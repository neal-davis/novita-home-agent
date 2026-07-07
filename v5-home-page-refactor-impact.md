# refactor/v5-home-page 改动范围与影响面

## 1. 对比范围

- 当前分支：`refactor/v5-home-page`
- 对比基准：`origin/main...HEAD`
- Merge base：`f624cc2692dbdc66f8570b2dbf7359ff2e25e791`
- 当前 HEAD：`ad7368e6a`
- 改动规模：`301 files changed, 25335 insertions(+), 2555 deletions(-)`
- 工作区状态：生成本文档前，当前分支业务代码无未提交工作区改动。

## 2. 总体改动范围

本分支是一次官网 V5 视觉与信息架构重构，主要覆盖：

- 官网首页 V5：`/`
- 全局官网导航：`WebsiteNavbar`
- 全局官网页脚与底部 CTA：`FooterSection`
- Agent Sandbox 官网页：`/sandbox`，并新增同构预览路由 `/sandbox1`
- GPU Cloud 官网页：`/gpus`
- GPU Bare Metal 官网页：`/gpu-baremetal`
- Dedicated Endpoint 官网页：`/dedicated-endpoint`
- Models 模型库页：`/models`
- Pricing 定价页：`/pricing`
- 错误页与 404：`src/app/error.tsx`、`src/app/not-found.tsx`
- Notice 顶部公告条
- 全局设计系统：颜色、字体、间距、阴影、Tailwind token、布局 safe rail
- 静态资源：新增首页、GPU、Dedicated Endpoint、Sandbox、Pricing、Footer、Error 等 V5 图片资源
- 内部设计/实现文档：`docs/superpowers/plans/*`、`docs/superpowers/specs/*`

## 3. 路由影响

### `/`

入口：`src/app/page.tsx`

页面从旧首页切换为 V5 首页组合：

- `WebsiteNavbar`
- `Hero`
- `LogoCloud`
- `Product`
- `WhyNovita`
- `BuiltWith`
- `Testimonials`
- `WhatsNew`
- `FooterSection`

内容变化：

- 首页主文案改为 `The AI cloud for every builder and agent`。
- 主能力从单一 Model/API 叙事扩展为 Model APIs、GPU Cloud、Agent Sandbox 三大产品线。
- 新增客户 Logo 区，包括 Genspark、Manus、Vercel、Kilo Code、Hugging Face、Quora、OpenRouter、Fish Audio、Hygo、Moonshot AI。
- 新增 AI Agents 技能复制卡片，展示 docs skill URL。
- 新增产品区侧边锚点：`MODEL APIS`、`GPU CLOUD`、`AGENT SANDBOX`。
- 新增 Built with Novita AI 案例轮播、Testimonials 区、What's New 轮播。

交互变化：

- Hero 背景使用 `unicornstudio-react` 渲染 WebGL 动效，并保留静态背景兜底。
- Hero 的 `Start Building` 跳注册页，`Talk to Us` 跳预约链接。
- AI Agents 卡片支持复制 docs skill URL。
- Product 区侧边栏 sticky，点击后平滑滚动到对应模块。
- Product 区使用 IntersectionObserver 高亮当前模块。
- Model APIs 视觉卡片每 2.5 秒自动切换 LLM / IMAGE / AUDIO / VIDEO / VISION。
- BuiltWith 与 WhatsNew 均有前后翻页按钮。

影响面：

- 首页 SEO metadata 已更新。
- 首页首屏引入大图和 Unicorn 动效，需关注首屏性能、低性能设备、prefers-reduced-motion 兜底。
- 首页内容的 CTA 链路覆盖注册、预约、模型库、Dedicated Endpoint、GPU、Sandbox。

### `/models`

入口：`src/app/models/page.tsx`

内容变化：

- 页面接入全局 V5 导航和页脚。
- 新增 `ModelLibraryHero`，主文案为 `Browse our supported open source models`。
- 模型列表改为左侧筛选 + 右侧搜索/卡片网格结构。
- 卡片默认使用 square variant。

功能变化：

- 支持 URL 参数初始化筛选：
  - `?type=serverless`
  - `?type=image`
  - `?type=featured`
  - `?provider=OpenAI` 等
- 左侧 TASK 筛选包含 Featured、All Models、LLM、Serverless、Image、Video、Embedding、Reranker。
- 左侧 PROVIDER 会按当前 TASK 动态过滤可选 provider。
- 搜索框支持输入联想、方向键选择、Enter 跳转、Esc 关闭。
- 动态 multimodal 配置与静态 model list 合并，动态 pricing 会参与模型卡片价格展示。
- 动态 label 支持：
  - `display`：NEW / HOT 等显示标签
  - `features`：底部功能标签
  - `filter`：用于 Featured 等筛选

影响面：

- 模型库不再使用原来的 `ModelSectionHeader` / `ModelSectionRenderer`。
- 模型列表展示依赖 Redux 中 multimodal config 与 priceMap，接口异常时部分动态模型或动态价格可能为空。
- 筛选状态只初始化自 URL，页面内切换筛选不会同步回 URL。

### `/pricing`

入口：`src/app/pricing/page.tsx`

内容变化：

- 页面接入 V5 导航、Pricing Hero、活动 Banner、V5 页脚。
- Hero 文案改为 `Pricing to seamlessly scale from idea to enterprise`。
- 定价内容按 tabs 展示：
  - Serverless Endpoints
  - Dedicated Endpoints
  - Agent Sandbox
  - GPUs

功能变化：

- 支持 query 参数直接打开对应 tab：
  - `?gpu=1`
  - `?sandbox=1`
  - `?de=1`
- LLM serverless 数据在服务端预取，并设置 `revalidate = 30`。
- Embedding、GPU、Sandbox、Sandbox Storage、multimodal config 在客户端后台异步加载。
- Dedicated Endpoints tab 改为 V5 样式：
  - LLM Dedicated Endpoints GPU-hour 表格
  - Image Endpoints 订阅卡片
  - `Create Endpoint` 带登录权限跳转
  - `Contact Sales` 外链预约
- GPU tab 改为卡片化 pricing 表，包含 On-Demand、Spot、1x/8x GPU。
- Sandbox tab 改为 CPU、Memory、Storage 分组表格，价格未加载时展示 skeleton。

影响面：

- Pricing 页对接口依赖更分散：首屏依赖服务端 model list，tab 内容依赖客户端多个价格接口。
- Pricing tab 的 query 参数会覆盖默认 tab。
- Console 内复用 `DetailContent` 时会受新的 spacing、tab、table 样式影响。

### `/gpus`

入口：`src/app/gpus/page.tsx`

内容变化：

- 页面接入 V5 导航、GPU Hero、V5 内容区、Footer。
- Hero 文案为 `Accelerate Your AI with Novita's GPU Cloud`。
- 内容区由三块组成：
  - `GpusSpecsSection`
  - `GpusCodeShowcaseSection`
  - `GpusCapabilitiesSection`

功能变化：

- Hero `Get Started`：
  - 已登录跳 `/gpus-console`
  - 未登录写入 `localStorage.redirect` 后跳 `/user/login?redirect=/gpus-console`
- Hero `Pricing` 跳 `/pricing?gpu=1`。
- GPU pricing 从 `reqMarketProducts` 拉取前 4 个产品，展示 On-Demand / Spot。
- Code showcase 支持 Python、Ruby、PHP、Java、Node.js、Go 切换。
- 请求代码动画结束后展示 response 面板。
- Capabilities 区包含 Start Now、Pricing、Spot Instance Info、Global Deployment 等 CTA/内容。

影响面：

- `/gpus` 从旧模块组合切换为 V5 页面，旧 `FirstPage`、`SaveCost`、`Deployment` 等组件不再作为主页面入口使用。
- GPU pricing 首屏内容依赖客户端接口，接口慢或失败时列表可能为空。

### `/gpu-baremetal`

入口：`src/app/gpu-baremetal/page.tsx`

内容变化：

- 页面接入 V5 导航、`GpuBareMetalHero`、静态 V5 内容区、Footer。
- Hero 文案为 `Rent Bare Metal GPU Servers`。
- 内容区从动态库存列表转为静态营销/方案页：
  - The Right GPU for Every Workload
  - AI Inference
  - Rendering & Simulation
  - Scientific Computing
  - Why Novita

交互变化：

- Hero `Meet with us` 跳预约链接。
- Hero `Contact sales` 使用 `mailto:gpu@novita.ai`。
- GPU 卡片中的 `Contact us` 跳预约链接。

影响面：

- 当前 `/gpu-baremetal` 页面不再挂载 `BaremetalList` 动态列表。
- `BaremetalList`、`BaremetalCard`、`CardDetail` 仍被修改但当前主路由中未引用；如后续重新接回动态列表，需要单独回归搜索、抽屉、Submit requirements 表单链路。

### `/dedicated-endpoint`

入口：`src/app/dedicated-endpoint/page.tsx`

页面结构：

- `WebsiteNavbar`
- `DedicatedEndpointHero`
- `DedicatedEndpointFeatures`
- `DedicatedEndpointModelCatalog`
- `DedicatedEndpointWorkflow`
- `DedicatedEndpointPricing`
- `DedicatedEndpointFaq`
- `FooterSection`

内容变化：

- 新 Hero 文案：`Run Your Models, We Handle the Rest`。
- 新增价值卡片：
  - Pay only for what's running
  - GPUs for every budget
  - Inference breaks? That's on us.
- 新增 Serverless vs Dedicated 对比。
- 新增 Platform features 六卡片。
- 新增热门开源模型 catalog。
- 新增 Deploy in 3 Steps workflow。
- 新增 Transparent GPU Pricing 表。
- 新增 FAQ 折叠面板。

交互变化：

- Hero 主 CTA 和 See Price 均跳预约链接。
- Pricing 中 `Talk to our team` 跳预约链接。
- FAQ 默认展开第一项，可折叠展开。
- FAQ 底部 `Contact support` 使用 support mailto。

影响面：

- 该路由从旧组件组合替换为 V5 页面内容。
- Dedicated Endpoint 价格和模型 catalog 当前主要为页面内静态展示；价格页 `DePage` 另有接口驱动的 dedicated pricing。

### `/sandbox`

入口：`src/app/sandbox/page.tsx`

内容变化：

- `/sandbox` 已切换为 V5 Agent Sandbox 页面。
- `/sandbox1` 新增同构页面，组件内容与 `/sandbox` 基本一致。
- 页面模块：
  - Hero
  - WhyNovita
  - Capabilities
  - Pricing
  - BuildWith
  - FooterSection

功能变化：

- Hero `Get started`：
  - 已登录跳 `/sandbox-console`
  - 未登录写入 `localStorage.redirect` 后跳 `/user/login?redirect=/sandbox-console`
- Hero `Pricing` 跳 `/pricing?sandbox=1`。
- Pricing 区 `Learn more` 跳 `/pricing?sandbox=1`。
- BuildWith guide 卡片跳 docs 路由。
- Enterprise 区按钮跳 `/contact`。

影响面：

- `/sandbox1` 作为新增公开路由存在，需确认是否仅用于预览，是否需要 SEO/canonical/站点地图策略。
- Sandbox 页面中部分 docs 链接为 `/docs/sandbox/...`，需确认与当前 docs 实际路由一致。

### Error / 404 / End of Service

入口：

- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/error/ErrPage.tsx`
- `src/app/components/error/Card.tsx`
- `src/app/components/error/EndOfService.tsx`

内容变化：

- Error 与 404 页面接入 V5 导航和页脚。
- Error/404 使用新的背景图与推荐产品卡片。
- 推荐卡片覆盖 model-api、serverless、gpu-instance、sandbox。
- 修正文案 `pickedput` 为 `picked out`。

交互变化：

- 404 主 CTA 跳首页。
- Error 主 CTA 调用 `reset()`。
- Error 描述内可跳 Discord 或 support mailto。
- Error boundary 仍会上报 `window.__MONITOR__`。

影响面：

- 错误页从局部样式改为全局官网 chrome，错误页首屏高度和推荐卡片布局变化。
- 推荐卡片中的部分旧链接仍是 `/model-api`、`/serverless`、`/gpu-instance`，需要确认是否应同步为 V5 新路由。

## 4. 全局组件影响

### `WebsiteNavbar`

新增文件：`src/app/components/website-navbar/WebsiteNavbar.tsx`

影响路由：

- `/`
- `/models`
- `/pricing`
- `/gpus`
- `/gpu-baremetal`
- `/dedicated-endpoint`
- `/sandbox`
- `/sandbox1`
- Error / 404

内容与交互：

- 固定在顶部，支持 Notice 高度偏移。
- 桌面端：
  - Model APIs mega menu
  - GPUs dropdown
  - Resources dropdown
  - Pricing link
  - 登录态显示 Console 和 UserInfoBox
  - 未登录显示 Start building
- 移动端：
  - 汉堡菜单
  - Model APIs / GPUs / Resources 可展开
  - 打开菜单时锁定 body scroll
  - 路由变化自动关闭菜单
- Start building：
  - 有登录态或 token cookie 时进 `/console`
  - 未登录时写入 `localStorage.redirect=/console`，再跳登录页

影响面：

- 新导航替代旧 Header 的官网场景。
- 导航依赖 cookie token、user slice、notice config、header auth hook。
- 移动菜单 top 位置依赖 Notice 高度，Notice 展示异常会影响菜单定位。

### `FooterSection`

新增文件：

- `src/app/components/footer-section/Banner.tsx`
- `src/app/components/footer-section/Footer.tsx`
- `src/app/components/footer-section/FooterSection.tsx`

内容与交互：

- Footer 顶部新增全宽 CTA Banner：`Everything you need to build production AI.`
- Banner `Get started`：
  - 已登录跳 `/console`
  - 未登录写入 `localStorage.redirect=/console`，再跳登录页
- Footer 链接分组：
  - Product
  - Resources
  - Company
  - Partners
- 新增合规图标：AICPA SOC 2、GDPR、ISO 27001。
- 新增 legal 与 social 链接：Security & Trust、Terms、Privacy、X、LinkedIn、Discord。

影响面：

- 多个官网路由底部统一替换为新 Footer。
- Footer 使用当前年份动态渲染版权时间。
- 外链、mailto、jobs、trust center 等依赖 `src/constants/urls.ts`。

### Notice

涉及文件：

- `src/app/components/Notice/Notice.tsx`
- `src/hooks/useHeaderHeight.ts`
- `src/lib/hooks/useIsNoticeShowing.tsx`
- `src/store/slice/configSlice.ts`
- `locales/en/dictionaries/common.json`

内容与交互：

- Notice 默认高度从 56 调整为 50。
- 支持内容用 `|||` 拆成主副两行。
- 支持 `**bold**` 高亮。
- 有 URL 时整段公告主体可点击，并保留 analytics track。
- 右侧增加 `Don't show again` 与 close icon。
- 移动端点击关闭会触发永久关闭；桌面 close 是本次关闭，`Don't show again` 是永久关闭。

影响面：

- 全局 header offset、navbar top、移动菜单 top 都依赖 Notice 高度。
- Notice 的关闭/永久关闭逻辑影响全站公告展示。
- 新增 common dictionary key：`noticeClose`、`noticeCloseHint`。

## 5. 设计系统与资源影响

### 字体

涉及文件：

- `src/app/fonts.ts`
- `src/app/layout.tsx`
- `src/fonts/MiletusGroteskTrial-*.otf`
- 删除 `TT_Interphases_Pro_Regular/Medium/DemiBold/Italic.woff2`

变化：

- 全局主字体变量从 `--font-tt-interfaces` 切换为 `--font-miletus`。
- 保留 `ttMono`。
- Billing budgets、balance warning 等局部组件同步使用 `font-miletus` 或 `var(--font-miletus)`。

影响面：

- 所有使用全局字体变量、`font-miletus`、Typography token 的页面都会受字体替换影响。
- 旧 `font-tt-interfaces` 类如果仍存在使用，需要确认 Tailwind alias 是否仍能覆盖或需要迁移。

### Design Tokens / Tailwind

涉及文件：

- `src/styles/_design-tokens.scss`
- `src/styles/_old_design_token.scss`
- `src/styles/colors.scss` 删除
- `src/styles/mixins.scss`
- `src/styles/theme.scss`
- `src/app/globals.scss`
- `tailwind.config.ts`

变化：

- 新增 primitive token、semantic token、spacing、radius、shadow、typography token。
- `globals.scss` 从 `colors` 改为导入 `_design-tokens`。
- 新增全局 typography utility：`font-display-*`、`font-heading-*`、`font-paragraph-*`、`font-mono-*`。
- Tailwind 新增 brand、gray、semantic text/fill/border/bg/status/element、spacing、maxWidth、height、shadow 等 token。
- 旧 token 被标记为 deprecated 并保留兼容。

影响面：

- 这是全局 CSS/Tailwind 级影响，非本次改造路由也可能受变量值、字体、border、shadow 变化影响。
- 构建产物可能受 Tailwind token 扩展影响，需关注样式冲突与未迁移类名。

### 静态资源

新增资源主要在：

- `locales/en/public/home/*`
- `locales/en/public/gpus/v5/*`
- `locales/en/public/sandbox1/page/*`
- `locales/en/public/dedicated-endpoint/*`
- `locales/en/public/pricing/v5/*`
- `locales/en/public/footer/*`
- `locales/en/public/error-boundray/*`
- `locales/en/public/models/v5/*`

影响面：

- 静态资源体积明显增加，需关注构建产物体积、CDN 缓存、首屏图片加载。
- `locales/en/public/sw.js` 也有调整，需关注静态资源缓存策略。

### 新依赖

`package.json` 新增：

- `unicornstudio-react`

影响面：

- 首页 Hero 背景动效依赖该包。
- 需要确认 CI、Docker、Vercel 构建环境能正常安装新依赖。

## 6. 其他受影响模块

### Settings Team / Billing

涉及文件：

- `src/app/settings/team/MemberList.tsx`
- `src/app/billing/budgets/*`
- `src/app/billing/balance-warning/components/ClientTable.tsx`

变化：

- Team member list 有较大格式化和状态处理调整，包括分页场景下详情开关同步、MutationObserver 处理 table overflow 等。
- Billing budgets 与 balance warning 局部字体从 TT Interphases 迁移为 Miletus。

影响面：

- 这些不是官网 V5 主路由，但会影响 Console/Settings/Billing 内部体验，需要单独回归团队成员、预算表、余额提醒页面。

### Analytics IDs

涉及文件：

- `src/app/components/analytics/constants.ts`

变化：

- Header/Footer tracking ID 扩展，新增 Careers 等入口。
- 新导航、页脚、错误页、GPU/BareMetal 等 CTA 使用新 ID。

影响面：

- 埋点名称发生变化或新增，数据侧需要确认是否已适配新 ID。

## 7. 主要回归建议

- `/`：首屏、WebGL 背景、复制按钮、Product sticky sidebar、自动切换、轮播按钮、所有 CTA。
- `/models`：URL 参数初始化、TASK/PROVIDER 筛选、搜索键盘操作、模型跳转、空状态。
- `/pricing`：四个 tab、`?gpu=1` / `?sandbox=1` / `?de=1`、价格接口失败兜底、Console 复用场景。
- `/gpus`：登录/未登录 CTA、动态价格表、代码语言切换、response 展示、Spot/Pricing 链接。
- `/gpu-baremetal`：Hero CTA、所有 workload 卡片、静态内容响应式。
- `/dedicated-endpoint`：Hero CTA、Deployment 对比、模型 catalog、Workflow、Pricing、FAQ 折叠。
- `/sandbox` 与 `/sandbox1`：CTA 登录 redirect、Pricing 链接、guide 链接、响应式布局。
- 全局：Notice 展示/关闭/永久关闭、导航 hover/dropdown/mobile、Footer 链接、Error/404。
- 非官网：Settings Team、Billing Budgets、Balance Warning 的字体和交互。

## 8. 潜在风险点

- 全局字体和 design token 替换影响面大，可能影响未参与 V5 改造的旧页面。
- 官网路由统一接入 `WebsiteNavbar` / `FooterSection`，旧 Header/Footer 相关布局假设可能失效。
- 多个页面使用大背景图和新图片资源，可能增加 LCP 和静态资源加载压力。
- 首页依赖 Unicorn WebGL 动效，需关注兼容性、异常兜底和 reduced motion。
- `/sandbox1` 是新增公开路由，需确认发布策略、SEO、sitemap、是否允许用户访问。
- `/gpu-baremetal` 当前不再展示动态库存列表，产品侧需确认这是预期信息架构。
- Pricing、Models、GPU 等页面的关键数据依赖多个接口，接口慢/失败时需要确认 UI 空态是否可接受。
- Error 推荐卡片仍含旧产品路径，需确认是否需要改成 V5 新路由。
