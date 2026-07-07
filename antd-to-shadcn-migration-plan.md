# antd / MUI -> shadcn 迁移计划

## 目标

将项目中的 antd、MUI 直接使用迁移到 shadcn/Radix、lucide/iconfont 和项目标准组件。迁移完成后：

- 源码和构建脚本不再直接 import `antd`、`@ant-design/*`、`@mui/*`、`@material-ui/*`。
- `package.json` 不再声明 antd、MUI、仅服务于 MUI 的 Emotion 直接依赖。
- 根布局、构建脚本、Service Worker、静态样式不再依赖 antd/MUI。
- 业务逻辑、API、路由、权限、埋点和数据语义保持不变。

三方依赖间接带入 antd/MUI 不作为迁移失败项，但需要记录来源并评估 bundle 风险。

## 原则

- 先收口基础能力，再迁移业务页面。
- 不保留长期兼容层，不在业务代码中继续模拟 antd/MUI API。
- 样式使用项目 token、SCSS module、Tailwind token class 或项目标准组件，不新增 `.ant-*` / `.Mui*` 选择器。
- 复杂组件按能力迁移，不按文件机械替换。
- 每个阶段必须有扫描命令和关键页面回归。
- 两个同源仓库已经完全独立，不再假设存在共享代码；一致性采用“参考实现优先”标准：UI 基础组件、工具函数、扫描脚本和关键业务替换方案尽量复刻当前仓库，路径或业务差异再局部适配。

## 当前仓库作为基准实现

两个同源仓库迁移前，先以当前仓库的已通过实现建立参考基线，避免重复踩坑。这里的“基线”不是共享代码包，而是独立仓库各自落地时优先对照的实现样本。

- 组件参考实现：在各独立仓库内复刻或移植 `src/components/ui`、`src/components/ui/standard` 中已经完成的 shadcn/Radix 封装和项目标准组件，尤其是 `notify`、`Select`、`SelectFilter`、`NumberInput`、`ConfirmDialog`、`WarningDialog`、`PreviewImage`、`Progress`、`Tooltip`、`TabsItems`、`CascadeFilter`、`DateRangePicker`、`Pagination`。
- 工具与脚本参考实现：在各独立仓库内落地与 `scripts/check-forbidden-keywords.js` 等价的 antd/MUI 直接依赖禁止规则，并保留当前仓库对生成文件、i18n 文件的忽略策略。
- 依赖基线：两个仓库先对齐当前仓库的 shadcn/Radix、lucide-react、sonner、react-hook-form、class-variance-authority、tailwind-merge、tailwindcss-animate、date-fns/dayjs 等相关依赖，再迁移业务代码。
- 配置基线：确认 `components.json`、`tailwind.config.ts`、全局 token、SCSS module 约定与当前仓库一致；不一致时先记录差异和适配方式。
- 迁移前记录：每个同源仓库都要保存旧依赖 import 清单、旧样式选择器清单、copy/dead code 目录清单、Service Worker/静态 CSS 引用、`package.json` 和 lockfile 差异。
- 业务差异处理：如果路径、模块名、目录结构或本地封装不同，建立“当前仓库路径 -> 同源仓库路径”映射表；实现语义仍以当前仓库为默认答案。

## 迁移阶段

### 1. 基线与保护

- 统计 antd/MUI import，按组件能力和业务域分组。
- 在 pre-build 或 lint 阶段加入禁止新增 UI 旧依赖的检查。
- 确认 copy、legacy、dead code 目录是否仍被路由或 import 使用；无用代码应删除，不能绕过扫描。
- 先在独立仓库内落地当前仓库的基础组件参考实现和禁止脚本等价实现，再开始业务页面替换。
- 对两个同源仓库分别产出迁移前扫描结果，作为后续验收对照。

验收：

```bash
rg -n "from ['\"]antd|from ['\"]antd/|from ['\"]@ant-design|@ant-design/static-style-extract|require\(['\"]antd|require\(['\"]@ant-design|from ['\"]@mui|from ['\"]@material-ui|@mui/|@material-ui/" src scripts package.json next.config.js
rg -n "<AntThemeProvider|AntdRegistry|genAntdCss|antd\\.global|@ant-design/static-style-extract|workbox.*antd|sw\\.js.*antd" src scripts package.json next.config.js public locales
rg -n "\\.ant-|\\.Mui|ant-|Mui[A-Z]" src public locales
npm ls antd @mui/material @mui/system @mui/icons-material @material-ui/core @material-ui/icons @emotion/react @emotion/styled
```

### 2. 通知、按钮、Tooltip、图标

优先迁移低风险高频能力：

- `message` / `notification` -> 项目 `notify`
- `Button` / `IconButton` -> 项目 Button
- `Tooltip` -> 项目 Tooltip / Radix Tooltip
- `Skeleton` -> shadcn Skeleton
- `Space` -> flex/gap
- `@ant-design/icons` / `@mui/icons-material` -> lucide-react 或现有 iconfont

要求：

- 通知 API 必须支持 success/error/warning/info/loading/dismiss。
- 错误对象渲染前必须归一为可读字符串。
- `message.*` 使用 singleton toast，避免连续提示堆叠刷屏。
- `notification.*` 保留 sonner 默认堆叠，不与 `message.*` 的 singleton 互相覆盖。
- `dismiss` / `destroy` 必须兼容旧调用；有 key/id 时关闭指定 toast，无 key/id 时关闭 message singleton。
- icon-only 按钮必须保留固定点击区域和 `aria-label`。

### 3. 弹窗、菜单、折叠、Tabs

迁移范围：

- `Modal`、`Modal.confirm`、`Modal.useModal`
- `Drawer`
- `Dropdown`
- `Popover`
- `Collapse` / `Accordion`
- `Tabs`

要求：

- 普通弹窗使用项目 Modal/Dialog。
- 删除、停止、终止、重启等危险操作使用 AlertDialog/ConfirmDialog。
- `ConfirmDialog` / `WarningDialog` 保留关闭、ESC、遮罩、异步确认、提交 loading、宽度、层级和 destructive/warn 视觉语义。
- Dropdown menu 数据结构改为 JSX，不保留 antd menu 配置对象。
- 折叠区保留展开状态、默认展开、键盘操作和内容渲染时机。

### 4. 表单与输入控件

迁移范围：

- `Input` / `InputBase` / `TextField`
- `InputNumber`
- `Select` / `MenuItem`
- `Radio` / `Checkbox` / `Switch`
- `Slider`
- `Form`
- `DatePicker`
- `Cascader`

要求：

- `InputNumber` 输出 `number | null`，空值不能被意外转成 `0`。
- `NumberInput` 保留 min/max/precision/step；滚轮不能意外修改数值。
- Select 必须保留 value 类型、默认值、All 选项、clear、disabled、placeholder、renderValue、onChange 参数语义。
- Select value 默认按 Radix 要求使用 string；原业务是 number/boolean/null 时，在业务边界显式转换，不在通用组件里偷偷转换。
- `SelectFilter` 必须保留清除按钮、搜索输入焦点、typeahead 阻断、空结果、disabled、renderTrigger/renderOption 和滚动回顶。
- 复刻 `useObstacleCollisionPadding` 的能力，让下拉层自动避开固定 footer/action bar，避免被底部操作栏遮挡。
- 搜索框采用固定 icon + 弹性 input 布局，避免 icon 和 placeholder 重叠。
- 表单迁移必须保留校验、默认值、编辑回填、提交 loading。
- 日期范围必须保留原 UTC/本地时间边界。

### 5. 高复杂组件

迁移范围：

- `Upload`
- `Image` preview
- `Progress`
- `Result`
- `FloatButton`
- `Card`
- `Tag` / `Alert`
- Table / Pagination / TablePagination

要求：

- Upload 保留文件类型、大小、拖拽、删除、重新上传、进度和错误提示。
- Image preview 保留打开、关闭、层级、尺寸和移动端表现。
- Pagination 保留页码、上一页/下一页、ellipsis、disabled、每页条数、持久化。
- Pagination/TablePagination 控件固定 `h-8`、`min-w-8`、`shrink-0`、`whitespace-nowrap` 等尺寸约束，避免 hover 边框相贴、换行、page size select 挤压。
- Table 保留 loading、empty、横向滚动、行操作、展开/收起。
- Upload、Image preview、Progress、Tooltip、Tabs、CascadeFilter、DateRange 优先按当前仓库 standard 组件的接口和行为复刻，不在业务侧重造长期旧 API facade。

### 6. 样式与依赖清理

- 删除 antd/MUI provider、registry、CSS 生成脚本、静态 CSS 和 Service Worker 缓存引用。
- 删除迁移期 facade、compat、copy 目录或无用封装。
- 删除 package 直接依赖并刷新 lockfile。
- 清理仍绑定已删除组件的 `.ant-*`、`.Mui*` 样式依赖。
- 如果旧选择器仅用于第三方残留或临时视觉兼容，必须记录文件、原因、归属和后续清理条件，不能混同为直接 import 扫描失败项。

验收：

```bash
rg -n "from ['\"]antd|from ['\"]antd/|from ['\"]@ant-design|@ant-design/static-style-extract|require\(['\"]antd|require\(['\"]@ant-design|from ['\"]@mui|from ['\"]@material-ui|@mui/|@material-ui|<AntThemeProvider|genAntdCss|AntdRegistry" src scripts package.json next.config.js public locales
rg -n "\\.ant-|\\.Mui|ant-|Mui[A-Z]" src public locales
npm ls antd @mui/material @mui/system @mui/icons-material @material-ui/core @material-ui/icons @emotion/react @emotion/styled
npm run pre-build-check
npm run lint
npm run build
```

## 扫描口径

- 直接旧依赖扫描是硬失败项：`antd`、`@ant-design/*`、`@mui/*`、`@material-ui/*`、旧 Provider/Registry、CSS 生成脚本、Service Worker 缓存引用都必须清除。
- `.ant-*` / `.Mui*` 旧样式选择器单独扫描和分类：仍绑定已删除组件的必须清理；仅用于第三方残留或临时视觉兼容的必须记录原因和归属。
- `public`、`locales`、生成后的 i18n JSON、base64 SVG、图片配置、外部素材元数据可能误命中 antd/MUI 字符串，需要人工判读，不作为自动失败项。
- `npm ls` 中如果只有三方依赖间接带入 antd/MUI，不作为迁移失败项，但必须记录依赖链、用途和 bundle 风险。
- 禁止为了通过扫描而把旧 import 移入 copy/dead code、动态 require、字符串拼接或业务 facade。

## 组件映射

| 旧组件                                      | 新实现                      | 备注                               |
| ------------------------------------------- | --------------------------- | ---------------------------------- |
| `message` / `notification`                  | `notify`                    | 命令式 API，统一错误文本           |
| `Button`                                    | 项目 Button                 | `type` / `danger` / `variant` 映射 |
| `IconButton`                                | icon-only Button            | 固定尺寸和 `aria-label`            |
| `Tooltip`                                   | 项目 Tooltip                | 保留 hover/focus                   |
| `Modal` / `Dialog`                          | 项目 Modal / Dialog         | 受控状态                           |
| `Modal.confirm`                             | ConfirmDialog / AlertDialog | 危险操作用 destructive/warn        |
| `Drawer`                                    | Sheet / Drawer              | 保留移动端体验                     |
| `Dropdown`                                  | DropdownMenu                | menu 配置改 JSX                    |
| `Collapse` / `Accordion`                    | Collapsible / Accordion     | 保留展开状态                       |
| `Tabs`                                      | shadcn Tabs                 | `items` 改 JSX                     |
| `Input` / `TextField` / `InputBase`         | 项目 Input / textarea       | 前后缀用 flex slot                 |
| `InputNumber`                               | NumberInput                 | 保留 min/max/precision/null        |
| `Select` / `MenuItem`                       | Select / Combobox           | 搜索、多选、复杂 label 走 Combobox |
| `Form`                                      | react-hook-form + 项目 Form | 不再透出 antd FormInstance         |
| `Upload`                                    | FileUpload                  | 原生 file input + drag/drop        |
| `Image`                                     | PreviewImage / img          | Dialog preview                     |
| `Progress`                                  | 项目 Progress               | token 样式                         |
| `Table`                                     | 项目 Table / 原生 table     | 保留 loading/empty/scroll          |
| `Pagination` / `TablePagination`            | 项目 Pagination             | 保留 page size 与 ellipsis         |
| `styled(...)`                               | SCSS module / token class   | 不新增 CSS-in-JS                   |
| `@ant-design/icons` / `@mui/icons-material` | lucide-react / iconfont     | 保留尺寸和点击区                   |

## 完成标准

- 禁止旧 UI import 的脚本通过。
- 类型检查、lint、build 通过。
- 核心页面的搜索、筛选、分页、弹窗、表单、上传、图片预览、危险确认全部回归通过。
- `package.json` 中无 antd/MUI/旧样式生成直接依赖。
- 两个同源仓库虽完全独立，但 UI 基础组件、标准组件、禁止脚本和关键替换实现已尽可能与当前仓库保持接口、行为和源码结构一致；无法一致的差异已记录原因。
- 旧样式选择器已分类：必须清理项清零，临时保留项有负责人、原因和清理条件。
- 文档和测试计划已同步更新。
