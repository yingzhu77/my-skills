# My Claude Code Skills

个人开发的 [Claude Code](https://claude.ai/code) Skills 集合。

## Skills

### novel-writer

AI 辅助长篇小说写作的四阶段工作流 skill。适用于 50+ 章的连续长篇创作。

**解决的核心问题：** AI 写单章很强，但写 180 章连续小说时会出现结尾模板化、身体反应固化、食物描写机械化、状态表膨胀等系统性问题。这个 skill 把踩坑经验编码成规则，在问题积累成灾之前拦住它。

**包含内容：**

| 文件 | 作用 |
|------|------|
| `SKILL.md` | 核心规则（~200行）：四阶段工作流、展示而非告知、结尾轮换、身体反应备选库、信息去重、8种反模式 |
| `references/style-checklist.md` | 每10章风格检查清单：结尾结构、重复句式、身体反应频率、比喻追踪 |
| `references/consistency-checker.md` | 自动一致性检查脚本说明：资源跳变、伏笔重复、时间线倒退 |

**四阶段工作流：**

1. **写作** — 读取项目圣经、状态表、伏笔表、最近3章正文，输出章节正文 + 写作日志
2. **审稿** — 检查连续性（人设漂移、设定矛盾、时间线倒退），直接更新状态文件
3. **一致性检查** — 每5章跑 Python 脚本，资源跳变/伏笔重复/字数超限
4. **修订** — 每卷结束后扫描重复句式、结尾模板、比喻固化，批量修复

**安装：**

```bash
# 方式一：克隆整个仓库后复制
git clone https://github.com/yingzhu77/my-skills.git
cp -r my-skills/novel-writer ~/.claude/skills/

# 方式二：直接克隆到 skills 目录（如果你只想要这个 skill）
git clone https://github.com/yingzhu77/my-skills.git /tmp/my-skills
cp -r /tmp/my-skills/novel-writer ~/.claude/skills/
rm -rf /tmp/my-skills
```

**使用：**

安装后在 Claude Code 中直接说：

- `"用 novel-writer 写一章"`
- `"用 novel-writer 审稿"`
- `"用 novel-writer 做风格检查"`

**它不能做什么：**

- 不能替你决定剧情走向
- 不能保证每一章都精彩
- 不能让 AI 突然拥有文学品味

**它能做什么：**

防止 AI 犯系统性的低级错误。结尾模板化、身体反应固化、食物描写机械化、信息三重重复——这些问题在写第 1 章时不会出现，但会在写到第 50 章时悄悄积累。skill 的作用就是在它们积累成灾之前把它们拦住。

---

> 背景：基于 180 章、6 卷、约 114 万字符的科幻废土经营流网文实战经验提炼。[写作复盘文章](https://yingzhu77.me/posts/ai-novel-journey/)
