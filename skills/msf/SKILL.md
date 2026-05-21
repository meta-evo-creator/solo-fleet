---
name: msf
version: 4.1.0
description: |
  医学社会组织发展研究工场（Medical Society Development Research Foundry） v4.1 — 科学研究方法驱动。5-Agent独立子代理(sessions_spawn)+Stage Contract+Evidence Ledger+独立审稿。
  Use when: 医学研究,系统评价,Meta分析,临床试验,证据质量,团标,团体标准,发展规划,技术路线图,学会,干细胞,外泌体,器官医学,AI医疗
  NOT for: 基金申请,合规审查,巡视纪检。
metadata:
  openclaw:
    emoji: ⚒️
    requires:
      sessions: sessions_spawn 可用
---

# MSF v4.1 ⚒️

> 5-Agent 独立子代理编排器。v4.1 补齐全部 Agent prompt 文件。

## 5-Agent 独立子代理管线

```
Phase 1: Stage Contract — 主会话 freeze
Phase 2: Scout — sessions_spawn Agent 1
Phase 3: Analyze — sessions_spawn Agent 2 (PRISMA+证据映射)
Phase 4: Draft — sessions_spawn Agent 3
Phase 5: Review — sessions_spawn Agent 4 (⚠️ 独立审稿, 硬门禁)
Phase 6: Revise — sessions_spawn Agent 5
Phase 7: Deliver — 主会话检查 review_score
```

**Phase 5 是硬门禁。没有 review_score 不允许交付。**

## 编排流程

```
用户问题
  ├─ Phase 1: 主会话冻结 Stage Contract
  ├─ Phase 2: spawn Agent 1 (scout)
  ├─ Phase 3: spawn Agent 2 (analyze)
  ├─ Phase 4: spawn Agent 3 (draft)
  ├─ Phase 5: spawn Agent 4 (review) ← 独立审计
  ├─ Gate: ≥80 → PASS, <80 → Phase 6
  └─ Phase 6: spawn Agent 5 (revise) → 交付
```

## 子代理 prompt 文件

| Agent | 文件 | 职责 |
|:-----:|:-----|:-----|
| 1 | agent1-scout.md | 文献/政策采集 |
| 2 | agent2-analyze.md | 证据映射+PRISMA |
| 3 | agent3-draft.md | 撰写初稿 |
| 4 | agent4-review.md | 独立审稿员 ⚠️ |
| 5 | agent5-revise.md | 修订 |

## 核心方法论（保留）

### Stage Contract

每次研究前冻结研究契络，PICO定义、搜索策略、质量门槛不可修改。

### PRISMA 流程

```
初始搜索 → 去重 → 标题筛选 → 摘要筛选 → 全文筛选 → 纳入
每步记录数量，搜索策略可复现。
```

### Evidence Ledger

每条主张必须对应 ≥1 条 source，标注证据等级（A-strong/A-weak/B-strong/B-weak/C）。

### 四模块

| 模块 | 做什么 |
|:-----|:------|
| SF-Standards | 团标全周期 |
| SF-Intel | 战略情报 |
| SF-Audit | 落地追踪 |

## LEARNED PATTERNS

### v4.1: 纸面造假修复 (2026-05-21)
v4.0 的 Agent 架构只存在于描述文字。plugins/scene/msf/ 目录不存在，无子代理 prompt 文件。
v4.1 补齐全部 5 个 Agent prompt 文件 + 编排流程。

### 审稿人分离
自己写的不能自己审。Review Agent 独立会话，不继承 Draft 上下文。
