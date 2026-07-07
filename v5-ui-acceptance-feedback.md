# V5 UI 验收与问题反馈范围

## 1. 文档目的

本文档用于产品、测试、设计一起验收 `refactor/v5-home-page` 分支的 UI 改造结果。

目标：

- 明确哪些页面和模块需要验收。
- 按类别收集问题，便于定位和分派。
- 给出每个页面可验证的内容、交互、响应式和数据范围。
- 统一反馈格式，避免只描述“样式不对”但无法复现。

## 2. 验收环境建议

建议至少覆盖以下环境：

- Desktop：1440px、1280px、1024px
- Tablet：834px、768px
- Mobile：393px、390px、375px
- 浏览器：Chrome 最新版；如有时间补充 Safari
- 登录状态：
  - 未登录
  - 已登录普通账号
  - 已登录但用户信息接口慢或失败
- 网络状态：
  - 正常网络
  - 慢 3G / Fast 3G，用于观察首屏图片、动效和骨架屏

## 3. 问题反馈格式

请每个问题按以下格式反馈：

```md
### 问题标题

- 严重级别：P0 / P1 / P2 / P3
- 问题分类：视觉 / 文案 / 交互 / 响应式 / 数据 / 路由 / 性能 / 埋点 / 兼容性
- 页面路由：
- 设备与视口：
- 登录状态：
- 浏览器：
- 复现步骤：
- 期望结果：
- 实际结果：
- 截图或录屏：
- 备注：
```

严重级别建议：

- P0：阻塞发布。页面白屏、构建失败、关键 CTA 无法使用、登录链路错误、核心页面不可访问。
- P1：高优先级。主要内容缺失、明显错位、移动端核心区域不可读、价格/模型等关键数据错误。
- P2：中优先级。局部样式偏差、非核心交互问题、低频断点布局问题。
- P3：低优先级。文案微调、间距微调、非阻塞体验优化。

## 4. 反馈分类

### 视觉类

用于反馈：

- 颜色、字体、字号、行高、字重不符合设计。
- 图片裁切、模糊、比例异常。
- 卡片、按钮、边框、圆角、阴影不符合预期。
- 区块间距、对齐、留白异常。
- 新旧设计风格混用明显。

### 文案类

用于反馈：

- 标题、描述、按钮文案与设计稿或产品要求不一致。
- 大小写、标点、拼写错误。
- CTA 文案不清晰。
- 产品术语不一致，例如 GPU Instance、GPU Bare Metal、Dedicated Endpoints、Agent Sandbox。

### 交互类

用于反馈：

- 按钮点击无反应。
- Hover、展开、折叠、轮播、复制、筛选、搜索等行为异常。
- 登录/未登录跳转逻辑不符合预期。
- 弹窗、抽屉、菜单无法关闭或遮挡页面。
- 键盘交互异常，例如搜索建议方向键、Enter、Esc。

### 响应式类

用于反馈：

- 移动端文字溢出、按钮换行异常。
- 图片或动效遮挡内容。
- 横向滚动条异常。
- 移动菜单位置不对。
- Tablet 布局不符合设计。

### 数据类

用于反馈：

- 模型列表、价格、GPU 产品、Sandbox 价格等接口数据未展示。
- loading / skeleton / 空状态异常。
- URL 参数筛选结果不正确。
- 接口失败后页面不可用。

### 路由类

用于反馈：

- CTA 跳转目标错误。
- 外链或 mailto 错误。
- 登录 redirect 参数错误。
- 新增 `/sandbox1` 是否应该可访问、是否需要隐藏或限制。

### 性能类

用于反馈：

- 首屏加载明显过慢。
- 大图加载失败或闪烁。
- WebGL 动效导致卡顿。
- 轮播、滚动、菜单动画掉帧。

### 埋点类

用于反馈：

- Header/Footer/CTA 的 id 缺失。
- 点击事件未上报。
- 埋点名称不符合数据侧约定。

## 5. 页面验收范围

### `/` 首页

验收内容：

- 顶部导航、Hero、LogoCloud、Product、Why Novita、BuiltWith、Testimonials、What's New、Footer 全部展示。
- Hero 主标题为 `The AI cloud for every builder and agent`。
- Hero 背景图和 WebGL 动效正常展示；关闭 reduced motion 时不应影响静态背景。
- LogoCloud 的客户 Logo 展示完整且不变形。
- Product 区包含 Model APIs、GPU Cloud、Agent Sandbox 三大模块。
- Testimonials 卡片文案、Logo、Case Study 链接展示正常。
- What's New 卡片可横向切换。

验收交互：

- `Start Building` 跳注册页。
- `Talk to Us` 跳预约链接。
- AI Agents 卡片复制按钮可复制 URL。
- Product 左侧 sticky 导航可点击并滚动到对应模块。
- Product 当前模块高亮随滚动变化。
- Model APIs 视觉卡片自动切换 LLM / IMAGE / AUDIO / VIDEO / VISION。
- BuiltWith 和 What's New 前后翻页按钮可用，边界状态 disabled 正确。

重点风险：

- 首页首屏图片和 WebGL 动效加载性能。
- 移动端 Hero 文案与图片是否遮挡。
- Product 区长页面滚动时 sticky 位置是否受 Notice 影响。

### `/models` 模型库

验收内容：

- Hero 展示 `Browse our supported open source models`。
- 左侧 TASK、PROVIDER 筛选区展示。
- 右侧搜索框、模型卡片网格展示。
- 模型卡片 Logo、名称、价格、标签、状态展示合理。

验收交互：

- TASK 点击后模型列表和数量变化正确。
- PROVIDER 点击后模型列表变化正确，再次点击取消 provider 筛选。
- `VIEW ALL ... MODELS` 清除筛选。
- 搜索输入后出现建议列表。
- 搜索建议支持鼠标点击跳转。
- 搜索建议支持方向键、Enter、Esc。

URL 参数验收：

- `/models?type=serverless`
- `/models?type=image`
- `/models?type=featured`
- `/models?provider=OpenAI`
- `/models?type=serverless&provider=OpenAI`

重点风险：

- URL 初始化筛选是否正确。
- 动态 multimodal 模型和价格加载后是否造成列表跳动。
- 移动端左侧筛选和三列卡片是否需要适配。

### `/pricing` 定价页

验收内容：

- Hero 展示 `Pricing to seamlessly scale from idea to enterprise`。
- 活动 Banner 展示正常。
- Tabs 包含 Serverless Endpoints、Dedicated Endpoints、Agent Sandbox、GPUs。
- Serverless Endpoints 展示 LLM、Embedding、多模态价格。
- Dedicated Endpoints 展示 LLM GPU-hour 表和 Image Endpoints 订阅卡。
- Agent Sandbox 展示 CPU、Memory、Storage 价格。
- GPUs 展示 GPU 产品价格、On-Demand、Spot、Storage。

验收交互：

- Tab 切换正常。
- `?gpu=1` 默认打开 GPUs。
- `?sandbox=1` 默认打开 Agent Sandbox。
- `?de=1` 默认打开 Dedicated Endpoints。
- Dedicated Endpoints 的 `Create Endpoint` 登录权限跳转正确。
- Image Endpoint 的 Purchase / Contact Sales 行为正确。
- GPU `Get Started`、`Spot Instance Info` 链接正确。
- Sandbox `Integration Guide` 链接正确。

重点风险：

- 各价格接口加载失败时不应白屏。
- Skeleton、空态、错误态是否可接受。
- Console 内复用 Pricing 组件时样式是否异常。

### `/gpus` GPU Cloud

验收内容：

- Hero 展示 `Accelerate Your AI with Novita's GPU Cloud`。
- GPU Pricing 表展示 GPU、VRAM、On-Demand、Spot。
- Code Showcase 展示语言列表、请求代码、响应面板。
- Platform Capabilities 展示成本、自动扩缩、能力卡片、Global Deployment。

验收交互：

- 未登录点击 `Get Started` 跳 `/user/login?redirect=/gpus-console`。
- 已登录点击 `Get Started` 跳 `/gpus-console`。
- `Pricing` 跳 `/pricing?gpu=1`。
- 语言切换 Python / Ruby / PHP / Java / Node.js / Go 正常。
- 请求代码动画结束后响应面板显示。
- `Start Now`、`Pricing`、`Spot Instance Info` 链接正确。

重点风险：

- GPU 价格接口慢或失败时页面展示。
- Code Showcase 移动端横向滚动和代码可读性。
- 背景大图在移动端是否裁切合理。

### `/gpu-baremetal` GPU Bare Metal

验收内容：

- Hero 展示 `Rent Bare Metal GPU Servers`。
- 页面展示以下模块：
  - The Right GPU for Every Workload
  - AI Inference
  - Rendering & Simulation
  - Scientific Computing
  - Purpose-Built for AI Workloads
- GPU 卡片标题、规格、badge、价格或 Contact us 展示正确。

验收交互：

- `Meet with us` 跳预约链接。
- `Contact sales` 打开 `mailto:gpu@novita.ai`。
- `Contact us` 跳预约链接。

重点风险：

- 当前页面为静态营销页，不再展示原动态库存列表。
- 产品需确认动态库存搜索、Reserve、需求提交抽屉是否本期不在 `/gpu-baremetal` 主页面展示。

### `/dedicated-endpoint`

验收内容：

- Hero 展示 `Run Your Models, We Handle the Rest`。
- 价值卡片展示 Pay only、GPU budget、Inference support。
- Serverless vs Dedicated 对比展示。
- Platform 六张能力卡展示。
- Catalog 模型列表展示。
- Workflow 三步流程展示。
- Transparent GPU Pricing 表展示。
- FAQ 展示。

验收交互：

- Hero `Star Deploying` 跳预约链接。
- Hero `See Price` 跳预约链接。
- Pricing `Talk to our team` 跳预约链接。
- FAQ 第一项默认展开。
- FAQ 可展开/收起。
- `Contact support` 打开 support mailto。

重点风险：

- Hero CTA 文案当前为 `Star Deploying`，需确认是否应为 `Start Deploying`。
- Pricing 与 Dedicated Endpoint 独立页面中的 GPU 价格口径是否一致。
- 移动端 FAQ、Workflow 卡片是否溢出。

### `/sandbox`

验收内容：

- Hero 展示 `Let your AI agents run for real`。
- 页面展示：
  - Speed, Security, and Concurrency
  - Sandbox Capabilities
  - Flexible, Usage-Based Pricing
  - Ready to Explore Agent Sandbox
  - Enterprise
- Capabilities 六项能力展示完整。
- Pricing 示例价格展示完整。

验收交互：

- 未登录点击 `Get started` 跳 `/user/login?redirect=/sandbox-console`。
- 已登录点击 `Get started` 跳 `/sandbox-console`。
- `Pricing` 跳 `/pricing?sandbox=1`。
- Pricing 区 `Learn more` 跳 `/pricing?sandbox=1`。
- Guide 卡片 `Learn more` 链接可用。
- Enterprise `Book a call`、`Contact Sales` 链接可用。

重点风险：

- Guide 链接为 `/docs/sandbox/quick-start`、`/docs/sandbox/template`、`/docs/sandbox/filesystem`，需确认 docs 实际路径。
- Hero 插图在移动端是否遮挡或过度裁切。

### `/sandbox1`

验收内容：

- 页面内容应与 `/sandbox` 基本一致。

需产品确认：

- `/sandbox1` 是否仅为临时预览路由。
- 是否需要从 sitemap、导航、SEO、对外投放中排除。
- 是否需要下线或重定向到 `/sandbox`。

### Error / 404

验收内容：

- 404 页面展示 V5 导航、错误 Hero、推荐产品卡片、Footer。
- Error boundary 页面展示 V5 导航、错误 Hero、推荐产品卡片、Footer。
- End of Service 页面推荐卡片样式正常。

验收交互：

- 404 `Go to home page` 跳 `/`。
- Error `Refresh` 可触发 reset。
- 描述内 Discord / contact us 链接可用。
- 推荐产品卡片可点击。

重点风险：

- 推荐卡片仍包含旧路由 `/model-api`、`/serverless`、`/gpu-instance`，需产品确认是否需要改为 V5 对应路由。

## 6. 全局组件验收范围

### 顶部导航 `WebsiteNavbar`

验收内容：

- Logo 展示正确。
- 桌面导航包含 Model APIs、GPUs、Agent Sandbox、Resources、Pricing。
- Model APIs mega menu 展示 Model Types、Featured Providers、Featured Models、View All Models。
- GPUs 下拉包含 GPU Instance、GPU Bare Metal。
- Resources 下拉包含 Docs、Blog、Careers。
- 未登录展示 `Start building`。
- 已登录展示 `Console` 和用户菜单。

验收交互：

- 桌面 hover 展开和关闭正常。
- 下拉菜单不会被页面内容遮挡。
- 移动端汉堡菜单打开/关闭正常。
- 移动端展开 Model APIs、GPUs、Resources 正常。
- 移动端打开菜单后 body 不可滚动，关闭后恢复。
- 路由切换后移动菜单自动关闭。
- Notice 展示时导航整体下移正确。

### Footer 与底部 CTA

验收内容：

- CTA Banner 背景图和文案展示正确。
- Footer 四列链接展示完整。
- 合规图标展示清晰。
- Legal、社媒链接展示完整。

验收交互：

- `Get started` 已登录跳 `/console`。
- `Get started` 未登录跳登录并带 redirect。
- Book demo、Contact support、Supply GPUs、Docs、Blog、Careers、Trust Center、Terms、Privacy、X、LinkedIn、Discord 链接正确。

### Notice 公告条

验收内容：

- 公告条高度与导航偏移正常。
- 单行文案、双行文案都能展示。
- `**bold**` 高亮正常。
- 有 URL 时主文案可点击。

验收交互：

- 点击 close：
  - 桌面：本次关闭。
  - 移动端：永久关闭。
- 点击 `Don't show again`：永久关闭。
- 关闭后导航位置恢复正常。

## 7. 响应式专项验收

每个核心路由至少检查：

- 1440px：设计稿主尺寸。
- 1024px：导航、卡片网格、左右布局是否压缩合理。
- 834px / 768px：Tablet 布局是否符合预期。
- 393px / 390px / 375px：移动端是否无横向滚动、无文字遮挡、CTA 可点击。

重点检查项：

- Hero 图片与文字是否重叠。
- 长标题是否换行合理。
- CTA 按钮是否超出容器。
- 卡片网格是否变成合理列数。
- 表格是否有必要的横向滚动。
- 移动导航是否遮挡 Notice 或页面内容。
- Footer 多列链接是否不会被挤压变形。

## 8. 数据与接口验收

需要重点观察：

- `/models`：
  - LLM 模型接口。
  - multimodal config。
  - priceMap。
- `/pricing`：
  - Serverless model list。
  - Embedding price。
  - GPU product price。
  - GPU storage price。
  - Sandbox CPU / Memory / Storage price。
  - Dedicated Endpoint specs。
  - Image Endpoint enterprise product list。
- `/gpus`：
  - GPU market products。

验收标准：

- 接口加载中有合理 loading 或 skeleton。
- 接口失败不应白屏。
- 空数据有可理解的空态或降级展示。
- 动态数据更新后布局不应严重跳动。

## 9. 登录与跳转验收

未登录重点验证：

- `/` Footer Banner `Get started` -> `/user/login?redirect=/console`
- `/gpus` `Get Started` -> `/user/login?redirect=/gpus-console`
- `/sandbox` `Get started` -> `/user/login?redirect=/sandbox-console`
- `WebsiteNavbar` `Start building` -> `/user/login?redirect=/console`

已登录重点验证：

- `/` Footer Banner `Get started` -> `/console`
- `/gpus` `Get Started` -> `/gpus-console`
- `/sandbox` `Get started` -> `/sandbox-console`
- `WebsiteNavbar` 显示 Console 和用户菜单。

## 10. 发布前验收结论模板

```md
## UI 验收结论

- 验收日期：
- 验收分支：refactor/v5-home-page
- 验收人：
- 验收范围：
- 是否通过：通过 / 带问题通过 / 不通过

### 阻塞问题

- P0：
- P1：

### 非阻塞问题

- P2：
- P3：

### 需要产品确认

- `/sandbox1` 是否保留。
- `/gpu-baremetal` 是否确认不展示动态库存列表。
- Error 推荐卡片是否保留旧路由。
- Dedicated Endpoint Hero 按钮文案 `Star Deploying` 是否需要修正。

### 备注
```
