# 可执行的导演动作配方

用于把意象写成有触发、速度变化和结果的动作。先选本曲需要的配方，再改几何与音乐锚点；这些不是固定镜头清单。静止、停留和硬切都可以承担叙事。

下面“原例”指 ATRAXI 的 MIT 项目，固定版本 `d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5`；链接给出实际算法位置。“迁移”是新的中性伪代码，包括可选的纯 2D 扩展，不表示原作已有文字矢量 morph 引擎。若实际复制上游代码，保留其 MIT 与作者声明；不随示例分发原曲、歌词或分析数组。

## 先约定共享状态

一个主体动作由一个时间函数计算。主体、遮罩、描边、附着文字和必要的相机分别消费其结果，避免各自 ease 到互不相干的位置。纯时间示例：

```js
const clamp01 = x => Math.max(0, Math.min(1, x));
const phase = (t, start, duration) => clamp01((t - start) / duration);
const smooth = x => x * x * (3 - 2 * x);
const mix = (a, b, x) => a + (b - a) * x;

function openingState(t, cue) {
  const open = smooth(phase(t, cue.open, cue.openDuration));
  const expand = phase(t, cue.expand, cue.end - cue.expand) ** 3;
  return {
    id: 'aperture', cx: cue.cx, cy: cue.cy,
    width: cue.width * (1 + 3 * expand),
    height: cue.height * (1 + 3 * expand),
    open: Math.max(0.012, open), expand
  };
}
// 适配层实现 makeAperturePath；一次几何同时供主体、挖孔、轮廓使用。
// const state = openingState(t, cue);
// const path = makeAperturePath(state);
// drawSubject(path); cutMask(path); strokeContour(path);
```

`duration > 0`、锚点次序与素材归属在加载时校验。渲染不依赖上一帧；噪声按主体 ID 和时间取样。需要反馈残影时另定义 seek/reset 策略，不把反馈缓冲误当作主体运动。

## 1. 开口成为观看边界

**原例：** [verseA.js:160–185](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/verseA.js#L160) 用两个歌词字的 `charT` 分别触发张开与深入。张开历时 0.45 秒；深入用三次加速，眼形宽高从初始放大至四倍，并联动相机高度与视角。挖孔和描边调用同一个 [draw.js:281](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/draw.js#L281) 眼形函数。

**迁移：** 用上述 `openingState`。音乐锚点分别是“主意象被提出”和“观看方式改变”，不必是两个歌词字。纯 2D 可让眼、窗、字内孔或纸缝扩大为下一画面的观看范围；下一层内容在开孔前已经存在。结果是观看边界改变，不只是字变大。

**交接与限制：** 扩大后的孔成为下一段画幅或继续保留的局部窗。若选择硬切，则记录轮廓或方向匹配。原例的海面与相机是原曲语义，不要求新作品照搬；眼形也不是必选符号。

## 2. 环境吞没主体，而后坠落

**原例：** [chorusA.js:53–110](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/chorusA.js#L53) 让波峰位置与幅度随乐句增长，关键词处触发下潜；页面的埋入程度由波峰与页面的空间关系计算。第二次 [chorusA.js:156–193](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/chorusA.js#L156) 分别计算爬升、0.26 秒甩转、0.62 秒坠落；同一个 `fallU` 参与相机下降与文字回声向下移动。原作不是只在重音上闪一下。

**迁移：** 在乐句开始至关键词之间累计压力，关键词之后改变运动方向。例如：

```text
pressure = smooth(phase(t, phraseStart, turnTime - phraseStart))
fall = phase(t, turnTime, fallDuration)²
front = mix(frontStart, frontEnd, pressure)
subject.y = restY + fall * fallDistance
attachedText.y = textRestY + fall * textDistance
mask = invasionShape(front, pressure)
```

纯 2D 的侵入前沿可为墨区、裂口、卷折或负形；字与图被同一事件吞没，消失后留下空洞、污迹或改变的构图。一个短瞬态只改变冲击量，不重置 `pressure/fall`。

**交接与限制：** 下一动作继承前沿、下落方向或留下的空缺。写实 3D 需保持遮挡与空间深度成立；平面拼贴可明确采用分层规则。上面的“共用 2D 侵入遮罩”是扩展，不能宣称原例所有对象都由一个遮罩控制。

## 3. 一格展开成整页

**原例：** [cycle.js:56–92](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/cycle.js#L56) 在最后一小节开始 0.12 秒后，用 0.38 秒三次缓动将其 `x/y/w/h` 插值至全屏。同一矩形供照片裁切、透明开孔与空间视口使用；[107–127 行](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/cycle.js#L107) 还联动尺线位置和标题尺度。

**迁移：** `u = smooth(phase(t, expandCue, duration))`；`rect(t) = mixRect(localRect, fullRect, u)`。边框、裁切和附着文字从 `rect(t)` 派生，不单独猜坐标。乐句结束或音色抽空可成为展开点；展开后保留原内容或继续显影。

**交接与限制：** 展开的那一格保持素材 ID 与内部焦点，成为下一版面主体。原例小节长度决定栏宽；新曲可用自己的乐句比例。不要把原曲的 5/8、6/8 结构或技术尺线强行放进 4/4 歌曲画面。

## 4. 音乐分组改变观看规则

**原例：** [decon.js:85–127](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/decon.js#L85) 以 `floor(q / 2)` 激活五条八分音符条带，各有视角；[132–170 行](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/decon.js#L132) 按 `gi/gstart` 换整幅观看方式；[184–200 行](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/decon.js#L184) 用短分组切换相机、正负片和大字落点。

**迁移：** 从 [song-direction.md](song-direction.md) 得到 `q/gi/gp`：条带激活可用 `floor(q / subdivision)`；当前观看规则由 `gi` 选择；组内推进由 `gp` 控制。纯 2D 可以换裁切轴、轮廓方向、图底关系或空间密度。选择一种音乐结构确实可闻的规则，不把所有参数都同时随机化。

**交接与限制：** 短 fill 可以有意硬切，结束后回到稳定主体；不要求所有组之间插值。组长必须来自新曲的安排或明确的视觉分组，不能照抄原曲数组；宽频 onset 候选不自动等于鼓分类。

## 5. 同句词组承担不同动作

**原例：** [verseA.js:225–256](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/verseA.js#L225) 分别安排下沉、延迟划除、强调色大字、白字敲出和局部震动；下沉随 3.5 秒二次加速，划线先等 0.35 秒再用 0.25 秒长出。每个词的歌词时间与视觉角色独立。

**迁移：** 为少量关键词写角色表 `{eventId, text, role, readState, actionState, residue}`。例如“划除”先可读，再增长贯穿线；“下沉”保持字形但逐步进入负形；“敲白”改变图底关系。共享的残余线可接到下一主体。逐字切片重组、采样笔画变线或字内侵蚀是新的 2D 扩展，应先做一字动作研究，不假称原作已经实现。

**交接与限制：** 保留需要观众识别的读字时刻，结果应在变形后继续可见。不是每个词都需要动画，更不是整句逐字卡拉 OK；密集短句可只选语义支点。

## 6. 下一版的结构提前出现

**原例：** [decon.js:207–236](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/decon.js#L207) 相机转向，白纸从右侧进入并覆盖旧景，再逐项绘制下章的空栏与节拍结构；随后 [cycle.js:37–86](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/cycle.js#L37) 按乐句显影栏内内容。两章布局相呼应，但原代码并非每个像素都无缝衔接。

**迁移：** 共享 `layoutSpec` 的栏数、比例、主轴和语义顺序：`drawScaffold(layoutSpec, anticipation)` → `developContents(layoutSpec, phraseProgress)`。若需要真正连续的边界，再按 [transition-contracts.md](transition-contracts.md) 共享精确几何；只做预示时，构图关联即可。

**交接与限制：** 留下的框、裂线或负形由下一章赋予内容。不要让每段都重复“空框出现→照片淡入”；预示只用于观众需要认识新观看规则的边界。

## 7. 同一意象反向回收

**原例：** [verseB.js:1–4、24–51](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/verseB.js#L1) 回用前章图版，负片、镜像、反向相机改变观看立场；[137–160 行](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/verseB.js#L137) 让再次出现的船成为空船。结尾 [end.js:160–184](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/end.js#L160) 将已完成的纸页变成空间中的页面，初始投影铺满画幅再拉远，污迹保留先前开孔的记忆。

**迁移：** 复用 `motifId`、基准轮廓与已经发生的痕迹；第二次改变一项观看关系或占据状态，结尾回收其结果。纯 2D 可以让同一开口反向闭合、同一轮廓变成缺席负形，或把先前散出的线重新组成边界。

**交接与限制：** 观众应能认识同一主体，又能看到发生过的改变。仅重复颜色或换一张相近照片不构成回收；也不要求全曲使用一张底图。
