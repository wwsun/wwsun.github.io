---
title: 浅谈LLM-based Agent(二)：你最想知道的工程那些事-网易KM
source: https://km.netease.com/v4/detail/blog/243921
author: 
published: 
created: 2025-07-11
description: 
tags:
  - clippings
  - agent
---
接上： [浅谈LLM-based Agent(一)：简要介绍&产品调研](https://km.netease.com/v4/topic/5047/item/110077)

---

上一篇文章中，简要介绍了Agent的一些概念、设计模式、类别、产品。本文将继续介绍Agent在工程上的一些技术环节。

本文试图回答如下问题：

1. Agent的执行流程框架有哪些种类？ReAct是什么？
2. Function Calling是什么？如何使用的？
3. 当前火热的MCP是什么？与Function Calling有哪些区别？有了MCP后，真的不再需要Function Calling了吗？
4. Memory是什么，短期Memory和长期Memory有什么区别？
5. Agent通用评测Benchmark有哪些？

---

## 三 工程调研

将重点介绍下：

1. 流程框架。Agent的整体执行流程有哪些范式。
2. Action。LLM如何和外部工具交互。
3. Observation。LLM如何利用工具调用结果和环境反馈。
4. Memory。LLM如何知道过去的对话交互信息。
5. Agent通用评测Benchmark。Agent通用评测的数据集有哪些。

## 3.1 流程框架

这里只针对高级的实现模式进行介绍。如前所述，高级的Agent实现模式，实质上就是一个或多个while循环。当前，很多Agent都是基于CoT（Chain-of-Thought）、Act、ReAct等流程框架实现的。

### 3.1.1 CoT/Act

对于CoT来说，它是一种大模型内置的推理能力。CoT效果可以通过精细化地定制Prompt呈现，不过当前的大多数推理类模型，通过训练让大模型原生拥有了CoT的能力。在使用时，主要是将一个复杂的问题分解成多个子问题，每个子问题借助Prompt或者大模型内置推理能力得到结果。

下面展示了大模型训练所需的CoT数据集样例（ [https://huggingface.co/datasets/Xkev/LLaVA-CoT-100k/viewer/default/train?views%5B%5D=train&row=1](https://huggingface.co/datasets/Xkev/LLaVA-CoT-100k/viewer/default/train?views%5B%5D=train&row=1) ）：

![](https://kmpvt.pfp.ps.netease.com/file/6826fbe681e5f46204ae7edciL4wKTJO01?sign=e98ad3aLxSHeN1YtGYnxDaqzKnk=&expire=1752216127&type=image/png) 上面展示的，就是CoT数据集的核心部分。

对于Act框架来说，可以认为它是大模型外置的扩展能力。大模型不能穷尽所有知识，而且在解决真实问题中，也需要和环境进行交互。Act则是让大模型和环境连接的一种框架，通过调用工具从环境获取信息、对环境产生影响、从环境接收反馈等。获取得到的信息或者反馈，就是Observation。在一般使用时，也是将一个复杂任务分解成多个步骤，每个步骤选择性地调用外部工具，然后得到Observation。以此循环往复，直至解决问题或者到达其他结束条件。

下图是一种多Agent中的Act框架：

![](https://kmpvt.pfp.ps.netease.com/file/6826fc2f38f404f91b9c8ac6JGmH2V9y01?sign=wJUPeYFZYi5mKy_6VdaQ9ysGcpI=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50)

### 3.1.2 ReAct

#### 3.1.2.1 简介

> ReAct: Synergizing Reasoning and Acting in Language Models【ICLR 2023】（ [https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629) ）

ReAct（aka. “Reasoning” (Think) with “Acting” (Act)）是一个涵盖 **思考、执行、观察并循环往复** 的框架流程。可以认为ReAct是CoT与Act的合体，不仅包含了大模型到外部的交互 **（React To Act）** ，还包含了外部Action结果反馈至大模型后的反思过程 **（Act To React）** 。

![](https://kmpvt.pfp.ps.netease.com/file/6826fca91ec87c3d0486af137f74kBvP01?sign=sB0Zv-Vgk0TWjmiyzSKrqU4_nig=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 这是ReAct与CoT、Act-Only的一些对比情况（总的来说就是，两者结合，效果更好）：

#### 3.1.2.2 示例

**ReAct工作流程及示例（基于LangGraph/LangChain实现）：**

1. 思考（Thought）：模型对当前问题进行分析，利用 **CoT** 思考下一步需要采取的行动。
2. 行动（Action）：模型决定调用哪些工具或函数，并提供必要的参数。
3. 观察（Observation）：工具执行后返回结果，模型对结果进行观察。
4. 响应（Response）：模型根据观察结果思考，是生成最终的用户响应，还是（调整Action Plan）继续执行。
```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

# python3 -m pip install -U langchain_openai langchain_community langgraph

# First we initialize the model we want to use.
# 更改api_key
model = ChatOpenAI(api_key="xxxxxx", 
                   base_url="https://api.siliconflow.cn/v1",
                   model="Qwen/Qwen2.5-72B-Instruct")
search = TavilySearchResults(tavily_api_key='xxxxxxxxx',
                             max_results=2)
agent = create_react_agent(model, tools=[search])
for step in agent.stream(
    {"messages": [{"role": "user", "content": "下周一想去上海迪士尼玩，为我制定个计划，包含天气、酒店、好玩的项目。"}]},
    stream_mode="values",
):
    step["messages"][-1].pretty_print()
```

![](https://kmpvt.pfp.ps.netease.com/file/6826fdb0120c355a45eb69baZzatuhLT01?sign=a5VSFzeYHIhATEe9yDSUZaZkmcI=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) LangGraph中的ReAct实现参考： [https://github.com/langchain-ai/langgraph/blob/main/libs/prebuilt/langgraph/prebuilt/chat\_agent\_executor.py](https://github.com/langchain-ai/langgraph/blob/main/libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py) 。 **该实现与Paper中不一样的点** ：

![](https://kmpvt.pfp.ps.netease.com/file/6826fdcf188b9f58b73ce0f5w5iQiep501?sign=KvZ9IJEsUYhOuUhKEZ8T4r85tNc=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 总的来说就是： **ReAct发布的时候，LLM模型还不太强** ；而LangGraph在设计实现的时候，LLM已经比较强了（支持推理、可以通过Function Calling机制调用多个工具等），所以就相对简化了ReAct实现。

> 相信随着大模型能力越来越强，Agent的实现框架也会更为简单，也更能够解决现实问题。

## 3.2 Action

### 3.2.1 Function Calling

#### 3.2.1.1 简介

由OpenAI提出，是一种让大模型 **学习及预测出需要使用的工具** 的方法。每个工具可以理解为一个Function。

调用工具的 **目的** ：大模型不可能囊括所有的数据，需要根据上下文调用工具来访问处理数据，或其他特定任务（天气查询、命令执行等）。

工具调用的 **前提** ：

- 确定调用工具的时机，以及调用哪种类型的工具；
- 确定传入工具的参数。

在Function Calling出现 **之前** ，是如何调用工具的？

- **人为确定** 调用工具的时机以及类型。 **问题** ：是很难对每处调用都人为指定，不通用。
- 需要 **显示地** 在Prompt描述好工具输入参数结构，或者通过NLP等其他工具提取出结构化的输入参数。 **问题** ：不同工具的输入结构不一样，很难每个都在Prompt定义，不通用。

有了Function Calling后，可以解决上述问题。 **解决方法** ：

- 准备样本数据（Prompt，以及工具名、工具描述、参数名、参数描述，和要求LLM返回的工具名及参数），通过LLM指令微调， **学习到** 工具调用的时机、类型、结构化的输入；
- 使用时，只需传入一般的Prompt和自定义的工具元信息，即可在对话过程中让LLM，根据 **Prompt、上下文、用户输入和工具及参数描述之间的相关性** ，自动判定确定出工具调用的时机、类型、结构化的输入参数。

**Function Calling指令微调所用样本数据** （ [https://huggingface.co/datasets/Deepexi/function-calling-small](https://huggingface.co/datasets/Deepexi/function-calling-small) ）。主要包含如下部分：

- **SystemPrompt** 。包含System描述，和一组工具，每个工具包含工具名、工具描述、参数名、参数描述；
- **UserPrompt及其对应的AssistantResponse** 。其中AssistantResponse中包含返回的工具名和参数名与值。
```json
{
  "systemPrompt": 你是一个函数筛选助理，如果与问题相关的话,您可以使用下面的函数来获取更多数据以回答用户提出的问题:{"function": "UpdateTicketNum", "description": "对用于免登嵌入报表的指定的ticket进行更新票据数量操作。", "arguments": [{"name": "Ticket", "type": "string", "description": "三方嵌入的票据值，即URL中的accessTicket值。"}, {"name": "TicketNum", "type": "integer", "description": "票据数。\n- 取值范围：1~99998，建议值为1。"}]}{"function": "DeregisterLocation", "description": "取消Location注册。", "arguments":[{"name": "LocationId", "type": "string", "description": "Location ID\n> 您可以调用接口RegisterLocation获取Location ID。"}]}{"function": "SyncMemberBehaviorInfo", "description": "保存会员行为信息。", "arguments": [{"name": "body", "type": "object", "description": "请求参数"}]}请以如下格式回复：:{"function":"function_name","arguments": {"argument1": value1,"argument2": value2}}, 
  "userPrompt":  "我想将免登嵌入报表的票据值为"abcd1234"的票据数量更新为10。",
  "assistantResponse":
    {
      "function": "UpdateTicketNum",
      "arguments": [
          {
              "Ticket": "abcd1234",
              "TicketNum": 10
          }
      ]
  }
}
```

#### 3.2.1.2 示例

**Function Calling工作流程：**

1. 用户提问：用户向模型提出问题。
2. 模型分析：模型分析问题，决定需要调用的外部工具及其参数。
3. 调用工具：根据工具名字和参数进行调用。
4. 工具响应：工具执行请求并返回结果。
5. 生成回答：模型根据工具返回的结果生成最终的用户响应。

**示例如下（基于OpenAI API实现）：**

```python
import asyncio
import json

from openai import OpenAI

# python3 -m pip install -U openai

class OpenAIClient:
    def __init__(self, api_key: str, base_url: str, tools: list[dict], tools_fn: dict):
        self.openai_client = OpenAI(api_key=api_key, base_url=base_url)
        if len(tools) != len(tools_fn):
            raise ValueError("tools and tools_fn must have the same length")
        self.tools = tools
        self.tools_fn = tools_fn

    async def _send_messages_basic(self, model: str, messages: list[dict], tools: list[dict]) -> str:
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
        )
        return response.choices[0].message

    async def send_messages(self, model: str, messages: list[dict]) -> str:
        print("--- prepared tools ---")
        print(json.dumps(self.tools, indent=4))
        resp_msg = await self._send_messages_basic(model, messages, self.tools)
        if resp_msg.tool_calls:
            print("--- tool call ---")
            to_call_tool = resp_msg.tool_calls[0]
            # 从LLM response中获取需要调用工具的名字
            func_name = to_call_tool.function.name
            if any(tool["function"]["name"] == func_name for tool in self.tools):
                # 从LLM response中获取需要调用工具的参数
                tool_args = to_call_tool.function.arguments
                tool_args = json.loads(tool_args)
                # 调用工具函数得到结果
                custom_tool = self.tools_fn[func_name]
                res = custom_tool(**tool_args)
                # 将结果发送给LLM
                messages.append({"role": "tool", "tool_call_id": to_call_tool.id, "content": str(res)})
                # 得到大模型回复
                tool_resp_msg = await self._send_messages_basic(model, messages, self.tools)
                messages.append({"role": "assistant", "content": tool_resp_msg.content})
                print(f"assistant: {tool_resp_msg.content}")
            else:
                print(f"Unknown function: {func_name}")
        else:
            messages.append({"role": "assistant", "content": resp_msg.content})
            print(f"assistant: {resp_msg.content}")

def multiply(a: float, b: float) -> float:
    return a * b

tools = [
    {
        "type": "function",
        "function": {
            "name": "multiply",
            "description": "Multiplies two numbers together.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {
                        "type": "integer",
                        "description": "The first number.",
                    },
                    "b": {
                        "type": "integer",
                        "description": "The second number.",
                    },
                },
                "required": ["a", "b"],
            },
        },
    }
]

async def main(api_key: str, base_url: str, model: str, tools: list[dict], tools_fn: dict):
    openai_client = OpenAIClient(api_key, base_url, tools, tools_fn)

    messages = []
    system_input = "你是一个数学计算助手，能够进行简单的数学计算。"
    print(f"system: {system_input}")
    messages.append({"role": "system", "content": system_input})
    user_input = "2乘以3等于多少？"
    print(f"user: {user_input}")
    messages.append({"role": "user", "content": user_input})
    await openai_client.send_messages(model, messages)

if __name__ == "__main__":
    asyncio.run(
        main(
            api_key="xxxxxx",  # LLM API Key
            base_url="https://api.siliconflow.cn/v1",  # LLM API URL
            model="Qwen/Qwen2.5-72B-Instruct",  # LLM Model Name
            tools=tools,  # LLM Tools Schema
            tools_fn={"multiply": multiply},  # 工具函数实体
        )
    )
```

### 3.2.2 MCP

#### 3.2.2.1 简介

MCP（aka. Model Context Protocol）是由Anthropic于2024年11月25日在 [Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) 中提出的，一种使开发者能够以标准统一的方式将各种数据源、工具和功能连接到LLM模型中。就像USB-C让不同设备能够通过相同的接口连接一样。在协议设计上，借鉴了LSP的设计模式。

![](https://kmpvt.pfp.ps.netease.com/file/68270007120c355a45eb749elloG7xH801?sign=SuvbgWZzJsjkjYpbyBy1BdiJOSs=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) ![](https://kmpvt.pfp.ps.netease.com/file/682700244c26f7c14aaedded4Qav2BW101?sign=3chxvs2aAkBWFbE29-lQFYzmQrs=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) **MCP出现前后大模型连接工具对比** ：

1. **在MCP出现前** ：由于每种工具的接口协议（HTTP、数据库等）不一样，大模型在连接这些工具的时候，就需要根据这些协议进行开发适配（在调用大模型前，针对每类远程工具开发一个客户端）。这就是MCP要解决的 **问题** 。
2. **在MCP出现之后** ：针对工具部署的服务端以及连接工具的客户端，统一协议标准。 **所有调用工具的地方，只要适配这一套标准就可以了** 。

![](https://kmpvt.pfp.ps.netease.com/file/6827004894c247127d2d2f4foDMGTuw501?sign=SQHqLscGWC4OdcYC4X1xuM-i-Rw=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) **需要注意的是** ：

1. MCP只是定义了工具在服务端部署以及客户端连接的协议，大模型在选择是否需要使用工具、使用哪种工具、确定工具调用的结构化参数时， **仍然是需要用到Function Calling的** 。
2. MCP支持Stdio、SSE、Streamable-HTTP等协议。其中，对于Stdio来说，MCP的Client和Server是在同一个节点的不同进程中。

> 如果是自己开发的工具，其实没必要使用MCP，因为自己开发的工具自己当然知道如何调用； **MCP主要是针对使用别人开发的工具时的协议适配。**

![](https://kmpvt.pfp.ps.netease.com/file/6827006d3fcb84ec6105c6d06FbzZ5P601?sign=RedBBWAKHlHn6BpXbvdmZ6by0js=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 为什么有了LangChain这类工具，还需要MCP—— **主要原因是面向的对象不同（By Harrison Chase ）** ：

- LangChain这类工具主要面向开发者的；
- MCP主要面向没有开发经验的用户，或者不想开发的人。而非开发者的数量远大于开发者。

**MCP已经逐渐形成生态：**

MCP.so： [https://mcp.so/](https://mcp.so/)

![](https://kmpvt.pfp.ps.netease.com/file/682701658f78bc22e9ed949dqipzuUNZ01?sign=8X-upSaC8F_TVeAXKY_BO1CDdxQ=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 阿里ModelScope： [https://www.modelscope.cn/mcp](https://www.modelscope.cn/mcp)

#### 3.2.2.2 示例

**MCP使用的具体流程：**

1. 应用（Claude Desktop / Cursor等）初始化时，通过MCP Client连接MCP Server获取Server上所有可用的工具。
2. 应用将用户问题随同工具一起发送给LLM。
3. LLM通过Function Calling，分析出可用的工具，并决定使用哪一个（或多个），然后告知应用。
4. 应用内，通过MCP Client将工具名和参数列表发送给MCP Server执行所选的工具，并将执行结果发送给MCP Client（类似于RPC）。
5. 应用收到MCP Client的工具调用结果后，将其送回给LLM。
6. LLM结合执行结果构造Prompt并生成自然语言的回应，然后将LLM回应结果展示给用户。

![](https://kmpvt.pfp.ps.netease.com/file/6827019f5ee864af9759764cFT9Y0UaF01?sign=o6aQpPS9hdib2urQwJbf5uKXkGQ=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) **MCP使用示例（基于FastMCP+OpenAI实现）** ：

MCP Server（streamable-http）如下：

```python
from typing import Annotated

from fastmcp import FastMCP
from pydantic import Field

# python3 -m pip install fastmcp

mcp = FastMCP(name="MyAssistantServer")

@mcp.tool(description="Adds two numbers together.")
def multiply(
    a: Annotated[float, Field(description="The first number")],
    b: Annotated[float, Field(description="The second number")],
) -> float:
    return a * b

if __name__ == "__main__":
    # 运行MCP Server（streamable-http协议）
    mcp.run(transport="streamable-http", host="127.0.0.1", port=9000)
```

在OpenAI Python SDK中调用MCP Client：

```python
import asyncio
import json

from fastmcp import Client
from openai import OpenAI

# python3 -m pip install -U openai fastmcp

class OpenAIClient:
    def __init__(self, api_key: str, base_url: str, mcp_client: Client):
        self.openai_client = OpenAI(api_key=api_key, base_url=base_url)
        self.mcp_client = mcp_client

    async def _get_tools(self) -> list[dict]:
        mcp_tools = await self.mcp_client.list_tools()
        tools = [
            {
                "type": "function",
                "function": {
                    "name": mcp_tool.name,  # 工具名称
                    "description": mcp_tool.description,  # 工具描述
                    "parameters": mcp_tool.inputSchema,  # 工具输入模式
                },
            }
            for mcp_tool in mcp_tools
        ]
        return tools

    async def _send_messages_basic(self, model: str, messages: list[dict], tools: list[dict]) -> str:
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
        )
        return response.choices[0].message

    async def send_messages(self, model: str, messages: list[dict]) -> str:
        tools = await self._get_tools()
        print("--- tools in mcp server ---")
        print(json.dumps(tools, indent=4))
        resp_msg = await self._send_messages_basic(model, messages, tools)
        if resp_msg.tool_calls:
            print("--- tool call ---")
            to_call_tool = resp_msg.tool_calls[0]
            # 从LLM response中获取需要调用工具的名字
            func_name = to_call_tool.function.name
            if any(tool["function"]["name"] == func_name for tool in tools):
                # 从LLM response中获取需要调用工具的参数
                tool_args = to_call_tool.function.arguments
                tool_args = json.loads(tool_args)
                # 使用mcp client调用工具得到结果
                res = await self.mcp_client.call_tool(func_name, tool_args)
                # 将结果发送给LLM
                messages.append({"role": "tool", "tool_call_id": to_call_tool.id, "content": str(res)})
                # 得到大模型回复
                tool_resp_msg = await self._send_messages_basic(model, messages, tools)
                messages.append({"role": "assistant", "content": tool_resp_msg.content})
                print(f"assistant: {tool_resp_msg.content}")
            else:
                print(f"Unknown function: {func_name}")
        else:
            messages.append({"role": "assistant", "content": resp_msg.content})
            print(f"assistant: {resp_msg.content}")

async def main(api_key: str, base_url: str, model: str, mcp_server_url: str):
    # 构建客户端。详见：https://gofastmcp.com/clients/client
    async with Client(mcp_server_url) as mcp_client:
        print(f"Client connected: {mcp_client.is_connected()}")
        openai_client = OpenAIClient(api_key, base_url, mcp_client)

        messages = []
        system_input = "你是一个数学计算助手，能够进行简单的数学计算。"
        print(f"system: {system_input}")
        messages.append({"role": "system", "content": system_input})
        user_input = "2乘以3等于多少？"
        print(f"user: {user_input}")
        messages.append({"role": "user", "content": user_input})
        await openai_client.send_messages(model, messages)

    # Connection is closed automatically here
    print(f"Client connected: {mcp_client.is_connected()}")

if __name__ == "__main__":
    asyncio.run(
        main(
            api_key="xxxxxx",  # LLM API Key
            base_url="https://api.siliconflow.cn/v1",  # LLM API URL
            model="Qwen/Qwen2.5-72B-Instruct",  # LLM Model Name
            mcp_server_url="http://localhost:9000/mcp",  # MCP server(streamable-http) URL
        )
    )
```
- 先启动MCP Server（streamable-http），端口好9000；
- 然后执行第2个脚本，在使用OpenAI调用大模型时，通过MCP Client获取工具信息，以及在Server端执行LLM Response指定的工具。

![](https://kmpvt.pfp.ps.netease.com/file/68270a57a54547984c7fcb5bb0YQRxkj01?sign=a1jWiVTh_Hxeox8w7iX4DKL0954=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) ![](https://kmpvt.pfp.ps.netease.com/file/68270a9bb34cca76f37733e5fkheODPc01?sign=0wEpO9VaLiMmQZS5bB3uEJlg5ZY=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50)

> 和Function Calling示例对比，其实可以看出，MCP的引入只是将与工具实体的交互变得更规范和简单了，但是LLM **依然是在Function Calling大的流程下选择要不要使用工具、使用哪个工具的** 。

## 3.3 Observation

![](https://kmpvt.pfp.ps.netease.com/file/682702249d8e31619618ec59alNhYkrq01?sign=WmTDBWuSy6y2MD4XgbauRv0lirY=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 观察的对象有如下几种形式：

![](https://kmpvt.pfp.ps.netease.com/file/68270241ee26949a0e1e0ec5PHoiQvPd01?sign=gSZF8lctvHqzdpP9tTaL9EPr28A=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 近年来提出的一些Observation优化方法（基本都是基于ReAct大的框架下，对Observation环节进行优化）：

**SelfCheck：**

> Using LLMs to Zero-Shot Check Their Own Step-by-Step Reasoning【ICLR2024】（ [https://arxiv.org/pdf/2308.00436](https://arxiv.org/pdf/2308.00436) ）

给定一个问题q，由某个带有适当CoT提示的LLM生成器（Generator）生成分步解决方案s。SelfCheck依次考虑s的每个步骤，并尝试根据前面的步骤确定其各自的正确性。

1. **目标提取（Target extraction）** 。作者认为，要检查某个推理步骤，首先需要弄清楚该推理步骤想要实现的目标。如果没有特定的目标，推理重塑阶段就会朝着随机的方向进行，导致无法作为原始步骤的参考内容。因此，该阶段使用 **问题，以及LLM生成器生成的所有先前步骤** ，来提取当前推理步骤的目标（是实现/完成何种内容）。
2. **信息收集（Information collection）** 。为了降低下一个推理重塑阶段的难度，并避免无关信息影响结果，作者在该阶段 **过滤掉与当前推理步骤不直接相关的信息** 。具体做法是提示LLM从问题和所有先前步骤中收集有用的信息。
3. **推理重塑（Step regeneration）** 。当推理步骤的目标和必要的、有关的信息已知时，可以提示LLM仅使用这些信息独立进行推理和内容生成，而无需了解原始步骤。 **由于信息收集阶段已过滤掉不相关的信息，因此重塑结果可信任度高** 。
4. **结果对比（Result comparison）** 。该阶段提示LLM将上阶段推理重塑的结果与原始推理步骤的内容进行对比。如果推理重塑输出内容“支持/矛盾”原始步骤，便可分别得出原始步骤可能“正确/不正确”的验证结论。此外，当原始步骤的正确性不能直接从再生输出推断出来时，作者设置第三个验证结论：“不直接相关”，以表达该现象。

![](https://kmpvt.pfp.ps.netease.com/file/68270279ee26949a0e1e0f7bvZyUz5pD01?sign=vhxtVQLmx68sW1SEqEmwinTp3TI=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) ![](https://kmpvt.pfp.ps.netease.com/file/68270291da9a3d5287d16464Ye67qb3g01?sign=JI4WMNvG27L1suRt85khptLqRpA=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 还有一些其他方法，鉴于篇幅，这里不再展开。

**Self-Refine:**

> Iterative Refinement with Self-Feedback【NeurIPS 2023】（ [https://arxiv.org/pdf/2303.17651](https://arxiv.org/pdf/2303.17651) ）

**Reflexion:**

> Language Agents with Verbal Reinforcement Learning【NeurIPS 2023】（ [https://arxiv.org/pdf/2303.11366](https://arxiv.org/pdf/2303.11366) ）

## 3.4 Memory

记忆能力可以让大模型能够理解历史对话信息，以便在当前轮次对话中给出更准确地回复。目前的绝大部分大模型本身是没有记忆能力的，都需要借助外部的工程能力配合Prompt来实现。

![](https://kmpvt.pfp.ps.netease.com/file/682702d17814cde973ccc9300LBX5rfP01?sign=6aKzpr6RoYSvLYZQeNgPGWM-8rk=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 大模型的上下文长度是有限的，而且处理能力也是有限的。所以，从实际应用上看，将所有的对话历史都扔给大模型，并不一定能取得较好效果。因此，从大模型能力和用途上看，可以将记忆能力大致划分成2类：

- **短期记忆** 。或者叫做近期记忆，就是近一段时间内与大模型的历史交互信息。在工程实现上，可以通过一个外部存储将每次交互信息更新进去。在最近一轮次调用大模型时，先从这个存储里将历史信息取出来，会同当前输入的Prompt组合到一起，然后再扔到大模型里。特点是，信息长度相对较短，信息内容更为细化。
- **长期记忆** 。记忆的时间范围更大，但相对来说，记忆的内容也会更为抽象（一些知识点、概念、人名、地点等）。在工程实现上，可以认为就是一个更高级的RAG链路（关于RAG，这里就不再展开了）。入库前先基于大模型或者常规NLP等方法，对历史信息进行抽取等处理，然后通过Embedding等技术建立索引；召回时，通过Embedding+Rank等技术获取到与当前Query语义上最相近的TOP K个记忆点。

关于记忆能力建设和应用实践，后续可以关注下 **云音乐社交直播算法团队** 实践文章。

## 3.5 评测Benchmark

### 3.5.1 GAIA

> GAIA: A Benchmark for General AI Assistants【ICLR 2024】（ [https://arxiv.org/pdf/2311.12983](https://arxiv.org/pdf/2311.12983) ）

![](https://kmpvt.pfp.ps.netease.com/file/6827034e266f7ca7da9cbc01wz0se8if01?sign=lIK-xTP7g8RMOhIRL3zgkKELRPw=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) GAIA主要专注于提出一个人类能比较简单地完成，而对于 LLM 则较为困难的 benchmark，因此定义出了 **四个目标** ：

- **真实世界的挑战性的问题（Real-world and challenging questions）** ：GAIA 旨在提出那些虽然 **对人类来说概念上简单，但对现有的AI系统来说却非常具有挑战性的真实世界问题** 。这些问题通常需要模型通过浏览开放且不断变化的网络、处理多模态数据或进行多步骤推理来解答。
- **易于解释性（Easy interpretability）** ：GAIA的问题设计简单，非专家的注释者也能取得近乎完美的得分。此外， **问题配有推理过程，以及数量有限但经过精心策划的问题** ，与那些可能缺乏效率和可靠性的聚合基准测试形成对比。
- **非游戏化（Non-gameability）** ：GAIA设计成不容易被简单粗暴地破解。回答这些问题需要成功完成一系列步骤，由于问题的多样性和行动空间的规模， **这些步骤不容易通过蛮力或记忆化策略来完成** 。此外，答案的准确性要求、它们在互联网上的不可用性以及可以检查推理痕迹，这些都减少了数据污染的可能性。
- **使用简便（Simplicity of use）** ：GAIA的问题设计为简单的提示，可能伴随着一个额外的文件，但 **答案必须是事实性的、简洁且明确的。这些特性允许进行简单、快速且基于事实的评估** 。问题旨在以零样本（zero-shot）的方式回答，限制了评估设置的影响。与许多需要特定数量和性质的提示或对实验设置敏感的LLM基准测试相反。

![](https://kmpvt.pfp.ps.netease.com/file/682703739d8e31619618f476fuBPcFmY01?sign=Q_tSvzQVhDcfzkUQ8ZWa31FOKcw=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) 经过这样的设计和验证后，GAIA总共提供了 **466** 个高质量问题，包含 **3种不同的难度级别和需求的能力维度** （网页浏览、多模态感知、代码生成、文件读取）。其中三种级别的具体解释如下：

- **level-1（简单）**: 通常不需要使用工具，或者最多使用一个工具，但不超过5个步骤；
- **level-2**: 涉及更多的步骤，大约在5到10步之间，需要结合使用不同的工具；
- **level-3（困难）**: 为接近完美的通用AI助手设计的，要求执行任意长的行动序列，使用任意数量的工具，并且需要访问一般性的世界信息。

**Manus评估分数：**

![](https://kmpvt.pfp.ps.netease.com/file/68270390bb06d770f25ff344uCLws8yC01?sign=0lvaJ_F4rKCCCDI1Zaiypb8Fd6k=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50) **HugginFace GAIA Leaderboard** ： [https://huggingface.co/spaces/gaia-benchmark/leaderboard](https://huggingface.co/spaces/gaia-benchmark/leaderboard)

### 3.5.2 AgentBench

> AgentBench: Evaluating LLMs as Agents【ICLR 2024】（ [https://arxiv.org/pdf/2308.03688](https://arxiv.org/pdf/2308.03688) ）

AgentBench是由ChatGLM团队发布的“第一个”旨在跨不同环境评估LLM-as-Agent的基准。它包含8个不同的环境，以提供对llm在各种场景中作为自主代理运行的能力的更全面的评估。这些环境包括5个新创建的域，即：

- 操作系统（OS）
- 数据库（DB）
- 知识图谱（KG）
- 数字纸牌游戏（DCG）
- 横向思维难题（LTP）

以及从已发布的数据集重新编译的3个：

- 房屋管理（HH）(ALFWorld)
- 网上购物（WS）(WebShop)
- 网页浏览（WB）(Mind2Web)

![](https://kmpvt.pfp.ps.netease.com/file/682703eeb6a5fd109365eaf4mECah4Vt01?sign=bWvHyPrW18YR4aSBYhRTvzf41Uo=&expire=1752216127&type=image/png&fop=imageView/6/f/webp/q/50)

---

## 参考文献

1. 李宏毅——一堂课搞懂 AI Agent 的原理： [https://www.bilibili.com/video/BV1BWRhYFE8y/?vd\_source=c23415a35b9aa6194d98a42b5a733d37](https://www.bilibili.com/video/BV1BWRhYFE8y/?vd_source=c23415a35b9aa6194d98a42b5a733d37)
2. Manus的技术实现原理浅析与简单复刻： [https://mp.weixin.qq.com/s/SSO-w6FF4mBm2zrXY5RzkA](https://mp.weixin.qq.com/s/SSO-w6FF4mBm2zrXY5RzkA)
3. 最近爆火的MCP(Model Context Protocol)，读这一篇就够了： [https://mp.weixin.qq.com/s/ULxokHOn4zVOgiLHf9DQUA](https://mp.weixin.qq.com/s/ULxokHOn4zVOgiLHf9DQUA)
4. 不到24小时，开源版Deep Research疯狂来袭： [https://mp.weixin.qq.com/s/bf\_3PmC2-ptzEBadBa6XFQ](https://mp.weixin.qq.com/s/bf_3PmC2-ptzEBadBa6XFQ)
5. Jina DeepSearch/DeepResearch分享： [https://mp.weixin.qq.com/s/znXxhSKyLg2dxJzFc\_XeWg](https://mp.weixin.qq.com/s/znXxhSKyLg2dxJzFc_XeWg)
6. LLM-based Agent评估综述： [https://mp.weixin.qq.com/s/oUMTcqdr5kR1y4JYciTDtg](https://mp.weixin.qq.com/s/oUMTcqdr5kR1y4JYciTDtg)
7. 真正的LLM Agent： [https://mp.weixin.qq.com/s/DoCgIacZ5LQIK31op8PCaw](https://mp.weixin.qq.com/s/DoCgIacZ5LQIK31op8PCaw)
8. OpenManus 多智能体框架的技术拆解： [https://www.53ai.com/news/OpenSourceLLM/2025031396827.html](https://www.53ai.com/news/OpenSourceLLM/2025031396827.html)
9. 一文读懂：OpenManus 智能体： [https://zhuanlan.zhihu.com/p/30090038284](https://zhuanlan.zhihu.com/p/30090038284)
10. ReAct Implementation in LangGraph： [https://langchain-ai.github.io/langgraph/concepts/agentic\_concepts/#react-implementation](https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/#react-implementation)
