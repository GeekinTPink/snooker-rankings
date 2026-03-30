## ZTE coding spec review (project rule)

If the user requests ZTE 编码规范检查：

- Use `git diff` to review **only the changed parts**
- Output a clear list of issues, each containing:
  - 文件名
  - 行号（尽量精确到行；如果是新增/删除块无法精确，用 diff hunk 范围说明）
  - 规范编号（若仓库内无对照文档，标记为 `N/A` 并说明原因）
  - 问题描述（可复现、可操作）

Do not modify code unless the user explicitly requests changes.

