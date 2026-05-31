# PLUGIN-REGISTRY.md — 技能索引表

> SOLO Fleet Registry — OpenClaw Skills 索引表。
> 技能统一存放于 `skills/` 目录，由 OpenClaw 框架通过 SKILL.md 的 `description` 关键词自动发现激活。
> 以下为当前所有已注册技能的触发词和架构汇总。
> 最后更新：2026-05-31（铁律6条·三权制衡·SkillOpt融合）

---

## Framework Plugins（OpenClaw 框架级）

| 插件 | priority | 触发条件 | 最后触发 |
|:-----|:--------:|:---------|:--------:|
| tool-awakening | 10(f) | 每次Suit层（含技能识别门禁+文件预检+搜索降级） | 2026-05-21 |
| core-lessons | 10(f) | 每次Suit层 | 2026-05-21 |
| cron-rules | 10(f) | 隔离cron会话 | 2026-05-14 |

## Scene（按需激活）

| 插件 | priority | keywords | task_types |
|:-----|:--------:|:---------|:----------:|
| deep-research | 3 | 深度调研,技术评估,行业分析,多源交叉 | L3 |

## OpenClaw Skills（框架级自动激活）

| 技能 | emoji | 触发词 | 架构 |
|:-----|:-----:|:------|:-----|
| solo | ⚡ | Fleet巡检,系统架构,三权制衡,技能索引 | 三权制衡 v2.0·六条铁律·零脚本原生(2026-05-31更新) |
| solo-audit | ⚖️ | Fleet巡检,系统审计,铁律对标,根因分析,MEV执行审计 | 司法权 v4.2.0·三张问句表+Fleet同步审计·Pro模型(2026-05-31更新) |
| deep-research | 🔍 | 深度调研,技术评估,行业分析,多源交叉,L3任务 | 8-Agent子代理(sessions_spawn) v3.3 ⬆️ |
| MSF | ⚒️ | 医学研究,系统评价,Meta分析,证据质量,团标 | 5-Agent子代理(sessions_spawn) v4.2.3 ⬆️ |
| discipline-inspect | ⚔️ | 巡视,纪检,监察,党纪,问责,诫勉,四种形态,问题底稿 | 8-Agent子代理(sessions_spawn) v3.0.2 ⬆️ |
| babata-browser | 🦞 | 学术搜索,政府网站,JS渲染,截图,web_fetch失败 | CloakBrowser v4.0.1 |
| babata-superocr | 📝 | 手写体识别,PDF扫描件,OCR | PaddleOCR+RapidOCR v1.0.0 |
| solo-file-transfer | 📤 | Word转Markdown,上传IMA,文件上传知识库 | docx_to_md + ima_api v1.0.0 |
| tavily | 🔭 | 英文搜索,国际信源,Web研究,AI答案生成 | Tavily Search API v1.1.0 (配额有限) |
| skill-vetter | 🔒 | 技能安全审查,技能安装前检查 | 安全审查协议 v1.0.0 |

---

## Dispatch 规则

1. 任务进入 Suit → 遍历 active + scene 插件 + OpenClaw skills
2. OpenClaw skills 由 `<description>` 关键词自动激活（框架级强制）
3. 内部插件通过 keywords 匹配 + `read` 加载
4. force_activate=true → 跳过匹配
5. conflict resolution: MSF(p5) vs high-priority skills → 按实际触发场景决策
