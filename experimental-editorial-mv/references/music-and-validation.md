# 音乐适配与验证

## 时钟

AudioEngine 通过 getOutputTimestamp 将输出时间映射到 performance clock，失效时用 currentTime 减 outputLatency/baseLatency。

```text
输出时刻 ≈ contextTime + (performance.now - performanceTime)/1000
歌曲时间 = offset + 输出时刻 - startCtx
渲染时间 = 歌曲时间 + userOffset + displayLead（播放时）
```

displayLead 默认1/60秒，是显示延迟估计而非测量。先验证真实播放再微调 userOffset。参考：[getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp)。rAF 累加不能成为主音乐时钟。

## 新曲重新分析

原 tools/analyze.py 读取 tools/out/song.wav，依赖 numpy/scipy/soundfile。91 BPM 和小节图硬编码，因此不是通用分析器。

1. 解码用户音频，确定时长、采样率、静音前导。
2. STFT/log-mel 起音估计候选网格，检查变速、弱起、自由速度。
3. 多段校核 BPM 与相位。原研究用 Rayleigh 相位搜索，并以小节/歌词锚点确认。
4. 建立变拍小节图。内部十六分单位：4/4=16、3/8=6、5/8=10、6/8=12、2/4=8。
5. groups 之和等于 len。5/8 的 `[4,6]` 或 `[4,3,3]` 都是十六分单位。
6. 提取 kick/snare/hat 和频段包络；用频段与瞬态校核，响度不能代替所有鼓点。
7. 核对歌词实际演唱位置；假名/音节数仅辅助分配，不代表字字等时。

短原型可以手工标注可信事件。缺少分析证据时将网格标为假设。

## 数据协议

```js
window.ANALYSIS = {
  bpm, sixteenth, t0, duration, n16,
  bars:[{i,k,t,len,meter,groups,sec}],
  sections:[{name,bar0,t0,t1}],
  k16:{kick:[],snare:[],hat:[],acc:[]},
  env:{rate,loud,low,mid,high,onset,bright}
};
```

以真实 analysis.js 为字段依据。env 曲线为 uint8 归一化后 base64，timing.js 解为 Float32 并插值。数组覆盖 duration/n16，时间单调且场景边界完整。变速曲换显式事件时间或 tempo map，不能沿用常量 P16。

## 动作分工

把这些信号落实为主体动作、运行时分组位置和导演事件表，见 [song-direction.md](song-direction.md)；具体时间函数见 [motion-recipes.md](motion-recipes.md)。信号分类未经核实时用混音起音及频段名称，不冒称底鼓/军鼓。

| 信号 | 主反应 |
|---|---|
| kick | 页面冲击、机位下顿、焦距冲击、穿水线 |
| snare | 套印错位、横滚、局部闪光、光柱 |
| hat | 小幅颗粒/图注变化 |
| 分组起点 | 硬切、换版、对应条带/机位显影 |
| 歌词关键字 | 有语义的主体动作 |
| 持续响度 | 环境强度、速度、整体压迫感 |

鼓点用事件强度乘指数衰减，各通道承担不同职责。

## 验证

以下是技术验证；正常速度下的主体动作、可读时段和场景接续另按 [aesthetic-validation.md](aesthetic-validation.md) 检查。源曲坐标与截取样片坐标分别记录，避免音轨裁切后重复加偏移。

- HTTP 加载完成，图片/字体解码、shader ready、WebGL 无错误。
- 各材质路径取样，并检查切换边界前后。
- renderAt 相同时间两次，在固定预热条件下像素一致；不用 Math.random/帧数决定内容。
- 真实播放测歌曲时间差和墙钟差，记录设备、浏览器、时长。该测量仅验证时钟推进，不证明物理音画延迟。
- 检查暂停/恢复、双向跳转、画质；暂停不积累反馈。
- 录一段，确认 Blob 有内容、包含音视频轨，并播放导出文件核对时长。

上游 __mv.renderAt 清反馈并预热，perf 用 readPixels 等 GPU；模板提供 __editorial。README 的6.4ms和小于1ms是作者对指定机器的报告，不是 skill 承诺。rAF FPS、CPU提交、GPU完成、录制帧率分别说明。

模板组合 captureStream(30) 与 Web Audio MediaStreamDestination 实时录制 WebM。高分辨率无丢帧、离线固定帧率、MP4 需要另做编码路径并校核时间基。
