(() => {
  // Exact values from arXiv:2601.10137 Table 1, Table 2, and Section 6 (Figure 4)
  const BENCH_DATA = {
    latent: [
      { name: "Qwen2.5-7B", baseShd: 59.1, baseStd: 2.6, oursShd: 38.7, oursStd: 1.9, ndcg: 0.76, ndcgStd: 0.01, star: true },
      { name: "DeepSeek-R1-7B", baseShd: 62.0, baseStd: 2.7, oursShd: 41.3, oursStd: 2.0, ndcg: 0.74, ndcgStd: 0.03, star: true },
      { name: "Llama-3-8B", baseShd: 67.8, baseStd: 3.2, oursShd: 46.2, oursStd: 2.4, ndcg: 0.70, ndcgStd: 0.06 },
      { name: "Mistral-8B", baseShd: 69.2, baseStd: 3.3, oursShd: 48.5, oursStd: 2.5, ndcg: 0.68, ndcgStd: 0.02 },
    ],
    standard: [
      { name: "Qwen2.5-7B", baseShd: 52.3, baseStd: 2.8, oursShd: 31.4, oursStd: 3.1, ndcg: 0.81, ndcgStd: 0.02, star: true },
      { name: "DeepSeek-R1-7B", baseShd: 54.8, baseStd: 3.0, oursShd: 33.7, oursStd: 3.4, ndcg: 0.79, ndcgStd: 0.06, star: true },
      { name: "Llama-3-8B", baseShd: 60.5, baseStd: 3.4, oursShd: 38.9, oursStd: 2.9, ndcg: 0.75, ndcgStd: 0.03 },
      { name: "Mistral-8B", baseShd: 62.1, baseStd: 3.5, oursShd: 40.7, oursStd: 3.4, ndcg: 0.73, ndcgStd: 0.03 },
    ],
  };

  // Section 6 & Figure 4: Confounder screening for Diet -> Weight
  const DIET_DATA = [
    {
      name: "Case 1 · {Diet, Weight}",
      zhName: "情形 1 · {饮食, 体重}",
      sub: "Unadjusted bivariate pair: flags strong omitted confounding",
      zhSub: "未调整双变量：识别因果方向但警示显著遗漏混杂",
      dir: 0.98,
      conf: 0.67,
      pill: "Conf. 0.67",
      warn: true,
    },
    {
      name: "Case 2 · + Exercise",
      zhName: "情形 2 · + 运动 (Exercise)",
      sub: "Adding Exercise explains a major share of confounding bias",
      zhSub: "引入运动协变量：解释大部分混杂偏差",
      dir: 0.97,
      conf: 0.24,
      pill: "0.67 → 0.24",
    },
    {
      name: "Case 3 · + Exercise, Support",
      zhName: "情形 3 · + 运动, 家庭支持",
      sub: "Family Support identified as weakly informative covariate",
      zhSub: "家庭支持仅带来极小额外混杂下降（弱相关协变量）",
      dir: 0.97,
      conf: 0.22,
      pill: "0.24 → 0.22",
    },
    {
      name: "Case 4 · + Exercise, BMR",
      zhName: "情形 4 · + 运动, 基础代谢率 BMR",
      sub: "Non-independence 1.00; confounding nearly eliminated",
      zhSub: "非独立性置信度 1.00；残余混杂几乎完全消除",
      dir: 0.97,
      conf: 0.03,
      pill: "Conf. 0.03 ✓",
      star: true,
    },
  ];

  // Table 2: Paradigm Comparison
  const PARADIGM_DATA = [
    {
      name: "Tree-Query (Ours)",
      out: "DAG (Conf.)",
      zhOut: "含混杂边有向图",
      props: [
        [true, "Detects Confounders", "识别潜混杂"],
        [true, "Outputs Confidence", "输出校准置信度"],
        [true, "Transparent Process", "推理过程透明"],
        [true, "Data-Free", "免观测数据"],
      ],
      score: 4,
      star: true,
    },
    {
      name: "Direct LLM",
      out: "DAG",
      zhOut: "普通有向图",
      props: [
        [false, "No Confounders", "难辨潜混杂"],
        [false, "No Confidence", "无校准置信度"],
        [false, "Opaque Prompt", "黑箱单步输出"],
        [true, "Data-Free", "免观测数据"],
      ],
      score: 1,
    },
    {
      name: "FCI",
      out: "PAG",
      zhOut: "部分祖先图 PAG",
      props: [
        [true, "Detects Confounders", "识别潜混杂"],
        [false, "No Confidence", "无边置信度"],
        [true, "Transparent Process", "规则透明"],
        [false, "Requires Data", "依赖观测样本"],
      ],
      score: 2,
    },
    {
      name: "PC Algorithm",
      out: "CPDAG",
      zhOut: "等价类 CPDAG",
      props: [
        [false, "Causal Sufficiency", "假设无潜混杂"],
        [false, "No Confidence", "无边置信度"],
        [true, "Transparent Process", "规则透明"],
        [false, "Requires Data", "依赖观测样本"],
      ],
      score: 1,
    },
  ];

  let mode = "benchmark";
  let split = "latent";
  let subIdx = 0;

  const workbenchEl = document.querySelector(".workbench");
  const rowsHost = document.getElementById("paired-rows");
  const subHost = document.getElementById("submetric-tabs");
  const splitTabs = document.getElementById("split-tabs");
  const legendEl = document.getElementById("wb-legend");
  const takeawayEl = document.getElementById("wb-takeaway");

  function isZh() {
    return document.documentElement.lang === "zh-CN";
  }

  function renderSubTabs() {
    subHost.replaceChildren();
    let labels = [];
    if (mode === "benchmark") {
      labels = isZh() ? ["结构汉明距离 SHD ↓", "置信排序 NDCG ↑"] : ["SHD ↓ (Lower is better)", "Tree-Query NDCG ↑"];
    } else if (mode === "diet") {
      labels = isZh() ? ["混杂置信度 vs. 方向置信度"] : ["Confounding vs. Direction Confidence"];
    } else {
      labels = isZh() ? ["四大关键性质对比 (表 2)"] : ["Key Capability Matrix (Table 2)"];
    }

    if (subIdx >= labels.length) subIdx = 0;
    labels.forEach((lbl, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = lbl;
      b.setAttribute("aria-pressed", String(idx === subIdx));
      b.addEventListener("click", () => {
        subIdx = idx;
        renderWorkbench();
      });
      subHost.appendChild(b);
    });
  }

  function renderWorkbench() {
    renderSubTabs();
    rowsHost.replaceChildren();
    splitTabs.style.display = mode === "benchmark" ? "inline-flex" : "none";

    if (mode === "benchmark") {
      const table = BENCH_DATA[split];
      if (subIdx === 0) {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--base"></i> Direct LLM 结构错误数 SHD ↓</span><span><i class="swatch swatch--ours"></i> Tree-Query 结构错误数 SHD ↓（越低越好）</span>`
          : `<span><i class="swatch swatch--base"></i> Direct LLM SHD ↓</span><span><i class="swatch swatch--ours"></i> Tree-Query SHD ↓ (fewer structural errors)</span>`;

        table.forEach((item) => {
          const diff = (item.oursShd - item.baseShd).toFixed(1);
          const bW = (item.baseShd / 74) * 100;
          const oW = (item.oursShd / 74) * 100;
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>NDCG: ${item.ndcg.toFixed(2)} ± ${item.ndcgStd.toFixed(2)}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill base" style="width:${bW.toFixed(1)}%"></i></div>
                <span class="bar-num">${item.baseShd.toFixed(1)}</span>
              </div>
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${oW.toFixed(1)}%"></i></div>
                <span class="bar-num ours">${item.oursShd.toFixed(1)}</span>
              </div>
            </div>
            <span class="delta-pill">$\\Delta$ ${diff} SHD</span>
          `;
          rowsHost.appendChild(row);
        });
      } else {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> Tree-Query NDCG ↑（Direct LLM 无置信度输出记为 N/A）</span>`
          : `<span><i class="swatch swatch--ours"></i> Tree-Query NDCG ↑ (Direct LLM = N/A, uncalibrated)</span>`;

        table.forEach((item) => {
          const w = item.ndcg * 100;
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>Direct LLM: N/A · SHD ${item.oursShd.toFixed(1)} ± ${item.oursStd.toFixed(1)}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${w.toFixed(1)}%"></i></div>
                <span class="bar-num ours">${item.ndcg.toFixed(2)}</span>
              </div>
            </div>
            <span class="delta-pill">±${item.ndcgStd.toFixed(2)}</span>
          `;
          rowsHost.appendChild(row);
        });
      }

      takeawayEl.innerHTML = isZh()
        ? `表 1（${split === "latent" ? "潜混杂修改基准" : "标准有向图基准"}）：在全部 4 个 7B–8B 基座模型上，Tree-Query 将图重建错误 SHD 一致降低约 $20.4$–$21.6$ 条边，并提供 $0.68$–$0.81$ 的校准置信排序 NDCG。`
        : `Table 1 (${split === "latent" ? "Modified Latent Benchmark" : "Standard DAG Benchmark"}): Across all four 7B–8B backbones, Tree-Query cuts structural errors by $20.4$–$21.6$ SHD while providing calibrated NDCG of $0.68$–$0.81$ (Direct LLM = N/A).`;
    } else if (mode === "diet") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--clay"></i> 潜在混杂置信度 $c_{\\leftrightarrow}$ ↓</span><span><i class="swatch swatch--ours"></i> 因果方向 $\\mathrm{Diet} \\to \\mathrm{Weight}$ 置信度 ↑</span>`
        : `<span><i class="swatch swatch--clay"></i> Confounding confidence $c_{\\leftrightarrow}$ ↓</span><span><i class="swatch swatch--ours"></i> Causal direction $\\mathrm{Diet} \\to \\mathrm{Weight}$ ↑</span>`;

      DIET_DATA.forEach((item) => {
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${isZh() ? item.zhName : item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill warn" style="width:${(item.conf * 100).toFixed(0)}%"></i></div>
              <span class="bar-num">${item.conf.toFixed(2)}</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${(item.dir * 100).toFixed(0)}%"></i></div>
              <span class="bar-num ours">${item.dir.toFixed(2)}</span>
            </div>
          </div>
          <span class="delta-pill ${item.warn ? "drop" : item.star ? "" : "neutral"}">${item.pill}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "第 6 节与图 4：随着运动（Exercise）与基础代谢率（BMR）加入条件集，潜在混杂置信度从 $0.67 \\to 0.24 \\to 0.22 \\to 0.03$ 逐步消退，而 $\\mathrm{Diet} \\to \\mathrm{Weight}$ 始终稳定在 $0.97$–$0.98$。"
        : "Section 6 & Fig. 4: As Exercise and BMR enter the variable set, confounding confidence drops $0.67 \\to 0.24 \\to 0.22 \\to 0.03$ while $\\mathrm{Diet} \\to \\mathrm{Weight}$ remains stable at $0.97$–$0.98$.";
    } else {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 具备该性质 (✓)</span><span><i class="swatch swatch--clay"></i> 不具备该性质 (✗)</span>`
        : `<span><i class="swatch swatch--ours"></i> Supported capability (✓)</span><span><i class="swatch swatch--clay"></i> Missing capability (✗)</span>`;

      PARADIGM_DATA.forEach((item) => {
        const badges = item.props
          .map(
            ([ok, enLbl, zhLbl]) =>
              `<span class="wb-tag ${ok ? "yes" : "no"}">${ok ? "✓" : "✗"} ${isZh() ? zhLbl : enLbl}</span>`
          )
          .join("");
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? "输出：" + item.zhOut : "Output: " + item.out}</small></div>
          <div class="wb-prop-badges">${badges}</div>
          <span class="delta-pill ${item.star ? "" : "neutral"}">${item.score} / 4</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 2：Tree-Query 兼具免数据推理、潜混杂检测、对抗校准置信度与可审计查询日志四项性质，可为下游统计因果发现提供结构化先验。"
        : "Table 2: Tree-Query uniquely combines data-free prior elicitation, explicit latent-confounder detection, calibrated confidence scores, and a transparent reasoning log.";
    }

    if (window.renderMathIn) window.renderMathIn(workbenchEl);
  }

  document.querySelectorAll("#mode-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      subIdx = 0;
      document.querySelectorAll("#mode-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mode === mode))
      );
      renderWorkbench();
    });
  });

  document.querySelectorAll("#split-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      split = btn.dataset.split;
      document.querySelectorAll("#split-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.split === split))
      );
      renderWorkbench();
    });
  });

  // Lightbox Dialog
  const dlg = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbTitle = document.getElementById("lb-title");
  const lbCap = document.getElementById("lb-cap");
  const lbClose = document.getElementById("lb-close");
  let lastTrigger = null;

  document.querySelectorAll("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      lastTrigger = btn;
      lbImg.src = btn.getAttribute("data-lightbox");
      lbImg.alt = btn.getAttribute("data-title") || "";
      lbTitle.innerHTML = btn.getAttribute("data-title") || "";
      lbCap.innerHTML = btn.getAttribute("data-caption") || "";
      if (window.renderMathIn) window.renderMathIn(dlg);
      dlg.showModal();
    });
  });

  lbClose.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) dlg.close();
  });
  dlg.addEventListener("close", () => {
    if (lastTrigger) lastTrigger.focus();
  });

  // Copy BibTeX
  const copyBtn = document.getElementById("copy-bib");
  const bibText = document.getElementById("bib-text");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(bibText.textContent.trim());
      copyBtn.textContent = isZh() ? "已复制 ✓" : "Copied ✓";
      setTimeout(() => {
        copyBtn.textContent = isZh() ? "复制 BibTeX" : "Copy BibTeX";
      }, 1800);
    } catch {}
  });

  // Bilingual I18N (EN / 中文)
  const I18N = {
    zh: {
      skipLink: "跳至主要内容",
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "预印本 ↗",
      topicBadge: "多智能体大模型 · 透明因果发现",
      fullTitle: "逐步因果推理：基于多智能体 Tree-Query 与对抗置信度估计的透明因果发现",
      authorNotes: "* 共同第一作者。† 通讯作者。",
      affilSummary: "作者单位",
      affil1: "清华大学深圳国际研究生院",
      affil2: "清华大学致理书院",
      heroLead:
        "用固定的四阶段因果查询树、Clinic 多专家路由与对抗置信度估计（ACE）取代不透明的单步大模型因果问答，在反驳扰动下量化每个局部断言的稳健性。",
      btnPaper: "预印本 PDF ↗",
      btnExplorer: "基准实验",
      btnCite: "BibTeX",
      stageEyebrow: "交互式决策树",
      stageTitle: "四级 Tree-Query 与 MES–ACE 对抗校准",
      modeLatent: "潜混杂 $X_1 \\leftrightarrow X_2$",
      modeDirect: "阻断后直接因果",
      metric1: "Qwen2.5-7B 结构汉明距离下降（标准图 52.3 → 31.4；潜混杂 59.1 → 38.7）",
      metric2: "标准基准置信排序质量（潜混杂掩码基准达 0.76）",
      metric3: "控制运动与基础代谢率后饮食—体重混杂度下降（因果方向保持 0.97）",
      methodKicker: "三层协同架构",
      methodHeading: "误差隔离查询树、领域专家分诊与对抗分布鲁棒性。",
      p1Num: "01 · Tree-Query",
      p1Title: "由粗到细四步解耦",
      p1Body: "对每对变量独立执行后门路径、独立性、潜混杂与方向四类有界查询，阻断 PC/FCI 条件集链式误差传播。",
      p2Num: "02 · Clinic & MES",
      p2Title: "多专家分诊路由",
      p2Body: "Clinic Agent 按查询类型调配图论、统计、反事实与机制专家独立投票，提取初始多数共识 $p_0$。",
      p3Num: "03 · 命题 4.6",
      p3Title: "对抗置信度估计（ACE）",
      p3Body: "三类对抗人格构造反向论据重询专家组；偏移量 $|p_j - p_0^{\\mathrm{raw}}| = W_1(\\hat{\\mu}_{\\mathrm{ans}}, \\hat{\\mu}_{\\mathrm{adv},j})$ 惩罚脆弱结论。",
      expKicker: "基准实验 · 表 1–2 与第 6 节",
      expHeading: "四大基座模型免数据图重建精度与混杂因子逐步筛查。",
      tabBench: "Mooij & UCI 基准 (表 1)",
      tabDiet: "饮食—体重混杂筛查 (图 4)",
      tabPara: "方法范式对比 (表 2)",
      splitLat: "潜混杂掩码图",
      splitStd: "标准有向图",
      figKicker: "论文原图",
      figHeading: "查询树决策平面、MES–ACE 节点模块与混杂筛查实例。",
      zoomFig1: "放大 ↗",
      zoomFig2: "放大 ↗",
      zoomFig3: "放大 ↗",
      zoomFig4: "放大 ↗",
      f1Meta: "图 1 · 决策树结构",
      f1Title: "显式因果 Tree-Query 决策平面",
      f1Cap: "沿无后门与阻断后双分支解析 $\\{X_1 \\perp X_2,\\; X_1 \\leftrightarrow X_2,\\; X_1 \\to X_2,\\; X_2 \\to X_1\\}$。",
      f2Meta: "图 2 · 节点执行引擎",
      f2Title: "Clinic 多专家系统与对抗翻转重询",
      f2Cap: "融合领域专家多数投票与三类对抗人格翻转测试，输出稳健置信分。",
      f3Meta: "图 3 · 潜混杂评测构造",
      f3Title: "掩码潜混杂基准构建",
      f3Cap: "掩去未观测共同原因 $A$ 并引入双向边 $B \\leftrightarrow C$，检验模型抵抗伪定向的能力。",
      f4Meta: "图 4 · 混杂筛查案例",
      f4Title: "饮食—体重因果关系混杂筛查",
      f4Cap: "区分关键混杂因子（运动、基础代谢率）与弱信息协变量（家庭支持）。",
      scopeKicker: "适用边界",
      scopeTitle: "免数据因果先验定位与调用开销",
      scopeP1:
        "<strong>统计因果发现的先验补充而非替代：</strong>Tree-Query 在无观测样本条件下提炼可审计的领域因果先验，用于预筛实验假设并为下游数据驱动算法提供热启动。",
      scopeP2:
        "<strong>有界可靠性前提与推理成本：</strong>渐近可识别性（定理 4.1）要求单专家错误率 $\\alpha < 0.5$ 且近似独立；多专家与三类对抗人格重询以额外调用开销换取校准稳健性。",
      bibLabel: "BibTeX · arXiv 2026",
      morePages: "系列科研主页",
      sibSelf: "多智能体因果查询树与对抗置信度估计。",
      sibTTVenue: "EMNLP 2026 · 奖项提名",
      sibTT: "隐状态因果探针与口头输出解耦分析。",
      sibGD: "无需正态性预检的双变量因果定向。",
      sibIIC: "线性结构方程模型中的迭代可识别闭包。",
      footAuthor: "丁子毅 (Ziyi Ding) · 清华大学深圳国际研究生院",
      footStudio: "学术主页",
      footTop: "回到顶部 ↑",
      lbClose: "关闭 (Esc)",
    },
  };

  const EN_CACHE = {};
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    EN_CACHE[el.dataset.i18n] = el.innerHTML;
  });

  const langBtn = document.getElementById("lang-toggle");

  function applyLocale(zhMode) {
    document.documentElement.lang = zhMode ? "zh-CN" : "en";
    langBtn.textContent = zhMode ? "EN" : "中文";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = zhMode ? (I18N.zh[key] || EN_CACHE[key]) : EN_CACHE[key];
    });
    copyBtn.textContent = zhMode ? "复制 BibTeX" : "Copy BibTeX";
    if (window.renderMathIn) window.renderMathIn(document.body);
    renderWorkbench();
    window.dispatchEvent(new CustomEvent("ziyi-lang-change"));
  }

  langBtn.onclick = () => {
    const nextZh = document.documentElement.lang !== "zh-CN";
    try { localStorage.setItem("ziyi-studio-locale", nextZh ? "zh" : "en"); } catch {}
    applyLocale(nextZh);
  };

  const params = new URLSearchParams(window.location.search);
  const isEmbedded = params.get("embed") === "1";
  if (isEmbedded) {
    document.documentElement.classList.add("is-embedded");
    const slugMap = {
      causalvae: "world-models",
      "traj-lewm": "traj-lewm",
      "causal-tongue-tie": "causal-reasoning",
      "gaussdetect-lingam": "causal-discovery",
      icd: "intervene-calibrate-discover-learning-causal-structure-from-pixels",
      egolam: "egolam",
      "identification-closure": "identification-closure",
      "tree-query": "tree-query",
      "state-readout-decoupling": "state-readout-decoupling",
      georefiner: "georefiner",
    };
    document.querySelectorAll("[data-sibling]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = slugMap[link.getAttribute("data-sibling")];
        if (targetId && window.parent && window.parent !== window) {
          e.preventDefault();
          window.parent.postMessage({ type: "ziyi-open-paper", paperId: targetId }, "*");
        }
      });
    });
    document.querySelectorAll("[data-studio-home]").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (window.parent && window.parent !== window) {
          e.preventDefault();
          window.parent.postMessage({ type: "ziyi-close-overlay" }, "*");
        }
      });
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && (!dlg || !dlg.open) && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "ziyi-escape" }, "*");
      }
    });
  }

  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "ziyi-set-locale") {
      const zh = e.data.locale === "zh";
      try { localStorage.setItem("ziyi-studio-locale", zh ? "zh" : "en"); } catch {}
      applyLocale(zh);
    }
  });

  let initZh = false;
  try {
    initZh = params.get("lang") ? params.get("lang") === "zh" : localStorage.getItem("ziyi-studio-locale") === "zh";
  } catch {}

  if (initZh) {
    applyLocale(true);
  } else {
    if (window.renderMathIn) window.renderMathIn(document.body);
    renderWorkbench();
  }
})();
