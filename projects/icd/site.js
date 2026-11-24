(() => {
  // Exact values from arXiv:2610.34711 Tables 1, 2, 3, and 4
  // Table 1: Graph discovery [AUPRC, SHD]
  const GRAPH_DATA = {
    "Domino Phys.": {
      runs: "7/8",
      rows: [
        { name: "ICD (Ours)", fam: "Frozen E + Calibrated T + Active orient.", vals: [0.982, 0], star: true },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.294, 2] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.284, 3] },
      ],
    },
    "Domino SCM": {
      runs: "8/8",
      rows: [
        { name: "ICD (Ours)", fam: "7-node continuous SCM · 8/8 runs", vals: [0.846, 4], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.313, 6] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.194, 6] },
      ],
    },
    PnP: {
      runs: "8/8",
      rows: [
        { name: "ICD (Ours)", fam: "6-node Pick-and-Place MEC · 8/8 runs", vals: [0.862, 0], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.516, 3] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.232, 5] },
      ],
    },
    Balance: {
      runs: "7/8",
      rows: [
        { name: "ICD (Ours)", fam: "5-node Balance MEC · 7/8 runs", vals: [0.413, 6], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.475, 8] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.178, 4] },
      ],
    },
    Gears: {
      runs: "8/8",
      rows: [
        { name: "ICD (Ours)", fam: "6-node Gears MEC · 8/8 runs", vals: [0.793, 7], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.522, 8] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.177, 5] },
      ],
    },
    Spring: {
      runs: "8/8",
      rows: [
        { name: "ICD (Ours)", fam: "CAUSAL3D Spring · 8/8 runs", vals: [0.242, 9], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.213, 11] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.084, 17] },
      ],
    },
    Seesaw: {
      runs: "6/8",
      rows: [
        { name: "ICD (Ours)", fam: "CAUSAL3D Seesaw · 6/8 runs", vals: [0.587, 5], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.342, 7] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.231, 8] },
      ],
    },
    CausalWorld: {
      runs: "7/8",
      rows: [
        { name: "ICD (Ours)", fam: "Robotic manipulation · 7/8 runs", vals: [0.276, 4], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [0.013, 11] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [0.007, 16] },
      ],
    },
  };

  // Table 3: Conditional consequence-prediction NMSE (x10^3) [Group 1 (ID/A), Group 2 (Shift/B), Ratio r]
  const CONSEQ_DATA = {
    "Domino Phys.": {
      ab: true,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [6.234, 8.291, 0.752], star: true },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [51.205, 421.363, 0.122] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [162.410, 515.288, 0.315] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [228.713, 791.706, 0.289] },
      ],
    },
    "Domino SCM": {
      ab: false,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [8.573, 10.341, 0.829], star: true },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [34.144, 245.391, 0.139] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [123.713, 874.392, 0.141] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [123.799, 807.120, 0.153] },
      ],
    },
    PnP: {
      ab: false,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [1.771, 3.461, 0.512], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [51.105, 318.545, 0.160] },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [57.011, 393.035, 0.145] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [58.106, 394.825, 0.147] },
      ],
    },
    Balance: {
      ab: false,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [2.085, 4.101, 0.508], star: true },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [102.146, 700.012, 0.146] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [104.107, 713.652, 0.146] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [130.996, 852.155, 0.154] },
      ],
    },
    Gears: {
      ab: false,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [0.729, 1.091, 0.668], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [75.124, 503.839, 0.149] },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [93.292, 663.595, 0.141] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [101.258, 699.789, 0.145] },
      ],
    },
    Spring: {
      ab: true,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [5.323, 8.064, 0.660], star: true },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [186.127, 609.486, 0.305] },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [204.114, 402.341, 0.507] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [234.144, 772.011, 0.303] },
      ],
    },
    Seesaw: {
      ab: true,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [4.276, 6.786, 0.630], star: true },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [95.245, 312.261, 0.305] },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [98.701, 244.512, 0.404] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [156.435, 987.345, 0.158] },
      ],
    },
    CausalWorld: {
      ab: true,
      rows: [
        { name: "ICD (Ours)", fam: "Calibrated mechanisms on learned DAG", vals: [4.817, 5.378, 0.896], star: true },
        { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", vals: [41.124, 408.946, 0.101] },
        { name: "ILCM", fam: "Intervention-pair implicit SCM", vals: [124.215, 332.211, 0.374] },
        { name: "CausalVAE", fam: "Concept-supervised neural SCM", vals: [293.854, 974.245, 0.302] },
      ],
    },
  };

  // Table 4: Counterfactual RGB pixel MSE (x10^-3)
  const CFRGB_DATA = {
    "Domino Phys.": [
      { name: "ICD (Ours)", fam: "Conditional-mean propagation", val: 0.880, star: true },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 1.287 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 2.314 },
      { name: "ILCM (ref.)", fam: "Single-seed paired-image reference", val: 5.707 },
    ],
    "Domino SCM": [
      { name: "ICD (Ours)", fam: "Learned $T$ + factual residuals + $T^{-1}$", val: 1.473, star: true },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 2.525 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 4.215 },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 9.009 },
    ],
    PnP: [
      { name: "ICD (Ours)", fam: "$-68.6\\%$ below CausalVAE", val: 1.118, star: true },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 2.161 },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 3.563 },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 7.025 },
    ],
    Balance: [
      { name: "ICD (Ours)", fam: "Learned $T$ + factual residuals + $T^{-1}$", val: 2.180, star: true },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 4.603 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 5.014 },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 15.477 },
    ],
    Gears: [
      { name: "ICD (Ours)", fam: "Learned $T$ + factual residuals + $T^{-1}$", val: 0.938, star: true },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 1.859 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 1.859 },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 8.187 },
    ],
    Spring: [
      { name: "ICD (Ours)", fam: "$-26.8\\%$ below ILCM", val: 2.384, star: true },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 3.256 },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 6.345 },
      { name: "ICM-VAE (given $G^\\star$)", fam: "Oracle ground-truth graph reference", val: 7.342 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 15.234 },
    ],
    Seesaw: [
      { name: "ILCM", fam: "Best pixel MSE on Seesaw", val: 5.234 },
      { name: "ICD (Ours)", fam: "Learned $T$ + factual residuals + $T^{-1}$", val: 8.264, star: true },
      { name: "ICM-VAE (given $G^\\star$)", fam: "Oracle ground-truth graph reference", val: 9.753 },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 11.745 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 32.219 },
    ],
    CausalWorld: [
      { name: "ICD (Ours)", fam: "Learned $T$ + factual residuals + $T^{-1}$", val: 5.261, star: true },
      { name: "CausalVAE", fam: "Concept-supervised neural SCM", val: 7.761 },
      { name: "ILCM", fam: "Intervention-pair implicit SCM", val: 9.664 },
      { name: "No-Graph Control", fam: "Dependency-removed cohort ablation", val: 19.281 },
    ],
  };

  // Table 2: Paired 3-seed Domino SCM calibration control (seeds 5/6/7, x10^3, mean ± SD)
  // vals: [ID Readout MSE, ID CF Effect NMSE, Amp.-Shift CF Effect NMSE, ID RGB MSE]
  const CALIB_DATA = [
    {
      name: "Nonlinear $T$ (Ours)",
      note: "Frozen $E_\\theta$, shared $\\hat{G}$ & $D'$, monotone $\\tanh$ bases",
      vals: [12.864, 4.968, 6.515, 1.065],
      sds: [0.830, 0.123, 0.418, 0.063],
      star: true,
    },
    {
      name: "Fully fitted affine",
      note: "Frozen $E_\\theta$, shared $\\hat{G}$ & $D'$, per-node scale & offset",
      vals: [14.721, 4.763, 6.656, 1.043],
      sds: [1.177, 0.142, 0.531, 0.065],
    },
    {
      name: "Uncalibrated ($T = \\mathrm{Id}$)",
      note: "Frozen $E_\\theta$, shared $\\hat{G}$ & $D'$, raw encoder coordinates",
      vals: [22.367, 5.463, 6.858, 1.085],
      sds: [3.941, 0.946, 1.290, 0.066],
      warn: true,
    },
    {
      name: "Ordinary joint updating (ref.)",
      note: "Different permissions: updates readout head & decoder",
      vals: [11.361, 9.985, 20.449, 1.058],
      sds: [5.044, 1.611, 3.725, 0.080],
      warn: true,
    },
  ];

  let mode = "graph";
  let domain = "Domino Phys.";
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
    if (mode === "graph") {
      labels = isZh() ? ["AUPRC ↑", "SHD ↓"] : ["AUPRC ↑", "SHD ↓"];
    } else if (mode === "conseq") {
      const isAB = CONSEQ_DATA[domain].ab;
      labels = isZh()
        ? [isAB ? "测试集 A NMSE ↓" : "分布内 ID NMSE ↓", isAB ? "测试集 B NMSE ↓" : "幅度偏移 NMSE ↓", "比值 $r = E_A / E_B$"]
        : [isAB ? "Set A NMSE ↓" : "ID NMSE ↓", isAB ? "Set B NMSE ↓" : "Amp. Shift NMSE ↓", "Ratio $r = E_A / E_B$"];
    } else if (mode === "cfrgb") {
      labels = isZh() ? ["像素 MSE ($\\times 10^{-3}$) ↓"] : ["Pixel MSE ($\\times 10^{-3}$) ↓"];
    } else {
      labels = isZh()
        ? ["幅度偏移效应 NMSE ↓", "ID 效应 NMSE ↓", "ID 读出 MSE ↓", "ID 像素 MSE ↓"]
        : ["Amp.-Shift CF Effect ↓", "ID CF Effect ↓", "ID Readout MSE ↓", "ID RGB MSE ↓"];
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
    domainTabs.style.display = mode === "calib" ? "none" : "inline-flex";

    if (mode === "calib") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 冻结接口校准配置</span><span><i class="swatch swatch--clay"></i> 未校准 / 普通联合更新（效应失真）</span>`
        : `<span><i class="swatch swatch--ours"></i> Frozen-interface calibration</span><span><i class="swatch swatch--clay"></i> Uncalibrated / Joint update drift</span>`;

      const mapIdx = [2, 1, 0, 3][subIdx];
      const maxVal = Math.max(...CALIB_DATA.map((d) => d.vals[mapIdx])) || 1;
      const oursVal = CALIB_DATA[0].vals[mapIdx];

      CALIB_DATA.forEach((item) => {
        const v = item.vals[mapIdx];
        const sd = item.sds[mapIdx];
        const pct = Math.max(4, (v / maxVal) * 96);
        const diff = v - oursVal;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.note}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : item.warn ? "warn" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${v.toFixed(3)}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : diff > 0.4 ? "drop" : "neutral"}">$\\pm$ ${sd.toFixed(3)}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 2（同种子 5/6/7 配对控制，$\\times 10^3$）：非线性校准将读出 MSE 从 $22.367$ 降至 $12.864$，幅度偏移非目标反事实效应误差降至最低 $6.515$；普通联合更新虽降低读出误差（$11.361$），却使反事实效应误差恶化至 $20.449$。"
        : "Table 2 (paired seeds 5/6/7, $\\times 10^3$): Nonlinear $T$ lowers readout MSE ($22.367 \\to 12.864$) and achieves the lowest amplitude-shift CF effect error ($6.515$), whereas ordinary joint updating inflates shift CF error to $20.449$.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    legendEl.innerHTML = isZh()
      ? `<span><i class="swatch swatch--ours"></i> ICD（本文方法）</span><span><i class="swatch swatch--base"></i> 对比基线与无图消融</span>`
      : `<span><i class="swatch swatch--ours"></i> ICD (Ours)</span><span><i class="swatch swatch--base"></i> Baselines &amp; No-Graph Ablation</span>`;

    if (mode === "graph") {
      const info = GRAPH_DATA[domain];
      const maxSHD = Math.max(1, ...info.rows.map((r) => r.vals[1]));
      info.rows.forEach((item) => {
        const v = item.vals[subIdx];
        const pct = subIdx === 0 ? Math.max(2, v * 100) : Math.max(3, (v / maxSHD) * 95);
        const badge = subIdx === 0 ? `SHD = ${item.vals[1]}` : `AUPRC ${item.vals[0].toFixed(3)}`;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${subIdx === 0 ? v.toFixed(3) : v}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : "neutral"}">${badge}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? `表 1 · ${domain}（完成运行数 ${info.runs}）：ICD 在 8 列中的 6 列取得最低 SHD、7 列取得最高 AUPRC；在物理 Domino（$\\mathrm{SHD}=0,\\;\\mathrm{AUPRC}=0.982$）与 Pick-and-Place（$\\mathrm{SHD}=0,\\;\\mathrm{AUPRC}=0.862$）上实现零结构误差恢复。`
        : `Table 1 · ${domain} (completed runs ${info.runs}): ICD achieves the lowest SHD in 6/8 columns and highest AUPRC in 7/8, with exact recovery ($\\mathrm{SHD} = 0$) on Physical Domino ($0.982$ AUPRC) and Pick-and-Place ($0.862$).`;
    } else if (mode === "conseq") {
      const info = CONSEQ_DATA[domain];
      const maxV = Math.max(1e-6, ...info.rows.map((r) => r.vals[subIdx]));
      const oursV = info.rows[0].vals[subIdx];
      info.rows.forEach((item) => {
        const v = item.vals[subIdx];
        const pct = subIdx === 2 ? Math.max(3, v * 100) : Math.max(2.5, (v / maxV) * 96);
        const ratioTxt = subIdx === 2
          ? `ID/A: ${item.vals[0].toFixed(2)}`
          : item.star
          ? `r = ${item.vals[2].toFixed(3)}`
          : `${(v / Math.max(oursV, 1e-6)).toFixed(1)}$\\times$ err`;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${v.toFixed(3)}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : "neutral"}">${ratioTxt}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? `表 3 · ${domain}（可执行查询条件误差，$\\times 10^3$）：ICD 在全部 8 列的两组测试集上均取得最低非目标状态预测误差，比值 $r = E_A / E_B \\in [0.508, 0.896]$（无图消融在第二组上误差显著升高）。`
        : `Table 3 · ${domain} (conditional NMSE $\\times 10^3$ on executed queries): ICD yields the lowest non-target outcome error in both groups across all 8 columns, with ratio $r = E_A / E_B \\in [0.508, 0.896]$.`;
    } else {
      const rows = CFRGB_DATA[domain];
      const maxV = Math.max(1e-6, ...rows.map((r) => r.val));
      const bestV = Math.min(...rows.map((r) => r.val));
      rows.forEach((item) => {
        const v = item.val;
        const pct = Math.max(4, (v / maxV) * 96);
        const isBest = Math.abs(v - bestV) < 1e-6;
        const pill = isBest ? (isZh() ? "最低误差" : "Lowest MSE") : `+${(((v - bestV) / bestV) * 100).toFixed(0)}%`;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${v.toFixed(3)}</span>
            </div>
          </div>
          <span class="delta-pill ${isBest ? "" : "neutral"}">${pill}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? `表 4 · ${domain}（可执行查询反事实图像 RGB MSE，$\\times 10^{-3}$）：ICD 在 8 列中的 7 列数值最低（Pick-and-Place 较 CausalVAE 降低 $68.6\\%$，Spring 较 ILCM 降低 $26.8\\%$；Seesaw 上 ILCM 更低）。`
        : `Table 4 · ${domain} (executed counterfactual RGB MSE, $\\times 10^{-3}$): ICD achieves the lowest pixel error in 7/8 columns ($68.6\\%$ below CausalVAE on PnP, $26.8\\%$ below ILCM on Spring; ILCM leads on Seesaw).`;
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
      const zh = isZh();
      lbImg.src = btn.getAttribute("data-lightbox");
      lbImg.alt = (zh && btn.getAttribute("data-title-zh")) || btn.getAttribute("data-title") || "";
      lbTitle.innerHTML = (zh && btn.getAttribute("data-title-zh")) || btn.getAttribute("data-title") || "";
      lbCap.innerHTML = (zh && btn.getAttribute("data-caption-zh")) || btn.getAttribute("data-caption") || "";
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
      skipMain: "跳至正文",
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "论文 ↗",
      statusBadge: "arXiv:2610.34711 · 预印本",
      topicBadge: "因果发现 · 世界模型 · 具身智能",
      heroHeading: "干预、<span>校准</span>与因果发现",
      fullTitle: "Intervene, Calibrate, Discover：从像素中学习因果结构",
      authorNotes: "* 共同第一作者 · † 通讯作者。",
      affilSummary: "作者单位",
      affil1: "清华大学",
      affil2: "中国科学院自动化研究所",
      affil3: "香港大学",
      affil4: "武汉大学",
      affil5: "千诀科技（INFIFORCE Intelligent Technology）",
      heroLead:
        "在冻结视觉编解码器的前提下，ICD 将像素读出校准至经核验的环境干预数值，主动干预定向未知因果边，并通过逆映射 $T^{-1}$ 解码反事实图像。",
      btnPaper: "论文 PDF ↗",
      btnDemos: "物理交互演示 ↗",
      btnArxiv: "arXiv ↗",
      btnCode: "代码仓库 ↗",
      stageEyebrow: "交互式流程",
      stageTitle: "可逆读出校准 $T$ 与主动因果图发现 $\\hat{G}$",
      modeCalibrated: "校准 ICD",
      modeUncalibrated: "未校准读出",
      metricVal1: "0<span> SHD</span>",
      metric1: "物理 Domino（$0.982$ AUPRC）与 Pick-and-Place（$0.862$）零误差恢复；7/8 列 AUPRC 最优",
      metricVal2: "8 / 8<span> 评测列</span>",
      metric2: "全部 8 个基准评测列均取得最低可执行非目标状态预测 NMSE（$\\times 10^3$，表 3）",
      metricVal3: "7 / 8<span> 评测列</span>",
      metric3: "反事实图像 RGB MSE（$\\times 10^{-3}$）最低，Pick-and-Place 较 CausalVAE 降低 $68.6\\%$（表 4）",
      methodKicker: "三阶段设计",
      methodHeading: "先对齐干预数值单位，再定向因果边与拟合局部机制。",
      p1Num: "01 · 数值校准",
      p1Title: "逐维严格单调可逆映射 $T$",
      p1Body:
        "保持 $E_\\theta$ 与 $D_\\psi$ 冻结，利用固定轮询采集的核验目标值（$B_{\\mathrm{cal}}$）拟合可逆映射 $T_{\\phi,j}$，使视觉读出 $h(x)$ 与干预设定 $q_j(u)$ 共享数值坐标。",
      p2Num: "02 · 结构发现",
      p2Title: "主动干预 CPDAG 边定向",
      p2Body:
        "冻结 $T$ 后在 $h(\\mathcal{D}_{\\mathrm{obs}})$ 上估计观测等价类骨架，并优先干预未定向边最多的节点（$B_{\\mathrm{graph}}$），结合无环检验与 Meek 规则完成定向。",
      p3Num: "03 · 反事实生成",
      p3Title: "固定事实残差的 $T^{-1}$ 逆解码",
      p3Body:
        "固定非根节点事实残差 $\\eta_j^{\\mathrm{fact}}$，沿 $\\hat{G}$ 更新后代节点至 $h^{\\mathrm{cf}}$，再经逆校准 $T^{-1}$ 还原至解码器坐标生成 $\\hat{x}^{\\mathrm{cf}}$。",
      expKicker: "定量基准 · 表 1–4",
      expHeading: "因果结构发现、受控校准效应与反事实像素生成对比。",
      tabGraph: "结构发现 (表 1)",
      tabConseq: "干预效应预测 (表 3)",
      tabRGB: "反事实图像 (表 4)",
      tabCalib: "配对校准消融 (表 2)",
      domPhys: "物理 Domino",
      domSCM: "Domino SCM",
      domPnP: "Pick & Place",
      domBal: "Balance",
      domGears: "Gears",
      domSpring: "Spring",
      domSeesaw: "Seesaw",
      domCW: "CausalWorld",
      figKicker: "论文原图",
      figHeading: "三阶段架构、六类物理场景与反事实像素误差分析。",
      zoomHint: "放大查看 ↗",
      zoomHint2: "放大查看 ↗",
      zoomHint3: "放大查看 ↗",
      zoomHint4: "放大查看 ↗",
      zoomHint5: "放大查看 ↗",
      f3Meta: "图 3 · 方法总览",
      f3Title: "冻结视觉接口、主动图发现与局部机制拟合",
      f3Cap: "将可逆读出校准（$B_{\\mathrm{cal}}$）与主动边定向（$B_{\\mathrm{graph}}$）解耦，使环境设定、因果图与局部机制共享统一坐标。",
      f4Meta: "图 4",
      f4Title: "六大视觉物理评测环境与真实生成图",
      f4Cap: "涵盖 Pick-and-Place、Balance、Gears、Domino、CAUSAL3D（Spring 与 Seesaw）以及 CausalWorld 机器人操作场景。",
      f1Meta: "图 1",
      f1Title: "多米诺事实场景与 $\\mathrm{do}(s_3 = u)$ 图截断",
      f1Cap: "硬干预仅替换目标节点的结构方程并移除其父节点入边，随后沿拓扑序向下游传播。",
      f5Meta: "图 5",
      f5Title: "校准反事实路径与像素误差热力图",
      f5Cap: "对比物理多米诺触发倾倒（$F_1 = 1$）下的反事实生成结果及统一尺度 RGB 绝对误差图。",
      f2Meta: "图 2",
      f2Title: "像素级干预数值查询的方法定位",
      f2Cap: "连接像素因果表征、反馈驱动主动实验设计与显式因果图结构发现。",
      scopeKicker: "边界与控制实验",
      scopeTitle: "识别假设与条件评测范围",
      scopeP1:
        "<strong>已知节点语义与条件评测：</strong>概念标签在预训练期锚定节点维度身份而不提供真实图 $G^\\star$。表 3–4 统计已执行查询上的条件误差而非端到端总体成功率；表 2 则在共享 $E_\\theta$、$\\hat{G}$ 与 $D'$ 的三随机种子 Domino 队列上严格隔离校准贡献。",
      scopeP2:
        "<strong>读出精度不等于干预精度：</strong>单纯降低状态读出 MSE 并不能保证反事实预测更准——普通联合更新虽取得更低的读出误差（$11.36$ vs. $12.86$），却使幅度偏移下的非目标反事实效应 NMSE 恶化至 $20.45$（本文非线性校准为 $6.52$）。",
      bibTitle: "BibTeX · arXiv 预印本",
      morePages: "系列科研主页",
      sib1Tag: "arXiv 2026 · 预印本",
      sib1Title: "Intervene, Calibrate, Discover",
      sib1Desc: "基于可逆校准的像素级主动因果结构发现。",
      sib2Tag: "ECCV 2026",
      sib2Title: "CausalVAE Plug-in",
      sib2Desc: "面向世界模型的模块化潜空间因果图插件。",
      sib3Tag: "预印本 · 2026",
      sib3Title: "EgoLAM",
      sib3Desc: "从手部与头部运动学习第一视角潜动作。",
      sib4Tag: "arXiv 2026",
      sib4Title: "Traj-LeWM",
      sib4Desc: "融合路径代价的轨迹感知世界模型规划。",
      footAuthor: "丁子毅 (Ziyi Ding) · 清华大学",
      footStudio: "学术主页",
      footTop: "回到顶部 ↑",
      lbClose: "关闭 (Esc)",
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
    initZh = (params.get("lang") ? params.get("lang") === "zh" : localStorage.getItem("ziyi-studio-locale") === "zh");
  } catch {}

  if (initZh) {
    applyLocale(true);
  } else {
    if (window.renderMathIn) window.renderMathIn(document.body);
    renderWorkbench();
  }
})();
