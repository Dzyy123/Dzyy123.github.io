(() => {
  // Exact values from GeoRefiner Manuscript Tables 1, 2, 3, 4 and Figures 1 & 5
  const COL_SPLITS = [
    "Avg.",
    "Clean",
    "MO-Color",
    "MO-Size",
    "MO-Texture",
    "RO-Color",
    "RO-Size",
    "RO-Texture",
    "Light-Color",
    "Table-Color",
    "Distractor",
  ];

  // Table 1: COLOSSEUM [Avg, Clean, MO-Color, MO-Size, MO-Texture, RO-Color, RO-Size, RO-Texture, Light-Color, Table-Color, Distractor]
  const COLOSSEUM = [
    {
      key: "pi05",
      name: "$\\pi_{0.5}$",
      famEn: "Generalist Flow VLA",
      famZh: "通用流匹配 VLA 基座",
      base: [55.6, 66.3, 43.8, 64.7, 47.6, 56.9, 45.3, 61.8, 53.1, 70.4, 46.1],
      ours: [64.3, 72.0, 57.4, 72.1, 55.7, 64.4, 58.2, 70.6, 60.3, 76.4, 55.9],
      star: true,
    },
    {
      key: "fastwam",
      name: "FastWAM",
      famEn: "World-Action Model (WAM)",
      famZh: "世界-动作模型（WAM）",
      base: [50.3, 65.9, 38.6, 58.4, 43.2, 52.7, 39.5, 55.8, 46.1, 61.3, 41.5],
      ours: [61.5, 73.8, 54.8, 67.8, 53.9, 64.3, 54.9, 65.9, 55.9, 69.8, 53.9],
      star: true,
    },
    {
      key: "bridgevla",
      name: "BridgeVLA",
      famEn: "3D-Aligned VLA Baseline",
      famZh: "三维对齐 VLA 基线",
      base: [65.8, 73.1, 60.5, 69.3, 63.5, 63.8, 61.7, 68.4, 69.7, 75.7, 51.8],
      ours: [73.3, 77.9, 72.2, 75.5, 70.5, 69.7, 72.6, 75.5, 76.1, 80.9, 62.1],
    },
  ];

  // Table 2: MimicGen [Avg., Coffee, Stack Three (ST), Three-Piece Assembly (TPA), Square]
  const MIMIC_SPLITS = ["Avg.", "Coffee", "Stack Three (ST)", "3-Piece Assembly", "Square"];
  const MIMICGEN = [
    {
      name: "$\\pi_{0.5}$",
      famEn: "Generalist Flow VLA · +18.2 pp avg",
      famZh: "通用流匹配 VLA · 平均 +18.2 pp",
      base: [36.3, 45.5, 51.1, 20.4, 28.2],
      ours: [54.5, 60.2, 68.0, 43.0, 46.8],
      star: true,
    },
    {
      name: "FastWAM",
      famEn: "World-Action Model · +13.5 pp avg",
      famZh: "世界-动作模型 · 平均 +13.5 pp",
      base: [41.5, 55.8, 49.2, 28.7, 32.3],
      ours: [55.0, 66.0, 62.0, 46.3, 45.7],
      star: true,
    },
    {
      name: "WMPO",
      famEn: "World-Model Policy Opt. · +9.6 pp avg",
      famZh: "世界模型策略优化 · 平均 +9.6 pp",
      base: [47.1, 61.7, 56.3, 37.5, 32.8],
      ours: [56.7, 68.8, 64.9, 50.2, 42.9],
    },
  ];

  // Table 3: LIBERO-Plus [Avg., Cam., Init, Lang., Light, BG., Noise, Layout]
  const LIBERO_SPLITS = ["Avg.", "Cam.", "Init", "Lang.", "Light", "BG.", "Noise", "Layout"];
  const LIBERO = [
    {
      name: "OpenVLA-OFT",
      famEn: "Held-out unseen VLA · 0.9M adapter (100 traj)",
      famZh: "训练未见过的基座 VLA · 0.9M 适配器微调",
      base: [69.7, 58.2, 30.6, 75.5, 89.2, 91.1, 71.7, 71.9],
      ours: [79.8, 74.0, 59.9, 86.8, 90.2, 91.5, 78.2, 78.0],
      star: true,
    },
    {
      name: "$\\pi_{0.5}$",
      famEn: "Shared 0.9M LIBERO-Plus adapter",
      famZh: "共享同一 0.9M LIBERO-Plus 适配器",
      base: [82.6, 70.6, 78.2, 77.4, 92.4, 91.1, 84.5, 83.8],
      ours: [86.4, 77.4, 83.1, 82.7, 93.6, 92.5, 88.0, 87.5],
    },
    {
      name: "FastWAM",
      famEn: "Shared 0.9M LIBERO-Plus adapter",
      famZh: "共享同一 0.9M LIBERO-Plus 适配器",
      base: [84.7, 72.9, 79.8, 80.2, 93.8, 93.2, 86.4, 86.3],
      ours: [87.8, 78.5, 84.1, 84.7, 94.6, 94.1, 89.2, 89.4],
    },
  ];

  // Table 4: LIBERO-Plus Ablations on OpenVLA-OFT [Avg., Cam., Init, Lang., Light] (gains in pp)
  const ABL_SPLITS = ["Avg. Gain", "Cam.", "Init", "Lang.", "Light"];
  const ABLATIONS = [
    {
      name: "Stage 2 w/ OpenVLA-OFT",
      noteEn: "Oracle joint core training with target VLA data",
      noteZh: "上界参考：阶段二直接纳入目标 VLA 数据联合训练",
      vals: [12.7, 17.9, 29.6, 13.2, 1.7],
    },
    {
      name: "Stage 3 w/ 200 Traj.",
      noteEn: "0.9M adapter fine-tuning with 200 trajectories",
      noteZh: "200 条轨迹微调 0.9M 基准适配器",
      vals: [10.3, 16.4, 29.1, 12.8, 1.0],
    },
    {
      name: "Full GeoRefiner (100 Traj.)",
      noteEn: "Default Stage-3 adapter (<1% params, 2k steps)",
      noteZh: "默认方案：100 条轨迹微调 0.9M 适配器（2k 步）",
      vals: [10.1, 15.8, 29.3, 11.3, 1.0],
      star: true,
    },
    {
      name: "Stage 3 w/ 50 Traj.",
      noteEn: "Few-shot 0.9M adapter fine-tuning",
      noteZh: "50 条少样本轨迹微调 0.9M 适配器",
      vals: [8.7, 11.2, 27.7, 9.4, 0.5],
    },
    {
      name: "w/o Refinement Gate $\\gamma$",
      noteEn: "Uncontrolled residual causes −2.3 pp drop on Light",
      noteZh: "移除门控 $\\gamma$：在光照扰动（Light）下过度修正跌 −2.3 pp",
      vals: [7.9, 13.2, 26.3, 7.6, -2.3],
      warn: true,
    },
    {
      name: "w/o Stage 3 (Zero-Shot)",
      noteEn: "Direct transfer with zero LIBERO-Plus trajectories",
      noteZh: "零样本迁移：不使用任何 LIBERO-Plus 适配数据",
      vals: [4.3, 5.9, 14.6, 3.8, 0.0],
    },
    {
      name: "w/o Region Tokens $R$",
      noteEn: "Global geometry $G$ only without QFormer regions",
      noteZh: "移除 QFormer 任务区域标记 $R$，仅保留全局几何 $G$",
      vals: [3.2, 4.9, 18.4, 5.9, 0.0],
      warn: true,
    },
  ];

  // Real-World & Cross-Platform Summary (exact reported gains from Fig. 1 & Tables 1–3)
  const REAL_SUMMARY = [
    {
      name: "AgileX Piper · $\\pi_{0.5}$",
      noteEn: "Place plant, Stack three blocks, Hang cup (Clean + Obj/BG/Light, 50 trials)",
      noteZh: "真机 3 任务 × 4 工况（无扰动 / 物体 / 背景 / 光照，每况 50 次）",
      gain: 25.0,
      badge: "+25%",
      star: true,
    },
    {
      name: "Franka · $\\pi_{0.5}$",
      noteEn: "Insert Block & Insert USB fine-grained contact tasks (50 trials/cond)",
      noteZh: "Franka 精细插孔（Insert Block / Insert USB，每况 50 次）",
      gain: 22.0,
      badge: "+22%",
      star: true,
    },
    {
      name: "MimicGen · $\\pi_{0.5}$",
      noteEn: "36.3% → 54.5% across Coffee, Stack Three, TPA & Square",
      noteZh: "精细接触仿真从 36.3% 跃升至 54.5%（4 任务平均）",
      gain: 18.2,
      badge: "+18.2 pp",
    },
    {
      name: "COLOSSEUM · FastWAM",
      noteEn: "50.3% → 61.5% across Clean + 9 visual/physical perturbations",
      noteZh: "无扰动 + 9 类视觉与物理扰动平均从 50.3% 升至 61.5%",
      gain: 11.2,
      badge: "+11.2 pp",
    },
    {
      name: "LIBERO-Plus · OpenVLA-OFT",
      noteEn: "69.7% → 79.8% on unseen VLA via 0.9M Stage-3 adapter",
      noteZh: "未见过的基座 VLA 仅微调 0.9M 适配器即从 69.7% 升至 79.8%",
      gain: 10.1,
      badge: "+10.1 pp",
    },
  ];

  let mode = "colosseum";
  let domainKey = "all";
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

  function renderDomainTabs() {
    domainTabs.replaceChildren();
    let opts = [];
    if (mode === "colosseum") {
      opts = [
        { k: "all", label: isZh() ? "三模型对比" : "All 3 VLAs" },
        { k: "pi05", label: "$\\pi_{0.5}$ (10)" },
        { k: "fastwam", label: "FastWAM (10)" },
        { k: "bridgevla", label: "BridgeVLA (10)" },
      ];
    } else if (mode === "ablation") {
      opts = [
        { k: "table4", label: isZh() ? "消融实验 (表 4)" : "Ablations (Table 4)" },
        { k: "real", label: isZh() ? "真机与跨平台增益 (图 1/5)" : "Real Robot & Summary" },
      ];
    }

    if (!opts.length) {
      domainTabs.style.display = "none";
      return;
    }
    domainTabs.style.display = "inline-flex";
    if (!opts.some((o) => o.k === domainKey)) domainKey = opts[0].k;

    opts.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = o.label;
      b.setAttribute("aria-pressed", String(o.k === domainKey));
      b.addEventListener("click", () => {
        domainKey = o.k;
        subIdx = 0;
        renderWorkbench();
      });
      domainTabs.appendChild(b);
    });
  }

  function renderSubTabs() {
    subHost.replaceChildren();
    let labels = [];
    if (mode === "colosseum" && domainKey === "all") {
      labels = ["Avg.", "Clean", "MO-Color", "RO-Color", "Light-Color", "Distractor"];
    } else if (mode === "mimicgen") {
      labels = MIMIC_SPLITS;
    } else if (mode === "libero") {
      labels = LIBERO_SPLITS;
    } else if (mode === "ablation" && domainKey === "table4") {
      labels = ABL_SPLITS;
    }

    if (!labels.length) {
      subHost.style.display = "none";
      return;
    }
    subHost.style.display = "inline-flex";
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

  function renderPairedList(items) {
    items.forEach((item) => {
      const diff = item.oursVal - item.baseVal;
      const diffLabel = (diff >= 0 ? "+" : "") + diff.toFixed(1) + " pp";
      const pillClass = diff > 0.05 ? "" : diff < -0.05 ? "drop" : "neutral";
      const row = document.createElement("div");
      row.className = "paired-row" + (item.star ? " highlight" : "");
      row.innerHTML = `
        <div class="paired-name">${item.title}<small>${item.sub}</small></div>
        <div class="bars-stack">
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill base" style="width:${Math.max(1.5, item.baseVal)}%"></i></div>
            <span class="bar-num">${item.baseVal.toFixed(1)}%</span>
          </div>
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill ours" style="width:${Math.max(1.5, item.oursVal)}%"></i></div>
            <span class="bar-num ours">${item.oursVal.toFixed(1)}%</span>
          </div>
        </div>
        <span class="delta-pill ${pillClass}">$\\Delta$ ${diffLabel}</span>
      `;
      rowsHost.appendChild(row);
    });
  }

  function renderWorkbench() {
    renderDomainTabs();
    renderSubTabs();
    rowsHost.replaceChildren();

    // Case 1: Ablations & Real-Robot Summary
    if (mode === "ablation") {
      if (domainKey === "real") {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> +GeoRefiner 平均成功率增益（图 1、图 5 及表 1–3）</span>`
          : `<span><i class="swatch swatch--ours"></i> +GeoRefiner mean success-rate gain (Fig. 1, Fig. 5 &amp; Tables 1–3)</span>`;

        REAL_SUMMARY.forEach((item) => {
          const pct = Math.min(100, (item.gain / 28) * 100);
          const row = document.createElement("div");
          row.className = "paired-row" + (item.star ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${isZh() ? item.noteZh : item.noteEn}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ours" style="width:${pct.toFixed(1)}%"></i></div>
                <span class="bar-num ours">+${item.gain.toFixed(1)}</span>
              </div>
            </div>
            <span class="delta-pill">${item.badge}</span>
          `;
          rowsHost.appendChild(row);
        });

        takeawayEl.innerHTML = isZh()
          ? "图 1 与图 5 真机评测：在 Franka（Insert Block、Insert USB）与 AgileX Piper（Place plant、Stack three blocks、Hang cup）共 5 项任务及无扰动 / 物体 / 背景 / 光照 4 类工况（每况 50 次独立试验）下，GeoRefiner 在 $\\pi_{0.5}$ 上分别实现 +22% 与 +25% 的平均提升。"
          : "Figures 1 &amp; 5 Real-World Evaluation: Across 5 manipulation tasks on Franka (+22%) and AgileX Piper (+25%) under Clean, Object, Background, and Lighting conditions (50 trials per condition on $\\pi_{0.5}$), GeoRefiner restores perturbed performance to or above clean base-VLA levels.";
        if (window.renderMathIn) window.renderMathIn(workbenchEl);
        return;
      }

      // Table 4 Ablations
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 阶段适配增益 (pp)</span><span><i class="swatch swatch--clay"></i> 移除门控 $\\gamma$ 或区域标记 $R$ 退化</span>`
        : `<span><i class="swatch swatch--ours"></i> Success-rate gain over OpenVLA-OFT (pp)</span><span><i class="swatch swatch--clay"></i> Gate $\\gamma$ / Region $R$ ablation drop</span>`;

      ABLATIONS.forEach((item) => {
        const v = item.vals[subIdx];
        const pct = Math.min(100, Math.max(2, (Math.abs(v) / 31) * 100));
        const sign = v >= 0 ? "+" : "";
        const isNeg = v < -0.01;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? item.noteZh : item.noteEn}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.warn || isNeg ? "warn" : "ours"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ours">${sign}${v.toFixed(1)} pp</span>
            </div>
          </div>
          <span class="delta-pill ${isNeg || item.warn ? "drop" : item.star ? "" : "neutral"}">${
            item.star ? "Ours (0.9M)" : `Avg +${item.vals[0].toFixed(1)}`
          }</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 4（LIBERO-Plus，未见过的 OpenVLA-OFT 基座）：零样本直接迁移即可获 +4.3 pp；微调 100 条轨迹（0.9M 参数）跃升至 +10.1 pp（Init 初始位姿扰动高达 +29.3 pp）；移除门控 $\\gamma$ 会在光照变化下跌 −2.3 pp，移除区域标记 $R$ 则使平均增益骤降至 +3.2 pp。"
        : "Table 4 (LIBERO-Plus on held-out OpenVLA-OFT): Zero-shot transfer already yields +4.3 pp; tuning 100 trajectories (0.9M params) reaches +10.1 pp (+29.3 pp on Init); removing gate $\\gamma$ drops Light by −2.3 pp, and removing region tokens $R$ cuts average gain to +3.2 pp.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    // Standard paired Base VLA vs. +GeoRefiner modes
    legendEl.innerHTML = isZh()
      ? `<span><i class="swatch swatch--base"></i> 冻结基座 VLA</span><span><i class="swatch swatch--ours"></i> + GeoRefiner</span>`
      : `<span><i class="swatch swatch--base"></i> Base VLA</span><span><i class="swatch swatch--ours"></i> + GeoRefiner</span>`;

    if (mode === "colosseum") {
      if (domainKey === "all") {
        const colMap = [0, 1, 2, 5, 8, 10]; // Avg., Clean, MO-Color, RO-Color, Light-Color, Distractor
        const cIdx = colMap[subIdx] ?? 0;
        renderPairedList(
          COLOSSEUM.map((m) => ({
            title: m.name,
            sub: `${isZh() ? m.famZh : m.famEn} · ${COL_SPLITS[cIdx]}`,
            baseVal: m.base[cIdx],
            oursVal: m.ours[cIdx],
            star: m.star,
          }))
        );
      } else {
        const m = COLOSSEUM.find((x) => x.key === domainKey) || COLOSSEUM[0];
        renderPairedList(
          COL_SPLITS.map((sp, idx) => ({
            title: sp,
            sub: idx === 0 ? `${m.name} · ${isZh() ? "全部 10 项均值" : "Mean across Clean + 9 perturbations"}` : `${m.name} · Table 1`,
            baseVal: m.base[idx],
            oursVal: m.ours[idx],
            star: idx === 0 || sp === "MO-Color" || sp === "RO-Size",
          }))
        );
      }
      takeawayEl.innerHTML = isZh()
        ? "表 1 · COLOSSEUM：在无扰动与 9 类物体颜色/尺寸/纹理、光照、桌面及干扰物扰动下，GeoRefiner 使 $\\pi_{0.5}$（55.6% $\\to$ 64.3%）、FastWAM（50.3% $\\to$ 61.5%，+11.2 pp）与 BridgeVLA（65.8% $\\to$ 73.3%）全面提升。"
        : "Table 1 · COLOSSEUM: Across Clean and nine object, lighting, table, and distractor perturbations, GeoRefiner lifts $\\pi_{0.5}$ (55.6% $\\to$ 64.3%), FastWAM (50.3% $\\to$ 61.5%, +11.2 pp), and BridgeVLA (65.8% $\\to$ 73.3%).";
    } else if (mode === "mimicgen") {
      renderPairedList(
        MIMICGEN.map((m) => ({
          title: m.name,
          sub: `${isZh() ? m.famZh : m.famEn} · ${MIMIC_SPLITS[subIdx]}`,
          baseVal: m.base[subIdx],
          oursVal: m.ours[subIdx],
          star: m.star,
        }))
      );
      takeawayEl.innerHTML = isZh()
        ? "表 2 · MimicGen：在 Coffee、Stack Three（ST）、三件套精密装配（TPA）与 Square 四项高接触敏感任务上，3 种基座平均提升 +13.8 pp；其中 $\\pi_{0.5}$ 在 TPA 上从 20.4% 翻倍升至 43.0%（+22.6 pp）。"
        : "Table 2 · MimicGen: Across Coffee, Stack Three (ST), Three-Piece Assembly (TPA), and Square, GeoRefiner achieves +13.8 pp mean gain across 3 base VLAs, more than doubling $\\pi_{0.5}$ on TPA (20.4% $\\to$ 43.0%).";
    } else if (mode === "libero") {
      renderPairedList(
        LIBERO.map((m) => ({
          title: m.name,
          sub: `${isZh() ? m.famZh : m.famEn} · ${LIBERO_SPLITS[subIdx]}`,
          baseVal: m.base[subIdx],
          oursVal: m.ours[subIdx],
          star: m.star,
        }))
      );
      takeawayEl.innerHTML = isZh()
        ? "表 3 · LIBERO-Plus：仅用 100 条轨迹训练单一共享 0.9M 基准适配器，即可同时提升 $\\pi_{0.5}$（+3.8 pp）、FastWAM（+3.1 pp）及完全未参与 GeoRefiner 训练的 OpenVLA-OFT（+10.1 pp，Cam. 视角扰动 +15.8 pp，Init 初始位姿 +29.3 pp）。"
        : "Table 3 · LIBERO-Plus: A single shared 0.9M benchmark adapter tuned on 100 trajectories improves $\\pi_{0.5}$ (+3.8 pp), FastWAM (+3.1 pp), and completely held-out OpenVLA-OFT (+10.1 pp avg; +15.8 pp on Cam., +29.3 pp on Init).";
    }

    if (window.renderMathIn) window.renderMathIn(workbenchEl);
  }

  document.querySelectorAll("#mode-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      domainKey = mode === "colosseum" ? "all" : "table4";
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
      skipMain: "跳至正文",
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "论文 ↗",
      statusBadge: "手稿 · 2027",
      topicBadge: "具身智能 · VLA 动作精修",
      fullTitle: "GeoRefiner：面向视觉-语言-动作模型的几何条件即插即用动作精修框架",
      authorNotes: "* 通讯作者。",
      affilSummary: "作者单位",
      affil1: "因福斯智能科技（INFIFORCE），中国杭州",
      affil2: "武汉大学，中国武汉",
      affil3: "香港大学，中国香港特别行政区",
      affil4: "清华大学，中国北京",
      heroLead:
        "预训练 VLA 能准确把握高层任务意图，但在环境扰动与精细接触操作中常出现局部三维几何偏差。GeoRefiner 作为下游即插即用模块挂载于任意冻结基座 VLA 之后，预测门控有界的几何残差动作修正。",
      btnPaper: "手稿 PDF ↗",
      btnSource: "原文链接 ↗",
      btnBench: "实验对比 ↓",
      stageEyebrow: "即插即用流程",
      stageTitle: "下游门控几何残差动作精修",
      modeGeo: "+ GeoRefiner",
      modeBase: "名义基座 VLA",
      m1Unit: " pp 平均",
      metric1: "MimicGen 精细操作增益：$\\pi_{0.5}$（+18.2）、FastWAM（+13.5）与 WMPO（+9.6）",
      metric2: "Franka（+22%）与 AgileX Piper（+25%）真机多扰动工况平均成功率提升",
      m3Unit: "M 参数",
      metric3: "阶段三仅微调 0.9M 适配器（<1%），使未见过的 OpenVLA-OFT 在 LIBERO-Plus 提升 +10.1 pp",
      methodKicker: "解耦架构与分阶段训练",
      methodHeading: "无需改动冻结 VLA 主干的三维几何精修机制。",
      p1Num: "01 · 空间对齐",
      p1Title: "0.9M 基准适配器",
      p1Body: "通过固定变换与 4 层校准 MLP，将异构本体状态、双视角 RGB 与原生动作映射至统一 7 自由度末端空间。",
      p2Num: "02 · 保守修正",
      p2Title: "门控有界残差精修",
      p2Body: "轨迹标记 $T$ 与双视角 DINOv2 几何 $G$ 及 QFormer 区域标记 $R$ 交叉注意力交互，预测门控 $\\gamma$ 与有界残差 $\\Delta A$。",
      p3Num: "03 · 渐进学习",
      p3Title: "三阶段渐进训练",
      p3Body: "阶段一预训练深度与 Grounded-SAM 区域热力图；阶段二学习门控残差；阶段三冻结核心仅微调 0.9M 适配器。",
      expKicker: "实验评测 · 表 1–4 与双平台真机",
      expHeading: "横跨 5 种基座策略与 2 套真实机器人平台的配对对比。",
      tabCol: "COLOSSEUM (表 1)",
      tabMimic: "MimicGen (表 2)",
      tabLibero: "LIBERO-Plus (表 3)",
      tabAblation: "真机与消融 (图 5 / 表 4)",
      figKicker: "论文原图",
      figHeading: "模型架构、三阶段日程与真机几何可视化。",
      zoom1: "放大图表 ↗",
      zoom2: "放大图表 ↗",
      zoom3: "放大图表 ↗",
      zoom4: "放大图表 ↗",
      zoom5: "放大图表 ↗",
      f3Meta: "图 3 · 系统总架构",
      f3Title: "即插即用几何条件精修架构",
      f3Cap: "将原生动作对齐至规范 7-DoF 空间，融合 CLIP 指令、双视角 DINOv2 几何 $G$、QFormer 区域 $R$ 与动作动力学 $T$，输出门控修正 $\\gamma \\odot \\Delta A$。",
      f1Meta: "图 1 · 核心动机与总览",
      f1Title: "纠正精细插孔与接触末端误差",
      f1Cap: "名义动作虽方向正确却易在 USB 与方块插孔处卡死；下游几何残差精修无需重训基座即可跨模型恢复对齐。",
      f4Meta: "图 4 · 训练策略",
      f4Title: "三阶段训练与 0.9M 轻量适配",
      f4Cap: "先利用深度与 Grounded-SAM 伪标签建立几何表征，再训练门控残差，最后冻结 400M 核心以不足 1% 参数适配新平台。",
      f5Meta: "图 5 · 真机评测",
      f5Title: "Franka 与 AgileX Piper 真机实验",
      f5Cap: "涵盖 Insert Block、Insert USB、Place plant、Stack three blocks 与 Hang cup 五项任务及物体、背景、光照扰动。",
      f6Meta: "图 6 · 几何表征诊断",
      f6Title: "跨光照扰动的深度与任务区域热力图",
      f6Cap: "在剧烈彩色光照变化下，阶段一深度解码与区域热力图依然稳定锁定杯架挂钩与插孔接触边界。",
      scopeKicker: "边界说明",
      scopeTitle: "局部几何修正与高层任务规划的边界",
      scopeP1:
        "<strong>任务意图前提：</strong>GeoRefiner 专注于纠正局部位置、姿态与接触偏差，前提是基座 VLA 给出的名义轨迹符合正确任务语义；高层子目标或语义规划错误不在其修正范围内。",
      scopeP2:
        "<strong>门控与区域必要性：</strong>消融实验表明去掉精修门控 $\\gamma$ 会在光照扰动下过度修正（LIBERO-Plus Light 下降 −2.3 pp），去掉 QFormer 区域标记 $R$ 会使平均增益从 +10.1 pp 降至 +3.2 pp。",
      bibHead: "BibTeX · 手稿 2027",
      morePages: "系列科研主页",
      sib1Tag: "手稿 · 2027",
      sib1Desc: "面向 VLA 模型的几何条件即插即用动作精修。",
      sib2Tag: "具身智能",
      sib2Desc: "从第一视角手部与头部运动学习潜动作表示。",
      sib3Tag: "手稿 · 2027",
      sib3Title: "State–Readout Decoupling",
      sib3Desc: "面向潜空间世界模型的时域隐状态解耦滚动。",
      sib4Tag: "ECCV 2026",
      sib4Title: "CausalVAE 插件",
      sib4Desc: "面向世界模型反事实动力学的因果图插件。",
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
