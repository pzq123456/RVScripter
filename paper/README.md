# 毕业设计论文稿（第一版）
> - 2024.2.20 -> 

## 参考资料
> 论文的写作思路：
> - 基础模块架构
> - 软件的发布、维护、文档、社区等
> - 创新算法的具体实现
>   - 空间分析算法
>       - 矢量数据
>       - 栅格数据
>       - 网络数据
>   - 渲染算法（可视化思路主要就是基于 canvas 的 2d）
> - （前端算法性能）算法的优化、测试
> - 算法的具体应用（搭建一个完整的系统）
1. [前端地形渲染](https://www.youtube.com/watch?v=bMTeCqNkId8): 使用 canvas 2d 动态渲染光照（阴影）效果。数据是 DEM 格式的地形数据。该功能可以作为一个算法具体介绍。
2. GeoJSON: 用于地图数据的格式，可以用于地图数据的存储和传输。GeoJSON 是一种用于表示地理空间数据的开放标准格式。它基于 JSON（JavaScript Object Notation）格式，并提供了一种简洁而有效地描述地理要素（如点、线、多边形等）及其属性的方法。以下是 GeoJSON 的一些主要特点和组成部分：
    1. **几何对象（Geometry Objects）**：GeoJSON 支持多种几何对象类型，包括点（Point）、线（LineString）、多边形（Polygon）、多点（MultiPoint）、多线（MultiLineString）和多边形集合（MultiPolygon）。
    2. **要素对象（Feature Objects）**：GeoJSON 的主要构建块是要素对象，它包含一个几何对象以及相关属性信息。每个要素对象可以包含几何对象和其他任意属性。此外，GeoJSON 还支持要素集合（FeatureCollection），它是一组要素对象的容器。
    3. **坐标参考系统（Coordinate Reference System，CRS）**：GeoJSON 支持两种 CRS 定义方式，分别是默认的 WGS84 地理坐标系（经纬度）和外部引用的 CRS。
    4. **标准兼容性**：GeoJSON 是一种开放标准，得到了广泛的支持，并且在许多 GIS 软件和平台中被广泛应用。

    GeoJSON 的简洁性、可读性以及与 Web 技术的兼容性使其成为在 Web 地图应用和地理空间数据交换中常用的格式之一。