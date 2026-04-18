---
title: "Tree-Query: A Confidence-Aware Meta-Framework for LLM-Based Causal Discovery"
collection: publications
category: manuscripts
permalink: /publication/2026-01-17-tree-query
excerpt: 'A model-agnostic meta-framework that wraps any single-shot LLM causal prompting method and augments it with multi-expert consensus and adversarial confidence estimation, producing calibrated, auditable causal predictions.'
date: 2026-01-17
venue: 'arXiv preprint (under review)'
paperurl: 'https://arxiv.org/abs/2601.10137'
citation: 'Ziyi Ding*, Chenfei Ye-Hao*, Zheyuan Wang, Xiao-Ping Zhang. (2026). &quot;Tree-Query: A Confidence-Aware Meta-Framework for LLM-Based Causal Discovery (a.k.a. Step-by-Step Causality).&quot; <i>arXiv:2601.10137</i>.'
---

**Authors:** Ziyi Ding\*, Chenfei Ye-Hao\*, Zheyuan Wang, Xiao-Ping Zhang  
*(\*equal contribution)*

**TL;DR:** Existing LLM-based causal discovery methods produce point predictions without any reliability indication. We introduce **Tree-Query**, a model-agnostic meta-framework that wraps any single-shot LLM causal prompting method with two capabilities: (i) **multi-expert consensus** — soliciting the same causal query from multiple reasoning perspectives and aggregating via majority voting; and (ii) **adversarial confidence estimation (ACE)** — stress-testing the consensus to produce per-prediction confidence scores. Across four benchmarks (Tübingen, Asia, Sachs, Child) using Qwen2.5-7B in a data-free setting, unanimous Tree-Query predictions reach 80.4% accuracy on Tübingen, surpassing the best single-shot baseline (76.9%); and vote fraction reliably separates correct from incorrect predictions, enabling selective trust.

[arXiv:2601.10137](https://arxiv.org/abs/2601.10137){: .btn .btn--primary}
