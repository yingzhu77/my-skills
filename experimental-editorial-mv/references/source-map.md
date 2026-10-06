# 来源与蒸馏范围

- [原仓库](https://github.com/longruizhi2-beep/he-drowns-mv-v2)，固定提交 `d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5`，审阅2026-10-06。
- [MIT代码许可](https://github.com/longruizhi2-beep/he-drowns-mv-v2/blob/d4b7a0dfaa0cb77cbf9ebc564fb1068ebd3a09d5/LICENSE)，Copyright (c) 2026 ATRAXI。

| 上游 | 提炼 | skill 内位置 |
|---|---|---|
| README、scenes/* | 意象、情绪、音乐版式、材质转换 | visual-language.md |
| verseA.js、chorusA.js、decon.js、cycle.js、verseB.js、end.js | 完整动作阶段、共享时间参数、版面展开与意象回收 | motion-recipes.md；纯 2D 映射标为扩展 |
| timing.js、scenes/common.js | 运行时拍组位置、快慢包络及新曲事件决策 | song-direction.md、music-and-validation.md |
| 场景进出、horizon、ride/floatCard | 接续类型、几何锚点与共同观看规则 | transition-contracts.md |
| draw.js | 两层协议、裁切、竖排、图注 | starter/js/draw.js |
| print.js | 分色、网点、纸纹、反馈、光字、3D合成 | starter/js/print.js |
| sea.js | 高度场、数组卡片、多机位、水线 | starter/js/sea.js |
| camera.js | 关键帧、骑浪、浮卡、投影 | starter/js/camera.js |
| audio.js | 输出补偿、seek、录音目标 | starter/js/audio.js |
| gl.js、util.js | shader、render target、确定性噪声 | 同名starter模块 |
| main.js、director.js | 合成、调度、录制、截图 | rendering.md与新写starter主循环 |
| timing.js、analysis.js、tools/* | 网格、变拍、鼓点与包络 | music-and-validation.md；未打包旧曲数据/脚本 |
| images.js、manifest_modern.json | 纹理身份、比例与素材声明格式 | starter/data/assets.json；演示图改为原创程序图形 |

保留七个核心模块按字节复制。启动UI、20秒演示导演、合成音轨、服务器和脚本为本次新增；模板并非完整原片复刻。

2026-10-07 补充导演动作、场景交接与动态审查方法。`assets/motion-study` 是新写的内容中性纯 2D 示例，演示条带与同一边界的连续发展；它没有复制原曲的海洋场景或实现通用笔画拓扑 morph。原作事实、伪代码迁移和新增方案在动作配方中分别标明。

## 已核实数值

原曲222.308秒，91 BPM，t0=0.07879，sixteenth=60/91/4。94小节、19音乐段落、51渲染片段。README的43点指性能采样。

30张图，3D阵列24层，单帧卡片6，视口5，涟漪8；均为该固定提交的实现值。

## 分开保留许可

MIT覆盖复制代码，模板根目录LICENSE保留原文。发布版仅包含代码与文档，演示图由新增 `placeholders.js` 生成；不分发上游照片。原上游 manifest 的 CC0 声明不等于本次独立核验。正式作品另配图片并记录许可。

原曲song.flac、歌词、时间线没有进入skill和模板。完整本地仓库快照含原音频；README明确其不适用MIT，快照不能当成纯MIT素材包。

原字体是OFL且按原曲字形子集化，本skill不分发字体。系统字体用于原型，正式作品检查新字形并保存许可。

可迁移：编辑性构图、两层印刷协议、音乐驱动、照片多身份、时间函数镜头、纸面/空间转换。

需重做：音乐分析、小节/歌词、导演、意象、素材、字形覆盖、画幅与设备测量。海面引擎可复用或按主题替换。
