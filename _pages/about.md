---
permalink: /
title: "About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I am a master's student at the [Tsinghua Shenzhen International Graduate School](https://www.sigs.tsinghua.edu.cn/), Tsinghua University, advised by Prof. [Xiao-Ping Zhang](https://www.sigs.tsinghua.edu.cn/) (IEEE Fellow).
My research interests lie at the intersection of **causal inference** and **machine learning**, with a current focus on:

- **Causal discovery** — identifiability, robust pairwise direction identification, and LiNGAM-style methods (e.g., GaussDetect-LiNGAM).
- **LLM-based causal reasoning** — confidence-aware meta-frameworks that turn single-shot LLM causal predictions into auditable, calibrated outputs (e.g., Tree-Query).
- **Trustworthy and transparent ML** — methods that expose their reasoning steps, abstain when uncertain, and support reliable downstream decisions.

I am broadly interested in any research that helps machines reason about cause and effect in a principled and reliable way.

News
======
{% assign news = site.publications | sort: 'date' | reverse %}
{% for post in news limit:5 %}
- **{{ post.date | date: "%Y-%m-%d" }}** — New paper: *[{{ post.title }}]({{ post.url | relative_url }})* — {{ post.venue }}
{% endfor %}

Selected Publications
======
See the full list on the [Publications](/publications/) page or my [Google Scholar profile](https://scholar.google.com/citations?user=1KeE6PsAAAAJ&hl=zh-CN).

Contact
======
- Email: `dingzy22 [at] mails [dot] tsinghua [dot] edu [dot] cn`
- Address: Tsinghua Shenzhen International Graduate School, Shenzhen, China
