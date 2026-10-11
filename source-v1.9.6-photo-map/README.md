# v1.9.6 类实景地图实现快照

此目录是 APK 中地图功能的可审阅快照：

- `assets/shared/ui.js`：类实景底图、缩小圆点 POI、亮眼浅蓝标签、未探索遮罩、导航箭头和路线交互。
- `assets/shared/interactions.js`：按 SVG viewBox 尺寸处理拖动、双指缩放和类实景底图的 4:3 比例。
- `assets/shared/route-worker.js`：后台路线计算与首次启动预热。
- `assets/data/campus.json`：POI、独立图标坐标 `markerX/markerY`、原有路网坐标 `mapX/mapY`、障碍边界、蓝/橙路网、唯一紫线楼梯和垃圾点数据。
- `assets/shared/baoshan-map-photo.jpg`：常规地图显示的类实景底图。

本次只调整图标显示坐标和样式；路网坐标、路线版本及未探索区域的路网排除范围保持不变。完整 APK 仍以 `downloads/jiguang-campus-map-v1.9.6-photo-map.apk` 为准。
