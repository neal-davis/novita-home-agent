---
name: pr-with-demo
description: >-
  把 verify-task 的成果发成 PR：组装验证报告 + 把演示视频（webm→gif/mp4）推到
  claude-task-assets 孤儿分支 + gh pr create（draft）。verify-task 跑完、要建 PR 时用。
  Triggers: "建 PR"、"create pr with demo"、"pr-with-demo <task-id>"、"把任务结果发 PR"。
---

# pr-with-demo

输入：`<task-id>`（不给就列 `<主仓库>/.claude/tasks/` 下最近的让用户选）。
任务目录解析：`node scripts/agent/task-paths.mjs dir <task-id>`。

## 步骤

### 1. 预检（缺一即停，把缺什么告诉用户）

- 任务目录存在，且有 `report.md`（verify-task 跑完的标志）与 `video/demo.webm`。
  没视频但有 GREEN 路由 → 先补录（录的是带断言的 `@demo` 验收流程，非滚屏导览）：
  `node scripts/agent/record-demo.mjs --task <id> --spec <demo spec 文件名片段>`。
- **上线材料门禁**：`node scripts/agent/check-report.mjs --task <id>` 必须绿——校验 report.md 有
  VERDICT 裁决头、plan.md 的每条 AC 都有证据、有「上线前盲区」小节、demo.webm 存在。红了回 verify-task 补齐，别硬发 PR。
- `gh auth status` 正常。
- 当前分支是 feature 分支（不在 main 上），工作区已 commit；未推送就 `git push -u origin HEAD`。

### 2. 转码（webm → gif + mp4）

```bash
which ffmpeg || brew install ffmpeg
cd "$(node scripts/agent/task-paths.mjs dir <task-id>)/video"
# 两遍调色板法：GIF 清晰且体积小
ffmpeg -y -i demo.webm -vf "fps=8,scale=960:-1:flags=lanczos,palettegen" palette.png
ffmpeg -y -i demo.webm -i palette.png -lavfi "fps=8,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse" demo.gif
ffmpeg -y -i demo.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart demo.mp4
rm -f palette.png
```

- `demo.gif` > 9MB → 降参重转（`fps=6,scale=720:-1`）；仍超 → 放弃 gif 只发 webm/mp4 链接。

### 3. 发布资产到孤儿分支

```bash
node scripts/agent/publish-task-assets.mjs --task <task-id>
```

脚本在临时仓库里操作（绕开 husky / worktree 分支占用 / 工作区污染），把
`<task-id>/demo.{webm,gif,mp4}` 推上 `claude-task-assets` 分支，stdout 给出各资产 URL。

### 4. 组装 PR 正文 → `<taskDir>/pr/body.md`

结构：

```markdown
## Summary

<plan.md 的任务目标，2-4 句>

## Changes

<本分支 diff 的要点列表>

## Verification（verify-task <task-id>）

<report.md 的终态表：路由 | 终态 | 测试 | 备注；BUG_FOUND/BLOCKED 如实列出>

- 新增测试：<单测/e2e 清单 + 用例数>
- 回归：test:e2e:agent ✅ / test:unit ✅ / smoke <结果>

## Demo

> ⚠ 本仓库是私有库，下方资产链接登录 GitHub 后可点开查看（PR 内不内嵌渲染）。

- 🎬 [demo.mp4](<publish 输出的 mp4 URL>) · [demo.gif](<gif URL>) · [demo.webm](<webm URL>)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. 建 PR（draft，人来转 ready）

```bash
gh pr create --draft --base main --title "<类型>: <任务一句话>" \
  --body-file "$(node scripts/agent/task-paths.mjs dir <task-id>)/pr/body.md"
```

### 6. 收尾输出（给用户）

- PR URL。
- 本地视频路径 `<taskDir>/video/demo.mp4`，并提示：**想要 PR 里内嵌播放器，把这个文件拖进
  PR 描述/评论框即可**（私有库唯一的内嵌方式，30 秒手动操作）。
- `log` 一条 steps.md：`pr created: <url>`。

## 护栏

- PR 一律 **draft**，转 ready / merge 由人决定。
- 推 `claude-task-assets` 前确认 `report.md` 里没有未脱敏内容被引用（资产只有视频，正文只引报告文本）。
- `gh pr create` 失败（无权限/重复 PR）→ 把 body.md 路径给用户手动处理，别重试轰炸。
- 不动 `.github/`、不建 tag/release。
