---
title: Vercel JSON Render
date: 2026-03-31 11:00:00
tags:
  - ai-ui
  - json-render
  - vercel
draft: false
description: Vercel JSON Render 采取让模型生成映射到预定义组件集的 JSON，而不是任意代码，从而提供安全受控的生成式 UI 渲染。
source: https://blog.logrocket.com/vercel-json-render-dynamic-ui/
---

## 引言

到 2026 年，AI 生成的界面已不再是什么新鲜事。它们正逐渐成为团队进行原型设计、个性化甚至交付产品体验的重要方式。然而，许多生成式 UI 的方法仍然依赖于一种脆弱的模式：让模型输出原始 React 或 HTML 字符串，然后希望结果是有效、安全且可维护的。

这种方式用于演示还可以，但在生产环境中很难让人放心。

字符串生成的 UI 难以验证、难以约束，而且容易出错。即使模型大部分情况下能生成正确的结构，你仍然需要担心格式错误的标记、不支持的属性、不一致的组合，以及让模型定义超出其应有范围的渲染层这一更大问题。

**Vercel 的 JSON Render 采取了不同的路径。** 与其让模型生成任意代码，不如让它生成映射到预定义组件集的 JSON。你控制哪些组件存在、它们接受哪些属性、以及交互如何流经系统。模型仍然帮助组合界面，但它在你定义的边界内工作。

这使得 JSON Render 对于希望探索 AI 生成 UI 又不想把前端钥匙交给别人的团队很有吸引力。它为你提供了一种将模型灵活性与模式验证、可预测渲染以及更清晰的安全保障相结合的方式。

在本指南中，我们将构建一个宠物收容所应用，使用 Vercel 的 JSON Render 直接从 AI 模型流式传输其 UI。你将定义一个允许的组件目录，通过注册表将它们连接到真实的 React 实现，并使用 Google 的 Gemini 模型生成用户可以实际交互的动态界面。

---

## 前置要求

要跟随本教程，你需要：

- Node.js 18+ 和 npm 或 pnpm
- Next.js 项目
- Google AI API 密钥

---

## 项目设置

首先，安装所需的依赖：

```bash
npm install @json-render/core @json-render/react @ai-sdk/google ai zod
```

各包功能说明：

| 包名                 | 功能                                          |
| -------------------- | --------------------------------------------- |
| `@json-render/core`  | 提供定义和处理 JSON 规范的核心逻辑            |
| `@json-render/react` | 提供 JSON Render 的 React 适配器              |
| `@ai-sdk/google`     | 将 Google 的 AI 模型集成到应用中              |
| `ai`                 | 提供用于流式传输模型响应的 Vercel AI SDK 工具 |
| `zod`                | 为组件定义和验证模式                          |

接下来，在项目根目录创建 `.env.local` 文件并添加你的 Google AI API 密钥：

```bash
GOOGLE_API_KEY=your-api-key-here
```

---

## JSON Render 的核心概念

在编写代码之前，了解 JSON Render 的三个主要部分会有所帮助：**目录（Catalog）**、**注册表（Registry）** 和 **规范（Spec）**。

### 目录（Catalog）

目录定义模型可以使用的组件。你可以把它看作一个严格的组件词汇表。对于每个组件，你定义其名称、接受的属性、这些属性的类型，以及它可以触发的任何事件。

### 注册表（Registry）

注册表将这些抽象的组件定义连接到应用程序中真实的 React 组件。它是模型结构化输出与实际 UI 实现之间的桥梁。

### 规范（Spec）

规范是描述当前界面的 JSON 对象。它是模型生成的，也是渲染器消费的内容。

这三个部分共同创建了一个受控循环：模型输出结构化 UI 描述，你的应用只使用你明确允许的组件和行为来渲染它。

---

## 搭建宠物收容所应用

我们将分层构建应用，从共享的规范类型开始，然后添加组件、目录、注册表，最后是渲染器。

### 定义类型

首先，定义一个共享的 `SpecType`。

创建 `types.ts` 文件并添加以下代码：

```typescript
import type { ActionBinding } from "@json-render/core"

export interface SpecType {
  root: string
  elements: Record<
    string,
    {
      type: string
      props: Record<string, unknown>
      children?: string[]
      on?: Record<string, ActionBinding | ActionBinding[]>
    }
  >
  [key: string]: unknown
}
```

此接口定义模型将生成的 JSON 规范的整体结构。

### 构建 React 组件

接下来，创建渲染器将使用的 React 组件。这些组件通过属性接收 AI 生成的数据，并通过 `emit` 函数将用户交互传递回渲染器。

创建 `components.tsx` 文件：

```typescript
import React from "react";

interface ComponentProps {
  props: Record<string, any>;
  emit?: (event: string) => void;
  children?: React.ReactNode;
}

export const PetCard = ({ props, emit }: ComponentProps) => (
  <div
    className="bg-white rounded-2xl shadow-md border p-5 cursor-pointer hover:border-amber-500 transition-all"
    onClick={() => emit?.("click")}
  >
    <h3 className="text-xl font-bold text-slate-800">{String(props.name)}</h3>
    <p className="text-sm text-slate-600">{props.breed} | {props.age}</p>
    <div className="flex flex-wrap gap-2 mt-3">
      {props.personality?.map((trait: string, i: number) => (
        <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border">
          {trait}
        </span>
      ))}
    </div>
  </div>
);

export const PetDetail = ({ props, emit }: ComponentProps) => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <button onClick={() => emit?.("back_to_grid")} className="text-amber-600 text-sm mb-4">← 返回</button>
    <h1 className="text-4xl font-black mb-2">{props.name}</h1>
    <p className="text-slate-500 mb-6">{props.breed} • {props.age}</p>
    <p className="text-slate-700 leading-relaxed mb-8">{props.description}</p>
    <button onClick={() => emit?.("click")} className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold">
      领养 {props.name}
    </button>
  </div>
);
```

在这个阶段，UI 片段作为普通的 React 组件存在。下一步是定义模型可以使用的受控系统。

### 定义目录

目录是模型可以生成的 UI 的真实来源。它指定了哪些组件存在、它们接受什么属性、可以触发哪些事件，以及渲染器可以处理哪些操作。

对于这个应用，我们需要 `PetGrid`、`PetCard`、`PetDetail` 等组件。

在 `lib` 文件夹中创建 `catalog.ts` 文件：

```typescript
import { defineCatalog } from "@json-render/core"
import { schema } from "@json-render/react/schema"
import { z } from "zod"

export const petCatalog = defineCatalog(schema, {
  components: {
    Container: {
      props: z.object({
        className: z.string().optional(),
      }),
      slots: ["default"],
      description: "用于分组元素的容器组件",
    },
    PetGrid: {
      props: z.object({
        columns: z.number().optional().default(3),
        className: z.string().optional(),
      }),
      slots: ["default"],
      description: "用于显示多个宠物的网格布局",
    },
    PetCard: {
      props: z.object({
        petId: z.string(),
        name: z.string(),
        breed: z.string(),
        age: z.string(),
        personality: z.array(z.string()).optional(),
      }),
      events: ["click"],
      description: "显示宠物领养信息的卡片",
    },
    PetDetail: {
      props: z.object({
        petId: z.string(),
        name: z.string(),
        breed: z.string(),
        age: z.string(),
        description: z.string().optional(),
        personality: z.array(z.string()).optional(),
        adoptionStatus: z.enum(["available", "pending", "adopted"]).optional(),
      }),
      events: ["click", "back_to_grid"],
      description: "单个宠物的详细视图",
    },
    Text: {
      props: z.object({
        content: z.string(),
        className: z.string().optional(),
        variant: z.enum(["h1", "h2", "h3", "p", "span", "label"]).optional(),
      }),
      description: "文本内容组件",
    },
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "outline"]).optional(),
        className: z.string().optional(),
      }),
      events: ["click"],
      description: "可点击的按钮组件",
    },
  },
  actions: {
    select_pet: {
      params: z.object({ petId: z.string() }),
      description: "选择要领养的宠物",
    },
    view_details: {
      params: z.object({ petId: z.string() }),
      description: "查看详细宠物信息",
    },
    adopt_pet: {
      params: z.object({ petId: z.string() }).optional(),
      description: "发起宠物领养",
    },
    back_to_grid: {
      description: "返回宠物网格视图",
    },
  },
})

export type PetCatalog = typeof petCatalog
```

我们使用 `defineCatalog` 创建一个类型安全的目录。在 `components` 对象中，每个组件都用 zod 声明其属性，以及它可以触发的任何事件和帮助指导模型行为的描述。

那些描述比看起来更重要。它们为模型提供了关于如何使用每个组件的实际提示，特别是当组件应该触发操作或遵循某种交互模式时。

`actions` 对象定义了渲染器可以执行的用户触发行为集，例如查看详情、选择宠物或返回网格。

### 创建注册表

一旦目录存在，下一步就是注册表。这是目录中的抽象定义连接到真实 React 组件和具体操作实现的地方。

创建 `registry.ts` 文件：

```typescript
import { defineRegistry } from "@json-render/react"
import { petCatalog } from "./catalog"
import * as UI from "./components"

export const { registry } = defineRegistry(petCatalog, {
  components: {
    Container: UI.Container,
    PetGrid: UI.PetGrid,
    PetCard: UI.PetCard,
    PetDetail: UI.PetDetail,
    Text: UI.Text,
    Button: UI.Button,
  },
  actions: {
    view_details: async (
      params: { petId: string } | undefined,
      setState: (path: string, value: any) => void,
    ) => {
      if (params && "petId" in params) {
        setState("/state/selectedPet", params.petId)
        setState("/state/view", "detail")
      }
    },
    back_to_grid: async (_params: undefined, setState: (path: string, value: any) => void) => {
      setState("/state/view", "grid")
      setState("/state/selectedPet", null)
    },
    select_pet: async (
      params: { petId: string } | undefined,
      setState: (path: string, value: any) => void,
    ) => {
      if (params && "petId" in params) {
        setState("/state/selectedPet", params.petId)
      }
    },
    adopt_pet: async (
      params: { petId: string } | undefined,
      setState: (path: string, value: any) => void,
    ) => {
      if (params && "petId" in params) {
        setState("/state/adoptedPets", (adopted: string[]) => [...adopted, params.petId])
      }
    },
  },
})
```

`defineRegistry` 将目录绑定到你的实际 UI 层。

`components` 映射告诉 JSON Render 每个目录条目使用哪个 React 组件。`actions` 映射定义了当渲染的 UI 触发事件时应该发生什么。这些操作接收任何相关参数以及一个 `setState` 函数，你可以用它来更新应用的全局状态。

例如，`view_details` 操作将当前视图切换到 "detail" 并存储选中的宠物 ID。这将抽象的模型生成交互转变为真实的应用状态转换。

### 实现渲染器

现在我们可以获取规范和注册表并实际渲染 UI 了。

创建 `renderer.tsx` 文件：

```typescript
"use client";

import React from "react";
import {
  Renderer,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  ValidationProvider,
} from "@json-render/react";
import { registry } from "./registry";
import type { SpecType } from "./types";

export { type SpecType };

export function SpecRenderer({
  spec,
  loading,
}: {
  spec: SpecType;
  loading?: boolean;
}) {
  const sanitizedSpec = React.useMemo(() => sanitizeSpecProps(spec), [spec]);
  const initialState = (spec as any).state || {};

  return (
    <StateProvider initialState={initialState}>
      <VisibilityProvider>
        <ActionProvider>
          <ValidationProvider>
            <Renderer spec={sanitizedSpec} registry={registry} loading={loading} />
          </ValidationProvider>
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}

function sanitizeSpecProps(spec: SpecType): SpecType {
  const newElements: SpecType["elements"] = {};
  for (const key in spec.elements) {
    if (Object.prototype.hasOwnProperty.call(spec.elements, key)) {
      const element = spec.elements[key];
      newElements[key] = {
        ...element,
        props: element.props ?? {},
      };
    }
  }
  return {
    ...spec,
    elements: newElements,
  };
}
```

`SpecRenderer` 组件用状态、可见性、操作和验证所需的提供程序包装核心 `Renderer`。

每个提供程序都有特定的角色：

- **StateProvider** 管理共享的应用状态
- **VisibilityProvider** 处理条件渲染逻辑
- **ActionProvider** 将用户交互路由到注册的操作
- **ValidationProvider** 确保规范与目录模式保持一致

在渲染之前，我们还会清理规范，确保每个元素都有一个属性对象。这个小的防御性步骤有助于避免在流式传输期间模型输出不完整或不均匀时的运行时失败。

### 从后端流式传输 UI

接下来，我们需要一个从模型流式传输 UI 的后端路由。与其一次性生成完整界面，我们将随时间流式传输 JSONL 补丁。

在 `app/api/generate/route.ts` 创建文件：

```typescript
import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { buildUserPrompt } from "@json-render/core"
import { petCatalog } from "@/lib/catalog"

const SYSTEM_PROMPT = petCatalog.prompt({
  customRules: [
    "你是一个 UI 生成器。只输出原始 JSONL 补丁。",
    "使用 '/state/view' 在 'grid' 和 'detail' 之间导航。",
  ],
})

export async function POST(req: Request) {
  const { prompt, context } = await req.json()
  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt({ prompt, currentSpec: context?.previousSpec }),
  })
  return result.toTextStreamResponse()
}
```

这个 API 路由首先通过 `petCatalog.prompt()` 生成系统提示。该提示给模型一个它可以在其中工作的受约束 UI 系统描述。

在 POST 处理程序中，`streamText` 将请求发送到 Gemini 并将结果流式传输回客户端。调用 `buildUserPrompt` 包括用户当前的提示和之前的规范，这允许模型迭代更新现有界面，而不是每次都重新生成所有内容。

这种增量方法更适合交互式应用。它保留上下文，减少 UI 中不必要的变动，并使渲染的体验感觉更具对话性。

### 连接所有组件

现在让我们在 `PetShelterApp.tsx` 中将流式 hook 连接到渲染器：

```typescript
"use client";

import React, { useState } from "react";
import { SpecRenderer, SpecType } from "@/lib/renderer";
import { useUIStream } from "@json-render/react";

export default function PetShelterApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  const { spec: streamedSpec, isStreaming, send } = useUIStream({
    api: "/api/generate",
    onComplete: (spec) => {
      setMessages(prev => [...prev, { role: "assistant", content: "UI 生成成功" }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    setMessages(prev => [...prev, { role: "user", content: inputValue }]);
    send(inputValue, { previousSpec: streamedSpec as SpecType });
    setInputValue("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-96 bg-white border-r flex flex-col">
        <div className="p-4 bg-amber-600 text-white font-bold">宠物领养 AI</div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg ${m.role === "user" ? "bg-amber-100" : "bg-slate-100"}`}>
              {m.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full p-3 border rounded-xl"
            placeholder="搜索宠物..."
          />
        </form>
      </div>
      <div className="flex-1 overflow-auto p-8">
        {streamedSpec && <SpecRenderer spec={streamedSpec as SpecType} loading={isStreaming} />}
      </div>
    </div>
  );
}
```

这个组件将聊天式提示流和流式渲染器结合在一起。

`useUIStream` hook 处理来自后端的规范更新。当用户提交提示时，应用发送提示和当前规范上下文，允许模型演进 UI 而不是重新开始。结果是一个界面生成感觉迭代而非一次性的系统。

### 扩展组件系统

一旦基本流程运行正常，你就可以扩展组件词汇而无需改变底层架构。

例如，你可以添加：

- 用于按品种或年龄筛选宠物的 `FilterBar`
- 显示领养状态的 `StatusBadge`
- 用于流式传输占位内容的 `LoadingCard`
- 真实的后端领养操作替代本地状态更新
- 针对应用组件词汇调优的不同模型

这是 JSON Render 最实用的优势之一。目录定义了模型可以工作的范围，而注册表和渲染器在系统增长时保持稳定。

---

## JSON Render 与替代方案对比

JSON Render 是 AI UI 工具这一更广泛类别的一部分，但它解决了比一些被归为一类的替代方案更具体的问题。

两个常见的比较是 **CopilotKit** 和 **A2UI Protocol**。虽然这三个都与 AI 驱动的界面相关，但它们位于堆栈的不同层次：

| 工具              | 最佳适用                                        | 强调重点                     | 需要考虑的权衡               |
| ----------------- | ----------------------------------------------- | ---------------------------- | ---------------------------- |
| **JSON Render**   | 需要安全、受模式约束的 AI 生成 UI 的 React 应用 | 从结构化组件定义进行受控渲染 | 最适合你想严格约束 UI 词汇时 |
| **CopilotKit**    | AI 行为和前端状态需要保持紧密同步的应用         | 无头 AI 状态管理和 UI 协调   | 较少关注渲染边界本身         |
| **A2UI Protocol** | 需要标准化代理到客户端 UI 协议的跨平台系统      | 跨客户端和框架的正式互操作性 | 更注重协议而非应用级渲染     |

主要区别在于每个工具在哪里划定边界。

**JSON Render** 专注于渲染控制。当你最大的关注点是让模型组合界面而不让它生成任意代码时，它最有用。你定义允许的构建块，验证输出，并保持渲染可预测。

**CopilotKit** 更以状态同步为中心。如果你的挑战是在长时间运行的工作流中协调助手状态、UI 更新和用户操作，CopilotKit 可能是更好的选择。

**A2UI Protocol** 朝着不同的方向发展。它较少关注 React 特定的渲染，更多是关于定义一种标准化协议，可以将结构化 UI 片段跨环境发送。这使其对多客户端或跨平台架构更具吸引力。

---

## 如何选择？

如果你需要一个实用的经验法则：

- **选择 JSON Render** 当你想要 AI 生成的 UI，但只在 tightly controlled component system 内
- **选择 CopilotKit** 当你更难的问题是 AI 状态编排而非安全组件渲染
- **选择 A2UI Protocol** 当你需要一种正式的、与框架无关的方式让代理和客户端跨平台交换 UI 定义

这种区别很重要，因为这些工具不是可互换的。它们可能都支持 AI 驱动的界面，但它们针对不同的架构约束进行了优化。

---

## 何时选择 JSON Render

JSON Render 在你希望模型帮助组装 UI 而不给它直接控制渲染层时最强。

这使它适合构建以下系统的团队：

- 具有受约束 UI 模式的内部工具
- 需要渲染已批准组件的 AI 助手
- 从固定设计系统组装的动态仪表板或工作流
- 验证和可预测性比原始灵活性更重要的应用

如果你希望模型发明任意布局、自由生成自定义代码，或在最少的应用特定设置下跨多个前端目标操作，它的吸引力就较小。

换句话说，**JSON Render 最适用于当你的问题不是"我如何让模型生成任何东西？"而是"我如何让模型只生成我能安全支持的东西？"**

---

## 结论

Vercel 的 JSON Render 为 AI 生成的 UI 提供了一种更适合生产的方法。

与其让模型输出原始 React 或 HTML，不如你定义一个允许的组件目录，通过注册表将这些组件映射到真实的 React 实现，并在经过验证的运行时内渲染生成的规范。模型仍然为界面组合做出贡献，但它在你应用控制的规则内这样做。

这就是这种模式真正的吸引力所在。它为你提供了一种方法，使生成式 UI 有用而不会让它变得不可预测。

对于评估 AI 生成界面工具的团队来说，决定归结为你最需要控制的地方。如果你的优先级是安全渲染、严格的组件边界和结构化模型输出，JSON Render 是一个强有力的选择。如果你的优先级是更广泛的 AI 状态编排或跨平台协议设计，其他选项可能更有意义。

本教程中的宠物收容所应用是一个简单的演示，但底层模式可以扩展到演示之外。一旦你将模型的角色与渲染器的责任分开，你就会得到一个更容易验证、更容易推理、更容易扩展的系统。

这就是 JSON Render 值得关注的原因。它不仅仅是从 JSON 生成 UI 的方式。它是对许多团队现在提出的更大问题的实际回答：**如何在不放弃对前端控制的情况下构建动态 AI 界面？**
