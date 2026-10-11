# 1.9.6 基线地图改动说明

本分支的 APK 以 `assets/shared/ui.js`、`assets/shared/core.js`、`assets/shared/route-worker.js` 和 `assets/data/campus.json` 为实现基线。地图是 SVG 自绘，路线在本地连通图中计算。

## 图层与 POI

```text
SVG 图层顺序：
  illustration      原有校园底图
  navigation        只有用户进入导航后才绘制带箭头的实际路线
  places            圆点 POI；普通按钮缩小，垃圾站/垃圾桶使用黄色圆点
  unexplored        左下角黑斜杠区域的灰色遮罩，覆盖点击事件
```

普通 POI 保持原名称和坐标；新增点使用 `wasteKind: "station" | "bin"`。`station` 显示“垃圾站”，`bin` 显示“垃圾桶”，两者都能打开地点详情。

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

未探索区域由 `unexploredAreas` 多边形定义。其内的 POI 不生成地图圆点，也不生成路网连接；灰色遮罩接收点击，因此不能选中或规划穿越。
