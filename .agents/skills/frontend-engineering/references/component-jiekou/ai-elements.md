# JieKou AI Elements

**源码目录**：`src/components/ai-elements/`。

聊天、流式回答、代码块、工具调用、引用、预览等 AI 场景优先使用这里的组件，不要重新手写基础 UI。

| 组件                         | 用途                            |
| ---------------------------- | ------------------------------- |
| `conversation`               | 消息滚动容器与 scroll-to-bottom |
| `message`                    | user / assistant 消息包装       |
| `response`                   | 流式 markdown 渲染              |
| `prompt-input`               | textarea + toolbar + submit     |
| `code-block`                 | 代码高亮与复制                  |
| `reasoning`                  | thinking 折叠展示               |
| `tool`                       | 工具执行状态 UI                 |
| `branch`                     | 多回答分支导航                  |
| `inline-citation` / `source` | 引用和来源展示                  |
| `suggestion`                 | prompt suggestion chips         |
| `web-preview`                | iframe 预览                     |
| `sla-metrics`                | TTFT / TPS 性能指标             |
| `image`                      | base64 图片展示                 |
| `loader`                     | loading spinner                 |
| `actions`                    | 消息操作栏                      |
| `task`                       | 文件任务展示                    |

流式状态必须有 loading/placeholder；消息 action 需要可访问 label；引用和来源不要只靠颜色区分。
