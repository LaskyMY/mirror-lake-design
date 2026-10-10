# 镜湖残响 · 游戏设计档案

**[打开在线阅读站](https://laskymy.github.io/mirror-lake-design/)**

因果探索叙事游戏：一对恋人在同一个世界的两个时间侧寻找彼此，却逐渐发现，自己正在制造对方已经经历的历史。

设计总纲 **v0.5 · 2026-10-02**；阅读版整理于 **2026-10-10**。包含完整剧情与结局剧透。

## 分类阅读

| 分类 | 内容 |
| --- | --- |
| [01 项目总览](docs/design/01-overview.md) | 定位、确认清单、版本与阅读规则 |
| [02 世界观与物件](docs/design/02-world.md) | 双螺旋、灵矿、香包与献灵 |
| [03 时间线与伏笔](docs/design/03-timeline.md) | 四季、事件账本、开场与切片 |
| [04 游戏框架](docs/design/04-gameplay.md) | 战斗、探索、操作与界面 |
| [05 角色设定](docs/design/05-characters.md) | 外貌、家庭、关系与参考 |
| [06 地图设计](docs/design/06-maps.md) | 地点、路线与世界标识物 |
| [07 火车循环 DLC](docs/design/07-dlc.md) | 镜湖号：未抵达者 |
| [08 制作与待定](docs/design/08-production.md) | 制作约束与版本决议 |
| [09 设计问卷](docs/design/09-questionnaire.md) | 待回答的设计选择 |
| [10 下载与来源](docs/design/10-archive.md) | 来源覆盖与历史候选 |

## 完整资料

- [现行总纲全文](source/current.md)
- [现行总纲与全部来源](docs/镜湖残响_设计总纲.md)
- [八份来源索引](docs/sources/README.md)
- [角色与核心物件原件](docs/镜湖残响_角色与核心物件设定整理_v1.0.docx)
- [编辑说明与待校对引用](docs/编辑说明.md)

现行决定优先于历史来源。保留正文的「确认／继承／补拟」标记；未确定事项不会因网页整理自动成为确定规则。

## 本地维护

需要 Node.js 18 或更新版本，无第三方运行依赖。

```sh
node scripts/build.cjs
node scripts/check.cjs
node scripts/serve.cjs
```

修改 `source/current.md` 后重新生成并检查，再提交 `source/` 与 `docs/`。GitHub Pages 从 `main` 分支的 `/docs` 自动发布。网站兼容仓库子路径与手机阅读，搜索完全在浏览器本地执行。

开发分工：Codex 负责内容、关键决策和验收；DeepSeek Flash 参与搜索索引模块的实现及修订。开发凭据和调用工具保存在本机工作区之外或独立开发目录中，不属于公开站点。
