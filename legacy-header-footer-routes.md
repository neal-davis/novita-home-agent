# 老 Header / Footer 路由清单

## 统计口径

本文件整理当前分支仍然使用老 Header / 老 Footer 的路由，供产品、测试、UI 验收和后续替换排期使用。

- 老 Header：`src/app/components/header/Header.tsx`
- 老 Footer：`src/app/components/footer/Footer.tsx`
- 间接使用也计入影响范围：
  - `src/app/components/header/ConsoleHeaderWrapper.tsx` 内部渲染老 `Header`
  - `src/app/components/header/PlaygroundHeader.tsx` 内部渲染老 `Header`
  - `src/app/model-api/product/components/Layout_new.tsx` 内部渲染老 `Header` 和老 `Footer`
  - `src/app/legal/layout.tsx` 内部渲染老 `Header` 和老 `Footer`
- 补充单独列出：
  - `src/app/components/header/AuthHeader.tsx` 不直接渲染老 `Header`，但属于老 header 目录并复用 `Header.module.scss`

未计入口径：

- `src/app/components/footer-section/FooterSection.tsx` 使用的是 `src/app/components/footer-section/Footer.tsx`，不是本次统计的老 Footer。
- `src/app/gpus-console/components/footer/Footer.tsx` 下的 `DocFooter` 不是本次统计的老 Footer。
- 老 Header 组件内部的 partials、hook、样式文件不按路由统计。

## 一、直接使用老 Header + 老 Footer 的页面路由

这些页面文件或页面引用的组件中，直接 import 并渲染了老 `Header` 和老 `Footer`。

| 路由                                 | 来源文件                                                | 备注                                           |
| ------------------------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| `/affiliate-new`                     | `src/app/affiliate-new/components/AffiliateNewPage.tsx` | `page.tsx` 引用 `AffiliateNewPage`             |
| `/build-month`                       | `src/app/build-month/page.tsx`                          | `Header` 设置了 `hideNavigation`、`hideNotice` |
| `/coding-plan`                       | `src/app/coding-plan/page.tsx`                          | 外层还有 `CodingPlanGuard`                     |
| `/gpus-spot`                         | `src/app/gpus-spot/page.tsx`                            | 同时渲染 `FooterBanner`                        |
| `/gpus/gpu/[gpu_model]`              | `src/app/gpus/gpu/[gpu_model]/page.tsx`                 | 动态 GPU 详情页                                |
| `/llama3`                            | `src/app/llama3/page.tsx`                               | 同时渲染 `FooterBanner`                        |
| `/model-api/image/[keyword]`         | `src/app/model-api/image/[keyword]/page.tsx`            | 动态图片关键词页                               |
| `/model-api/image/pokemon/[keyword]` | `src/app/model-api/image/pokemon/[keyword]/page.tsx`    | 动态 Pokemon 图片关键词页                      |
| `/model-api/model/[version_id]`      | `src/app/model-api/model/[version_id]/page.tsx`         | 动态模型版本页                                 |
| `/model-api/model/upload`            | `src/app/model-api/model/upload/page.tsx`               | 模型上传页                                     |
| `/models/end-of-service`             | `src/app/models/end-of-service/page.tsx`                | 同时渲染 `FooterBanner`                        |
| `/models/llm`                        | `src/app/models/llm/page.tsx`                           | 同时渲染 `FooterBanner`                        |
| `/models/voices`                     | `src/app/models/voices/page.tsx`                        | 同时渲染 `FooterBanner`                        |
| `/referral`                          | `src/app/referral/page.tsx`                             | 登录态下 `Header page="console"`               |
| `/sandbox/success`                   | `src/app/sandbox/success/page.tsx`                      | 同时渲染 `FooterBanner`                        |
| `/serverless`                        | `src/app/serverless/page.tsx`                           | 同时渲染 `FooterBanner`                        |
| `/team-permission-details`           | `src/app/team-permission-details/page.tsx`              | 同时渲染 `FooterBanner`                        |
| `/templates`                         | `src/app/templates/page.tsx`                            | 同时渲染 `FooterBanner`                        |
| `/templates/[slug]`                  | `src/app/templates/[slug]/page.tsx`                     | 动态模板详情页，同时渲染 `FooterBanner`        |

## 二、通过 shared layout 使用老 Header + 老 Footer 的路由

### `/legal/*`

来源：`src/app/legal/layout.tsx`

这些路由共享 legal layout，因此都会使用老 `Header`、`FooterBanner` 和老 `Footer`。

- `/legal`
- `/legal/privacy-policy`
- `/legal/terms-of-service`
- `/legal/dedicated-endpoints-sla`

### `/model-api/product/*`

来源：`src/app/model-api/product/components/Layout_new.tsx`

这些产品页都通过 `Layout_new` 使用老 `Header` 和老 `Footer`。

- `/model-api/product/LoRA-training`
- `/model-api/product/animate-anyone`
- `/model-api/product/cleanup`
- `/model-api/product/create-tile`
- `/model-api/product/doodle`
- `/model-api/product/img2img`
- `/model-api/product/img2video`
- `/model-api/product/img2video-motion`
- `/model-api/product/inpainting`
- `/model-api/product/lcm-txt2img`
- `/model-api/product/merge-face`
- `/model-api/product/mix-pose`
- `/model-api/product/outpainting`
- `/model-api/product/reimagine`
- `/model-api/product/remove-background`
- `/model-api/product/remove-text`
- `/model-api/product/remove-watermark`
- `/model-api/product/replace-background`
- `/model-api/product/replace-object`
- `/model-api/product/replace-sky`
- `/model-api/product/restore-face`
- `/model-api/product/sd3`
- `/model-api/product/sdxl-turbo`
- `/model-api/product/speech2txt`
- `/model-api/product/speech2txt-translate`
- `/model-api/product/txt2img`
- `/model-api/product/txt2video`
- `/model-api/product/upscale`
- `/model-api/product/video-magic-cut`
- `/model-api/product/video-remove-object`
- `/model-api/product/video-remove-subtitle`
- `/model-api/product/video-remove-watermark`
- `/model-api/product/video-translate`
- `/model-api/product/video-upscale`
- `/model-api/product/voice-cloning`
- `/model-api/product/voice-cloning-instant`

### `/models/video/*`

来源：`src/app/model-api/product/components/Layout_new.tsx`

这些 video model 页面复用了同一个 `Layout_new`，因此也使用老 `Header` 和老 `Footer`。

- `/models/video/kling-v1.6-i2v`
- `/models/video/kling-v1.6-t2v`
- `/models/video/minimax-hailuo-02`
- `/models/video/minimax-video-01`
- `/models/video/wan-2.1`
- `/models/video/wan-2.1-i2v`
- `/models/video/wan-2.6`

## 三、GPU Console 下使用老 Header / Footer 的路由

### 统一布局影响

来源：`src/app/gpus-console/layout.tsx`

`/gpus-console/*` 统一通过 `ConsoleHeaderWrapper` 渲染老 `Header`。因此该分组下所有页面至少会使用一次老 `Header`。

### 子页面额外直接渲染老 Header + 老 Footer

以下页面除了继承 `gpus-console/layout.tsx` 的老 Header 外，页面自身还直接渲染老 `Header` 和老 `Footer`。

| 路由                              | 来源文件                                          |
| --------------------------------- | ------------------------------------------------- |
| `/gpus-console/application`       | `src/app/gpus-console/application/page.tsx`       |
| `/gpus-console/billing`           | `src/app/gpus-console/billing/page.tsx`           |
| `/gpus-console/explore`           | `src/app/gpus-console/explore/page.tsx`           |
| `/gpus-console/image`             | `src/app/gpus-console/image/page.tsx`             |
| `/gpus-console/instances`         | `src/app/gpus-console/instances/page.tsx`         |
| `/gpus-console/jobs`              | `src/app/gpus-console/jobs/page.tsx`              |
| `/gpus-console/savingsPlans`      | `src/app/gpus-console/savingsPlans/page.tsx`      |
| `/gpus-console/serverless`        | `src/app/gpus-console/serverless/page.tsx`        |
| `/gpus-console/serverless-deploy` | `src/app/gpus-console/serverless-deploy/page.tsx` |
| `/gpus-console/settings`          | `src/app/gpus-console/settings/page.tsx`          |
| `/gpus-console/storage`           | `src/app/gpus-console/storage/page.tsx`           |
| `/gpus-console/templates`         | `src/app/gpus-console/templates/page.tsx`         |
| `/gpus-console/templates-library` | `src/app/gpus-console/templates-library/page.tsx` |
| `/gpus-console/serverless copy`   | `src/app/gpus-console/serverless copy/page.tsx`   |

### 仅通过 GPU Console 布局使用老 Header

以下页面当前未直接 import 老 `Footer`，但会通过 `gpus-console/layout.tsx` 使用老 `Header`。

- `/gpus-console`
- `/gpus-console/upgrade`

## 四、直接使用老 Header，但没有老 Footer 的页面路由

| 路由                                  | 来源文件                                              | 备注                                        |
| ------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `/dedicated-endpoint-order`           | `src/app/dedicated-endpoint-order/page.tsx`           | `Header position="relative" page="console"` |
| `/model-api/model`                    | `src/app/model-api/model/page.tsx`                    | 模型列表页                                  |
| `/models/[model_series]/[model_name]` | `src/app/models/[model_series]/[model_name]/page.tsx` | 动态模型详情页，`Header size="wide"`        |

## 五、通过 PlaygroundHeader 使用老 Header 的路由

来源：`src/app/components/header/PlaygroundHeader.tsx`

`PlaygroundHeader` 内部渲染老 `Header`，但不渲染老 `Footer`。

- `/models/llm/[model]`
- `/models/image`

## 六、通过 ConsoleHeaderWrapper 使用老 Header 的路由

来源：`src/app/components/header/ConsoleHeaderWrapper.tsx`

`ConsoleHeaderWrapper` 内部渲染老 `Header`，但不渲染老 `Footer`。

### Main Console

- `/console`
- `/console/pricing-console`

### Templates Library

- `/templates-library/[templateId]`

### Settings

来源：`src/app/settings/template.tsx`

- `/settings`
- `/settings/account`
- `/settings/audit-logs`
- `/settings/key-management`
- `/settings/team`

### Quota Limits

来源：`src/app/quota-limits/template.tsx`

- `/quota-limits`
- `/quota-limits/image`
- `/quota-limits/llm`
- `/quota-limits/sandbox`

### Billing

来源：`src/app/billing/layout.tsx`

- `/billing`
- `/billing/budgets`
- `/billing/[section]`

### Sandbox Console

来源：`src/app/sandbox-console/layout.tsx`

- `/sandbox-console`
- `/sandbox-console/template`
- `/sandbox-console/usage`
- `/sandbox-console/view`

### Models Console

来源：`src/app/models-console/layout.tsx`

- `/models-console`
- `/models-console/image-dedicated-endpoints`
- `/models-console/image-playground`
- `/models-console/library`
- `/models-console/llm-dedicated-endpoints`
- `/models-console/llm-metrics`
- `/models-console/llm-playground`
- `/models-console/model-detail/[modelId]`
- `/models-console/model-management`
- `/models-console/multimodal-playground`
- `/models-console/settings`
- `/models-console/usage`

## 七、非页面路由但会影响体验的入口

| 入口       | 来源文件                   | 影响                                                          |
| ---------- | -------------------------- | ------------------------------------------------------------- |
| 全局错误页 | `src/app/global-error.tsx` | 渲染老 `Header` 和 `FooterBanner`，老 `Footer` 当前是注释状态 |

## 八、使用 AuthHeader 的授权路由

来源：`src/app/components/header/AuthHeader.tsx`

这些页面不直接使用老 `Header.tsx`，但使用老 header 目录下的 `AuthHeader`，并复用老 Header 的样式文件。

- `/oauth/authorize`
- `/oauth/authorize/refuse`
- `/oauth/authorize/success`

## 九、验收关注点

- Header：导航项、登录态入口、控制台态 `page="console"`、Notice 展示和高度占位。
- Footer：Footer 链接、FooterBanner 展示、移动端折叠/布局、底部留白。
- Console 路由：重点检查是否出现双 Header、顶部高度异常、侧边栏与 Header 重叠。
- OAuth 路由：重点检查 Logo、固定定位、背景色、移动端高度和授权结果页返回路径。
- 动态路由：至少抽样验证一个真实参数，例如 `/templates/[slug]`、`/model-api/image/[keyword]`、`/models/[model_series]/[model_name]`。
