---
permalink: /
title: "About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I am a Ph.D. student in **Data Science and Information Technology** at the [Tsinghua Shenzhen International Graduate School](https://www.sigs.tsinghua.edu.cn/) (SIGS), Tsinghua University (since Sep. 2025), advised by Prof. [Xiao-Ping (Steven) Zhang](https://sites.google.com/view/xiaopingzhang/home).

> Prof. Zhang is **Tsinghua Pengrui Chair Professor** at Tsinghua SIGS, founding Dean of the **Institute of Data and Information (iDI)**, and a **Fellow of IEEE / Canadian Academy of Engineering / Engineering Institute of Canada**. He serves as **Vice President-Education** of the IEEE Signal Processing Society and is a member of the **IEEE Fellow Committee (2026–2027)**.

Before joining Tsinghua, I received my B.S. in **Statistics** from the [School of Mathematical Sciences](https://math.tongji.edu.cn/), Tongji University (Sep. 2021 – Jul. 2025).

My research interests lie at the intersection of **causal inference** and **machine learning**, with a current focus on:

- **Causal discovery** — identifiability, robust pairwise direction identification, and LiNGAM-style methods (e.g., GaussDetect-LiNGAM).
- **LLM-based causal reasoning** — confidence-aware meta-frameworks that turn single-shot LLM causal predictions into auditable, calibrated outputs (e.g., Tree-Query).
- **Trustworthy and transparent ML** — methods that expose their reasoning steps, abstain when uncertain, and support reliable downstream decisions.

I am broadly interested in any research that helps machines reason about cause and effect in a principled and reliable way.

News
======
{% assign news = site.publications | sort: 'date' | reverse %}{% for post in news limit:5 %}
* **{{ post.date | date: "%Y-%m-%d" }}** — New paper: *[{{ post.title }}]({{ post.url | relative_url }})* — {{ post.venue }}{% endfor %}
* **2025-09** — Started my Ph.D. at Tsinghua SIGS.
* **2025-07** — Graduated from Tongji University with a B.S. in Statistics.

Selected Publications
======
See the full list on the [Publications](/publications/) page or my [Google Scholar profile](https://scholar.google.com/citations?user=1KeE6PsAAAAJ&hl=zh-CN).

Contact
======
- Email: `dingzy25 [at] mails [dot] tsinghua [dot] edu [dot] cn`
- Address: Tsinghua Shenzhen International Graduate School, Shenzhen, China
