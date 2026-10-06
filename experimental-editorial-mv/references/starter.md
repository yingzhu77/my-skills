# 使用模板

```powershell
python "<skill-dir>/scripts/scaffold.py" "D:/work/my-mv"
node "D:/work/my-mv/serve.js"
```

需要Python3复制、Node启动及WebGL2/Web Audio浏览器；无框架/npm依赖。运行时无外部请求，服务器只监听loopback，默认8182，可用PORT环境变量改。通过HTTP打开。

模板由 `js/placeholders.js` 生成六张中性图形，生成96 BPM、20秒合成音轨，四状态各5秒：纸面、开孔、空间印刷、整页漂浮。无照片、歌曲、外部字体素材。拖动检查帧，Space播放/暂停，Q画质，R从头实时录WebM。

四等长状态用于演示 API。新曲的乐句、动作阶段与切点需重新编排；不能用这四段作为成片节奏的默认答案。

## 纯 2D 动作起点

```powershell
python "<skill-dir>/scripts/scaffold.py" --motion-study "D:/work/motion-study"
node "D:/work/motion-study/serve.js"
```

默认打开 `http://127.0.0.1:8190/`。18 秒内容中性示例：印刷条带收紧成一道缝，沿同一边界张开、发展墨形再收束。主体、遮罩和描边复用几何函数，按绝对时间计算；提供播放/暂停/拖动。它不含原曲或歌词，也不需要摄影/WebGL2，属于基于原例编排原则的新 2D 实现。

用该示例检查动作如何留下结果并被下一动作接住；适配歌曲时加入实际音乐事件，不把演示阶段秒数当作分析结果。音轨、字体与成片导出按作品另配。

## 混合空间模板结构

| 文件 | 修改用途 |
|---|---|
| index.html/style.css | 启动、画布、控制 |
| serve.js | 本地服务器 |
| data/project.json | BPM、时长、秒数段落 |
| data/assets.json | 文件名、比例、素材来源 |
| js/main.js | 加载、导演、时间、录制 |
| js/{audio,camera,draw,gl,print,sea,util}.js | MIT原引擎 |

__editorial.renderAt(t) 暂停、清反馈、计算帧；state() 提供模式/时间，audio提供音乐时钟。

另配图片时在assets.json设置 `procedural: false` 与本地 `file`，并保存来源许可。moon/city以id查找，修改id时更新main.js.setupTextures。阵列统一尺寸，卡片几何恢复比例。系统字体会因平台不同，正式作品选定字体后预载与检查。生成的作品与素材保存在 skill 仓库外，或放入被忽略的制作目录。

UI可选本地音乐并更新时长，但仍用演示96 BPM及四等分段落，它不会分析新曲。正式适配按music-and-validation.md替换rhythm/sceneAt/compose。project.json段落是秒数，改BPM时同步段落；变拍接timing协议或tempo map。

模板默认关闭拖影，开启时补固定步长预热。16:9改竖屏需改投影和排版。沿用原卡片/视口上限。Q释放被替换的渲染目标；热换纹理和context loss完整生命周期需另加。导出为实时WebM。
