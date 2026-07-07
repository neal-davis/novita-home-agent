# data-testid 待办 backlog

> 4 批深度 e2e 探索累计的 src 选择器加固建议。当前 49 条深测靠 CSS-module 哈希类片段 / `<th>` 硬编码列名 xpath / 埋点 id 子串定位（能跑绿但脆）。给下列组件补 `data-testid` 后，可把锚点升级为 `getByTestId`，长期更抗重构。

_本文件由 4 批 workflow 结果自动汇总；agent 不能改 src，需主会话/前端补。_
**累计 159 条建议。**

## Batch A (console)

### `billing-budgets`

- src/app/billing/budgets/components/BudgetsTable.tsx 的 <Table> 加 data-testid="budgets-table"（现仅能靠 <th>"Budget Type" xpath ancestor::table 唯一定位，脆）
- BudgetsTable 每个成员主行 <TableRow> 加 data-testid="budget-row"（现靠 tbody tr 计数 + hasText 邮箱）
- index.tsx 的 currentTeam===null 兜底页根 div 加 data-testid="budgets-team-required"（现只能断言不含/含表头反推三态分支）
- index.tsx 的「Team Info」按钮加 data-testid="budgets-team-info-btn"、Refresh 按钮加 data-testid="budgets-refresh-btn"（现靠 getByRole name 文案，虽是硬编码字面量但仍是文案锚点）
- TeamMemberInfo 的统计项（Total Members / Members with Budget 的值）加 data-testid，便于 smoke 在有 token 时断言后端统计值

### `gpus-console-instances`

- src/app/gpus-console/instances/components/defaultGuide.tsx 的空态根容器（<div className="p-2"> 含 <h1>）：建议加 data-testid="instances-default-guide"，空态目前只能靠『Section 工具栏不存在 + 按钮角色数』反向确认，正向锚点缺失。
- src/app/gpus-console/instances/components/section.tsx 的实例卡 <button id="panel3-header">（行 1271）：id 被每张卡复用（非唯一），当前靠 locator('#panel3-header').count() 当行数勉强可用，建议改为 data-testid="instance-card" 更语义、更稳。
- src/app/gpus-console/instances/components/section.tsx 列表根 <div className={styles.subContainer}>（行 883）：建议加 data-testid="instances-section"，目前用 [class*='subContainer'] 依赖 CSS-module hash 前缀（虽稳定但不如显式 testid）。

### `gpus-console-billing`

- src/app/billing/billing-details/components/DetailContent.tsx: 给 <Card className=billing_content_wrapper> 和 role=status 说明条加 data-testid（如 billing-details-content / billing-details-info-alert），目前只能靠 shadcn role=tablist/tabpanel/status 锚定，加 testid 会更稳。
- src/app/billing/billing-details/components/SummaryTable.tsx: 给 NoData 空态容器加 data-testid=billing-summary-empty，让空态/有数据两路都有确定锚点（现用 tabpanel 内 table|class\*=table 二选一兜底）。
- src/app/billing/billing-details/components/DetailContent.tsx: TabsTrigger 已有 CLICK_BTN_IDs.BILLING.\* 拼出的 id，但那是埋点串、非测试约定；建议补稳定 data-testid 避免埋点串变动时测试连带碎。

### `gpus-console-serverless`

- item.tsx: 给端点卡片根 <div className="rounded-[8px] border-[1px]...">（约 L523）加 data-testid="serverless-endpoint-card"，让 hermetic 直接断言卡片行数，替代现在用 'ENDPOINT ID' 标签计数的代理
- Section.tsx: 给 Create Endpoint 按钮（约 L108）加 data-testid="serverless-create-endpoint-btn"——项目自定义 Button 不暴露 accessible name，现只能用 locator('button',{hasText})
- Section.tsx: 给搜索框（SearchInput，L147）加 data-testid，现依赖硬编码 placeholder 'Instance Name/lD Filter/GPU Type'（注意源码里就是拼写错误 'lD'）
- defaultGuide.tsx: 给引导容器或 Deploy Now / Learn More 按钮加 data-testid，现用 h1 hasText + locator('button',{hasText}) 锚定

### `gpus-console-storage`

- src/app/gpus-console/storage/components/section.tsx: 每张存储卡（styles.cardFlex 外层 div，约 285 行）建议加 data-testid="storage-card"——当前用每卡内的 Deploy 按钮 id (#main**gpus-console**storage\_\_deploy) 数行，能用但是借位锚点，专属 data-testid 更稳。
- src/app/gpus-console/storage/components/section.tsx: Section 根容器（styles.subContainer，196 行）建议加 data-testid="storage-section"——当前用 [class*='subContainer'] 语义 class，CSS module hash 改了会碎。
- src/app/gpus-console/components/DataEmpty/index.tsx 或 no-data.tsx: 空态建议加 data-testid="data-empty"——当前用 img[alt='no data'] 属性锚点（可用），但 alt 文案若调整会碎。

### `gpus-console-templates`

- src/app/gpus-console/templates/components/section.tsx: 给「+ New Template」按钮（styles.addBtn Button）加 data-testid="templates-new-template-btn" —— 现在 getByRole("button",{name:/New Template/}) 取不到可访问名（文案在内层 span），只能退到 [class*='addBtnTxt'] 哈希类锚点
- src/app/gpus-console/templates/components/section.tsx: 给模板卡根 div（styles.cardFlexContainer）加 data-testid="template-card" —— 现用 [class*='cardFlexContainer'] 数行，加 testid 后可 getByTestId 更稳
- src/app/gpus-console/templates/components/section.tsx: 给列表外层 [class*='subContainer'] 或卡片网格容器加 data-testid="templates-list" 便于区分列表区与空态区
- src/components/ui/standard/no-data.tsx: 给 NoData 根 div 加 data-testid="no-data" —— 空态现用 [class*='no_data_text'] 哈希类锚点，全站空态都会受益

### `models-console-model-management`

- src/app/model-api/model/components/privateModel/privateModel.tsx: 给 SHOW_MODEL 外层容器加 data-testid="private-model-root"，给 Upload Model 按钮加 data-testid="upload-model-btn"（目前只能靠 CLICK_BTN_IDs 分析打点 id 子串 [id*="__upload-model"] 定位）
- src/app/model-api/model/components/privateModel/ModelTable.tsx: 给 <Table> 或其外层 .table_container 加 data-testid="model-table"（目前靠 <th> 硬编码字面量 "MODEL NAME In API" 的 xpath ancestor::table 定位，页面共 6 张表）；给 NoData 空态容器加 data-testid="model-table-empty"（目前靠 NoData 默认 title "No Data" 文案）
- src/app/components/Modal/Modal.tsx 或 UploadModal.tsx: 上传弹窗目前靠 shadcn DialogContent 的 role="dialog" 定位，建议加 data-testid="upload-model-modal" 更稳

### `models-console-usage`

- 给 src/app/models-console/components/chart/wrapper.tsx 的根容器(styles.wrapper div)加 data-testid="usage-charts"，作为整页渲染完成的稳定锚点
- 给三个图表容器各加 data-testid：apiUsage.tsx 的 styles.content → data-testid="usage-api-bar-chart"；apiCreditUsage.tsx 的 styles.content → data-testid="usage-credit-chart"；apiUsagePie.tsx 的 styles.content → data-testid="usage-pie-chart"（echarts canvas 不透出数据，加 testid 后 hermetic 可断言各图存在而不依赖 canvas 总数）
- 给 PermissionWrapper 的 no-permission 兜底块加 data-testid="permission-denied"（当前只能靠 img[alt='no permission'] 间接判定权限分支）

### `console-home`

- src/app/console/components/AccountSummary/index.tsx: 给 Available Credit / Available Vouchers / API Keys 的数值 span 加 data-testid（如 console-account-credit / console-account-voucher-count / console-account-key-count）。当前只能靠 .text-[var(--brand-0)] 的固定下标定位（[1]=credit [2]=voucher [3]=key），banner 促销文案也用同一 class 占了下标 0，脆弱。
- src/app/components/ModelLibrary/BaseModelCard/index.tsx: 给模型名 span（现 className={styles.modelName}）加稳定 data-testid（如 model-card-name），现用 CSS-module 哈希类的 [class*="modelName"] 子串匹配，类名一旦改 build hash 仍含 modelName 故暂稳，但非契约。
- src/app/console/components/Explore/GPUCard.tsx: 给卡根/卡名加 data-testid（如 gpu-card / gpu-card-name），现靠 fixture productName 文案定位。
- src/app/console/components/CustomerInfo/index.tsx: 给 ACCOUNT SETUP 调研 Dialog 内容加 data-testid（如 questionnaire-dialog），现靠硬编码字面量 'ACCOUNT SETUP' 断言其不可见。

### `dedicated-endpoint`

- DedicatedEndpointGpuBudgetList.tsx 的每行预算项（数据驱动，当前只能靠 <p> + /^from \$.../hr$/ 文案锚定）：建议根容器加 data-testid="de-gpu-budget-list"、每行加 data-testid="de-gpu-budget-row"（含 key/价格），让数据驱动断言用稳定锚点而非文案正则。
- DedicatedEndpointPricing.tsx 的静态定价表：建议加 data-testid="de-pricing-table"（当前用 <th hasText='Price / GPU-hour'> + xpath ancestor::table 定位，因 th 不暴露 columnheader role）。
- 整页零 data-testid：营销页区块标题虽是硬编码字面量可暂用，但若文案后续接入 i18n 管线则会碎；建议关键区块（Pricing/Catalog/Features）根 section 各加 data-testid。

### `coding-plan`

- src/app/coding-plan/components/planList/index.tsx: 给 #plans 容器或每张方案卡外层加 data-testid（如 data-testid="coding-plan-card"），现在卡片计数只能靠 CSS module 哈希类 [class*="tier_text_content"]——hash 类对类名重命名脆弱。
- src/app/coding-plan/components/planList/item.tsx: 给 Subscribe 操作 div 加 data-testid="coding-plan-subscribe"、给 Model Access 触发器加 data-testid="coding-plan-model-access"，现在只能靠源码字面量文案 getByText("Subscribe"/"Model Access") 定位（虽非 i18n 目录，但仍是裸文案）。
- src/app/coding-plan/components/planList/item.tsx: 给单价 span 加 data-testid="coding-plan-price"，现在靠正则 /^\$19\.9$/ 匹配文本节点。

### `affiliate`

- src/app/affiliate-new/components/AffiliateExperience.tsx: 给 #affiliate-credentials 那个 <section> 加 data-testid="affiliate-credentials"（目前靠 id 锚定，可用但 data-testid 更稳）
- src/app/affiliate-new/components/AffiliateExperience.tsx: 给 referral-link 的 <a>（CopyValue href 那个）加 data-testid="affiliate-referral-link"，避免只能靠 href 子串 invitedCode 断言数据穿透
- src/app/affiliate-new/components/Header.tsx: 给 hero 主 CTA <LinkWithAuthority>（Become an Affiliate / Affiliate Login / Team Owner Required 三态）加 data-testid="affiliate-hero-cta"，让 hermetic 能断言登录态切换 CTA 行为而不碰 i18n 文案
- src/app/affiliate-new/components/AffiliateNewPage.tsx: 可给整页根 div 加 data-testid="affiliate-page" 作为页面就绪锚点

## Batch B (playground/auth)

### `models-console-llm-playground`

- ModelSelector 触发器（src/app/models-console/llm-playground/components/model-selector/ModelSelector.tsx 的 SelectFilter triggerClassName 节点）加 data-testid="playground-model-selector"——当前只能用 getByRole('combobox').filter({hasText: displayName}) 区分，因为导航栏也有 combobox。
- PlaygroundMainContent 的 ChatTab 容器（src/app/models-console/llm-playground/components/chat-tab/chatTab.tsx）加 data-testid="playground-chat-tabs"——当前 mode 按钮靠 ChatMode 枚举字面量 'chat'/'completion' 定位。
- PlaygroundHeader 的模型 id chip（src/app/models-console/llm-playground/components/layout/PlaygroundHeader.tsx，currentModel.id 那个 div）加 data-testid="playground-current-model-id"。

### `models-console-multimodal-playground`

- ModelSelector (src/app/models-console/multimodal-playground/components/ModelSelector/index.tsx): 给 SelectFilter 触发器与 Model API docs <Link> 加 data-testid（如 mmp-model-selector / mmp-docs-link），现在只能靠 combobox+displayName 文案与 href 锚定
- ParametersPanel (src/app/models-console/multimodal-playground/components/ParametersPanel.tsx): 给 Run/Reset 按钮加 data-testid（如 mmp-run-btn / mmp-reset-btn），现在靠硬编码文案 Generate/Reset/Log in to use 区分登录门控两态
- page.tsx loader: 给 Loader 容器加 data-testid（如 mmp-loading），现在配置缺失分支只能靠 svg.animate-spin 锚定 loader

### `models-console-metrics-usage`

- UsageDashboard.tsx <main className={styles.usagePage}> -> data-testid="usage-page" (页面根锚点)
- metricCard / metricValue -> data-testid="usage-metric-card"（4 张汇总卡，现靠 [class*=metricValue] 顺序定位）
- 模型排行 <article>/<table> -> data-testid="usage-model-ranks-table"（现靠 <th>Model + monoTag 双谓词与 5 个 footer SEO 表区分）
- 密钥排行 <table> -> data-testid="usage-key-ranks-table"（现靠 <th>Key Name 文案）
- QuotaCard <section className={styles.budgetCard}> -> data-testid="usage-quota-card"，及 budgetUsed/budgetTotal/budgetPercent 子 testid（现靠 [class*=budget*] 片段）
- ScopeDropdown <button className={styles.scopeButton}> -> data-testid="usage-scope-trigger"；member 项 -> data-testid="usage-scope-member"
- 排序 <button className={styles.sortButton}> -> data-testid 带列名（如 usage-model-sort-cost），现靠 hasText 'Cost (USD)' 文案（恰好是源码字面量、非 i18n，但仍属文案匹配）

### `models-console-settings`

- 给 PlaygroundSwitch 的根容器 div.console-card 加 data-testid="models-settings-playground-card"——目前只能靠 .console-card 语义 class 定位卡片，加 testid 更稳。
- 给升级确认 Dialog 的 DialogContent 加 data-testid="models-settings-upsell-dialog"——目前靠 getByRole("dialog") + 两个按钮 track id 定位，加 testid 后断言更明确。
- Switch / Dialog 按钮已有稳定 track id（#main**models-console**settings\_\_playground-switch / ...-tips-cancel / ...-tips-dedicated-endpoint），无需新增。

### `gpus-console-explore`

- explore section.tsx 的创建表单容器（现仅靠 [class*='section_subContainer'] 锚定，建议加 data-testid="gpus-explore-create-form"）
- stepOne.tsx 产品列表容器 stepOne_productContainer（建议加 data-testid="gpus-explore-product-list"）
- stepOne.tsx 单个产品卡 stepOne_productItem（建议加 data-testid="gpus-explore-product-item" 以便断言行数；当前 productItem 经分组/canBuy 过滤后与原始产品数非 1:1，无法做精确行数锚点）
- stepOne.tsx 三步过滤区/StepTwo/StepThree 当前无任何 data-testid，全靠 [class*='stepOne_filterArea'] 等 hash class 锚定（CSS Module hash 重编译会变，建议关键区块补稳定 data-testid）

### `gpus-console-jobs`

- src/app/gpus-console/jobs/page.tsx: 壳页内若日后接回 <Section /> 的 jobs 表格，给 mainTable 的 <table aria-label="caption table"> 加 data-testid="jobs-table"、每行 <tr> 加 data-testid="jobs-row"，便于断言确定性行数（当前 Section 被注释，无锚点可断言数据行）。
- src/app/components/header/partials/SideNavigationItems.tsx: NavItem 的 <Link> 加 data-testid（如 data-testid={`console-nav-${item.key}`}）+ data-active 属性，替代当前靠 href + CSS Module 哈希前缀 [class*="active"] 锚定 active 态。
- src/app/components/header/ConsoleHeaderWrapper.tsx: console 顶部标题区 <span class=page_title>（consolePageTitle）加 data-testid="console-page-title"——当前标题文字经 i18n 不可断言，仅能靠 header 计数。

### `gpus-console-application`

- src/app/gpus-console/application/components/section.tsx: 给模板卡外层 div（styles.templates_item）加 data-testid="application-template-card"，目前只能靠 CSS module 哈希类片段 [class*='templates_item__'] 数行（脆，构建改名即碎）
- src/app/gpus-console/application/components/section.tsx: 给底部 Commitment footer（已有 data-commitment-footer，可复用）加显式 data-testid="application-commitment-footer"，以及给三个 Commitment RadioGroup 各加 data-testid（onDemand/subscription/spot）便于断言模式分支而非靠 [role='radiogroup'] 计数
- src/app/gpus-console/application/components/section.tsx: 给「Currently selected」GPU Type / VRAM 区加 data-testid（如 application-selected-gpu / application-selected-vram），现在只能 getByText('RTX 4090 x 1')/('24GB') 命中文本
- src/app/gpus-console/components/DataEmpty.tsx: DataEmpty 无 data-testid/稳定 id（实测 className 为空），空态只能靠「无卡 + footer 占位」间接断言；建议加 data-testid="data-empty"
- src/app/gpus-console/application/components/templateDetail.tsx / detailsTab.tsx: 给 detail 容器与 README/Configuration tab 加 data-testid，现靠 [class*='template_detail_container'] / [class*='detailsContainer'] CSS 模块哈希类

### `gpus-console-settings`

- src/app/gpus-console/settings/components/section.tsx: 给 Section 根容器 <div className={styles.subContainer}> 加 data-testid="gpu-settings-root"（目前只能靠 [class*='subContainer'] 语义 class 锚定）
- src/app/gpus-console/settings/components/section.tsx: 给 SSH textarea 加 data-testid="gpu-settings-ssh-key-input"（目前靠 page.locator('textarea').first()，页面只有这一个 textarea 故稳定，但显式 testid 更稳）
- src/app/gpus-console/settings/components/section.tsx: 给 Container Registry Auth 表加 data-testid="gpu-settings-registry-table"（目前靠 subContainer 内唯一 <table> 推断；页面其余 5 张表来自 Header/通知，在 subContainer 外）
- src/app/gpus-console/settings/components/section.tsx: 给 Single-Numa 复选框（Checkbox）加 data-testid="gpu-settings-single-numa"（Radix Checkbox 的 getByRole('checkbox') 在本环境命中 0，只能靠 label button[role='checkbox'] + data-state 锚定）
- src/app/gpus-console/settings/components/section.tsx: registry 删除按钮已有 aria-label="Delete registry auth"，但其内含 lucide Trash2 <svg> 导致 Playwright getByRole('button',{name}) 命中 0；可保留 aria-label 同时加 data-testid="gpu-settings-registry-delete" 以便 getByTestId

### `console-pricing-console`

- DetailContent (src/app/pricing/components/DetailContent.tsx): 给每个 TabsContent 容器加稳定 data-testid（如 pricing-tab-content-model / -gpu / -sandbox / -de）。当前只能靠 Radix 自动生成的 id 后缀 [id$="-content-gpu"] 定位，虽稳定但是实现细节，加 data-testid 更直观抗重构。
- GpuPrice 卡片 (src/app/pricing/components/GpuPrice.tsx ~line 99): 给每张 GPU 卡外层 div 加 data-testid="gpu-price-card"（或带 productId）。当前用『每卡一个 <th>Specification』命中数当卡数锚点（可用但脆，依赖列名硬编码）。
- GpuPrice 卡名 <p> (~line 101): 卡名 JSX `1x {productName}` 渲染成 "1x{productName}"（无空格），断言只能用产品名子串正则。加 data-testid="gpu-card-name" 可直接断言全文。
- SandboxPrice 三张价格表 (src/app/pricing/components/SandboxPrice.tsx): 给三块（vCPUs/Memory/Storage）各加 data-testid，避免靠内联字面量列头 <th> 文案定位。

### `user-login`

- LoginForm 的 FormNotice 提示区块（src/app/user/login/components/FormNotice.tsx 的 .notice 容器）建议加 data-testid="login-form-notice"——现在只能靠 CSS-module 哈希类前缀 [class*="LoginForm_notice__"] 定位，prod 构建若改哈希策略会脆。
- LoginForm 邮箱展开区块（src/app/user/login/components/LoginForm.tsx 的 styles.form_container <div>）建议加 data-testid="login-email-form"，作为展开态稳定锚点（现用 #email/#password + 提交按钮 id 组合）。
- LabelInput（src/app/user/components/label-input/index.tsx）建议把 name 也透传成 <input data-testid>（现仅 id={name}，#email/#password 够用但语义上 input 没有 name 属性，未来表单语义化时可补）。

### `user-register`

- SignupForm 根容器（src/app/user/register/components/SignupForm.tsx 的 .form_wrap div）可加 data-testid="signup-form"，作为表单整体存在性的语义锚点（目前靠分析 track id 间接定位）。
- 邮箱注册区块（isShowEmailRegister 展开后的 .form_container）可加 data-testid="signup-email-fields"，让「表单已展开」断言不依赖逐个 input id。
- 校验错误提示 div（SignupForm.tsx 两处 <div className="text-red-500 text-sm mt-1">）可加 data-testid="field-error"，避免用 div.text-red-500 这类样式 class 做选择器。

## Batch C (gpus-console/marketing)

### `gpus-console-savings-plans` ⚠ BUG_FOUND

- src/app/gpus-console/savingsPlans/components/section.tsx: add data-testid="savings-plans-section" on the root subContainer div and data-testid="savings-plans-table" on the <Table aria-label="caption table"> so a hermetic test can anchor the Section/table without i18n text (only meaningful once the route actually renders this Section — see BUG below)
- src/app/gpus-console/savingsPlans/components/section.tsx: add a stable id/data-testid on each data <TableRow> (e.g. data-testid="savings-plan-row") for a clean row-count assertion (currently rows are keyed by row.id with no test anchor)

### `gpus-console-serverless-deploy`

- src/app/gpus-console/serverless-deploy/components/gpuCardList.tsx: 给 .productContainer 外层加 data-testid="serverless-gpu-card-list"，给每张 .productItem 卡加 data-testid="serverless-gpu-card"（当前只能用 [class*='productItem'] 锚定卡数，易随 SCSS-module 类名变更而碎）
- src/app/gpus-console/serverless-deploy/components/section.tsx: 给「Selection:」摘要条容器加 data-testid="serverless-selection-summary"，让「首卡自动选中回填」这一行为有显式锚点（现靠 gpu_name 出现 2 次间接断言）

### `gpus-console-templates-library`

- src/app/gpus-console/templates-library/components/itemList.tsx: add data-testid="template-card-list" on the card_container_list wrapper div (line ~66) and data-testid="template-card" on each per-card div (line ~70) so e2e can count rows without relying on CSS-module class substrings or '> div' child fragility
- src/app/gpus-console/templates-library/components/list.tsx: add data-testid on the 4 toolbar tab buttons (e.g. tpl-tab-all / tpl-tab-official / tpl-tab-my-creations / tpl-tab-my-favorites, lines ~428-525) — they currently have no id/testid, so tab-switch interactions can only be reached via lucide icon classes and are additionally blocked by the global 'What's New' dialog
- src/app/gpus-console/components/DataEmpty/index.tsx (or NoData in src/components/ui/standard/no-data.tsx): add data-testid="data-empty" on the empty-state root so empty-branch assertions don't depend on the img alt="no data" / svg src

### `gpus-console-image`

- src/app/gpus-console/image/components/section.tsx: 给每行任务卡容器 div(className styles.itemContainer) 加 data-testid="image-prewarm-row"（现仅靠 [class*='itemContainer'] 类片段数行）
- src/app/gpus-console/image/components/section.tsx: 给「Create Image Prewarm Task」按钮加 data-testid="image-prewarm-create"（按钮 accessible-name 经 i18n 不可断言，且 getByRole name 匹配为 0）
- src/app/gpus-console/image/components/section.tsx: 给空态 NoData 容器/列表区根加 data-testid（现复用全局 img[alt='no data']，多个空态页共享同一锚点）
- src/app/gpus-console/image/components/jobState.tsx: 给状态徽章 span 加 data-testid="job-state" 并保留硬编码 state 文案（现靠 getText 硬编码 SUCCEEDED/RUNNING/FAILED 文案做内容锚点）

### `gpus-console-upgrade`

- src/app/gpus-console/components/Main/Main.tsx: 给 SPA body 内容区（page.tsx 的 .gpu-container-content 包裹层，或 Main 的 body_content）加 data-testid="gpus-console-spa-body"，让「桩路由 body 为空 vs 真 console 页 body 填充」的断言不依赖硬编码字面量 class
- src/app/gpus-console/components/globalNotice/index.tsx: 给 DialogContent 加 data-testid="gpu-global-notice-dialog"（目前只能靠 OK 按钮的 analytics id #main**gpus-console**notice-dialog\_\_close 间接判定弹窗存在）
- src/app/gpus-console/upgrade/page.tsx: 该路由 page.tsx 仅 `return <></>`、被 layout 完全忽略——若 upgrade 本应有专属内容，建议确认是有意桩位还是漏实现（见 notes 的 BUG 排查结论）

### `models-console-llm-metrics`

- src/app/models-console/llm-metrics/page.tsx: 给模型选择 SelectTrigger 加 data-testid（如 llm-metrics-model-select），现仅靠 [class*=operate] 内第一个 combobox 定位（依赖工具栏 DOM 顺序）。
- src/app/models-console/llm-metrics/page.tsx: 给 SelectContent 加稳定 id（如 #llm-metrics-model-select-content，仿 llm-playground 的 #llm-playground-model-select-content），现靠 role=option 全局定位（页内多 Select 时需收窄）。
- src/app/models-console/llm-metrics/components/CharWrapper.tsx: 给图表卡 .console-card 容器加 data-testid（如 llm-metrics-chart），便于精确断言单图（现靠 .console-card 通配类计数 6）。

### `dedicated-endpoint-order`

- src/app/dedicated-endpoint-order/components/OrderInfo.tsx: 给 plan_name / price_content(含 line-through 原价 span) / quantity_content / Total 金额 span / func_list 容器各加 data-testid——目前断言靠 CSS-module 稳定类片段([class*="plan_name"] 等)与 Big.js 算出的金额文本($149.00/$298.00),虽稳但加 testid 可让金额/折扣断言摆脱对 SCSS 类哈希前缀与文本格式的隐式依赖
- src/app/dedicated-endpoint-order/components/SelectBillingMethod.tsx: 给 cardInfo 卡片摘要块(brand/last4/Expiration)加 data-testid;当前靠 getByText('4242')/getByText('visa') 命中,加 testid 更稳。radio 行已有稳定埋点 id([id$="billing-method-switch-credit-card"]/switch-balance/add-payment-method/top-up),无需新增

### `gpus`

- src/app/gpus/components/GpusSpecsSection.tsx: add data-testid="gpus-pricing-table" on the .min-w-[980px] grid container (currently the only stable anchor is the Tailwind class .min-w-[980px])
- src/app/gpus/components/GpusSpecsSection.tsx: add data-testid="gpus-pricing-row" on each rendered product row wrapper so row count can be asserted without relying on '/hr/GPU' text matching
- src/app/gpus/components/GpusSpecsSection.tsx: add per-cell data-testid (e.g. gpus-price-ondemand / gpus-price-spot) so price values can be located structurally instead of by computed text

### `gpu-baremetal`

- src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx GpuCard <article> — add data-testid="baremetal-gpu-card" (8 张卡片当前只能靠语义 article 计数)
- src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx WorkloadSection 容器 — add data-testid="baremetal-workload-section" + data-section-id={section.id}（按 every-workload/ai-inference/... 定位单区块）
- src/app/gpu-baremetal/components/GpuBareMetalHero.tsx Hero Contact Us 按钮 — add data-testid="baremetal-hero-cta"（当前靠 href 锚点）
- src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx GpuCard 价格/CTA 块 — add data-testid 区分 price-card vs contact-card（当前靠 '/GPU/hr' 文案分支）

### `gpus-spot`

- 在 src/app/gpus-spot/components/GPUPricing.tsx 的 webContainer 容器 div 加 data-testid="gpus-spot-pricing-desktop"（当前用 CSS-module 子串 [class*="webContainer"] 锚定，hash 后缀可能随构建变）
- 在 src/app/gpus-spot/components/GPUPricingCard.tsx 的根 box div 加 data-testid="gpu-pricing-card"（当前用 [class*="GPUPricingCard_box"] 计数 3 张卡片）

### `models-llm`

- src/app/models/llm/components/FeaturedModels.tsx: give the model card grid a data-testid (e.g. data-testid="llm-model-grid") so tests anchor the grid without the .lg:grid-cols-3 utility-class fragment
- src/app/components/ModelLibrary/BaseModelCard/index.tsx: add data-testid="model-card" on the root container div (currently anchored only via the CSS-module-hashed BaseModelCard_container\_\_\* class, which breaks if the module hash/class name changes)
- src/app/models/llm/components/FeaturedModels.tsx: add data-testid="create-endpoint-cta" on the 'Create a New Endpoint' Link (currently anchored by href substring)

### `models-image`

- src/app/models/image/components/Nav/Nav.tsx: 给 <nav> 容器加 data-testid="playground-nav"，给每个 <a> 加 data-testid={`playground-nav-item-${func.name}`}（目前只能靠 href="#txt2img" + CSS-module 类片段 nav*item*\*/Nav_selected 锚定）
- src/app/components/input/ModelSelector/ModelSelectorV2.tsx: 给 model_selector_trigger 加 data-testid="model-selector-trigger"（目前靠 [class*="model_selector_trigger"]）
- src/app/model-api/model/components/modelItem/modelItem.tsx: 给 img_wrap_div 加 data-testid="model-item"（目前靠 [class*="img_wrap_div"] 断行数；CSS-module 改名会碎）
- src/app/components/modals/ModelList.tsx: 给模型弹窗根加 data-testid="model-list-modal"（getByRole('dialog') 在本页返回 2 个，需更精确锚点）

## Batch D (model-api/video)

### `model-api-product-txt2img`

- src/app/model-api/product/components/txt2img/Case.tsx: 给示例项 div(.case_item) 加 data-testid="txt2img-case-item"（当前只能靠 CSS-module 哈希类片段 [class*=case_item] 锚定，脆）
- src/app/model-api/product/components/txt2img/Case.tsx: 给 demo 容器/示例区(.cases_wrapper)与 prompt 文本框各加一个 data-testid，便于把 demo 区与 Header/Footer/ProductRecommendations 区分（目前 textbox 全页唯一尚可，但若未来新增输入框会冲突）
- src/app/model-api/product/components/firstpage/FirstPage_new.tsx: hero 区无 data-testid；当前页有 2 个 h1（hero + 推荐位），只能 getByRole('heading',{level:1}).first()，建议给 hero h1 加 data-testid 以精确锚定首屏

### `model-api-product-img2img`

- src/app/components/demos/base.module.scss .case_item div (示例缩略图容器) → 加 data-testid="product-demo-case-item"：当前用 CSS-module 类片段 [class*="case_item"] 锚点；更关键的是其 onClick 在 e2e 中无法稳定触发（sticky Header pointer 拦截 + 折叠下方 IntersectionObserver 接线滞后 + ::after 遮罩），加 testid 并修首点行为后才能把「点击示例→prompt 回显种子数据」做成门禁交互
- src/app/model-api/product/components/img2img/Case.tsx 的 demo 容器（styles.demo_wrapper / form_wrapper / result_wrapper）→ 加 data-testid="img2img-demo-wrapper" 等：当前靠 #btn-product-generate + 资源 src 间接定位 demo 区，无独立 demo 容器锚点
- src/app/components/dragger/Dragger.tsx 上传区（role=button + input[type=file]）→ 加 data-testid="product-demo-uploader"：当前用 input[type=file] 计数，稳定但语义弱

### `model-api-product-inpainting`

- 可选（非阻塞）：给 Inpainting demo 外层 wrapper（CaseWrapper_new 的 commonStyle.demo_wrapper 或 DemoWrapper 根）加 data-testid，使 hermetic 选择器不依赖 CSS-module 哈希类片段 [class*="demo_form_wrapper"] / [class*="demo_result_wrapper"]。
- 可选：给 ModelSelector 的 model_name span（src/app/components/input/ModelSelector/ModelSelector.tsx）加 data-testid="model-selector-name"，当前用 [class*="model_name"] 已稳定但与 ModelSelectorLite 同类名。
- 本页已有稳定锚点：#btn-product-generate（埋点 id）、a[href*="#inpainting"]（功能名常量），无强制需求。

### `model-api-product-outpainting`

- src/app/components/error/EndOfService.tsx: 给推荐卡所在 section 容器加 data-testid（如 data-testid="eos-suggestions"），让 hermetic 不必依赖 aria-labelledby id 锚点
- src/app/components/error/Card.tsx: 给每张推荐卡 <Link> 加 data-testid（如 data-testid={`eos-card-${item.product}`}），替代当前按 href 计数+section scope 的写法（页面别处也有 /sandbox 链接）
- src/app/components/error/EndOfService.tsx: 给退役 API 列表 <ul> 加 data-testid="eos-deprecated-list"，避免依赖 ul.grid 这一 Tailwind class 片段做行数断言

### `model-api-product-remove-background`

- RemoveBackground.tsx Showcase 缩略图容器加 data-testid="demo-showcase-case"（map index）便于稳定选中而非 CSS-module 片段 case_item
- DemoWrapper/RemoveBackground 预览图加 data-testid="demo-preview-origin" / "demo-preview-result"（现仅能用 [class*=preview_wrapper] img 模糊定位）
- Estimated cost 元素加 data-testid="demo-estimated-cost"（现价格串 $0.017/image 在 demo + 3 张推荐卡共出现 4 次，需 scope 到 [class*=price_info]）
- DemoWrapper 表单区/结果区加 data-testid="demo-form" / "demo-result" 便于交互断言（当前 demo 内 <div> onClick 不接收 Playwright 合成点击：preview 大图 absolute 覆盖缩略图坐标拦截指针——加 testid + 直达元素可绕开 overlay）

### `model-api-product-reimagine`

- EndOfService.tsx 弃用列表 <ul> / <li>：当前靠 Tailwind 字面量类 `ul.list-none.grid.grid-cols-3 > li` 锚定（稳定但偏脆，类名一调即失效）。建议给该 <ul> 加 data-testid="end-of-service-deprecated-list"、<li> 加 data-testid="end-of-service-deprecated-item"，使弃用清单的计数/成员断言不依赖布局类。
- EndOfService.tsx `styles.api_item`：NotFound.module.scss 未定义 .api_item，渲染出的 class 实为 undefined（`[class*=api_item]` 命中 0）——疑似无效 CSS module 引用。非测试阻断（已改用 Tailwind 类锚定），但建议主会话核查该 className 是否漏定义样式。

### `models-video-wan-21`

- 给 demo Generate 按钮补 data-testid（现状：#btn-product-generate id 稳定可用，但 data-gtm-product-name 因 Button 只在 renderTag=link 时透传 elAttrs 而为 null，无法用作路由身份锚点）
- 给 showcase chip 容器/每个 chip 补 data-testid=wan-t2v-showcase-item（现状靠 CSS-module 类片段 [class*=case_item] 锚定，对 defaultCases 计数有牙但类名是构建产物）
- 给 prompt 输入区补 data-testid=wan-t2v-prompt（现状靠 getByRole('textbox').first()，页面恰一个 textbox 故唯一，但多 demo 复用时脆）
- 给 FormContent 的 Model / Width\*Height / Seed 三个 Select 补 data-testid，便于断参数面板渲染（现状无稳定锚点，本 spec 未深断这三个控件）

### `models-video-kling-t2v`

- KlingV16T2v/components/FormContent.tsx: showcase 项 .case_item 建议加 data-testid="demo-showcase-case"（现仅靠 CSS-module 类片段 [class*=case_item] 锚定，类名经 CSS Modules 哈希仍带 case_item 前缀故暂稳，但加 testid 更抗重构）
- KlingV16T2v/components/FormContent.tsx: Model / Duration 两个 Radix Select 无稳定 id/testid（仅 role=combobox 且无可锚文案），建议各加 data-testid="demo-mode-select" / data-testid="demo-duration-select"，以便对「切 duration → 估价变化」这类分支做确定性交互断言（当前因无锚点 + 估价在 hermetic 环境不渲染而未覆盖）
- KlingV16T2v/components/FormContent.tsx: prompt / negative-prompt 两个 PromptInput textarea 仅靠出现次序 nth(0)/nth(1) 区分，建议加 data-testid="demo-prompt" / data-testid="demo-negative-prompt"，避免未来表单加文本框后次序断言错位
- FormFooter.tsx: 估算价格 <p class=price_info> 建议加 data-testid="demo-estimated-cost"——当前 hermetic 环境定价配置解析为 0 → {estimatePrice && ...} 短路不渲染，有了 testid 可在 smoke 真实后端层断言估价出现

### `models-video-minimax-hailuo`

- src/app/components/demos/MinimaxHailuo02/components/FormContent.tsx: 给 showcase 容器/各 case_item、Duration/Resolution 两个 Select、Enable image upload / Enable prompt expansion 两个 Switcher 加 data-testid（如 data-testid="hailuo-duration-select" / "hailuo-resolution-select"），现仅靠 [role=combobox]+filter(hasText:"6s"/"768P") 的 option 取值定位，比 testid 脆
- src/app/components/demos/MinimaxHailuo02/components/FormFooter.tsx: 给 PrimaryBtn 已有稳定 id #btn-product-generate（可用），但 elAttrs 的 data-gtm-product-name 实测未渲染到 DOM（getAttribute 返回 null）——若想用作产品锚点需修复 Button 的 elAttrs 透传
- src/app/components/demos/MinimaxHailuo02/components/ResultContent.tsx: 给结果区 video / 占位容器加 data-testid（如 data-testid="hailuo-result"），现靠 CSS-module 片段 [class*="video_wrapper"] 定位

### `models-voices`

- src/app/models/voices/components/playground/Playground.tsx: 给 voice 选择器容器(voice_box_list)与每个 VoiceItem 加 data-testid（如 voices-voice-select / voices-voice-item-<voiceId>），给 textarea 加 data-testid=voices-tts-input，给 generate 按钮(g_btn)加 data-testid=voices-generate-btn，给语言选择 item 加 data-testid=voices-lang-<param>——当前只能靠 CSS-module 类前缀子串([class*="Playground_item__"])锚定，build 改 SCSS 模块名即碎。
- src/app/models/voices/components/voice-library/AudioItem.tsx: 给 library 卡(item)加 data-testid=voices-library-card，便于稳定计数(现用 [class*="VoiceLibrary_item__"])。
- src/app/models/voices/components/playground/Playground.tsx: 字数计数若想被断言确定值，建议把 '{text.length} / {Limit}' 包进带 data-testid=voices-char-counter 的节点（现仅能断 '/ 500' 字面量，因 text.length 渲染滞后于受控 fill）。

### `model-api-model`

- src/app/models/components/ModelLibraryHero.tsx: 给 <section> 或 hero <h1> 加 data-testid（如 data-testid="model-library-hero"），让落地页首屏有 locale 无关的强锚点（现仅靠 i18n 文案 h1）
- src/app/components/ModelLibrary/Search/index.tsx: 给 SearchInput 加 data-testid="model-library-search-input"（现靠 getByPlaceholder("Search Model") 定位，placeholder 走 i18n 有碎裂风险）
- src/app/components/ModelLibrary/BaseModelCard: 给卡片根节点加 data-testid="model-card"（现靠 CSS-module 哈希类片段 [class*="BaseModelCard_container"]，重命名模块即失效）
- src/app/components/ModelLibrary/LabelFilters/index.tsx: 给分类筛选 Button 加 data-testid（如 data-testid="model-filter-{value}"），让筛选交互可断言而不依赖 i18n 文案/Radix 内部结构

### `models-end-of-service`

- src/app/components/error/EndOfService.tsx: 给弃用 API 列表 <ul className="list-none grid grid-cols-3"> 加 data-testid="eos-deprecated-api-list"（当前用 ul.grid-cols-3 类片段锚定，若布局类调整会脆）
- src/app/components/error/Card.tsx: 给每张推荐卡 <Link> 加 data-testid={`eos-suggestion-card-${item.product}`}（当前靠 href + section 作用域定位，product 维度无独立锚点）
- src/app/components/error/EndOfService.tsx: 顶部 <Image alt="end-of-service"> 可加 data-testid="eos-hero-image"（alt 已稳定够用，仅锦上添花）
