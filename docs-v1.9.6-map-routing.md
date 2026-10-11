# 1.9.6 基线地图改动说明

本分支的 APK 以 `assets/shared/ui.js`、`assets/shared/core.js`、`assets/shared/route-worker.js` 和 `assets/data/campus.json` 为实现基线。宝山校区使用 `baoshan-map-photo.jpg` 作为类实景底图；路线仍在本地连通图中计算。圆点坐标表同时提供 Excel 和 CSV 版本，见 `map-data/`。

## 图层与 POI

```text
SVG 图层顺序：
  photo-base         宝山校区类实景底图（普通浏览时显示）
  navigation        只有用户进入导航后才绘制带箭头的实际路线
  places            圆点 POI；普通按钮缩小，垃圾站/垃圾桶使用黄色圆点
  unexplored        左下角黑斜杠区域的灰色遮罩，覆盖点击事件
```

普通 POI 保持原名称。路网连接继续使用 `mapX/mapY`，本次只增加并校对显示用的 `markerX/markerY`，因此图标位置不会改变路线规划。圆点进一步缩小，说明文字改为亮眼浅蓝色。新增点使用 `wasteKind: "station" | "bin"`。`station` 显示“垃圾站”，`bin` 显示“垃圾桶”，两者都能打开地点详情。坐标以 1448×1086 底图等比例映射到 SVG 的 1000×750 范围。

## 路网规则

`campus.json.meta.mapAnnotations.baoshan` 保存从标注图整理出的路径：

- `groundPaths` 生成 `level: 1, kind: "path"` 边；
- `upperPaths` 生成 `level: 2, kind: "upper"` 边；
- `stairs` 生成唯一的 `kind: "stairs"` 垂直连接；
- `blockedPaths` 保存红线边界。路网只从蓝线、橙线和楼梯生成边，不自动跨越红线；内部蓝线穿过建筑时仍保留；
- 无障碍模式过滤楼梯边，普通步行模式允许楼层切换；橙蓝线相交不会自动换层。

伪代码：

```js
for (const edge of graph.edges) {
  if (edge.kind === "restricted") continue;
  if (mode === "accessible" && (edge.kind === "stairs" || !edge.accessible)) continue;
  relax(edge);
}
```

未探索区域的路网排除范围由 `unexploredAreas` 保持不变，用户端显示轮廓使用 `displayPoints` 对齐图片边界；其内的 POI 不生成地图圆点，也不生成路网连接；灰色遮罩接收点击，因此不能选中或规划穿越。红、蓝、橙、紫标注线路只留在路网数据中，常规用户地图不绘制；进入导航后只绘制带箭头的当前路线。
