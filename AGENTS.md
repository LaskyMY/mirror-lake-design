# 文档维护与协作

- `source/current.md` 是现行设计总纲。历史来源位于 `source/content.json` 的 `docs`，不覆盖现行决定。
- 保留角色、地图、物件、伏笔和来源全文。新设定必须区分确认、继承与补拟。
- 修改前备份；不得把旧版来源当作现行规则，也不得将摘要替换为完整原文。
- Codex 负责内容决策、架构、审查、验证与发布。DeepSeek Flash 仅处理 Codex 明确分配的常规实现任务，接收必要代码片段，产出候选改动，由 Codex 验收。
- 不提交凭据、聊天凭据、游戏运行数据或本机配置。
- 修改后运行 `node scripts/build.cjs` 和 `node scripts/check.cjs`。界面修改还应检查桌面和手机阅读、搜索及章节跳转。
- GitHub Pages 使用 `main` 分支 `/docs` 目录。此仓库单独发布，不覆盖其他托管站点。
