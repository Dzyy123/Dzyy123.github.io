(() => {
  // Exact values from ECCV 2026 Tables 1, 2, and 3 (Baseline / +CausalVAE)
  const CF_DATA = {
    "Physics 3-body": [
      { name: "GNN-NLL", fam: "Graph + NLL", base: [11.00, 53.50], ours: [41.00, 68.88], star: true },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [10.50, 52.25], ours: [41.00, 66.92], star: true },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [10.00, 49.33], ours: [24.00, 51.77] },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [14.50, 55.83], ours: [22.00, 57.50] },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [11.50, 52.96], ours: [15.00, 53.17] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [22.50, 59.83], ours: [25.00, 50.62] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [10.50, 51.75], ours: [13.00, 51.00] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [8.50, 46.00], ours: [8.50, 45.40] },
    ],
    "Chemistry": [
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [13.05, 33.22], ours: [27.49, 48.67], star: true },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [13.54, 32.96], ours: [25.76, 47.66], star: true },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [15.50, 33.62], ours: [25.26, 45.80] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [15.38, 33.53], ours: [24.61, 48.24] },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [28.30, 50.46], ours: [29.56, 51.09] },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [35.91, 55.82], ours: [34.34, 54.12] },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [25.96, 48.44], ours: [23.70, 45.20] },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [52.61, 59.47], ours: [35.87, 55.81] },
    ],
    "2D Shapes": [
      { name: "GNN-NLL", fam: "Graph + NLL", base: [33.00, 58.81], ours: [54.75, 74.00], star: true },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [62.80, 78.46], ours: [68.35, 81.88], star: true },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [65.75, 80.22], ours: [67.82, 81.64] },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [67.06, 81.11], ours: [68.50, 81.94] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [19.70, 41.76], ours: [19.40, 43.11] },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [53.10, 70.97], ours: [52.53, 70.86] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [46.97, 66.15], ours: [45.31, 65.74] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [13.85, 32.39], ours: [8.55, 22.92] },
    ],
    "3D Cubes": [
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [7.90, 19.07], ours: [16.75, 33.80], star: true },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [29.90, 53.02], ours: [33.20, 55.40] },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [39.90, 60.41], ours: [41.65, 63.11], star: true },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [27.15, 50.08], ours: [27.65, 51.01] },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [30.60, 53.74], ours: [30.90, 54.83] },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [20.05, 44.28], ours: [18.50, 42.57] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [22.15, 38.32], ours: [20.35, 41.01] },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [28.45, 48.15], ours: [25.90, 48.73] },
    ],
  };

  // Table 1: Factual H@1 across [1-step, 5-step, 10-step]
  const FACTUAL_DATA = {
    "Physics 3-body": [
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [88.00, 25.00, 3.00], ours: [99.00, 36.00, 7.00], star: true },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [98.00, 9.00, 7.00], ours: [99.00, 17.00, 5.00], star: true },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [89.00, 10.00, 1.00], ours: [98.00, 9.00, 3.00] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [70.00, 1.00, 2.00], ours: [91.00, 3.00, 2.00] },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [92.00, 4.00, 0.00], ours: [94.00, 4.00, 1.00] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [92.00, 1.00, 0.00], ours: [94.00, 2.00, 0.00] },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [96.00, 11.00, 1.00], ours: [95.00, 11.00, 3.00] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [90.00, 20.00, 3.00], ours: [86.00, 8.00, 2.00] },
    ],
    "Chemistry": [
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [99.97, 99.43, 95.74], ours: [99.99, 98.63, 67.20], star: true },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [99.95, 99.94, 99.92], ours: [99.96, 99.73, 98.60] },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [99.95, 99.96, 99.86], ours: [99.95, 99.74, 99.48] },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [99.91, 99.84, 99.92], ours: [99.90, 99.81, 99.33] },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [99.95, 99.94, 99.91], ours: [99.91, 99.38, 89.28] },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [99.86, 98.17, 93.24], ours: [99.89, 96.77, 85.73] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [96.03, 88.50, 78.20], ours: [97.47, 74.59, 25.32] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [99.50, 77.97, 30.50], ours: [16.03, 6.48, 3.76] },
    ],
    "2D Shapes": [
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [99.91, 98.89, 96.11], ours: [99.90, 97.60, 86.02] },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [99.80, 85.69, 43.04], ours: [99.62, 83.88, 47.10], star: true },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [94.42, 43.77, 17.14], ours: [95.73, 48.58, 20.79], star: true },
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [99.42, 81.31, 42.57], ours: [98.83, 77.28, 40.37] },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [94.01, 58.84, 28.34], ours: [94.03, 58.16, 27.44] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [76.51, 20.30, 5.58], ours: [87.70, 1.75, 0.29] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [59.45, 9.84, 2.00], ours: [60.37, 10.82, 2.14] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [3.25, 0.73, 0.33], ours: [2.16, 0.19, 0.08] },
    ],
    "3D Cubes": [
      { name: "AE-NLL", fam: "Monolithic + NLL", base: [78.90, 26.45, 7.54], ours: [79.64, 27.42, 8.23], star: true },
      { name: "AE-Contrastive", fam: "Monolithic + Contrastive", base: [68.37, 19.49, 7.35], ours: [69.69, 18.79, 5.72] },
      { name: "VAE-Contrastive", fam: "Variational + Contrastive", base: [65.25, 14.72, 4.36], ours: [66.09, 17.49, 6.71], star: true },
      { name: "Modular-NLL", fam: "Object-wise + NLL", base: [64.77, 14.94, 2.95], ours: [65.09, 15.88, 3.49] },
      { name: "GNN-NLL", fam: "Graph + NLL", base: [59.61, 12.23, 2.66], ours: [60.13, 13.34, 3.06] },
      { name: "GNN-Contrastive", fam: "Graph + Contrastive", base: [60.88, 15.71, 5.45], ours: [59.38, 2.67, 0.13] },
      { name: "VAE-NLL", fam: "Variational + NLL", base: [55.44, 10.69, 2.27], ours: [52.58, 9.36, 1.45] },
      { name: "Modular-Contrastive", fam: "Object-wise + Contrastive", base: [3.18, 0.39, 0.21], ours: [11.32, 0.42, 0.13] },
    ],
  };

  // Table 3: Physics Ablations [Factual H@1, CF-H@1]
  const ABLATION_DATA = [
    { name: "Three-stage training (Ours)", note: "S1 = 20, S2 = 80, $\\alpha$-gate on, late-mixed", vals: [91.00, 31.00], star: true },
    { name: "Rollout policy: curriculum", note: "Curriculum horizon schedule", vals: [91.00, 31.33] },
    { name: "Single-step rollout", note: "w/o multi-step rollout loss", vals: [90.67, 30.67] },
    { name: "w/o Contrastive loss", note: "NLL-only Stage-3 refinement", vals: [89.33, 29.67] },
    { name: "Joint training (w/o stage split)", note: "End-to-end without S1/S2/S3 decoupling", vals: [90.33, 28.00] },
    { name: "w/o CausalVAE branch", note: "Bypassing structural DAG $A$ module", vals: [80.00, 27.67] },
    { name: "Baseline (GNN-Contrastive)", note: "Backbone without CausalVAE", vals: [88.00, 11.50] },
    { name: "w/o State alignment $\\mathcal{L}_{\\mathrm{align}}$", note: "Removes Stage-2 coordinate anchoring", vals: [9.00, 26.67], warn: true },
    { name: "$\\alpha$-Gate OFF", note: "Uncontrolled raw/causal latent mixing", vals: [1.33, 13.67], warn: true },
  ];

  let mode = "cf";
  let domain = "Physics 3-body";
  let subIdx = 0;

  const workbenchEl = document.querySelector(".workbench");
  const rowsHost = document.getElementById("paired-rows");
  const subHost = document.getElementById("submetric-tabs");
  const domainTabs = document.getElementById("domain-tabs");
  const legendEl = document.getElementById("wb-legend");
  const takeawayEl = document.getElementById("wb-takeaway");

  function isZh() {
    return document.documentElement.lang === "zh-CN";
  }

  function renderSubTabs() {
    subHost.replaceChildren();
    let labels = [];
    if (mode === "cf") labels = ["CF-H@1 (%)", "CF-MRR (%)"];
    else if (mode === "factual") labels = ["1-Step H@1", "5-Step H@1", "10-Step H@1"];
    else labels = ["CF-H@1 (%)", "Factual H@1 (%)"];

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
    domainTabs.style.display = mode === "ablation" ? "none" : "inline-flex";

    if (mode === "ablation") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 正常配置</span><span><i class="swatch swatch--clay"></i> 去掉 $\\mathcal{L}_{\\mathrm{align}}$ 或 $\\alpha$ 门控崩溃项</span>`
        : `<span><i class="swatch swatch--ours"></i> Stable configuration</span><span><i class="swatch swatch--clay"></i> Collapsed when removing $\\mathcal{L}_{\\mathrm{align}}$ or $\\alpha$-gate</span>`;

      const metricIdx = subIdx === 0 ? 1 : 0;
      ABLATION_DATA.forEach((item) => {
        const v = item.vals[metricIdx];
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.note}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.warn ? "warn" : "ours"}" style="width:${Math.max(1.5, v)}%"></i></div>
              <span class="bar-num ours">${v.toFixed(2)}%</span>
            </div>
          </div>
          <span class="delta-pill ${item.warn ? "drop" : item.star ? "" : "neutral"}">${
            item.star ? "Ours" : item.warn ? (isZh() ? "关键消融" : "Critical") : `Factual ${item.vals[0].toFixed(1)}%`
          }</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 3（GNN-Contrastive 宿主）：三阶段训练将 CF-H@1 从 11.50% 提至 31.00%（事实 H@1 91.00%）；去掉状态锚定 $\\mathcal{L}_{\\mathrm{align}}$（9.00%）或关闭 $\\alpha$ 门控（1.33%）会直接导致滚动崩溃。"
        : "Table 3 (GNN-Contrastive host): Three-stage training lifts CF-H@1 from 11.50% $\\to$ 31.00% (factual H@1 91.00%); removing $\\mathcal{L}_{\\mathrm{align}}$ (9.00%) or $\\alpha$-gating (1.33%) collapses rollout.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    legendEl.innerHTML = isZh()
      ? `<span><i class="swatch swatch--base"></i> 宿主基线</span><span><i class="swatch swatch--ours"></i> + CausalVAE</span>`
      : `<span><i class="swatch swatch--base"></i> Baseline</span><span><i class="swatch swatch--ours"></i> + CausalVAE</span>`;

    const table = mode === "cf" ? CF_DATA[domain] : FACTUAL_DATA[domain];
    table.forEach((item) => {
      const bVal = item.base[subIdx];
      const oVal = item.ours[subIdx];
      const diff = oVal - bVal;
      const diffLabel = (diff >= 0 ? "+" : "") + diff.toFixed(2);
      const pillClass = diff > 0.05 ? "" : diff < -0.5 ? "drop" : "neutral";

      const row = document.createElement("div");
      row.className = "paired-row" + (item.star ? " highlight" : "");
      row.innerHTML = `
        <div class="paired-name">${item.name}<small>${item.fam}</small></div>
        <div class="bars-stack">
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill base" style="width:${Math.max(1, bVal)}%"></i></div>
            <span class="bar-num">${bVal.toFixed(2)}</span>
          </div>
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill ours" style="width:${Math.max(1, oVal)}%"></i></div>
            <span class="bar-num ours">${oVal.toFixed(2)}</span>
          </div>
        </div>
        <span class="delta-pill ${pillClass}">$\\Delta$ ${diffLabel}</span>
      `;
      rowsHost.appendChild(row);
    });

    if (mode === "cf") {
      const notes = {
        "Physics 3-body": isZh()
          ? "表 2 · Physics：8 组主干平均相对提升 +102.5%，GNN-NLL（11.0 $\\to$ 41.0）与 AE-NLL（10.5 $\\to$ 41.0）增幅最大。"
          : "Table 2 · Physics: +102.5% mean relative CF-H@1 gain, led by GNN-NLL (11.0 $\\to$ 41.0) and AE-NLL (10.5 $\\to$ 41.0).",
        "Chemistry": isZh()
          ? "表 2 · Chemistry：Modular-Contrastive（+14.44）、GNN-Contrastive（+12.22）与 VAE-NLL（+9.76）显著提升。"
          : "Table 2 · Chemistry: Modular-Contrastive (+14.44), GNN-Contrastive (+12.22), and VAE-NLL (+9.76) gain strongly under interventions.",
        "2D Shapes": isZh()
          ? "表 2 · 2D Shapes：GNN-NLL 跃升 +21.75（33.0 $\\to$ 54.75），Modular-NLL 升至 68.35%。"
          : "Table 2 · 2D Shapes: GNN-NLL jumps +21.75 CF-H@1 (33.0 $\\to$ 54.75); Modular-NLL reaches 68.35%.",
        "3D Cubes": isZh()
          ? "表 2 · 3D Cubes：Modular-Contrastive 翻倍（7.90 $\\to$ 16.75），AE-NLL 达最高 41.65%。"
          : "Table 2 · 3D Cubes: Modular-Contrastive more than doubles CF-H@1 (7.90 $\\to$ 16.75); AE-NLL reaches 41.65%.",
      };
      takeawayEl.innerHTML = notes[domain];
    } else {
      takeawayEl.innerHTML = isZh()
        ? `表 1 · ${domain}：多数主干保持或提升多步事实精度（如 Physics GNN-Contrastive 5 步 25% $\\to$ 36%）；窄潜空间下 Chemistry Modular-Contrastive 存在容量瓶颈。`
        : `Table 1 · ${domain}: Factual retrieval is preserved or improved on most hosts (Physics GNN-Contrastive 5-step: 25% $\\to$ 36%), with narrow-latent trade-offs on Chemistry Modular-Contrastive.`;
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

  document.querySelectorAll("#domain-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      domain = btn.dataset.domain;
      document.querySelectorAll("#domain-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.domain === domain))
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
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "论文 ↗",
      topicBadge: "世界模型 · 反事实动力学",
      fullTitle: "CausalVAE 作为世界模型插件：迈向可靠的反事实动力学",
      authorNotes: "* 通讯作者。",
      affilSummary: "作者单位",
      heroLead:
        "保留原有预测主干，通过可学习的无环因果图组织潜空间表示——让干预精准作用于目标因子，而不扰动无关变量。",
      btnPaper: "论文 PDF ↗",
      btnPoster: "海报 ↗",
      stageEyebrow: "交互式流程",
      stageTitle: "因果插件与 $\\alpha$ 门控滚动",
      modeFactual: "事实预测",
      modeIntervene: "$\\mathrm{do}(s + \\Delta)$",
      metric1: "Physics 8 个配对基线平均 CF-H@1 相对提升",
      metric2: "Physics GNN-NLL 反事实检索（AE-NLL: 10.5 → 41.0%）",
      metric3: "覆盖 Physics、Chemistry、Shapes 与 Cubes 四大领域",
      methodKicker: "三阶段设计",
      methodHeading: "无需重写宿主模型的模块化因果注入。",
      p1Title: "冻结宿主无环图",
      p1Body: "冻结预训练编码器与转移模块，在潜空间施加可微无环图 $A$ 约束。",
      p2Title: "训练期状态锚定",
      p2Body: "训练期利用真实状态 $s_t$ 固定坐标轴（定理 1 恢复 $\\hat{A} = A^\\star$），推理期无需状态标签。",
      p3Title: "$\\alpha$ 门控转移融合",
      p3Body: "阶段三融合宿主潜变量 $z_t$ 与因果潜变量 $\\tilde{z}_t$，稳定 5 步与 10 步长程滚动。",
      expKicker: "配对实验 · 表 1–3",
      expHeading: "相同数据划分下对比 Baseline 与 +CausalVAE。",
      tabCF: "反事实检索 (表 2)",
      tabFactual: "事实 1/5/10 步 (表 1)",
      tabAblation: "消融实验 (表 3)",
      figKicker: "原图与海报",
      figHeading: "论文图表与 ECCV 2026 海报。",
      zoomPoster: "放大海报 ↗",
      posterTitle: "ECCV 2026 会议海报",
      posterCap: "插件结构、三阶段日程与跨主干反事实检索总览。",
      f1Title: "潜空间因果插件",
      f1Cap: "在编码器与残差转移模块之间沿无环图 $A$ 组织因果表示。",
      f3Title: "反事实检索评测",
      f3Cap: "施加受控 $\\mathrm{do}$ 干预并重仿真，检验未来状态检索命中率。",
      f2Title: "三阶段解耦训练",
      f2Cap: "分离动力学预训练与结构学习，避免多步滚动坍缩。",
      f4Title: "一阶物理雅可比对齐",
      f4Cap: "学到的耦合结构匹配三体局部线性化模板 $A_{\\mathrm{GT}} = |J(s^\\star) - I|$。",
      scopeKicker: "边界说明",
      scopeTitle: "选择性收益与适用范围",
      scopeP1:
        "<strong>主干相关性：</strong>在对干预脆弱的宿主上收益显著；窄潜空间在 Chemistry Modular-Contrastive 上可能丢失因子，加宽潜维度即可恢复。",
      scopeP2:
        "<strong>局部一阶近似：</strong>定理 1 为总体水平结论，$A_{\\mathrm{GT}} = |J(s^\\star) - I|$ 刻画局部一阶耦合趋势而非完整非线性定律。",
      morePages: "系列科研主页",
    },
  };

  // Cache raw EN strings BEFORE initial KaTeX rendering
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

  // Seamless embed mode inside Ziyi Ding personal_website PublicationDetail (?embed=1)
  const params = new URLSearchParams(window.location.search);
  const isEmbedded = params.get("embed") === "1";
  if (isEmbedded) {
    document.documentElement.classList.add("is-embedded");
    const slugMap = {
      causalvae: "world-models",
      "traj-lewm": "traj-lewm",
      "causal-tongue-tie": "causal-reasoning",
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
    initZh = (params.get("lang") ? params.get("lang") === "zh" : localStorage.getItem("ziyi-studio-locale") === "zh");
  } catch {}

  if (initZh) {
    applyLocale(true);
  } else {
    if (window.renderMathIn) window.renderMathIn(document.body);
    renderWorkbench();
  }
})();
