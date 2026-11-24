(() => {
  // Exact values strictly from arXiv:2604.09309 Tables 1, 2, 3, 5, 7, 9, 10, 12 and Figures 4–5
  const RANDOM6_RATE = [
    { name: "IIC (Interv. $k = 2$)", sub: "2 intervened nodes (~3% seed edges) · 554 unique gains", zhSub: "干预 2 个节点（约 3% 种子边）· 554 条独有新增边", val: 97.5, gain: "+11.9%", star: true },
    { name: "IIC (Interv. $k = 1$)", sub: "1 intervened node · iterative Reduced HTC", zhSub: "干预 1 个节点 · 约化 HTC 迭代传播", val: 93.4, gain: "+7.8%", star: true },
    { name: "Chen et al. (2017)", sub: "Auxiliary variables without iterative closure", zhSub: "辅助变量法（无迭代反馈传播）", val: 93.1, gain: "+7.5%" },
    { name: "Xie et al. (2024)", sub: "Generalized independent noise (GIN)", zhSub: "广义独立噪声条件（GIN）", val: 86.8, gain: "+1.3%" },
    { name: "Standard HTC", sub: "Baseline graphical Half-Trek Criterion (0 seeds)", zhSub: "标准半路径准则基线（无外部种子）", val: 85.6, gain: "Baseline", baseOnly: true },
  ];

  const RANDOM6_GAMMA = [
    { name: "IIC (Intervention $k = 2$)", sub: "$|\\mathrm{IIC}(\\mathcal{S}_0)\\setminus\\mathrm{HTC}| / |\\mathcal{S}_0|$ on $n = 6$ mixed graphs", zhSub: "$n = 6$ 随机混合图上的传播放大倍数 $\\gamma$", val: 4.0, star: true },
    { name: "IIC (IV · CHD MR)", sub: "4 IV seed edges $\\to$ 9 additional edges unlocked", zhSub: "4 条工具变量种子边解锁 9 条额外边", val: 2.3, star: true },
    { name: "Chen et al. (2017)", sub: "Single-pass auxiliary variable identification", zhSub: "单步辅助变量识别（无闭包迭代）", val: 1.2 },
    { name: "Xie et al. (2024)", sub: "Direct non-Gaussian sub-model check", zhSub: "直接非高斯局部识别（无跨节点放大）", val: 1.0, baseOnly: true },
    { name: "Direct Seed Only", sub: "Counting seed edges $\\mathcal{S}_0$ without propagation", zhSub: "仅计入种子边本身（无传播效应）", val: 1.0, baseOnly: true },
  ];

  const EXHAUSTIVE_DATA = [
    {
      name: "CHD Mendelian Rand.",
      sub: "9 nodes, 13 directed & 4 bidirected edges (Fig. 5)",
      zhSub: "9 节点冠心病网络（13 条有向边、4 条混杂边，图 5）",
      base: 61.5,
      ours: 100.0,
      pill: "8/13 → 13/13",
      star: true,
    },
    {
      name: "$n = 5$ Combined Seeds",
      sub: "IV + intervention seeds · gap cut 17.0% $\\to$ 2.6% (Fig. 4a)",
      zhSub: "IV + 干预组合种子 · 盲区从 17.0% 降至 2.6%（图 4a）",
      base: 83.0,
      ours: 97.4,
      pill: "+14.4 pp",
      star: true,
    },
    {
      name: "$n = 4$ Exhaustive IV",
      sub: "48 DAGs, 336 edges · 10/10 newly ID verified (100% prec.)",
      zhSub: "穷举 48 个图共 336 条边 · 100% 准确率且完备分类",
      base: 85.7,
      ours: 88.7,
      pill: "+3.0 pp",
    },
    {
      name: "$n = 5$ Exhaustive IV",
      sub: "2,576 DAGs, 134,144 edges · 2,080 new edges, 0 FP (AD = 0 extra)",
      zhSub: "穷举 2,576 个图共 134,144 条边 · 新增 2,080 条零假阳性",
      base: 80.8,
      ours: 82.3,
      pill: "2,080 new",
    },
  ];

  // Table 9: Scalability across n = 10, 20, 50, 100
  const SCALING_DATA = [
    { name: "$|V| = 10$ ($|E| = 14$)", sub: "$|\\mathcal{S}_0| = 2$ seeds · $18 \\pm 5$ ms", zhSub: "$|\\mathcal{S}_0| = 2$ 个干预节点 · 耗时 $18 \\pm 5$ ms", base: 96.1, ours: 98.6, ms: 18, star: true },
    { name: "$|V| = 20$ ($|E| = 57$)", sub: "$|\\mathcal{S}_0| = 4$ seeds · $72 \\pm 12$ ms", zhSub: "$|\\mathcal{S}_0| = 4$ 个干预节点 · 耗时 $72 \\pm 12$ ms", base: 97.0, ours: 99.2, ms: 72, star: true },
    { name: "$|V| = 50$ ($|E| = 368$)", sub: "$|\\mathcal{S}_0| = 10$ seeds · $580 \\pm 45$ ms", zhSub: "$|\\mathcal{S}_0| = 10$ 个干预节点 · 耗时 $580 \\pm 45$ ms", base: 98.6, ours: 99.3, ms: 580 },
    { name: "$|V| = 100$ ($|E| = 1{,}485$)", sub: "$|\\mathcal{S}_0| = 20$ seeds · $5{,}595 \\pm 310$ ms", zhSub: "$|\\mathcal{S}_0| = 20$ 个干预节点 · 耗时 $5{,}595 \\pm 310$ ms", base: 99.5, ours: 99.7, ms: 5595 },
  ];

  // Table 10: Estimation |Bias| (n = 5000, 100 trials)
  const EST_BIAS = [
    { name: "$T \\to Y$ (confounded)", sub: "OLS biased (0.213); 2SLS = 0.001, IIC = 0.001", zhSub: "混杂边：OLS 严重有偏 (0.213)，IIC 偏差仅 0.001", ols: 0.213, iic: 0.001, star: true },
    { name: "$W_2 \\to Y$ (confounded)", sub: "No valid IV (2SLS = N/A); IIC resolves via closure", zhSub: "无可用工具变量（2SLS 失效），IIC 经传播无偏估计", ols: 0.168, iic: 0.000, star: true },
    { name: "$W_1 \\to Y$ (confounded)", sub: "No valid IV (2SLS = N/A); IIC RMSE = 0.019", zhSub: "无可用工具变量（2SLS 失效），IIC 均方根误差 0.019", ols: 0.130, iic: 0.003, star: true },
    { name: "$Z \\to T$ (unconfounded)", sub: "Clean seed edge: IIC $\\approx$ 2SLS $\\approx$ OLS", zhSub: "无混杂种子边：IIC 与 OLS/2SLS 精度一致", ols: 0.002, iic: 0.003 },
  ];

  // Table 12: Robustness at 30% graph misspecification
  const ROBUST_30 = [
    { name: "No Error (0%)", sub: "Exact mixed graph $G$ ($n = 6$, 500 graphs)", zhSub: "精确混合图基线（$n = 6$，500 个随机图）", prec: 100.0, rec: 100.0, star: true },
    { name: "Missing Directed (30%)", sub: "30% directed edges omitted", zhSub: "缺失 30% 有向边扰动", prec: 99.1, rec: 98.3 },
    { name: "Extra Directed (30%)", sub: "30% spurious directed edges added", zhSub: "多出 30% 伪有向边扰动", prec: 98.9, rec: 97.5 },
    { name: "Extra Confounders (30%)", sub: "Conservative confounding preserves precision", zhSub: "保守混杂设定保持高准确率", prec: 98.3, rec: 96.5 },
    { name: "Missing Confounders (30%)", sub: "Overlooking latent variables (hardest regime)", zhSub: "遗漏 30% 潜混杂边（最严苛扰动）", prec: 96.4, rec: 98.9, warn: true },
  ];

  let mode = "random6";
  let subIdx = 0;

  const workbenchEl = document.querySelector(".workbench");
  const rowsHost = document.getElementById("paired-rows");
  const subHost = document.getElementById("submetric-tabs");
  const legendEl = document.getElementById("wb-legend");
  const takeawayEl = document.getElementById("wb-takeaway");

  function isZh() {
    return document.documentElement.lang === "zh-CN";
  }

  function renderSubTabs() {
    subHost.replaceChildren();
    let labels = [];
    if (mode === "random6") {
      labels = isZh() ? ["识别率 (%)", "传播放大倍数 $\\gamma$"] : ["Id. Rate (%)", "Amplification $\\gamma$"];
    } else if (mode === "exhaustive") {
      labels = isZh() ? ["HTC vs. IIC 识别率 (%)"] : ["HTC vs. IIC Rate (%)"];
    } else if (mode === "scaling") {
      labels = isZh() ? ["识别率 (%)", "运行耗时 (ms)"] : ["Id. Rate (%)", "Runtime (ms)"];
    } else {
      labels = isZh() ? ["有限样本 |Bias| ↓ (表 10)", "30% 图扰动鲁棒性 (表 12)"] : ["Estimation |Bias| ↓ (Table 10)", "30% Graph Error (Table 12)"];
    }
    if (subIdx >= labels.length) subIdx = 0;
    labels.forEach((lbl, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = lbl;
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

    if (mode === "random6") {
      if (subIdx === 0) {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> IIC 与对比方法（1,881 个混合图，10,283 条边）</span><span><i class="swatch swatch--base"></i> 标准 HTC 基线</span>`
          : `<span><i class="swatch swatch--ours"></i> IIC &amp; side-info methods (1,881 graphs, 10,283 edges)</span><span><i class="swatch swatch--base"></i> Standard HTC baseline</span>`;

        RANDOM6_RATE.forEach((item) => {
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ${item.baseOnly ? "base" : "ours"}" style="width:${item.val}%"></i></div>
                <span class="bar-num ${item.baseOnly ? "" : "ours"}">${item.val.toFixed(1)}%</span>
              </div>
            </div>
            <span class="delta-pill ${item.baseOnly ? "neutral" : ""}">${item.gain}</span>
          `;
          rowsHost.appendChild(row);
        });
      } else {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> IIC 迭代传播放大 $\\gamma$</span><span><i class="swatch swatch--base"></i> 无迭代反馈方法（$\\gamma \\le 1.2\\times$）</span>`
          : `<span><i class="swatch swatch--ours"></i> IIC iterative amplification $\\gamma$</span><span><i class="swatch swatch--base"></i> Non-iterative baselines ($\\gamma \\le 1.2\\times$)</span>`;

        RANDOM6_GAMMA.forEach((item) => {
          const w = (item.val / 4.2) * 100;
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ${item.baseOnly ? "base" : "ours"}" style="width:${w.toFixed(1)}%"></i></div>
                <span class="bar-num ${item.baseOnly ? "" : "ours"}">${item.val.toFixed(1)}×</span>
              </div>
            </div>
            <span class="delta-pill ${item.star ? "" : "neutral"}">$\\gamma = ${item.val.toFixed(1)}\\times$</span>
          `;
          rowsHost.appendChild(row);
        });
      }

      takeawayEl.innerHTML = isZh()
        ? "表 1、表 3 与图 4b（$n = 6$，1,881 个图，10,283 条边）：仅干预 $k = 2$ 个节点（约占总边数 $3\\%$）即可将识别率从 $85.6\\%$ 推升至 $97.5\\%$（$\\gamma \\approx 4.0\\times$），并识别出 Chen et al. 与 Xie et al. 均无法解决的 554 条独有因果边。"
        : "Tables 1 & 3, Fig. 4b ($n = 6$, 1,881 graphs, 10,283 edges): Two intervention seeds ($\\sim 3\\%$ of edges) lift identification from $85.6\\%$ to $97.5\\%$ ($\\gamma \\approx 4.0\\times$), resolving $554$ edges that neither Chen et al. nor Xie et al. can identify.";
    } else if (mode === "exhaustive") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--base"></i> 标准 HTC</span><span><i class="swatch swatch--ours"></i> IIC 迭代闭包（100% 数值雅可比验证准确率）</span>`
        : `<span><i class="swatch swatch--base"></i> Standard HTC</span><span><i class="swatch swatch--ours"></i> IIC Closure (100% Jacobian-verified precision)</span>`;

      EXHAUSTIVE_DATA.forEach((item) => {
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill base" style="width:${item.base}%"></i></div>
              <span class="bar-num">${item.base.toFixed(1)}%</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${item.ours}%"></i></div>
              <span class="bar-num ours">${item.ours.toFixed(1)}%</span>
            </div>
          </div>
          <span class="delta-pill">${item.pill}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 2、表 5、表 7 与图 5：在 $n \\le 5$ 全部 134,480 条边穷举验证中，IIC 新增识别的 2,090 条边实现 $100\\%$ 准确率（0 假阳性），严格包涵祖先分解（AD 独有边为 0），并在 9 节点冠心病孟德尔随机化网络中实现 $13/13$ 全识别。"
        : "Tables 2, 5, 7 & Fig. 5: Across exhaustive $n \\le 5$ verification, all $2{,}090$ newly identified IIC edges achieve $100\\%$ precision (0 false positives), strictly subsuming Ancestor Decomposition (0 AD-only edges), while closing all $5/13$ CHD gap edges.";
    } else if (mode === "scaling") {
      if (subIdx === 0) {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--base"></i> 标准 HTC (%)</span><span><i class="swatch swatch--ours"></i> IIC 识别率 (%) · 每规模 200 个随机图</span>`
          : `<span><i class="swatch swatch--base"></i> Standard HTC (%)</span><span><i class="swatch swatch--ours"></i> IIC Rate (%) · 200 random graphs per size</span>`;

        SCALING_DATA.forEach((item) => {
          const diff = (item.ours - item.base).toFixed(1);
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill base" style="width:${item.base}%"></i></div>
                <span class="bar-num">${item.base.toFixed(1)}%</span>
              </div>
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${item.ours}%"></i></div>
                <span class="bar-num ours">${item.ours.toFixed(1)}%</span>
              </div>
            </div>
            <span class="delta-pill">+${diff}%</span>
          `;
          rowsHost.appendChild(row);
        });
      } else {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> IIC 平均运行时间（毫秒，表 9）</span>`
          : `<span><i class="swatch swatch--ours"></i> Mean IIC runtime in milliseconds (Table 9)</span>`;

        SCALING_DATA.forEach((item) => {
          const w = Math.max(2.5, (Math.log10(item.ms) / Math.log10(6000)) * 100);
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${w.toFixed(1)}%"></i></div>
                <span class="bar-num ours">${item.ms.toLocaleString()} ms</span>
              </div>
            </div>
            <span class="delta-pill neutral">${item.ours.toFixed(1)}% ID</span>
          `;
          rowsHost.appendChild(row);
        });
      }

      takeawayEl.innerHTML = isZh()
        ? "表 9 与图 3：从 $|V| = 10$ 到 $100$（$1{,}485$ 条边），IIC 在多项式时间内稳定超越标准 HTC，百节点图单图耗时仅 $5.6$ 秒。"
        : "Table 9 & Fig. 3: Scaling from $|V| = 10$ to $100$ ($1{,}485$ edges), IIC consistently improves over HTC while finishing in $18\\text{ ms}$ ($|V|=10$) to $5.6\\text{ s}$ ($|V|=100$).";
    } else {
      if (subIdx === 0) {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--clay"></i> OLS 绝对偏差 $|\\mathrm{Bias}|$（受混杂污染）</span><span><i class="swatch swatch--ours"></i> IIC-Estimate $|\\mathrm{Bias}|$（$\\sqrt{n}$ 一致估计）</span>`
          : `<span><i class="swatch swatch--clay"></i> OLS $|\\mathrm{Bias}|$ (confounded)</span><span><i class="swatch swatch--ours"></i> IIC-Estimate $|\\mathrm{Bias}|$ ($\\sqrt{n}$-consistent)</span>`;

        EST_BIAS.forEach((item) => {
          const wOls = Math.max(2, (item.ols / 0.24) * 100);
          const wIic = Math.max(1.5, (item.iic / 0.24) * 100);
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill warn" style="width:${wOls.toFixed(1)}%"></i></div>
                <span class="bar-num">${item.ols.toFixed(3)}</span>
              </div>
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${wIic.toFixed(1)}%"></i></div>
                <span class="bar-num ours">${item.iic.toFixed(3)}</span>
              </div>
            </div>
            <span class="delta-pill ${item.star ? "" : "neutral"}">${item.star ? "Bias < 0.004" : "Clean edge"}</span>
          `;
          rowsHost.appendChild(row);
        });

        takeawayEl.innerHTML = isZh()
          ? "表 10（6 节点混杂图，$n = 5{,}000$，100 次重复）：混杂边上 OLS 产生 $0.130$–$0.213$ 的非渐近偏差，2SLS 无法估计无直接工具变量的 $W_1, W_2 \\to Y$，而 IIC 插件估计器将全部偏差压低至 $\\le 0.003$。"
          : "Table 10 (6-node confounded SEM, $n = 5{,}000$, 100 trials): OLS incurs persistent $0.130$–$0.213$ bias on confounded edges and 2SLS is inapplicable on $W_1, W_2 \\to Y$, whereas IIC-Estimate keeps $|\\mathrm{Bias}| \\le 0.003$ across all edges.";
      } else {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> 识别准确率 Precision (%)</span><span><i class="swatch swatch--base"></i> 识别召回率 Recall (%)</span>`
          : `<span><i class="swatch swatch--ours"></i> Identification Precision (%)</span><span><i class="swatch swatch--base"></i> Identification Recall (%)</span>`;

        ROBUST_30.forEach((item) => {
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.zhSub : item.sub}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ${item.warn ? "warn" : "ours"}" style="width:${item.prec}%"></i></div>
                <span class="bar-num ours">${item.prec.toFixed(1)}%</span>
              </div>
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill base" style="width:${item.rec}%"></i></div>
                <span class="bar-num">${item.rec.toFixed(1)}%</span>
              </div>
            </div>
            <span class="delta-pill ${item.warn ? "drop" : ""}">Prec ${item.prec.toFixed(1)}%</span>
          `;
          rowsHost.appendChild(row);
        });

        takeawayEl.innerHTML = isZh()
          ? "表 12（$30\\%$ 结构设定误差）：即便图结构存在 $30\\%$ 缺失或冗余边，IIC 准确率仍保持 $\\ge 96.4\\%$、召回率 $\\ge 96.5\\%$。"
          : "Table 12 ($30\\%$ structural perturbation): Even with $30\\%$ missing or spurious edges, IIC retains $\\ge 96.4\\%$ precision and $\\ge 96.5\\%$ recall.";
      }
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
      topicBadge: "线性结构方程模型 · 参数可识别性",
      fullTitle: "迭代可识别闭包（IIC）：放大线性结构方程模型中的因果可识别性",
      authorNotes: "* 通讯作者。",
      affilSummary: "作者单位",
      affil1: "清华大学深圳国际研究生院",
      heroLead:
        "传统半路径准则（HTC）必须一次性判定节点全部入边。迭代可识别闭包（IIC）通过代入种子系数并传播约化 HTC，将局部先验系统性放大为近全局可识别性。",
      btnPaper: "预印本 PDF ↗",
      btnExplorer: "实验结果",
      btnCite: "BibTeX",
      stageEyebrow: "交互式传播推演",
      stageTitle: "种子系数代入与约化 HTC 迭代闭包",
      modeIIC: "IIC 迭代闭包",
      modeHTC: "传统单步 HTC",
      metric1: "$n = 6$ 混合图识别率（较 2 个干预种子实现 $\\gamma \\approx 4.0\\times$ 传播放大）",
      metric2: "在 $n \\le 5$ 穷举 134,144 条边验证中保持零假阳性",
      metric3: "在冠心病孟德尔随机化网络中补全全部 5 条 HTC 盲区边",
      methodKicker: "两阶段解耦架构",
      methodHeading: "让稀疏因果种子沿图结构自举收敛至最小不动点。",
      p1Num: "01 · 可组合种子",
      p1Title: "模块化种子函数接口",
      p1Body: "工具变量、$\\mathrm{do}(v)$ 干预、非高斯子模型或领域先验均可作为 $\\mathcal{S}_0$ 注入，且组合后单调不减。",
      p2Num: "02 · 定理 4.3",
      p2Title: "约化 HTC 系数消元",
      p2Body: "消去已知父节点集合 $K \\subseteq \\mathrm{pa}(i)$ 将未知父集缩减至 $R = \\mathrm{pa}(i)\\setminus K$，同时证明雅可比矩阵 $J = [\\Sigma_{w_l, r_m}]$ 保持泛型满秩。",
      p3Num: "03 · 不动点闭包",
      p3Title: "节点级最优收敛保证",
      p3Body: "约化 HTC 迭代在至多 $|D|$ 步内（实证 $\\le 2$ 步）到达唯一最小不动点，严格包涵标准 HTC 与祖先分解。",
      expKicker: "基准评测 · 表 1–3, 9–10, 12",
      expHeading: "传播放大倍数、穷举精度验证、百节点扩展与流行病学实例。",
      tabRand: "混合图 $n = 6$ (表 1 & 3)",
      tabExh: "穷举验证与冠心病 MR (表 2 & 图 5)",
      tabScale: "大图扩展 $|V| = 10\\dots 100$ (表 9)",
      tabEst: "参数估计与图误差鲁棒性 (表 10 & 12)",
      figKicker: "论文原图",
      figHeading: "框架结构、分步传播轨迹与孟德尔随机化案例。",
      zoomFig1: "放大 ↗",
      zoomFig2: "放大 ↗",
      zoomFig3: "放大 ↗",
      zoomFig4: "放大 ↗",
      zoomFig5: "放大 ↗",
      f1Meta: "图 1 · 总体框架",
      f1Title: "IIC 架构与传播放大机制",
      f1Cap: "融合多源种子函数与约化 HTC 反馈回路，收敛至不动点 $\\mathrm{IIC}(\\mathcal{S}_0)$。",
      f2Meta: "图 2 · 迭代轨迹",
      f2Title: "两步收敛完整过程",
      f2Cap: "即便 $T, W \\in \\mathrm{sib}(Y)$ 使标准 HTC 完全失效，IIC 仍在两轮内识别全部入边。",
      f4Meta: "图 4 · 放大分析",
      f4Title: "传播放大因子 $\\gamma \\approx 4\\times$",
      f4Cap: "仅占总边数约 $3\\%$ 的两个干预种子经迭代反馈解锁 $+11.9\\%$ 识别增量。",
      f3Meta: "图 3 · 可扩展性",
      f3Title: "多项式时间大图扩展",
      f3Cap: "从 $|V| = 10$ 扩展至 $100$ 保持 $98.6\\%$–$99.7\\%$ 识别率，百节点耗时低于 $6$ 秒。",
      f5Meta: "图 5 · 真实案例",
      f5Title: "冠心病孟德尔随机化网络",
      f5Cap: "利用 BMI 与 SBP 遗传工具变量将 $|R|$ 从 $5$ 降至 $3$，解锁全部 $5$ 条混杂暴露边。",
      scopeKicker: "适用边界",
      scopeTitle: "节点级最优性与图设定误差特征",
      scopeP1:
        "<strong>节点级多项式边界：</strong>IIC 在所有节点级 HTC 策略中达到理论最优（定理 B.2）；剩余盲区边均满足 $|R| \\ge 2$ 且 $|R \\cap \\mathrm{sib}(i)| \\ge 1$（其中 $78.7\\%$ 为 $|R|=2, |R \\cap \\mathrm{sib}(i)|=1$），需补充种子或跨节点代数求解。",
      scopeP2:
        "<strong>图结构扰动鲁棒性：</strong>在 $30\\%$ 边设定误差下（表 12），准确率仍达 $\\ge 96.4\\%$、召回率 $\\ge 96.5\\%$；遗漏潜混杂是主要假阳性来源，而保守添加双向边仅温和降低召回率。",
      bibLabel: "BibTeX · arXiv 2026",
      morePages: "系列科研主页",
      sibSelf: "线性结构方程模型中的迭代可识别闭包。",
      sibGD: "无需正态性预检的双变量因果定向。",
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
