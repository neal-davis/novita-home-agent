# 前端数据与状态管理

## 触发条件

在以下情形先通读本文档再改代码：新增或迁移全局 state、slice / module、异步数据流、Context、路由级注水（hydrate）方案、权限或会话相关数据、多页面状态串扰、或裁定接口结果写入全局 store / Context / 组件的归属。

---

## 决策链（自上而下匹配）

1. **仅影响单个组件或父子两层** → `useState` / `useReducer` 或 props，不默认升全局。
2. **影响一个功能岛内多层级、不跨路由共享** → 功能域 **Context** 或局部 reducer；不默认新建全局模块。
3. **跨路由、多子树依赖的业务事实**（会话、租户、权限快照、站点级配置、主题等）→ 工程约定的 **全局 store**（Redux Toolkit、Zustand、Pinia 等）。
4. **强依赖后端列表 / 详情、需缓存、失效与去重** → **服务端状态层**（TanStack Query、SWR、RTK Query）或团队约定的 cache；与「全局 UI 事实」分离，明确响应数据**落在哪一层**、**谁触发更新**、全局与缓存的边界。

---

## 常见工程形态（抽象）

- **全局 store + thunk / saga**：异步在 middleware 或 thunk 内调用统一 API 层；列表是否进 store 须有生命周期或域划分。
- **全局 store + React Query**：列表 / 详情以 Query 为真相源；全局仅存会话、权限等横切数据；禁止两套长期重复同一列表。
- **仅 Query、弱全局**：小型应用可行；跨页共享仍可能需要轻量全局或 URL。
- **SSR / 根布局注水**：服务端拉取布局强依赖数据后，通过 `preloadedState` 或等价机制交给客户端 store，减少白屏；具体 API 随框架（Next、Remix 等）而定。
- **树外读 store**（拦截器、工具函数）：偶发；入口应**少且集中**，新增前优先 hooks 或显式依赖注入。

---

## 对齐陌生代码库（执行前）

1. 搜索 store 入口：`configureStore`、`createStore`、Zustand `create`、模块名 `store/` 或 `slices/`
2. 确认是否引入了 Query 层（`QueryClientProvider`、`useSWR`、`useQuery`）
3. 确认 SSR 注水方式（`getServerSideProps`、`loader`、根布局 `fetch`），数据由 loader 取齐再交给客户端，与工程现有模式一致，避免无谓瀑布请求

---

## 禁止

- 臆测目标工程使用或未使用 **Query 层**；以代码检索为准
- 在未读目标模块初始 state 与 reducer 的前提下**新增 slice** 或复制会话 / 权限类 state
- 将**整页列表**默认写入全局且**不做**清理、命名空间或与缓存层的分工
- 在 util、拦截器外**散落**读写全局 store；若必须，与既有少数入口保持一致

---

## 反模式

- 全局长期堆积「仅某路由需要」的列表 payload
- Context 过深或 value 过大导致无关子树重渲染 — 拆分 Context 或细化粒度
- 用全局布尔代替明确的加载态 / 错误态
- thunk（或组件）与 Query 对同一资源**重复请求**且无失效协调

---

## 附录：分层映射示例（便于对照上文决策链）

以下用 **一个 Next.js + Redux Toolkit 工程** 说明抽象分层如何落地；其他仓库结构不同，但可套用同一对照方式。**不代表所有项目都如此实现**。

| 抽象层 | 该示例中的典型落点 |
|--------|---------------------|
| **URL / 路由** | 路径与 `searchParams`（如活动、筛选）；可分享、刷新不丢的导航条件 |
| **远程数据** | 统一 `fetch` 封装 + 业务 `api/` 模块；全局异步多用 `createAsyncThunk` 调接口；未单独引入 TanStack Query / SWR，列表 / 详情多在 thunk 或页面 `useEffect` 中拉取 |
| **全局 client store** | `combineReducers` 下多块 slice：会话与用户域、站点与权限 / 运营配置域、轻量 UI 导航域、产品线专用配置与价格缓存域等；组件用 `useAppSelector` / `useAppDispatch` |
| **首屏注水** | 根 `layout`（服务端）并行请求会话 / 用户等强依赖数据，通过 `preloadedState` 注入客户端 store，避免首屏白屏 |

> 该工程**未引入** Query 层，因此列表 / 详情数据由 thunk 管理，部分承担类似职责。迁移到 Query 时需重新划清与全局 store 的边界，参考本文"决策链"第 4 条。

---

## 自检（新功能）

- [ ] 刷新后是否仍需？→ 考虑 URL 或持久化策略
- [ ] 全局或缓存层是否已有同语义数据？→ 扩展而非重复新建
- [ ] 是否跨路由共享？→ 决策链重新判断归属层
- [ ] 是否有加载 / 错误 / 空状态？→ 明确态而非全局布尔
