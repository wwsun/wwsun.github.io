---
title: OpenAI GPT 图像生成模型提示工程指南
tags:
  - ai-art
  - openai
  - prompt
  - multimodal
description: 深度解析 OpenAI 官方 GPT 图像生成模型（以 gpt-image-2 为核心）提示工程指南，涵盖核心参数、结构化提示词模板、文生图高阶技法及多图参考/局部精密编辑（虚拟试衣、线稿渲染、风格迁移、透明背景与角色一致性）的生产级最佳实践。
source: https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide
---

本文整理并提炼自 OpenAI 官方 Cookbook 的《**GPT Image Generation Models Prompting Guide**》（由 Mandeep Singh、Emre Okcular 和 Tiger He 撰写）。

该指南全面总结了 OpenAI 旗舰图像生成模型（以 `gpt-image-2` 为主）在文生图（Text-to-Image）与图生图/图像编辑（Image-to-Image / Edit）领域的生产级最佳实践。与早期的 DALL-E 系列相比，新一代模型具备**极高的图内文字渲染精度**、**原生的透明背景输出**、**强大的物理与世界常识推理**以及**多图输入下的严格身份/几何保真能力**。

在撰写提示词时，可同时参考知识库中的 [[gpt-image2-prompt]]、[[50-design-styles-for-better-prompting]] 以及通用提示框架 [[costar-prompt-framework]]。

---

## 核心模型与参数矩阵

OpenAI 当前图像生成 API 提供以下核心模型及参数配置（数据截至 2026 年最新规范）：

| 模型名称           | 输出画质 (`output_quality`) | 输入保真度 (`input_fidelity`)            | 分辨率规则                                    | 推荐生产场景                                                                                     |
| :----------------- | :-------------------------- | :--------------------------------------- | :-------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `gpt-image-2`      | `low`, `medium`, `high`     | 不支持（模型默认全量高保真，无需该参数） | 自由比例（任意符合长宽约束的分辨率）          | **新项目默认首选**。最高画质渲染、复杂图内排版、写实摄影、精密图像编辑、多图合成与高容错业务流。 |
| `gpt-image-1.5`    | `low`, `medium`, `high`     | `low`, `high`                            | `1024x1024`, `1024x1536`, `1536x1024`, `auto` | 存量系统迁移期过渡。新项目优先迁移至 `gpt-image-2`。                                             |
| `gpt-image-1`      | `low`, `medium`, `high`     | `low`, `high`                            | `1024x1024`, `1024x1536`, `1536x1024`, `auto` | 仅保留用于向下兼容。建议尽早升级。                                                               |
| `gpt-image-2-mini` | `low`, `medium`, `high`     | 不支持                                   | 自由比例                                      | 高并发、成本与延迟极度敏感的实时交互场景或初期原型探索。                                         |

### 关键参数设计要点

- **画质与延迟平衡（`output_quality`）**：
  - 延迟或成本敏感的场景，优先使用 `low`。新模型的 `low` 档画质依然优于老一代模型，且生成速度显著提升。
  - 遇到图内密集小字、复杂信息图表、微距人像特写、角色身份敏感编辑时，切换为 `medium` 或 `high`。
- **透明背景原生支持（`background="transparent"`）**：
  - `gpt-image-2` 原生支持直接生成透明背景的 PNG 或 WebP 素材，适用于电商白底抠图、Logo、贴纸（Stickers）与演示稿组件。
- **图像编辑接口（`client.images.edit`）**：
  - 支持传入多张参考图（`image=[img1, img2, ...]`），模型能原生解析各图像语义并执行融合或修改，而无需传统复杂的手动 Inpainting 掩码。

---

## 图像提示词结构化工程法则

高质量的图像提示词并非无规则的词云堆砌，而应采用**分层结构化（Layered Specification）**。Alpha 测试表明，结构清晰的 Prompt 能显著降低模型幻觉与不必要的漂移。

### 通用提示词五层模板

```text
[场景目标与类型设定]：明确声明输出媒介与目标（如：专业科技杂志信息图、35mm 胶片写实摄影、电商透明背景商品展示图）
[主体描述]：主体对象、形态比例、材质表面、关键特征细节、动作与视线朝向
[环境与构图]：背景环境、机位角度（平视/俯拍/广角）、留白区域（如左侧留出三分之一作为文案区）
[光影与质感]：主光源与环境光（柔光、黄金时刻、高反差）、色温、物理阴影与折射
[明确约束与不变项 (Constraints)]：严格声明必须保留什么、必须排除什么（如：无水印、无无关文字、保留参考图的面部特征不变）
```

### 六项黄金设计准则

1. **写实摄影（Photorealism）的激活词**：
   - 必须在提示词中明确包含 **`photorealistic`**，它能强力激活底层写实模式。
   - 辅以 `real photograph`、`taken on a professional camera` 或 `35mm lens` 等描述，但切忌陷入虚构的镜头物理参数细节，模型主要将其视为整体氛围与构图基调的锚点。
2. **拒绝“AI 塑料感”的材质描述**：
   - 明确具体的物理微观细节，例如：`subtle film grain`（微弱胶片噪点）、`visible skin pores and natural imperfections`（自然皮肤毛孔与瑕疵）、`matte fabric texture with soft draping`（哑光布料自然垂坠感）。
3. **空间定位与人物视线**：
   - 避免含糊的“一个人在看书”，明确写出交互几何与视线落点：“双手自然搭在桌沿，目光低垂看向打开的精装书页，而非正视镜头”。
4. **文字渲染控制（In-Image Text）**：
   - 渲染精确英文文字时，将文本用引号明确包裹，并指定字形风格（如：`bold sans-serif font`）、排版层级与高对比度。
5. **锁定与排除（Change vs. Preserve）**：
   - 特别在图生图编辑中，**声明“不要改什么”与“要改什么”同等重要**。例：`Do not change the face, hairstyle, or body proportions; modify only the jacket color.`
6. **模板化优于复杂语法**：
   - 生产环境中，清晰的短句分段、换行分点或 JSON-like 键值对，比冗长的单一复合大段落更稳定可维护。

---

## 文生图实战模式（Text → Image）

### 1. 结构化信息图与科学图示（Infographics）

`gpt-image-2` 能原生排版多层级文字与流程连线：

- **Prompt 模式**：指定“清晰层级（visual hierarchy）”、“分步流程卡片（numbered process cards）”、“无衬线印刷体（clean sans-serif typography）”与“对比色高亮”。
- **要点**：直接给出每张卡片内的具体标题与核心指标，避免模型自造混乱文本。

### 2. 自然光感写实人像（Natural Photorealism）

- **核心策略**：通过环境光反差与局部微瑕破除 AI 平滑感。
- **参考 Prompt 片段**：
  ```text
  Photorealistic candid portrait of an architect in a brightly lit studio.
  Natural daylight from large floor-to-ceiling windows on the left.
  Realistic skin texture with subtle fine lines, soft stray hairs around the temples.
  Shallow depth of field, 85mm lens aesthetic, muted scandinavian color palette.
  No oversaturated colors, no plastic skin smoothing, no studio flash glare.
  ```

### 3. 多语言与图内翻译（In-Image Localization）

- **能力**：直接生成带有特定语种文字的图表、菜单或包装盒，且保持文字与图形的布局对齐。

### 4. 透明背景素材（Transparent Background Assets）

- **参数配合**：`background="transparent"` + `output_format="png"` 或 `webp`。
- **适用场景**：独立应用图标、电商单品白底透图、3D 游戏道具贴图、演讲 PPT 插图。

---

## 图像编辑与多图参考实战（Text + Image → Image）

图像编辑是 `gpt-image-2` 最强大的飞跃：支持单次向 `client.images.edit` 输入多张图片，模型能够在空间与语义层面上跨图提取与重组信息。

### 1. 虚拟试衣与商品展示（Virtual Try-On）

> [!important] 核心原则：锁定人体身份，仅替换衣物几何
> 必须显式声明人物面部、五官、发型、体态完全冻结，要求新衣物自然贴合现有身体姿态并生成真实物理阴影。

```python
# 示例：模特图 + 多张服装单品图融合
prompt = """
Edit the image to dress the woman using the provided clothing images.
Do not change her face, facial features, skin tone, body shape, pose, or identity in any way.
Preserve her exact likeness, expression, hairstyle, and proportions.
Replace only the clothing, fitting the garments naturally to her existing pose and body geometry with realistic fabric draping.
Match lighting, shadows, and color temperature to the original photo so the outfit integrates photorealistically, without looking pasted on.
Do not change the background, camera angle, or framing, and do not add accessories or watermarks.
"""

result = client.images.edit(
    model="gpt-image-2",
    image=[
        open("model_full_body.png", "rb"),
        open("jacket.png", "rb"),
        open("boots.png", "rb"),
    ],
    prompt=prompt,
    size="1024x1536",
    quality="medium",
)
```

### 2. 线稿/手绘草图变真图（Sketch → Photorealistic Render）

- **设计范式**：将草图视为**空间约束规范（Spatial Spec）**。
- **Prompt 模式**：
  ```text
  Turn this drawing into a photorealistic architectural photograph.
  Preserve the exact perspective, wall angles, furniture layout, and proportions from the sketch.
  Apply realistic warm oak wood textures, polished concrete flooring, and soft afternoon sunlight casting through the windows.
  Do not add new furniture or architectural elements not present in the drawing.
  ```

### 3. 严格风格迁移（Style Transfer）

- **两张输入**：图 A（内容主体）+ 图 B（目标视觉风格）。
- **约束要求**：要求模型仅提取参考图的调色板（Palette）、笔触纹理（Brushstrokes）、颗粒质感或渲染介质，将主体替换为新内容，严禁把参考图中的具体物体搬运过来。

### 4. 室内装潢精密局部替换（Interior Design Precision Swap）

- **场景**：保留整间客厅硬装、光照、地毯与窗外景色，仅将中央的布艺沙发替换为指定材质（如干邑色头层牛皮双人沙发），并要求地毯上呈现匹配的新物体阴影与反光。

### 5. 跨场景角色一致性（Multi-Image Character Consistency）

- **连续绘本与漫画工作流**：
  - 输入设定好的角色正面立绘作为参考图。
  - Prompt 锁定：`Maintain the exact same character appearance, facial structure, distinctive blue round glasses, and red hoodie from the reference image.`
  - 动态变更：改变镜头视角（特写/全景）、情绪表情（惊恐/大笑）与交互场景（奔跑在雨中森林），实现稳定的连贯叙事。

---

## 生产落地避坑指南

1. **避免参数堆砌**：不要塞入冗余矛盾的相机镜头参数（如同时写 `wide angle 14mm` 和 `bokeh 85mm f/1.2`），这会导致模型难以权衡画面透视。
2. **多图输入顺序与命名约定**：当传入多张参考图时，在 Prompt 中清晰指代各图职责（例如：“参考图 1 为人物主体，参考图 2 为服装版型，参考图 3 为材质颜色”）。
3. **优先小步迭代**：面对复杂的重度编辑任务（例如既要换衣服、又要换背景、还要加复杂光影），拆解为两步连续调用 `images.edit`，稳定性显著高于单次一次性完成。
