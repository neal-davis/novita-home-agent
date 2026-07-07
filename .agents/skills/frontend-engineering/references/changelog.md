# Changelog

---

## 文件组织

变更记录放在项目根目录 `.changelog/` 下，每个分支/issue 一个独立 md 文件：

```
.changelog/
├── feat-user-avatar_LIN-123.md
├── fix-login-layout_LIN-789.md
└── refactor-dashboard.md
```

**文件命名：** `{分支名}_{issue-id}.md`，无 issue 时省略后缀。

### 文件格式

```markdown
# {变更标题}

**类型：** Added | Changed | Fixed | Removed | Security
**Issue：** LIN-123（如有）

{变更的业务描述，面向团队/用户，不是技术细节}
```

### 分类规则

| 类型 | 说明 |
|------|------|
| Added | 新增功能 |
| Changed | 对已有功能的修改 |
| Fixed | Bug 修复 |
| Removed | 移除功能 |
| Security | 安全相关修复 |

---

## 生成时机

功能开发完成后，提示用户是否生成 changelog 文件：

> 功能开发完成。是否在 `.changelog/` 下生成变更记录？

**Agent 行为：**
1. 从当前 git 分支名和 issue id（如有）生成文件名
2. 根据本次改动自动填写类型和业务描述
3. 写入 `.changelog/` 目录

**需要记录的变更：**
- 新增/修改功能、Bug 修复、依赖升级、影响用户可感知行为的配置变更等和Linear集成需求

---

## Issue 集成

如果有 Linear MCP 工具可用：
- 通过 MCP 获取 Issue 详情，自动关联编号
- 开发完成后提示用户是否更新 Issue 状态

无 Linear MCP 时正常工作，用户可手动添加 Issue 编号。
