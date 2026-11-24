(() => {
  // Exact values from SRD Manuscript Tables 1 & 2 and Section "Long-Horizon Diagnostic on TwoRoom"
  // Format per task: ar: [Success %, Params M, Time s], srd: [Success %, Params M, Time s], srdAr: [Success %, Params M, Time s]
  const MAIN_DATA = {
    LeWM: [
      {
        name: "TwoRoom",
        famEn: "2D Doorway Navigation · SRD-AR: 97.33%",
        famZh: "双房间导航 · SRD-AR: 97.33%",
        ar: [88.67, 18.03, 25.25],
        srd: [96.00, 7.54, 13.75],
        srdAr: [97.33, 11.51, 14.42],
        star: true,
      },
      {
        name: "Reacher",
        famEn: "Continuous Arm Control · SRD-AR: 87.33%",
        famZh: "连续机械臂控制 · SRD-AR: 87.33%",
        ar: [81.33, 18.03, 55.58],
        srd: [88.00, 7.69, 27.87],
        srdAr: [87.33, 11.51, 26.78],
        star: true,
      },
      {
        name: "OGB-Cube",
        famEn: "Cube Manipulation · SRD-AR: 79.33%",
        famZh: "方块操作 · SRD-AR: 79.33%",
        ar: [73.33, 18.03, 47.92],
        srd: [76.67, 7.69, 36.32],
        srdAr: [79.33, 11.51, 37.44],
      },
      {
        name: "PushT",
        famEn: "Contact-Rich Pose Alignment · SRD-AR: 86.67%",
        famZh: "精细接触位姿对齐 · SRD-AR: 86.67%",
        ar: [94.67, 18.03, 33.78],
        srd: [87.33, 7.69, 17.12],
        srdAr: [86.67, 11.51, 17.93],
      },
    ],
    PLDM: [
      {
        name: "PushT",
        famEn: "Contact-Rich Pose Alignment · SRD-AR: 89.33%",
        famZh: "精细接触位姿对齐 · SRD-AR: 89.33%",
        ar: [78.00, 18.03, 38.32],
        srd: [84.67, 8.48, 20.00],
        srdAr: [89.33, 19.27, 18.04],
        star: true,
      },
      {
        name: "OGB-Cube",
        famEn: "Cube Manipulation · SRD-AR: 65.33%",
        famZh: "方块操作 · SRD-AR: 65.33%",
        ar: [65.00, 18.83, 49.11],
        srd: [67.33, 8.48, 33.66],
        srdAr: [65.33, 19.27, 34.19],
        star: true,
      },
      {
        name: "TwoRoom",
        famEn: "2D Doorway Navigation · SRD-AR: 99.33%",
        famZh: "双房间导航 · SRD-AR: 99.33%",
        ar: [97.00, 18.03, 33.21],
        srd: [98.00, 8.33, 12.35],
        srdAr: [99.33, 19.12, 12.28],
      },
      {
        name: "Reacher",
        famEn: "Continuous Arm Control · SRD-AR: 78.00%",
        famZh: "连续机械臂控制 · SRD-AR: 78.00%",
        ar: [78.00, 18.83, 45.81],
        srd: [78.67, 8.48, 26.65],
        srdAr: [78.00, 19.27, 26.26],
      },
    ],
  };

  // Exact TwoRoom Long-Horizon numbers reported in Section "Long-Horizon Diagnostic on TwoRoom" & Fig. 2
  const HORIZON_DATA = {
    success: [
      {
        name: "Horizon $H = 5$",
        subEn: "25 raw env steps · SRD-AR: 97.33%",
        subZh: "25 个环境步 · SRD-AR: 97.33%",
        base: 88.67,
        ours: 96.00,
        max: 100,
        unit: "%",
        pill: "+7.33 pp",
      },
      {
        name: "Horizon $H = 20$",
        subEn: "100 raw env steps + distant goals · SRD-AR: 46.0%",
        subZh: "100 个环境步 + 远距离目标 · SRD-AR: 46.0%",
        base: 14.00,
        ours: 46.00,
        max: 100,
        unit: "%",
        pill: "+32.0 pp",
        star: true,
      },
    ],
    mse: [
      {
        name: "Raw Step $s = 65$",
        subEn: "Peak open-loop trajectory separation (lower is better)",
        subZh: "开环潜空间误差最大分离点（越低越好）",
        base: 0.348,
        ours: 0.218,
        max: 0.45,
        unit: "",
        dec: 3,
        pill: "−37.3%",
        star: true,
      },
      {
        name: "Terminal Step $s = 80$",
        subEn: "End-of-rollout open-loop latent MSE (lower is better)",
        subZh: "开环滚动末端潜空间 MSE（越低越好）",
        base: 0.417,
        ours: 0.345,
        max: 0.45,
        unit: "",
        dec: 3,
        pill: "−17.2%",
      },
    ],
    time: [
      {
        name: "Horizon $H = 5$",
        subEn: "50 closed-loop episodes · SRD-AR: 14.42 s",
        subZh: "50 轮闭环评估耗时 · SRD-AR: 14.42 s",
        base: 25.25,
        ours: 13.75,
        max: 520,
        unit: " s",
        dec: 2,
        pill: "−45.5%",
      },
      {
        name: "Horizon $H = 20$",
        subEn: "Repeated AR Transformer vs. persistent GRU · SRD-AR: 66.0 s",
        subZh: "重复调用 Transformer vs. 持续 GRU 推进 · SRD-AR: 66.0 s",
        base: 515.0,
        ours: 68.0,
        max: 520,
        unit: " s",
        dec: 1,
        pill: "−86.8%",
        star: true,
      },
    ],
  };

  // Exact Table 2: Alternative rollout formulations on TwoRoom (LeWM)
  const ABLATION_DATA = [
    {
      name: "SRD-AR",
      noteEn: "Decoupled GRU + $\\mathcal{L}_{\\mathrm{SRD}}$ + local $\\mathcal{L}_{\\mathrm{AR}}$",
      noteZh: "解耦 GRU + $\\mathcal{L}_{\\mathrm{SRD}}$ + 局部单步辅助损失 $\\mathcal{L}_{\\mathrm{AR}}$",
      vals: [97.33, 11.510, 14.42],
      deltas: ["+8.66 pp", "−36.2%", "−42.9%"],
    },
    {
      name: "SRD (Ours)",
      noteEn: "Decoupled GRU hidden trajectory + shared readout $R_\\phi$",
      noteZh: "默认配置：持续 GRU 隐状态轨迹 + 共享读出头 $R_\\phi$",
      vals: [96.00, 7.540, 13.75],
      deltas: ["+7.33 pp", "−58.2%", "−45.5%"],
      star: true,
    },
    {
      name: "AR-GRU",
      noteEn: "GRU predictor but retains latent readout feedback",
      noteZh: "GRU 架构，但保留规划潜变量自回归反馈",
      vals: [94.00, 7.577, 17.03],
      deltas: ["+5.33 pp", "−58.0%", "−32.6%"],
    },
    {
      name: "SRD-Transformer",
      noteEn: "Decoupled hidden carrier with Transformer transition",
      noteZh: "解耦隐状态载体 + Transformer 转移模块",
      vals: [93.33, 18.036, 18.58],
      deltas: ["+4.67 pp", "+0.01%", "−26.4%"],
    },
    {
      name: "AR baseline",
      noteEn: "1-step Transformer recursively fed $\\hat{z}_{t+k}$",
      noteZh: "标准单步 Transformer 递归回流 $\\hat{z}_{t+k}$",
      vals: [88.67, 18.034, 25.25],
      deltas: ["Baseline", "18.034 M", "25.25 s"],
    },
    {
      name: "AR-MS",
      noteEn: "Multi-step supervision attached to coupled AR rollout",
      noteZh: "仅添加多步监督，但未解除潜变量读出耦合",
      vals: [88.00, 18.034, 31.98],
      deltas: ["−0.67 pp", "0.0%", "+26.6%"],
      warn: true,
    },
  ];

  let mode = "main";
  let domain = "LeWM";
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
    if (mode === "main") {
      labels = isZh()
        ? ["AR vs. SRD 成功率 (%)", "AR vs. SRD-AR (%)", "参数量 (M) ↓", "评估耗时 (s) ↓"]
        : ["AR vs. SRD (%)", "AR vs. SRD-AR (%)", "Params (M) ↓", "Eval Time (s) ↓"];
    } else if (mode === "horizon") {
      labels = isZh()
        ? ["闭环成功率 (%)", "开环潜空间 MSE ↓", "规划耗时 (s) ↓"]
        : ["Success Rate (%)", "Open-Loop MSE ↓", "Eval Time (s) ↓"];
    } else {
      labels = isZh()
        ? ["成功率 (%)", "预测器参数 (M) ↓", "评估耗时 (s) ↓"]
        : ["Success (%)", "Params (M) ↓", "Time (s) ↓"];
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
    domainTabs.style.display = mode === "main" ? "inline-flex" : "none";

    if (mode === "ablation") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 解耦 / 循环变体</span><span><i class="swatch swatch--clay"></i> 耦合多步监督退化（AR-MS）</span>`
        : `<span><i class="swatch swatch--ours"></i> Decoupled / recurrent variants</span><span><i class="swatch swatch--clay"></i> Coupled multi-step loss alone (AR-MS)</span>`;

      const maxScales = [100, 20, 35];
      const units = ["%", " M", " s"];
      const decs = [2, 3, 2];

      ABLATION_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        const pct = Math.min(100, Math.max(2, (v / maxScales[subIdx]) * 100));
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? item.noteZh : item.noteEn}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.warn ? "warn" : item.name === "AR baseline" ? "base" : "ours"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ours">${v.toFixed(decs[subIdx])}${units[subIdx]}</span>
            </div>
          </div>
          <span class="delta-pill ${item.warn ? "drop" : item.name === "AR baseline" ? "neutral" : ""}">${item.deltas[subIdx]}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 2（TwoRoom，LeWM）：仅附加多步损失而不解耦潜变量（AR-MS：88.00%，耗时 +26.6%）无法带来增益；结合持续 GRU 隐状态载体与共享读出头后，SRD 达 96.00% 成功率，同时减少 58.2% 参数与 45.5% 评估耗时。"
        : "Table 2 (TwoRoom, LeWM): Attaching multi-step supervision to a coupled rollout (AR-MS: 88.00%, +26.6% time) yields no gain; combining persistent GRU hidden states with decoupled readout $R_\\phi$ reaches 96.00% with 58.2% fewer parameters and 45.5% less runtime.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    if (mode === "horizon") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--base"></i> 自回归基线（AR）</span><span><i class="swatch swatch--ours"></i> 状态–读出解耦（SRD）</span>`
        : `<span><i class="swatch swatch--base"></i> Autoregressive (AR)</span><span><i class="swatch swatch--ours"></i> SRD (Ours)</span>`;

      const key = subIdx === 0 ? "success" : subIdx === 1 ? "mse" : "time";
      HORIZON_DATA[key].forEach((item) => {
        const dec = item.dec ?? 2;
        const bPct = Math.min(100, Math.max(2, (item.base / item.max) * 100));
        const oPct = Math.min(100, Math.max(2, (item.ours / item.max) * 100));
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${isZh() ? item.subZh : item.subEn}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill base" style="width:${bPct.toFixed(1)}%"></i></div>
              <span class="bar-num">${item.base.toFixed(dec)}${item.unit}</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${oPct.toFixed(1)}%"></i></div>
              <span class="bar-num ours">${item.ours.toFixed(dec)}${item.unit}</span>
            </div>
          </div>
          <span class="delta-pill">${item.pill}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "图 2 · TwoRoom 长时域诊断：当规划时域从 $H = 5$ 增至 $H = 20$ 且目标距离同步拉远时，AR 成功率从 88.67% 骤降至 14%，而 SRD 保持 46%（+32 pp），在环境步 65 处将开环潜空间 MSE 降低 37.3%（0.348 $\\to$ 0.218），并将 $H = 20$ 规划耗时从 515 s 压缩至 68 s（−86.8%）。"
        : "Figure 2 · TwoRoom Long-Horizon Stress Test: As horizon scales $H = 5 \\to 20$ with more distant goals, AR falls from 88.67% to 14% while SRD retains 46% (+32 pp), cutting step-65 open-loop MSE by 37.3% (0.348 $\\to$ 0.218) and $H = 20$ runtime from 515 s to 68 s (−86.8%).";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    // mode === "main" (Table 1)
    const useSrdAr = subIdx === 1;
    legendEl.innerHTML = isZh()
      ? `<span><i class="swatch swatch--base"></i> 自回归基线（AR）</span><span><i class="swatch swatch--ours"></i> ${useSrdAr ? "SRD-AR（含局部单步损失）" : "SRD（默认解耦滚动）"}</span>`
      : `<span><i class="swatch swatch--base"></i> Autoregressive (AR)</span><span><i class="swatch swatch--ours"></i> ${useSrdAr ? "SRD-AR (+ local 1-step loss)" : "SRD (Default Ours)"}</span>`;

    const valIdx = subIdx <= 1 ? 0 : subIdx - 1; // 0: Success, 1: Params, 2: Time
    const maxScale = valIdx === 0 ? 100 : valIdx === 1 ? 20 : 60;
    const unit = valIdx === 0 ? "%" : valIdx === 1 ? " M" : " s";

    MAIN_DATA[domain].forEach((item) => {
      const bVal = item.ar[valIdx];
      const oVal = (useSrdAr ? item.srdAr : item.srd)[valIdx];
      let diffLabel = "";
      let pillClass = "";

      if (valIdx === 0) {
        const diff = oVal - bVal;
        diffLabel = `$\\Delta$ ${(diff >= 0 ? "+" : "")}${diff.toFixed(2)} pp`;
        pillClass = diff > 0.05 ? "" : diff < -0.05 ? "drop" : "neutral";
      } else {
        const rel = ((oVal - bVal) / bVal) * 100;
        diffLabel = `${rel >= 0 ? "+" : ""}${rel.toFixed(1)}%`;
        pillClass = rel < -0.5 ? "" : rel > 0.5 ? "drop" : "neutral";
      }

      const bPct = Math.min(100, Math.max(2, (bVal / maxScale) * 100));
      const oPct = Math.min(100, Math.max(2, (oVal / maxScale) * 100));

      const row = document.createElement("div");
      row.className = "paired-row" + (item.star ? " highlight" : "");
      row.innerHTML = `
        <div class="paired-name">${domain} · ${item.name}<small>${isZh() ? item.famZh : item.famEn}</small></div>
        <div class="bars-stack">
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill base" style="width:${bPct.toFixed(1)}%"></i></div>
            <span class="bar-num">${bVal.toFixed(2)}${unit}</span>
          </div>
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill ${pillClass === "drop" && valIdx === 0 ? "warn" : "ours"}" style="width:${oPct.toFixed(1)}%"></i></div>
            <span class="bar-num ours">${oVal.toFixed(2)}${unit}</span>
          </div>
        </div>
        <span class="delta-pill ${pillClass}">${diffLabel}</span>
      `;
      rowsHost.appendChild(row);
    });

    takeawayEl.innerHTML = domain === "LeWM"
      ? (isZh()
          ? "表 1 · LeWM：SRD 在 TwoRoom（+7.33 pp）、Reacher（+6.67 pp）与 OGB-Cube（+3.34 pp）上均优于 AR，预测器参数减少 57.3–58.2%，评估耗时减少 24.2–49.9%；仅在强调短程局部接触几何的 PushT 上下降 7.34 pp。"
          : "Table 1 · LeWM: SRD improves TwoRoom (+7.33 pp), Reacher (+6.67 pp), and OGB-Cube (+3.34 pp) while cutting predictor parameters by 57.3–58.2% and runtime by 24.2–49.9%; PushT (−7.34 pp) reflects a short-range contact-fidelity trade-off.")
      : (isZh()
          ? "表 1 · PLDM：SRD 在全部 4 项任务上均超越 AR（PushT +6.67 pp，SRD-AR 跃升 +11.33 pp 至 89.33%；TwoRoom SRD-AR 达 99.33%），默认 SRD 参数量减少 53.0–55.0%，规划耗时缩短 31.5–62.8%。"
          : "Table 1 · PLDM: SRD improves all 4 tasks over AR (PushT +6.67 pp, reaching 89.33% / +11.33 pp with SRD-AR; TwoRoom reaches 99.33% with SRD-AR), while default SRD uses 53.0–55.0% fewer parameters and 31.5–62.8% less evaluation time.");
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
      skipMain: "跳至正文",
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "实验",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "论文 ↗",
      statusBadge: "手稿 · 2027",
      topicBadge: "世界模型 · 潜空间滚动",
      fullTitle: "面向潜空间世界模型的状态–读出解耦",
      authorNotes: "† 通讯作者。",
      affilSummary: "作者单位",
      affil1: "香港大学",
      affil2: "清华大学深圳国际研究生院",
      affil3: "因福斯智能科技（INFIFORCE）",
      heroLead:
        "自回归滚动将每一步预测潜变量再次输入下一步转移，使读出误差跨步回流累积。SRD 沿规划时域推进独立循环隐状态轨迹，并通过共享读出头单向投射规划潜变量，彻底消除读出回流。",
      btnPaper: "手稿 PDF ↗",
      btnSource: "原文链接 ↗",
      btnBench: "实验对比 ↓",
      stageEyebrow: "交互式滚动推演",
      stageTitle: "时域隐状态推进 vs. 潜变量反馈回流",
      modeSRD: "SRD 滚动（本文）",
      modeAR: "自回归滚动（AR）",
      m1Unit: " 组设定",
      metric1: "在 LeWM 与 PLDM 四大视觉目标达成任务中 7 组超越自回归基线",
      metric2: "TwoRoom 长程优势从 $H = 5$ 的 +8 pp 扩大至 $H = 20$ 的 +32 pp（14% $\\to$ 46%）",
      m3Unit: "% 参数量",
      metric3: "紧凑 GRU 滚动预测器平均缩短 44% 评估耗时（$H = 20$ 下缩短 86.8%）",
      methodKicker: "解耦滚动范式",
      methodHeading: "分离动力学循环载体与面向规划器的潜变量读出。",
      p1Num: "01 · 耦合诊断",
      p1Title: "潜变量读出误差回流",
      p1Body: "自回归预测器将 $\\hat{z}_{t+k} = z_{t+k}^{\\mathrm{tgt}} + e_k$ 重新送入 $P_\\phi$，使中间读出误差经局部雅可比 $J_k$ 逐步放大。",
      p2Num: "02 · 滚动载体",
      p2Title: "持续隐状态时域轨迹",
      p2Body: "由 $h_{\\mathrm{init}} = g_\\phi(z_t)$ 初始化后，GRU 沿动作嵌入 $u_k$ 推进 $h_{0:H-1}$，共享读出头 $R_\\phi$ 单向输出 $\\hat{z}_{t+k+1}$。",
      p3Num: "03 · 时域监督",
      p3Title: "时域对齐读出损失",
      p3Body: "对原生隐状态轨迹 $h_{0:H-1}$ 上的每一步读出联合施加潜空间 MSE 监督，并完整保留宿主正则项 $\\mathcal{L}_{\\mathrm{aux}}$。",
      expKicker: "实验评测 · 表 1–2 与长时域诊断",
      expHeading: "相同编码器与 CEM 规划器下对比 AR、SRD 与 SRD-AR。",
      tabMain: "目标达成率 (表 1)",
      tabHorizon: "TwoRoom 长时域诊断 (图 2)",
      tabAblation: "滚动范式消融 (表 2)",
      figKicker: "论文原图",
      figHeading: "滚动架构对比与 TwoRoom 长时域扩展分析。",
      zoomFig: "放大图表 ↗",
      zoomFig2: "放大图表 ↗",
      f1Meta: "图 1 · 规划流程对比",
      f1Title: "自回归潜变量滚动 vs. 状态–读出解耦（SRD）",
      f1Cap: "SRD 仅替换目标条件 CEM 规划中的滚动预测模块，在不改动编码器 $f_\\theta$ 与代价函数的前提下切断潜变量反馈回路。",
      f2Meta: "图 2 · 长时域压力测试",
      f2Title: "TwoRoom 时域扩展曲线（$H \\in \\{5, 10, 15, 20\\}$）",
      f2Cap: "随规划步长与目标距离同步增加，SRD 成功率领先幅度从 +8 pp 扩大至 +32 pp，开环潜空间 MSE 最高降低 37.3%，$H = 20$ 耗时减少 86.8%。",
      scopeKicker: "边界说明",
      scopeTitle: "短程精细接触与长程时域稳定性的权衡",
      scopeP1:
        "<strong>精细接触权衡：</strong>LeWM-PushT（94.67% $\\to$ 87.33%）是唯一低于 AR 的设定，反映出短程接触几何对局部单步保真度更敏感；而在 PLDM-PushT 上，SRD 提升 +6.67 pp（84.67%），SRD-AR 进一步达 89.33%（+11.33 pp）。",
      scopeP2:
        "<strong>可选局部监督：</strong>SRD-AR 在训练期引入单步辅助损失 $\\lambda_{\\mathrm{AR}}\\mathcal{L}_{\\mathrm{AR}}$，测试期仍保持无回流解耦滚动，在 PLDM-TwoRoom 上取得最高 99.33% 成功率。",
      bibHead: "BibTeX · 手稿 2027",
      morePages: "系列科研主页",
      sib1Tag: "手稿 · 2027",
      sib1Title: "State–Readout Decoupling",
      sib1Desc: "切断读出回流的时域隐状态世界模型滚动。",
      sib2Tag: "arXiv 2026",
      sib2Desc: "基于全轨迹代价的路径感知世界模型规划。",
      sib3Tag: "ECCV 2026",
      sib3Title: "CausalVAE 插件",
      sib3Desc: "面向世界模型反事实动力学的因果图插件。",
      sib4Tag: "手稿 · 2027",
      sib4Desc: "面向 VLA 模型的几何条件即插即用动作精修。",
      footAuthor: "丁子毅 (Ziyi Ding) · 清华大学深圳国际研究生院",
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
