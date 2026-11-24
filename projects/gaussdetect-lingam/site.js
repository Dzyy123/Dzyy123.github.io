(() => {
  // Plotted values from Figure 3 (Tests per Decision, TPD) and Figure 2 (GT-IT Consistency Rate)
  // under Y = 2X + \epsilon_Y across Exponential, Laplace, and Poisson disturbances (n = 400, 800, 1600).
  const TPD_DATA = {
    "400": [
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Heavy-tailed symmetric noise", zhSub: "对称重尾非高斯噪声", base: 2.45, ours: 2.00, star: true },
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Skewed one-sided noise", zhSub: "单侧偏态非高斯噪声", base: 2.15, ours: 2.00, star: true },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Discrete count disturbance", zhSub: "离散计数非高斯扰动", base: 2.13, ours: 2.00 },
    ],
    "800": [
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Heavy-tailed symmetric noise", zhSub: "对称重尾非高斯噪声", base: 2.63, ours: 2.00, star: true },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Discrete count disturbance", zhSub: "离散计数非高斯扰动", base: 2.13, ours: 2.00, star: true },
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Skewed one-sided noise", zhSub: "单侧偏态非高斯噪声", base: 2.00, ours: 2.00 },
    ],
    "1600": [
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Heavy-tailed symmetric noise", zhSub: "对称重尾非高斯噪声", base: 2.45, ours: 2.00, star: true },
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Skewed one-sided noise", zhSub: "单侧偏态非高斯噪声", base: 2.38, ours: 2.00, star: true },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Near-Gaussian discrete tail", zhSub: "大样本近似高斯离散尾部", base: 1.97, ours: 2.00 },
    ],
  };

  // Plotted batch consistency rate between Gaussianity test and reverse independence test (Figure 2)
  const CONSISTENCY_DATA = {
    "400": [
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Batch GT–IT agreement ($n = 400$)", zhSub: "正态性与独立性检验一致率 ($n = 400$)", val: 1.00, star: true },
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Batch GT–IT agreement ($n = 400$)", zhSub: "正态性与独立性检验一致率 ($n = 400$)", val: 0.88 },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Batch GT–IT agreement ($n = 400$)", zhSub: "正态性与独立性检验一致率 ($n = 400$)", val: 0.88 },
    ],
    "800": [
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Batch GT–IT agreement ($n = 800$)", zhSub: "正态性与独立性检验一致率 ($n = 800$)", val: 1.00, star: true },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Batch GT–IT agreement ($n = 800$)", zhSub: "正态性与独立性检验一致率 ($n = 800$)", val: 1.00, star: true },
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Leptokurtic finite-sample norm gap", zhSub: "尖峰重尾下正态性检验有限样本波动", val: 0.75 },
    ],
    "1600": [
      { dist: "Laplace", zhDist: "Laplace 分布", sub: "Batch GT–IT agreement ($n = 1600$)", zhSub: "正态性与独立性检验一致率 ($n = 1600$)", val: 1.00, star: true },
      { dist: "Exponential", zhDist: "Exponential 分布", sub: "Batch GT–IT agreement ($n = 1600$)", zhSub: "正态性与独立性检验一致率 ($n = 1600$)", val: 0.94, star: true },
      { dist: "Poisson", zhDist: "Poisson 分布", sub: "Batch GT–IT agreement ($n = 1600$)", zhSub: "正态性与独立性检验一致率 ($n = 1600$)", val: 0.94 },
    ],
  };

  // Exact Table 1 from gaussdetect.txt
  const VARIANTS_DATA = [
    {
      name: "GaussDetect-LiNGAM (Ours)",
      sub: "L, A, E = Must · Scope = Local",
      zhSub: "线性/无环/外生 = 必需 · 范围 = 局部双变量",
      ng: "Optional (Diagnosed)",
      zhNg: "可选（数据自动诊断）",
      ret: "DAG + Noise Regime",
      zhRet: "因果方向 + 噪声高斯性",
      pct: 100,
      star: true,
    },
    {
      name: "Pairwise-LiNGAM",
      sub: "L, A, E = Must · Scope = Local",
      zhSub: "线性/无环/外生 = 必需 · 范围 = 局部双变量",
      ng: "Must (Ex-ante + GT)",
      zhNg: "必需（先验假设 + 正态预检）",
      ret: "DAG only",
      zhRet: "仅输出 DAG",
      pct: 66,
    },
    {
      name: "DirectLiNGAM",
      sub: "L, A, E = Must · Scope = Global",
      zhSub: "线性/无环/外生 = 必需 · 范围 = 全局多变量",
      ng: "Must (All disturbances)",
      zhNg: "必需（全部噪声非高斯）",
      ret: "DAG only",
      zhRet: "仅输出 DAG",
      pct: 55,
    },
    {
      name: "ICA-LiNGAM",
      sub: "L, A, E = Must · Scope = Global",
      zhSub: "线性/无环/外生 = 必需 · 范围 = 全局多变量",
      ng: "Must (All disturbances)",
      zhNg: "必需（全部噪声非高斯）",
      ret: "DAG only",
      zhRet: "仅输出 DAG",
      pct: 55,
    },
  ];

  let mode = "tpd";
  let sample = "800";

  const workbenchEl = document.querySelector(".workbench");
  const rowsHost = document.getElementById("paired-rows");
  const extraHost = document.getElementById("wb-extra");
  const subHost = document.getElementById("submetric-tabs");
  const sampleTabs = document.getElementById("sample-tabs");
  const legendEl = document.getElementById("wb-legend");
  const takeawayEl = document.getElementById("wb-takeaway");

  function isZh() {
    return document.documentElement.lang === "zh-CN";
  }

  function renderWorkbench() {
    rowsHost.replaceChildren();
    extraHost.replaceChildren();
    subHost.replaceChildren();
    sampleTabs.style.display = mode === "variants" ? "none" : "inline-flex";

    if (mode === "tpd") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--base"></i> Pairwise-LiNGAM（正态预检 + 独立性检验，图 3 读数）</span><span><i class="swatch swatch--ours"></i> GaussDetect-LiNGAM（恒定 2.00 次独立性检验）</span>`
        : `<span><i class="swatch swatch--base"></i> Pairwise-LiNGAM (GT pre-test + ITs, Fig. 3)</span><span><i class="swatch swatch--ours"></i> GaussDetect-LiNGAM (constant 2.00 ITs)</span>`;

      TPD_DATA[sample].forEach((item) => {
        const diff = item.ours - item.base;
        const diffLbl = (diff >= 0 ? "+" : "") + diff.toFixed(2) + " TPD";
        const pillCls = diff < -0.03 ? "" : "neutral";
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${isZh() ? item.zhDist : item.dist}<small>${isZh() ? item.zhSub : item.sub}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill base" style="width:${((item.base / 3.0) * 100).toFixed(1)}%"></i></div>
              <span class="bar-num">~${item.base.toFixed(2)}</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${((item.ours / 3.0) * 100).toFixed(1)}%"></i></div>
              <span class="bar-num ours">${item.ours.toFixed(2)}</span>
            </div>
          </div>
          <span class="delta-pill ${pillCls}">${diffLbl}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? `图 3（$Y = 2X + \\epsilon_Y$，$n = ${sample}$）：GaussDetect-LiNGAM 对每对变量恒定仅执行 $2.00$ 次独立性检验（无正态性预检），而 Pairwise-LiNGAM 在通过正态性检验后需额外执行两次独立性检验（Laplace 下高达 $\\sim 2.63$ TPD）。`
        : `Figure 3 ($Y = 2X + \\epsilon_Y$, $n = ${sample}$): GaussDetect-LiNGAM executes exactly $2.00$ independence tests per decision, whereas Pairwise-LiNGAM adds a normality pre-test before running two independence checks (up to $\\sim 2.63$ TPD on Laplace noise).`;
    } else if (mode === "consistency") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 定理 4.3 实证一致率 $\\mathbb{P}(\\varphi_{\\mathrm{IT}} = \\varphi_{\\mathrm{GT}})$（图 2 读数）</span>`
        : `<span><i class="swatch swatch--ours"></i> Empirical equivalence rate $\\mathbb{P}(\\varphi_{\\mathrm{IT}} = \\varphi_{\\mathrm{GT}})$ (Fig. 2)</span>`;

      CONSISTENCY_DATA[sample].forEach((item) => {
        const pct = item.val * 100;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${isZh() ? item.zhDist : item.dist}<small>${isZh() ? item.zhSub : item.sub}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ours">${item.val.toFixed(2)}</span>
            </div>
          </div>
          <span class="delta-pill ${item.val >= 0.99 ? "" : "neutral"}">${pct.toFixed(0)}% ${isZh() ? "一致" : "Match"}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? `图 2（$n = ${sample}$）：反向残差独立性检验与正向噪声正态性检验在多类非高斯分布下保持高度一致（Exponential $n=400,800$、Poisson $n=800$ 与 Laplace $n=1600$ 均达 $1.00$），有限样本差异主要源于传统正态性检验对尖峰尾部的敏感性。`
        : `Figure 2 ($n = ${sample}$): Reverse-model independence tests match forward Gaussianity checks up to $1.00$ (Exponential $n = 400, 800$, Poisson $n = 800$, Laplace $n = 1600$); minor finite-sample gaps stem from normality-test sensitivity on leptokurtic tails.`;
    } else {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 释放先验非高斯假设（输出 DAG + 噪声分布诊断）</span><span><i class="swatch swatch--base"></i> 强依赖先验非高斯假设</span>`
        : `<span><i class="swatch swatch--ours"></i> Releases ex-ante non-Gaussianity (returns DAG + Noise Regime)</span><span><i class="swatch swatch--base"></i> Requires ex-ante non-Gaussianity</span>`;

      VARIANTS_DATA.forEach((item) => {
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : "base"}" style="width:${item.pct}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${isZh() ? item.zhRet : item.ret}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : "neutral"}">${isZh() ? item.zhNg : item.ng}</span>
        `;
        rowsHost.appendChild(row);
      });

      extraHost.innerHTML = `
        <div class="wb-matrix">
          <div class="wb-mcard highlight">
            <strong>$(\\varphi_1, \\varphi_2) = (0, 1) \\Rightarrow X \\to Y$</strong>
            <p>${isZh() ? "接受正向独立 $X \\perp\\!\\!\\!\\perp \\epsilon_Y$ 且拒绝反向独立 $Y \\perp\\!\\!\\!\\perp \\epsilon_X$。" : "Accepts forward $X \\perp\\!\\!\\!\\perp \\epsilon_Y$ and rejects reverse $Y \\perp\\!\\!\\!\\perp \\epsilon_X$."}</p>
          </div>
          <div class="wb-mcard highlight">
            <strong>$(\\varphi_1, \\varphi_2) = (1, 0) \\Rightarrow Y \\to X$</strong>
            <p>${isZh() ? "接受反向独立 $Y \\perp\\!\\!\\!\\perp \\epsilon_X$ 且拒绝正向独立 $X \\perp\\!\\!\\!\\perp \\epsilon_Y$。" : "Accepts reverse $Y \\perp\\!\\!\\!\\perp \\epsilon_X$ and rejects forward $X \\perp\\!\\!\\!\\perp \\epsilon_Y$."}</p>
          </div>
          <div class="wb-mcard">
            <strong>$(\\varphi_1, \\varphi_2) = (1, 1) \\Rightarrow$ ${isZh() ? "高斯噪声（弃权）" : "Gaussian Noise (Abstain)"}</strong>
            <p>${isZh() ? "双向独立性均被接受 $\\Leftrightarrow \\epsilon_X, \\epsilon_Y$ 服从正态分布，线性高斯下不可识别。" : "Both independence tests accepted $\\Leftrightarrow \\epsilon_X, \\epsilon_Y$ behave as Gaussian; LiNGAM abstains."}</p>
          </div>
          <div class="wb-mcard">
            <strong>$(\\varphi_1, \\varphi_2) = (0, 0) \\Rightarrow$ ${isZh() ? "证据不足（Inconclusive）" : "Inconclusive"}</strong>
            <p>${isZh() ? "双向均拒绝：提示非线性、潜混杂或有限样本检验功效不足。" : "Both rejected: flags nonlinearity, hidden confounding, or finite-sample power limits."}</p>
          </div>
        </div>
      `;

      takeawayEl.innerHTML = isZh()
        ? "表 1 与第 4 节：经典 ICA/Direct/Pairwise-LiNGAM 均要求先验满足非高斯假设；GaussDetect-LiNGAM 仅保留线性、无环与外生性，通过 $(\\varphi_1, \\varphi_2)$ 同步诊断高斯性与因果方向。"
        : "Table 1 & Section 4: Classical ICA, Direct, and Pairwise-LiNGAM require non-Gaussianity ex ante; GaussDetect-LiNGAM keeps linearity, acyclicity, and exogeneity while diagnosing Gaussianity directly from $(\\varphi_1, \\varphi_2)$.";
    }

    if (window.renderMathIn) window.renderMathIn(workbenchEl);
  }

  document.querySelectorAll("#mode-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll("#mode-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mode === mode))
      );
      renderWorkbench();
    });
  });

  document.querySelectorAll("#sample-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      sample = btn.dataset.sample;
      document.querySelectorAll("#sample-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.sample === sample))
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
      navMethod: "理论",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "预印本 ↗",
      topicBadge: "因果发现 · 双变量 LiNGAM",
      fullTitle: "GaussDetect-LiNGAM：无需正态性检验的因果方向识别",
      affilSummary: "作者单位",
      affil1: "清华大学深圳国际研究生院",
      heroLead:
        "基于 Skitovich–Darmois 定理，正向噪声的高斯性与反向回归残差的独立性在样本级严格等价——无需脆弱的正态性预检，即可识别因果方向或在双高斯情形下安全弃权。",
      btnPaper: "预印本 PDF ↗",
      btnExplorer: "实验对比",
      btnCite: "BibTeX",
      stageEyebrow: "交互式判别流程",
      stageTitle: "以残差独立性检验替代正态性预检",
      modeNonGauss: "非高斯噪声 $\\epsilon_Y$",
      modeGauss: "双高斯噪声",
      metric1: "每次因果决策恒定仅需 2 次独立性检验（0 次正态性预检）",
      metric2: "在 Exponential、Laplace 与 Poisson 噪声下验证 GT–IT 一致率",
      metric3: "联合区分 $X \\to Y$、$Y \\to X$、高斯弃权与证据不足四类状态",
      methodKicker: "核心理论等价性",
      methodHeading: "一次双向残差检验，同步完成高斯性诊断与方向识别。",
      p1Num: "01 · Skitovich–Darmois",
      p1Title: "正态分布与独立性对偶",
      p1Body: "定理 4.2 证明：反向回归自变量 $Y$ 与残差 $\\epsilon_X$ 独立，当且仅当 $X \\perp\\!\\!\\!\\perp \\epsilon_Y$ 且二者均服从正态分布。",
      p2Num: "02 · 定理 4.3",
      p2Title: "假设检验样本级等价",
      p2Body: "正向正态性检验 $\\varphi_{\\mathrm{GT}i}$ 与反向独立性检验 $\\varphi_{\\mathrm{IT}i}$ 结论一致，可用核独立性检验直接替代 Shapiro–Wilk 或 JB 检验。",
      p3Num: "03 · 算法 1",
      p3Title: "四态联合判别准则",
      p3Body: "联合评估 $\\varphi_1 = \\mathbb{I}(Y \\perp\\!\\!\\!\\perp \\epsilon_X)$ 与 $\\varphi_2 = \\mathbb{I}(X \\perp\\!\\!\\!\\perp \\epsilon_Y)$，非高斯时定向，高斯时安全弃权。",
      expKicker: "实验验证 · 表 1 与图 2–3",
      expHeading: "不同样本量与噪声分布下的一致率与检验开销节省。",
      tabTPD: "每次决策检验数 · TPD (图 3)",
      tabCons: "GT–IT 一致率 (图 2)",
      tabVar: "LiNGAM 变体对比 (表 1)",
      figKicker: "论文原图",
      figHeading: "算法流程对比与有限样本实验图表。",
      zoomFig: "放大 ↗",
      zoomFig2: "放大 ↗",
      zoomFig3: "放大 ↗",
      f1Meta: "图 1 · 判别流程",
      f1Title: "释放先验非高斯假设",
      f1Cap: "利用定理 4.3 跳过正态性预检，直接由双向残差独立性计算 $(\\varphi_1, \\varphi_2)$。",
      f2Meta: "图 2 · 一致性验证",
      f2Title: "正态性与独立性检验一致率",
      f2Cap: "在 $n = 400, 800, 1600$ 及三类非高斯扰动下验证定理 4.3 的等价性。",
      f3Meta: "图 3 · 检验效率",
      f3Title: "每次决策检验次数（TPD）",
      f3Cap: "GaussDetect-LiNGAM 恒定保持 $2.00$ TPD，避免 Pairwise-LiNGAM 的额外正态预检开销。",
      scopeKicker: "适用边界",
      scopeTitle: "结构假设与诊断范围",
      scopeP1:
        "<strong>基础结构前提：</strong>仍需满足线性、无环与外生性（无潜混杂）；当存在非线性或隐混杂时，通常触发 $(\\varphi_1, \\varphi_2) = (0, 0)$ 输出“证据不足”。",
      scopeP2:
        "<strong>数据驱动弃权而非突破高斯不可识别性：</strong>线性高斯下因果方向依然不可识别，但算法无需先验知晓噪声类型——双高斯时输出 $(1, 1)$ 自动弃权。",
      bibLabel: "BibTeX · arXiv 2025",
      morePages: "系列科研主页",
      sibSelf: "无需正态性预检的双变量因果定向。",
      sibIIC: "线性结构方程模型中的迭代可识别闭包。",
      sibTQ: "多智能体因果查询树与对抗置信度估计。",
      sibTTVenue: "EMNLP 2026 · 奖项提名",
      sibTT: "隐状态因果探针与口头输出解耦分析。",
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
