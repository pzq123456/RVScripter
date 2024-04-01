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

3. WebWorkers
    针对使用 Web Workers 处理大型数组的需求，可以设计一个事件系统来管理和协调 Web Workers 的工作。下面是一个初步的设计方案：

    主线程（Main Thread）：负责将大数组分割成固定大小的小块，并将每个小块分配给不同的 Web Worker 进行处理。同时，主线程负责接收来自 Web Workers 的处理结果，并将结果合并或处理后返回给应用程序。

    Web Workers：每个 Web Worker 负责处理一个小块的数组数据。它们可以执行诸如求取平均数、执行数学计算等操作。处理完成后，Web Worker 将结果发送回主线程。

    事件系统：设计一个事件系统来管理主线程与 Web Workers 之间的通信和协调。事件系统可以包括以下功能：

    事件分发器（Event Dispatcher）：负责将任务分发给可用的 Web Workers，同时监控任务的完成情况。
    任务队列（Task Queue）：维护一个任务队列，存储待处理的任务和任务的处理结果。
    任务完成监听器（Task Completion Listener）：监听 Web Workers 完成任务的事件，并将结果添加到任务队列中。
    错误处理器（Error Handler）：处理 Web Workers 中可能出现的错误，并进行适当的处理和反馈。
    数据通信：主线程与 Web Workers 之间通过消息传递进行通信。主线程将任务分配给 Web Workers，并接收处理结果；Web Workers 接收任务并处理，然后将结果发送回主线程。

    动态调整：根据系统资源和运行时情况，可以动态调整 Web Workers 的数量和分配策略，以优化性能和资源利用率。

    这样的设计可以有效地利用多线程处理大型数组，并且通过事件系统实现了任务的分发和结果的收集，使得系统更加灵活和可扩展。同时，需要注意在设计过程中考虑到错误处理、性能优化和安全性等方面的问题。
> - 我希望在自己编写的包中编写一个用于管理 webworker 的核心模块，这个模块放在文件夹 core 中。我简单描述一下我希望使用worker来做什么。情况一：我会有一个非常巨大的数组，现在假设就是二维数组，需要处理。正常使用js来处理会阻塞主线程导致页面卡顿，我希望调用特定的webworker来处理它，譬如我会将这个大数组分割成小块再更具浏览器的性能等、用户设置等因素创建并分发处理事件。情况二：我希望动态接受worker的处理结果。比如说我现在有一个512*512的二维数组，我希望通过某种仅与空间相关的采样方式将其变为128*128的小数组，我可能会首先定义一个默认值数组128*128，这样用户就可以直接使用这个数组，然后数组会根据 workers 的运行结果动态更新，全部workers运行结束后会触发最终完成事件，在这之前会不断根据worker的运行结果来替换默认值。这种行为的主要作用是优化用户体验，譬如我希望一幅图片进行处理，那么用户看到的图片会首先出现再逐步细化。
> - 我希望使用typescript编写一个 webworker 的管理对象，我希望实现一个简单的任务队列，通过这个对象动态地管理全局所有 workers 的调用。譬如我有一个workers文件夹，里面以 worker0.ts 的方式命名若干个worker的脚本，用于实现不同的任务。对于浏览器，我希望限制同时在运行的最大worker数量，同时，为了灵活性，我希望用户可以自行编写workers的数据处理函数，这样全局的worker管理对象就可以只处理抽象的worker管理譬如开始一个worker、维护任务队列并根据当前任务的完成情况触发不同的事件。
> - https://www.cnblogs.com/rock-roll/p/10176738.html

# RVScripter
An online code-editable Geo-platform based on RVGeo. 

## 技术验证

### 1. 代码编辑器技术选型 + 技术验证
> - 技术验证文件夹：`./project/editor`
- CodeMirror + Monaco
## Ideas
1. [Online Code Compiler](https://www.youtube.com/watch?v=RZ66yGyEKFg)
2. https://www.youtube.com/watch?v=q7x7QDMiSgY
3. https://juejin.cn/post/7273435095913283584

### 2. 节点编辑器
节点编辑器是指
1. https://zhuanlan.zhihu.com/p/362259030
2. 数字艺术效果示例：https://github.com/thi-ng/umbrella/blob/develop/examples/README.md
3. 拖拽 node graph：https://demo.thi.ng/umbrella/estuary/


### 3. 可能的节点可视化编程前端架构（GLSL webGPU）
1. https://polar.sh/emilwidlund/posts/alma-an-experimental-playground-for-generative-graphics

### 4. Tinkercad 是一款免费的在线软件工具集合，可帮助世界各地的用户进行思考、创造和制造。我们是三维设计、工程和娱乐软件领导企业 Autodesk (//www.autodesk.com.cn/)的理想推介。
https://www.tinkercad.com/



### 5. 面向大语言模型的地理表示语言 （for LLM Geo-Representation Language）
- 创造自己的语言：https://www.youtube.com/watch?v=8VB5TY1sIRo
- AST 抽象语法树
- 基于大语言模型开发一款地理表示语言需要认真考虑以下几个方面的努力：
    1. **语法设计：** 定义一套清晰、简洁且易于理解的地理表示语言的语法规则。确保语法规则能够充分利用大语言模型的自然语言理解和生成能力，以实现更自然的地理描述。
    2. **语义建模：** 借助大语言模型的语义理解能力，设计地理元素的语义表示。考虑如何更准确地表达地理位置、关系、属性等信息，以满足用户的语义需求。
    3. **智能交互：** 开发智能用户界面，使用户能够通过自然语言与地理数据进行交互。充分利用大语言模型的自然语言生成，提供智能的地理推荐、查询和导航功能。
    4. **数据集成：** 实现与外部地理信息数据库和知识库的集成，以获取更多的上下文信息。大语言模型可以帮助解析和理解外部数据，提供更全面的地理信息。
    5. **实时处理：** 利用大语言模型的高速计算能力，实现对实时地理信息的快速处理和更新。这可以涵盖实时交通、天气变化等方面的数据。
    6. **自动文档生成：** 利用大语言模型的文本生成能力，自动生成地理数据的文档和元数据。这有助于提高数据的可理解性和可信度。
    7. **质量监控和错误纠正：** 利用大语言模型的文本分析能力，监控地理数据的质量，并自动检测和纠正潜在的错误或不一致性。
    8. **多语言支持：** 考虑设计一种多语言支持的地理表示语言，以提供更广泛的语言覆盖，促进跨文化和国际交流。

  - 这是一个很有创新性的想法，充分利用大语言模型的生成能力和常识来约束和优化地理表示语言。以下是一些可能的方法和策略：
    1. **约束生成：** 利用大语言模型的生成能力，制定一套规则和约束，以确保生成的地理表示语言是合理的。这可以包括语法规则、语义规则以及与常识知识的结合，以避免生成不合理或矛盾的地理描述。
    2. **常识知识嵌入：** 将大语言模型的常识知识嵌入到地理表示语言中，以确保生成的语言与实际地理常识一致。例如，确保河流与桥梁之间的关系是合理的，避免描述桥梁跨越不存在的河流等情况。
    3. **实时更新：** 利用大语言模型对实时信息的感知能力，及时更新地理表示语言中的信息。这可以包括实时交通状况、天气变化等，以保持生成的地理语言与当前情况的一致性。
    4. **上下文理解：** 利用大语言模型的上下文理解能力，确保生成的地理表示语言与先前的描述和上下文保持一致。这有助于提高语言生成的连贯性。
    5. **关系推理：** 利用大语言模型的推理能力，进行地理元素之间关系的推理。例如，如果描述了一个城市和一个河流，模型可以推断可能存在桥梁连接这两者。
    6. **错误检测与修正：** 利用大语言模型的文本分析能力，进行生成地理表示语言时的错误检测与修正。这有助于减少不一致性和提高语言生成的准确性。
    7. **用户交互与反馈：** 提供用户交互界面，允许用户对生成的地理表示语言进行反馈。这有助于改善模型的性能，并根据用户的需求进行优化。
    8. **多模态融合：** 融合地理信息的多种表达方式，包括文本、图形和其他可视化元素，以提供更丰富的地理表示。这有助于模型更全面地理解地理空间。
 - 截至我知识截断日期（2022年1月），关于利用大语言模型的生成能力以及常识知识来约束和优化地理表示语言的具体研究可能是有限的。这领域的研究通常涉及地理信息系统（GIS）、自然语言处理（NLP）和人工智能（AI）等多个领域的交叉。
    1. Geographic Information Systems (GIS)
    2. Natural Language Processing (NLP) and Geography
    3. Spatial Language Generation
    4. Knowledge-aware Geospatial Modeling
    5. AI-driven Geographic Language Understanding

    - 使用学术搜索引擎（如Google Scholar、PubMed）或访问学术会议网站（如ACL、GIScience等）可能会有助于找到最新的研究论文和项目。此外，关注相关领域的研究团体、实验室和大学的网站也可能提供有关这方面研究的信息。 

### 6. 
- Rate.js: https://retejs.org/
- Flow: https://github.com/sunag/flow
- https://github.com/mrdoob/three.js/tree/dev/playground

### 7. GIS 基础功能
- https://www.geoman.io/

### 8. 序列化与反序列化
- https://tech.meituan.com/2015/02/26/serialization-vs-deserialization.html

### 9. SAM 遥感影像分割
- https://github.com/opengeos/segment-geospatial

## 大体思路
0. 核心（Core）：RVGeo（根据 leaflet 重构后的）。我会参考leaflet的架构，对RVGeo进行重构，使其更加规范高效。并在此基础上实现基GIS 核心功能（可视化、简易交互式图形编辑）。可以说，该项目的核心就是一个高度精简的前端地理信息系统，然后我要在此基础上探索如何实现可视化编程（Visual Programming）。
1. 代码编辑器：是下一步节点编辑器的基础。我需要在前端编写代码（暂定JS），为了项目的创新点，我会设计一种新的（地理表示）语言并为其设计一个编译器。该部分尚在探索中。新的地理表示语言及其编译器会是一个不错的创新点，同时，考虑到现在 ChatGPT 等技术的发展，我希望这种地理表示能够更加高效地帮助 ChatGPT 等技术进行地理信息的处理。（待定）
2. 节点编辑器：同样需要前端编译技术将其节点图编译为代码。
## References
1. [Online Code Compiler](https://github.com/zerefwayne/online-compiler) 