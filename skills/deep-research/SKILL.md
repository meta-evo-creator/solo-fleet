---
name: deep-research
version: 3.1.0
description: |
  深度调研技能 v3.1 — 多Agent并行子代理(7×sessions_spawn)+审稿分离。Scout(3路并行)→Analyze(2路并行)→Draft→Review(独立Agent)→Revise。设计来源：ScholarClaw(29-stage pipeline)+AutoResearchClaw(4-round audit)。
  Use when: 深度调研,技术评估,行业分析,多源交叉,L3任务
  NOT for: 简单搜索, 医学研究(use med-research), 纪检巡视(use discipline-inspect)
metadata:
  openclaw:
    emoji: 🔍
    requires:
      sessions: sessions_spawn 可用
---

# Deep-Research v3.1 🔍

> 7-Agent 独立子代理编排器。审稿分离。OpenClaw 原生。
> **v3.1 改动：补齐7个Agent子代理prompt文件，新增编排流程。**

## 五阶段管线（7 Agent）

```
Phase 1: Scout (3路并行 sessions_spawn)
  ├─ Agent 1a (web scout): tavily + web_search 广域搜索
  ├─ Agent 1b (academic scout): 学术/政策搜索
  └─ Agent 1c (deep scout): babata-browser 深度抓取
  → Merge: 主会话去重+评分+来源标注

Phase 2: Analyze (2路并行 sessions_spawn)
  ├─ Agent 2a: 主视角分析
  └─ Agent 2b: 对立/补充视角分析
  → Merge: 交叉验证+矛盾标注

Phase 3: Draft (sessions_spawn)
  → Agent 3: 综合 Scout + Analyze → 结构化报告

Phase 4: Review (sessions_spawn) ⚠️ 独立审稿
  → Agent 4: 独立会话，不继承任何上游上下文
  → 产出: quality_score + revision_plan
  → Gate: score < 60 → REJECT, 60-79 → REVISE, ≥80 → PASS

Phase 5: Revise (sessions_spawn)
  → Agent 5: 基于 revision_plan 修订报告
```

## 编排流程

```
用户问题
  ├─ Phase 1: 并行 spawn Agent 1a + 1b + 1c
  ├─ 主会话: 合并去重 Scout 结果
  ├─ Phase 2: 并行 spawn Agent 2a + 2b
  ├─ 主会话: 交叉验证分析结果
  ├─ Phase 3: spawn Agent 3 (draft)
  ├─ Phase 4: spawn Agent 4 (review) ← 独立审计
  ├─ Gate: score ≥ 80 → 交付
  │        score < 80 → Phase 5
  └─ Phase 5: spawn Agent 5 (revise) → 交付
```

## 子代理 prompt 文件

| Agent | 文件 | 职责 |
|:-----:|:-----|:-----|
| 1a | agent1a-scout-web.md | Web 搜索 Scout |
| 1b | agent1b-scout-academic.md | 学术搜索 Scout |
| 1c | agent1c-scout-deep.md | 深度抓取 Scout |
| 2a | agent2a-analyze.md | 主视角分析 |
| 2b | agent2b-analyze.md | 对立视角分析 |
| 3 | agent3-draft.md | 报告撰写 |
| 4 | agent4-review.md | 独立审稿员 |
| 5 | agent5-revise.md | 修订 |

## 审稿 Agent 约束

- ❌ 不继承 Draft/Sout/Analyze Agent 上下文
- ✅ 只读：原始问题 + 采集结果 + 分析结果 + 报告终稿
- ✅ 必须产出：quality_score + revision_plan

## 采集深度控制

| 级别 | Scout Agent数 | 每路结果数 | 适用 |
|:----:|:-----------:|:--------:|:-----|
| fast | 2路 (1a+1b) | 5 | 快速概览 |
| standard | 3路 | 10 | 标准调研 |
| deep | 3路 | 20 | 深度调研 |

## LEARNED PATTERNS

### v3.1: 纸面造假修复 (2026-05-21)
v3.0 的 7-Agent 架构只存在于描述文字中，没有任何子代理 prompt 文件。
plugins/scene/deep-research/ 目录为空。
v3.1 补齐全部 7 个 Agent prompt 文件 + 编排流程。

### v3.0: 审稿分离
审稿人不能是写作者。Review Agent 必须独立会话。
