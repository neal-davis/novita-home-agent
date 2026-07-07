# 前端 API 层 — 参考（通用）

## 1. 推荐分层

```
组件 / hooks
    ↓ 只调用命名清晰的函数：getUserProfile(), createOrder()
api/user.ts, api/order.ts（或 services/）
    ↓ 组装 path、method、body、query
http/client.ts（或 lib/request.ts）
    ↓ fetch 或 axios；baseURL；拦截器；401；错误归一
```

落地时以**当前仓库已有目录**为准，只补一层，不要并行两套 client。

## 2. 环境变量命名习惯（示例）

| 用途 | 常见命名 | 暴露给浏览器 |
|------|----------|----------------|
| 主后端 REST | `NEXT_PUBLIC_API_URL` / `VITE_API_BASE` | 是（仅公开可暴露的基址） |
| 仅服务端 | `API_SECRET`、内网 base | 否 |

具体名字以后端与部署约定为准；skill 不绑定某一组变量名。

## 3. 请求选项清单（实现封装时）

- [ ] `method`、`url`、query、JSON body
- [ ] `signal`（AbortController）用于取消
- [ ] 超时（若团队要求）
- [ ] 二进制响应：按需配置 responseType（`blob` / `arrayBuffer`）
- [ ] 本地 Mock：环境变量切换 mock base、MSW 或代理；与生产路径保持一致，避免 mock 专用路径泄漏到生产构建

## 4. 通用原则（与具体框架弱相关）

1. **单一入口**  
   用一层薄封装（如 `request` / `apiClient`）统一：`baseURL`、默认 headers、`credentials`、JSON parse、统一错误与 401 处理。业务代码只调封装好的函数，不直接对业务域名裸 `fetch`（除非项目已约定某类请求例外）。

2. **基址来自环境变量**  
   如 `NEXT_PUBLIC_API_URL` / `VITE_API_URL` 等，**不要**把生产域名写死在组件里。多网关（主站 API、第三方开放平台）用**不同常量**或 `baseURL` 参数区分。

3. **按领域拆模块**  
   `api/user.ts`、`api/order.ts` 或 `services/user.ts`：每个文件导出「动词 + 资源」函数，内部调用共享封装。避免一个巨型 `api.ts` 堆全部 endpoint。

4. **Query 与 Body**  
   GET 查询用序列化工具（`URLSearchParams`、axios `params` 等），避免手写字符串拼接漏编码。POST / PUT 的 JSON body 与后端字段名保持一致；上传用 `FormData` 时注意在**一处**封装或注释说明，避免复制粘贴扩散。

## 7. Agent 执行任务时的自检

- [ ] 新接口落在正确的领域文件（`api/` / `services/`），而非随机新建 `utils.ts`
- [ ] `baseURL` 来自环境变量或项目既有常量，未硬编码
- [ ] 鉴权方式与同模块其他接口一致
- [ ] 未在不该暴露密钥的场景使用 `NEXT_PUBLIC_*` 或客户端直连
