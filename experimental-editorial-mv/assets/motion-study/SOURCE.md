# 来源与运行

这是**基于原例动作原则的新 2D 示例**，不是原项目画面的复刻，也不声称原项目实现了这段完整形变。所有图形由程序生成；不含歌曲、歌词、摄影、外部字体或第三方运行时依赖。

原理来源：[he-drowns-mv-v2](https://github.com/longruizhi2-beep/he-drowns-mv-v2/tree/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5)，固定提交 `d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5`。

- 原 [draw.eyePath](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/draw.js#L281) 用同一 Bézier 轮廓生成形状，[verseA.js](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/verseA.js#L160) 将它同时用于纸面挖孔和描边，并将开合与扩张分成两个时间阶段。
- 原 [cycle.js](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/js/scenes/cycle.js) 让已经出现的最后一栏连续扩大为整页，观看角色改变而非更换一个无关的矩形图版。
- 本示例将这些原则重新实现为条带共同收压 → 同一路径的缝张开 → 内部墨形发展 → 收束；`js/motion.js` 是新增代码，没有复制上游 scene。
- `serve.js` 采用 skill 原有 MIT loopback server，改了标题和默认端口；许可证见 `LICENSE`。新图形与播放器代码同样采用 MIT。

直接运行：

```powershell
node "<motion-study-dir>/serve.js"
```

浏览器打开服务器打印的地址，默认 `http://127.0.0.1:8190/`。按 Space 播放/暂停；时间滑块可以双向拖动。它是正常速度的 18 秒无声动作研究，不是 MV 成片。

复制为独立项目：

```powershell
python "<skill-dir>/scripts/scaffold.py" --motion-study "<new-empty-project-dir>"
```

时间协议：`stateAt(t)` 仅由绝对时间产生状态；`boundaryPath(descriptor)` 产生同一个主体/遮罩/描边路径。播放器以 `performance.now()` 建立播放时钟，没有按帧累计几何。`window.__motionStudy.renderAt(t)` 可直接跳到固定帧，`state()` 返回当前动作阶段。8 秒处两动作接续，后一个动作沿用前一个动作的缝描述；结尾也回到同一描述。
