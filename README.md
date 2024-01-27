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

### 7. GIS 基础功能
- https://www.geoman.io/

### 8. 序列化与反序列化
- https://tech.meituan.com/2015/02/26/serialization-vs-deserialization.html

## 大体思路
0. 核心（Core）：RVGeo（根据 leaflet 重构后的）。我会参考leaflet的架构，对RVGeo进行重构，使其更加规范高效。并在此基础上实现基GIS 核心功能（可视化、简易交互式图形编辑）。可以说，该项目的核心就是一个高度精简的前端地理信息系统，然后我要在此基础上探索如何实现可视化编程（Visual Programming）。
1. 代码编辑器：是下一步节点编辑器的基础。我需要在前端编写代码（暂定JS），为了项目的创新点，我会设计一种新的（地理表示）语言并为其设计一个编译器。该部分尚在探索中。新的地理表示语言及其编译器会是一个不错的创新点，同时，考虑到现在 ChatGPT 等技术的发展，我希望这种地理表示能够更加高效地帮助 ChatGPT 等技术进行地理信息的处理。（待定）
2. 节点编辑器：同样需要前端编译技术将其节点图编译为代码。
## References
1. [Online Code Compiler](https://github.com/zerefwayne/online-compiler) 