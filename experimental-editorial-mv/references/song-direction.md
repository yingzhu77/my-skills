# 从音乐事件到动作编排

用于动手写分镜前，把可听见的结构转成运行时动作。BPM、歌词时间和包络是不同证据；它们不自动决定镜头。先选主意象与动作结果，再为它选择合适触发与速度曲线。

## 三张小表

按实际需要记录少量关键项，阶段数量不固定。以下是字段与中性示例，不是原曲或某首新歌的分析数据。

| 音乐事件 | 时间/范围 | 证据及置信度 | 可用作什么 |
|---|---|---|---|
| 乐句开始 | `phrase.start` | 人耳复核的结构边界 | 开始累计张力 |
| 关键词 | `word.start` | 强制对齐候选，复核后更新状态 | 主体动作的语义支点 |
| 强宽频起音 | `onset.time` | 音频检测候选；强度不等于鼓种类 | 已在进行动作的短冲击 |
| 音色抽空/休止 | `[a,b]` | 正常速度听音验证 | 骤停、保留或负形显露 |

| 主体与动作 | 触发 | 速度变化 | 持续结果 | 主导权交接 |
|---|---|---|---|---|
| 开口张开并扩大 | 语义提出→乐句推进 | 先平缓，后加速 | 观看边界改变 | 扩大的轮廓成为下一画幅 |
| 墨区吞没字 | 关键词→强起音 | 长侵入＋短冲击 | 字被遮挡，留下空缺 | 空缺显露下一主体 |
| 裂线停止 | 乐句抽空 | 迅速收敛 | 稳定的负形 | 下次音色进入再延伸 |

| 意象 ID | 首次出现 | 回归变化 | 最后回收 |
|---|---|---|---|
| `aperture` | 小开口，内部被遮住 | 扩大或反向观看 | 留下闭合痕迹 |
| `thread` | 字旁的一条线 | 接过散开的字形/变成边界 | 收成缺席的轮廓 |

重复表帮助选择可以认出的前后关系，不要求所有意象复现。歌词时间原值与设计偏移分开保存，例如 `{acousticTime, visualOffset, confidence, source}`；重复的同字用 `lineId/eventId` 区分。

## 可运行的音乐位置协议

原例 [timing.js:15–20](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/timing.js#L15) 为分组建立前缀和，随后 [62–76 行](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/timing.js#L62) 将播放时间变成 `q/gi/gq/gp`。`q` 的单位是十六分音符，不是 0..1；`gi` 是组索引，`gp` 是当前组内 0..1 进度。

以下是重新编写的纯函数。调用前验证小节按 `t` 排序、组长为正且总和等于 `len`；无重叠小节。区间为 `[start,end)`，前奏、空隙及曲尾返回 `null`，由导演明确处理，避免意外外推末组。

```js
function musicalPosition(t, bars, sixteenth) {
  if (!(sixteenth > 0) || !Number.isFinite(t)) return null;
  let bi = -1;
  for (let i = 0; i < bars.length && bars[i].t <= t; i++) bi = i;
  if (bi < 0) return null;
  const b = bars[bi];
  const rawQ = (t - b.t) / sixteenth, tick = Math.round(rawQ);
  const q = Math.abs(rawQ - tick) < 1e-9 ? tick : rawQ;
  if (q >= b.len) return null;
  let gi = 0, start = 0;
  while (gi < b.groups.length - 1 && q >= start + b.groups[gi]) {
    start += b.groups[gi++];
  }
  const glen = b.groups[gi], gq = q - start;
  return { bi, q, p: q / b.len, gi, gq, gp: gq / glen, glen,
    groupTime: b.t + start * sixteenth };
}

// 4/4 的四拍例子；BPM 不提供首拍偏移，bar0 必须另行确认。
const bpm = 84, sixteenth = 60 / bpm / 4, bar0 = 0;
const bars = [0, 1].map(i => ({
  t: bar0 + i * 16 * sixteenth, len: 16, groups: [4, 4, 4, 4]
}));
const p = musicalPosition(bar0 + 5 * sixteenth, bars, sixteenth);
// p.q=5, p.gi=1, p.gq=1, p.gp=.25：第二拍内的第二个十六分位置。
```

`1e-9` 格的容差只消除整格边界的浮点误差，不用于将声学事件吸附到节拍。4/4 中可按四拍控制四次观看变化；也可按已听出的切分或明确设计的组长控制变化，但不要把原例的混合拍号抄到新曲。恒定 BPM 只构建候选网格；有速度漂移时用校正小节/拍点插值，不能将整曲强行锁在公式上。

## 分开计算长动作与短瞬态

```text
longAction = actionState(t, phraseAnchors)       // 持续累计，不按每次 onset 清零
impact = max strength[e] * exp(-(t-e.time)/tau) // 只取 e.time≤t 的候选事件
readPose = compose(longAction, smallImpact(impact))
```

长动作控制轮廓、遮挡、占据范围、方向和材质结果。瞬态可短时增加挤压、套印或速度冲击，随后退出；不要让每个强起音都重置主体，或让包络只驱动颗粒、色差而没有主体动作。

例如，当前组的 `gp` 可驱动线段长度；`gi` 可决定分区激活；组首时间可给 `exp(-(t-groupTime)/tau)` 的重音衰减。这是“组首强调”，只有经过音源分离或人耳核验才称 kick/snare。原项目的鼓强度数组与新曲的宽频候选不是同一类数据。

**实际选择：** 对长乐句观察积累与释放；对密集短 fill 允许硬切规则变化；对静寂让状态收敛并停留。动画曲线以听感和动作可读性校正，歌词边界不等于动画必切边界。

## 写导演前的最小动作说明

为代表段落写出：“谁在什么事件开始做什么，速度如何变，改变了什么，下一动作接走什么。”若只能写出“照片放大＋文字淡入＋滤镜变强”，先补动作的结果或构图关系。可以选择安静版面，但应说明它承担的停留、预期或对比，不靠增加随机运动填满时间。

把说明落为一两个可观察的时间函数，先做带音乐的正常速度样片；按 [aesthetic-validation.md](aesthetic-validation.md) 判断动作是否成立，再扩大时间范围。使用 2D、3D、摄影或纯图形由该动作的功能决定。
