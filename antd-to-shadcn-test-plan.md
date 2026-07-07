# antd / MUI -> shadcn 提测计划

## 提测范围

- antd、MUI 直接 import 已迁移到 shadcn/Radix、lucide/iconfont 或项目标准组件。
- `package.json` 已移除 antd、MUI、仅服务于 MUI 的 Emotion 直接依赖。
- 根布局、构建脚本、Service Worker、静态 CSS 不再引用 antd/MUI。
- 迁移期 compat/facade/copy 代码已清理或有明确保留原因。
- 两个同源仓库已经完全独立，不假设共享代码；一致性验收以当前仓库为参考实现，要求 UI 基础组件、standard 组件、禁止脚本和关键替换实现尽可能与当前仓库保持接口、行为和源码结构一致。

## 跨仓库一致性回归

当前仓库作为基准实现，两个同源仓库提测前必须分别完成以下检查：

- 三个仓库分别执行同一套旧依赖扫描、Provider/Registry/CSS/Service Worker 扫描、旧样式选择器扫描、`pre-build-check`、`lint`、`build`。
- 对比各独立仓库内对应组件源码或 diff 摘要，确认 `src/components/ui`、`src/components/ui/standard`、`notify`、`Select`、`SelectFilter`、`useObstacleCollisionPadding`、`NumberInput`、`ConfirmDialog`、`WarningDialog`、`PreviewImage`、`Progress`、`Pagination` 关键接口和行为没有偏离当前仓库参考实现。
- 对 GPU Console、Billing、Settings、Model Console、Demo/Model API 做同名页面同路径回归；路径不同的仓库必须记录页面映射表。
- 如果同源仓库因业务、路径或架构差异无法按当前仓库源码结构复刻，必须记录差异文件、差异原因、替代实现和对应回归结论。
- `package.json` 和 lockfile 对齐当前仓库直接依赖状态；三方间接依赖带入 antd/MUI 时记录依赖链和 bundle 风险。

## 必测功能

- 全局通知：success/error/warning/info/loading 展示、关闭和重复提示控制；`message.*` 使用 singleton；`notification.*` 保持 stacked；Error 对象展示可读文本；`dismiss` / `destroy` 行为正确。
- 弹窗：普通弹窗、危险确认、遮罩关闭、ESC、关闭按钮、提交 loading；异步确认完成后关闭；destructive/warn 样式正确。
- 表单：默认值、编辑回填、校验、disabled、提交 loading、提交成功/失败提示。
- Select/筛选器：默认值、All 选项、`0` 值、清除、搜索、disabled、value 类型、renderValue/renderTrigger、onChange、空结果。
- Select 浮层：靠近固定 footer/action bar 时不被遮挡，内容可内部滚动，移动端位置正确。
- 搜索框：icon 与 placeholder 不重叠，文字大小统一，输入、回车、清除有效。
- 分页：页码、上一页/下一页、ellipsis、每页条数、disabled、持久化；hover 边框不相贴；移动端不换行。
- 表格/列表：loading、empty、横向滚动、行操作、展开/收起。
- Upload：选择、拖拽、限制校验、删除、重新上传、进度。
- Image preview：打开、关闭、尺寸、层级、移动端表现。
- Tooltip/Dropdown/Popover：触发、定位、关闭、键盘和 hover/focus 行为。
- 日期筛选：UTC/本地时间边界不变，开始/结束日不会偏移。

## 重点页面

- GPU Console：instances、storage、image、jobs、billing、settings、templates、explore、application、serverless-deploy。
- Model Console：playground、dedicated endpoints、multimodal/image 相关页面。
- Billing：overview、billing details、余额/充值/账单筛选。
- Settings：team、key management、image auth、password/reset 类表单。
- Demo / Model API：上传、图片预览、参数表单、生成流程。

## 风险点

- Select 迁移后字符串化 value 导致 `0`、All、默认值显示异常。
- Select/SelectFilter 搜索输入被 Radix typeahead 抢焦点，导致搜索框无法连续输入。
- Select dropdown 被固定 footer、底部 action bar 或 sticky header 遮挡。
- 搜索框迁移后 input 抢占空间导致 icon 与文字重叠。
- Button 默认 variant 与旧 antd/MUI 默认视觉不一致。
- Pagination 布局换行、hover 边框相贴、page size 选择异常。
- Dialog 宽度由内容撑开导致抖动。
- Upload/Image 迁移改变文件对象、预览层级或错误提示。
- 日期筛选迁移改变 UTC/本地时间边界。
- `InputNumber` 空值被转成 `0`，或滚轮导致数值意外变化。
- `message` 和 `notification` 都使用 singleton，导致多个 notification 互相覆盖。
- 旧 `.ant-*` / `.Mui*` 样式选择器残留但已经没有对应旧组件，造成无效样式或误导后续维护。

## 验收命令

```bash
rg -n "from ['\"]antd|from ['\"]antd/|from ['\"]@ant-design|@ant-design/static-style-extract|require\(['\"]antd|require\(['\"]@ant-design|from ['\"]@mui|from ['\"]@material-ui|@mui/|@material-ui/" src scripts package.json next.config.js
rg -n "<AntThemeProvider|AntdRegistry|genAntdCss|antd\\.global|@ant-design/static-style-extract|workbox.*antd|sw\\.js.*antd" src scripts package.json next.config.js public locales
rg -n "\\.ant-|\\.Mui|ant-|Mui[A-Z]" src public locales
npm ls antd @mui/material @mui/system @mui/icons-material @material-ui/core @material-ui/icons @emotion/react @emotion/styled
npm run pre-build-check
npm run lint
npm run build
```

期望：

- 旧依赖 import、旧 Provider/Registry/CSS 生成脚本、Service Worker 缓存引用除迁移文档外无有效命中。
- `.ant-*` / `.Mui*` 扫描结果已分类：绑定已删除旧组件的清零；临时兼容或第三方残留项记录文件、原因、归属和清理条件。
- pre-build-check、lint、build 通过。
- 如三方依赖间接带入 antd/MUI，记录依赖链和 bundle 风险，不作为直接失败项。

## 人工回归矩阵

| 能力                 | 回归点                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| 通知                 | singleton message、stacked notification、Error 对象、key/id、destroy/dismiss    |
| Select               | All、`0`、默认值、clear、search、disabled、renderTrigger、fixed footer 下拉避障 |
| 搜索框               | icon 与 placeholder 不重叠、输入、回车、清除、移动端宽度                        |
| 分页                 | ellipsis、prev/next disabled、page size、hover、移动端不换行                    |
| 表单                 | 默认值、编辑回填、校验、disabled、submit loading、失败提示                      |
| Dialog/危险确认      | ESC、遮罩、关闭按钮、异步确认、destructive/warn 样式                            |
| Upload/Image preview | 文件限制、删除、重传、进度、预览层级、移动端                                    |
| 日期                 | UTC/本地时间边界、开始结束日、清空和重新选择                                    |
