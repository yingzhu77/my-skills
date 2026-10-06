# 渲染架构

对应代码在 `assets/starter/js/`，继承上游 MIT 许可。来源见 [source-map.md](source-map.md)。

```text
音乐时间 → scene(t) → P（照片）+ I（油墨覆盖通道）+ F/S 参数
平面： P + I → Press.render → 后期 → 屏幕
背景： Sea.render → 背景纹理 + P + I → Press.render → 屏幕
纸入3D： P + I → Press.printPage → 页面纹理 → Sea.render
          → Press.render(backOnly, keepInk) → 屏幕
```

## 两层协议

- P 是普通颜色和透明度；`F.backMode=1` 时透明部分露出原始 3D。
- 用 `destination-out` 在 P 上画孔。黑圆只会成为印刷内容。
- I 起始填不透明黑，再用 lighter。红/绿/蓝通道为 K/A/B 的覆盖率；红色通常印成黑主版。
- 输出油墨由 F.inkK/inkA/inkB 决定，inkLight=1 则把覆盖率转为 screen 混合的光。
- 每帧重置变换、alpha、filter、合成模式与内容。

原生逻辑画布 1920×1080，降分辨率按 RW/1920 缩放。camera.project 和多视口也按 16:9 定义。竖屏同时改投影中心、纵横比、视口转换和版式。

## 三种合成入口

```js
// 透明纸孔露出真实空间；P 的 alpha 控制纸面覆盖
F.backMode = 1;
const bg = sea.render(S, RW, RH, t, seaT, null);
press.render(photoCanvas, inkCanvas, F, t, bg.tex);

// 空间作为照片印刷；P 叠加其他照片
F.backMode = 2;
F.tone = [1.15, 0.62, 0, 0.78]; // 原作暗夜画面的抬亮示例
const printed = sea.render(S, RW, RH, t, seaT, null);
press.render(photoCanvas, inkCanvas, F, t, printed.tex);

// 整页进入空间；文字可留在屏幕上作光
const page = press.printPage(photoCanvas, inkCanvas, F, t, {noInk: !!S.overlayInk});
const space = sea.render(S, RW, RH, t, seaT, page.tex);
press.render(photoCanvas, inkCanvas, F, t, space.tex,
  {backOnly: true, keepInk: !!S.overlayInk});
```

页面卡片为 `{page:true,c,u,v}`。pageIn3D 由主循环消费；Sea.render 本身只接受页面纹理和卡片列表。

## 纹理数组

原 Sea.loadCards 用 `texStorage3D(TEXTURE_2D_ARRAY,1,RGBA8,size,size,count)` 分配，把每张照片拉伸到统一方形 Canvas 后用 texSubImage3D 上传，以 layers[name] 记录层号。GLSL 以 `texture(uCards,vec3(uv,layer))` 采样，卡片几何恢复比例。

```js
S.cards = [{img:'image-key',
  c:[x,y,z],      // 世界坐标中心
  u:[ux,uy,uz],  // 半宽向量
  v:[vx,vy,vz],  // 半高向量
  alpha:1, glow:0}];
```

camera.floatCard 的 w/h 也是半轴尺度。上游阵列 24 层，但 uniforms 只有 6 卡片，JS `.slice(0,6)`；视口上限 5，涟漪上限 8。提高上限需一起改 GLSL 数组/循环和 JS typed arrays，再测编译与帧时。

新增时检查 MAX_TEXTURE_SIZE/MAX_ARRAY_TEXTURE_LAYERS。原 loadCards 不检查容量，也不销毁旧纹理；热替换需另加。RGBA8、1024²、24层、无 mipmap 约96 MiB；512² 同样层数约24 MiB，未含其他 render targets。

阵列只有一个 mip level，以 LINEAR 过滤。切到 mipmap filter 时需分配/生成对应层级。先用单卡片核对方向和比例。参考：[texStorage3D](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage3D)。

## 空间与镜头

Sea 是全屏三角形驱动的片元着色器，高度场 ray marching，无网格海面或 Three.js 依赖。尖浪八度、涌浪、涟漪经自适应步进与割线细化求交。反射、月光、泡沫和水下光柱建立空间；线性空间计算，最后 ACES 类映射。

逐像素水线可将镜头附近分为水上/水下，不是整屏切滤镜。seaHeightJS 和 GLSL 共用哈希/高度场，使 ride/floatCard 跟随渲染水面；改浪时同步改 CPU/GPU 公式。

camera.keyed 插值位置、yaw/pitch/roll 和 fov；角度为弧度、fov 为度。跨±π 要处理旋转意图。project 返回逻辑屏幕坐标，背向相机返回 null，隐藏对应图注。

原海浪时间为响度速度曲线的预积分查表。直接 `seaT=t*loud(t)` 会突变。新空间可替换海引擎；按艺术方向保留需要的纸面/卡片协议，时间仍由音乐计算。纯 2D 无需卡片。

替换时核对观看关系：主体和相机是否受共同的场/动作驱动，摄影地平线是否与空间视线匹配，背景如何响应镜头，以及遮挡/介质是否一致。原作的 `common.horizon + shore.pitchFor` 主动对齐摄影和 3D 地平线。普通屏幕 UV 照片不会响应相机转向，适合作平面拼贴或受限机位，不能自动承担可穿行环境。接续检查见 [transition-contracts.md](transition-contracts.md)。

## 印刷参数

| 参数 | 用途 |
|---|---|
| mode=0/1/2/3/其他 | 三专色/四色/单色/原色/双色 |
| cell, scrType, scrMix | 网点尺度、点或线、加网强度 |
| offK/offA/offB | 印版像素偏移 |
| tone | 对比、gamma、黑点、白点 |
| wet, bleed | 湿纸变形、墨扩散 |
| neg, ca, zoomBlur | 负片、色差、径向模糊 |
| trail, trailXf, trailMode | 前帧反馈、变换、混合 |
| grainAmt, vig | 末级颗粒、暗角 |

照片加网、文字保持实心覆盖，不能统一截图后加同一个网点滤镜。

## 性能与生命周期

先降 S.scale（3D 内部分辨率）、总输出尺寸、阵列尺寸，再减少视口/卡片/步进工作；保持版式与音乐事件。

KHR_parallel_shader_compile 可使编译和资源加载重叠，播放前检查 prog.ready。ANGLE 编译行为按当前浏览器实测。

原 Press.resize / Sea.ensure 新分配 render target 不销毁旧对象。模板在画质切换时主动释放替换目标。长期编辑器需补齐纹理、帧缓冲、program 的 dispose 和 context loss 处理。
