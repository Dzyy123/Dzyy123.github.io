(() => {
  // Exact values from arXiv:2608.14125 Tables 2, 3, 4 & Section 4 Controlled Tests
  const SIM_DATA = [
    { name: "Traj-LeWM (Ours)", note: "End-to-end lightweight + LTC (<1M)", vals: [93.5, 99, 88, 93, 94], ours: true },
    { name: "LeWM", note: "Primary controlled endpoint baseline", vals: [85.8, 96, 74, 86, 87] },
    { name: "DINO-WM", note: "Frozen pretrained DINOv2 encoder", vals: [84.8, 74, 86, 79, 100] },
    { name: "PLDM", note: "Reward-free latent dynamics planner", vals: [79.5, 78, 65, 78, 97] },
    { name: "GCBC", note: "Goal-conditioned behavior cloning", vals: [null, 75, 84, null, 100] },
    { name: "GCIQL", note: "Goal-conditioned implicit Q-learning", vals: [null, 20, 64, null, 100] },
    { name: "GCIVL", note: "Goal-conditioned value learning", vals: [null, 33, 56, null, 100] },
  ];

  // Table 4: Two-Axis Ablation [Avg, Push-T, Cube, Reacher, Two-Room]
  const ABLATION_ROWS = [
    { name: "Traj-LeWM · Joint Score", note: "Full supervision + $C_0 + \\lambda\\tilde{S}_\\psi$ planning", vals: [93.5, 99, 88, 93, 94], ours: true },
    { name: "Traj-LeWM · Endpoint Only", note: "Full supervision, LTC disabled at test ($\\lambda = 0$)", vals: [89.0, 98, 80, 84, 94] },
    { name: "Traj-LeWM-syn · Endpoint Only", note: "Synthetic preferences only ($\\lambda = 0$)", vals: [87.3, 96, 79, 80, 94] },
    { name: "LeWM · Endpoint Only", note: "No trajectory supervision ($\\lambda = 0$)", vals: [85.8, 96, 74, 86, 87] },
    { name: "Traj-LeWM · LTC Only", note: "Pure path functional $S_\\psi$ without $C_0$", vals: [80.3, 78, 69, 94, 80] },
  ];

  // Endpoint-controlled diagnostics (Section 4)
  const CONTROLLED_DATA = [
    { name: "Reacher", note: "207 hardest pairs ($|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}$) · 200 jitter pairs", vals: [94.4, 100.0], ours: true },
    { name: "OGBench-Cube", note: "Object manipulation under matched endpoint $C_0$", vals: [90.0, 100.0], ours: true },
    { name: "Push-T", note: "Non-prehensile planar T-block pushing", vals: [85.8, 100.0] },
    { name: "Two-Room", note: "Doorway navigation with wall partition", vals: [83.0, 96.0] },
  ];

  // Table 3: Franka FR3 Real-Robot (20 paired start-goal tasks)
  const ROBOT_DATA = [
    { metric: "Task Success ↑", sub: "No collision &amp; min 7-DoF $\\|e\\|_2 \\le 0.11\\;\\mathrm{rad}$", lewm: 50.0, lewmRaw: "10 / 20 (50%)", ours: 70.0, oursRaw: "14 / 20 (70%)", gain: "+20 pp" },
    { metric: "Target Miss ↓", sub: "Completed rollout $&gt; 0.11\\;\\mathrm{rad}$ threshold", lewm: 30.0, lewmRaw: "6 / 20 (30%)", ours: 20.0, oursRaw: "4 / 20 (20%)", gain: "−10 pp" },
    { metric: "Collision Termination ↓", sub: "Safety stop due to table/obstacle contact", lewm: 20.0, lewmRaw: "4 / 20 (20%)", ours: 10.0, oursRaw: "2 / 20 (10%)", gain: "−50% rel." },
  ];

  let view = "sim";
  let subIdx = 0;

  const workbenchEl = document.querySelector(".workbench");
  const rowsHost = document.getElementById("paired-rows");
  const subHost = document.getElementById("sub-tabs");
  const legendEl = document.getElementById("wb-legend");
  const takeawayEl = document.getElementById("wb-takeaway");

  function isZh() {
    return document.documentElement.lang === "zh-CN";
  }

  function renderWorkbench() {
    subHost.replaceChildren();
    rowsHost.replaceChildren();

    if (view === "sim" || view === "ablation") {
      const tabs = ["4-Task Mean", "Push-T", "OGBench-Cube", "Reacher", "Two-Room"];
      if (subIdx >= tabs.length) subIdx = 0;
      tabs.forEach((lbl, idx) => {
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

      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> Traj-LeWM（联合评分）</span><span><i class="swatch swatch--base"></i> 对照世界模型 / 消融变体</span>`
        : `<span><i class="swatch swatch--ours"></i> Traj-LeWM (Ours)</span><span><i class="swatch swatch--base"></i> Baselines / Ablations</span>`;

      const list = (view === "sim" ? SIM_DATA : ABLATION_ROWS).filter((r) => r.vals[subIdx] !== null);
      const lewmTaskVal = (view === "sim" ? SIM_DATA[1] : ABLATION_ROWS[3]).vals[subIdx];

      list.forEach((item) => {
        const v = item.vals[subIdx];
        const diff = v - lewmTaskVal;
        const diffStr = diff === 0 ? "Baseline" : (diff > 0 ? `+${diff.toFixed(1).replace(".0", "")} pp` : `${diff.toFixed(1).replace(".0", "")} pp`);
        const row = document.createElement("div");
        row.className = "paired-row" + (item.ours ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.note}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.ours ? "ours" : "base"}" style="width:${v}%"></i></div>
              <span class="bar-num ${item.ours ? "ours" : ""}">${v.toFixed(subIdx === 0 ? 1 : 0)}%</span>
            </div>
          </div>
          <span class="delta-pill ${diff > 0 ? "" : diff < 0 ? "drop" : "neutral"}">${diffStr} vs LeWM</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = view === "sim"
        ? (isZh()
          ? "表 2：无需外部视觉预训练、仅增 &lt;1M 参数，四任务均值 85.8% $\\to$ 93.5%（Cube +14 pp）。"
          : "Table 2: &lt;1M added parameters, no external visual pretraining; 4-task mean rises 85.8% $\\to$ 93.5% (Cube +14 pp).")
        : (isZh()
          ? "表 4：训练期偏好塑形将仅终点规划（$\\lambda = 0$）从 85.8% 提至 89.0%；规划期联合 $C_0 + \\lambda\\tilde{S}_\\psi$ 进一步升至 93.5%。"
          : "Table 4: Training preferences alone lift $C_0$-only planning 85.8% $\\to$ 89.0%; joint $C_0 + \\lambda\\tilde{S}_\\psi$ ranking reaches 93.5%.");
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    if (view === "controlled") {
      const tabs = [
        isZh() ? "终点匹配排序" : "Endpoint-Matched",
        isZh() ? "固定首尾扰动" : "Fixed-Endpoint Jitter",
      ];
      if (subIdx >= 2) subIdx = 0;
      tabs.forEach((lbl, idx) => {
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

      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> LTC $S_\\psi$ 正确排序率（仅终点 $C_0$ 基线 = 50%）</span>`
        : `<span><i class="swatch swatch--ours"></i> LTC $S_\\psi$ correct ordering ($C_0$ tie baseline = 50%)</span>`;

      CONTROLLED_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        const row = document.createElement("div");
        row.className = "paired-row" + (item.ours ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.note}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${v}%"></i></div>
              <span class="bar-num ours">${v.toFixed(1)}%</span>
            </div>
          </div>
          <span class="delta-pill">+${(v - 50).toFixed(1)} pp</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "图 3：终点距离严格匹配（$|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}$）或固定首尾时，$S_\\psi$ 仍分别以 83.0%–94.4% 与 96%–100% 区分优劣路径。"
        : "Fig. 3: Under matched ($|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}$) or identical endpoints, $S_\\psi$ orders paths at 83.0%–94.4% and 96%–100%.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    // Real-Robot view
    legendEl.innerHTML = `<span><i class="swatch swatch--base"></i> LeWM</span><span><i class="swatch swatch--ours"></i> Traj-LeWM</span>`;

    ROBOT_DATA.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "paired-row" + (idx === 0 ? " highlight" : "");
      row.innerHTML = `
        <div class="paired-name">${item.metric}<small>${item.sub}</small></div>
        <div class="bars-stack">
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill base" style="width:${item.lewm}%"></i></div>
            <span class="bar-num">${item.lewmRaw}</span>
          </div>
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill ${idx === 0 ? "ours" : "warn"}" style="width:${item.ours}%"></i></div>
            <span class="bar-num ours">${item.oursRaw}</span>
          </div>
        </div>
        <span class="delta-pill">${item.gain}</span>
      `;
      rowsHost.appendChild(row);
    });

    takeawayEl.innerHTML = isZh()
      ? "表 3 · Franka FR3：20 组配对任务成功率 50% $\\to$ 70%（10/20 $\\to$ 14/20），碰撞终止减半（4 $\\to$ 2）。"
      : "Table 3 · Franka FR3: 20 paired tasks lift success 50% $\\to$ 70% (10/20 $\\to$ 14/20) and halve collisions (4 $\\to$ 2).";
    if (window.renderMathIn) window.renderMathIn(workbenchEl);
  }

  document.querySelectorAll("#view-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      view = btn.dataset.view;
      subIdx = 0;
      document.querySelectorAll("#view-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.view === view))
      );
      renderWorkbench();
    });
  });

  // Lightbox
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

  // Bilingual I18N
  const I18N = {
    zh: {
      backStudio: "← 丁子毅主页",
      navMethod: "方法",
      navResults: "结果",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "预印本 ↗",
      topicBadge: "世界模型规划 · Franka 真机",
      fullTitle: "基于潜轨迹代价的路径感知世界模型规划",
      authorNotes: "* 共同第一作者。† 通讯作者。",
      affilSummary: "作者单位",
      heroLead:
        "终点距离看不见中间过程。Traj-LeWM 引入不到 1M 参数的偏好学习潜轨迹代价（LTC），同步塑形视觉编码器并重排 CEM 候选路径。",
      btnPaper: "预印本 PDF ↗",
      btnExplorer: "实验数据",
      btnCite: "BibTeX",
      stageEyebrow: "交互式 CEM 竞技场",
      stageTitle: "终点距离匹配，真实执行结果截然相反",
      modeEndpoint: "仅终点 $C_0$",
      modeJoint: "$C_0 + \\lambda\\tilde{S}_\\psi$",
      metric1: "四任务平均闭环成功率（Cube +14 pp · Reacher +7 pp）",
      metric2: "Reacher 207 组终点匹配难例正确排序率",
      metric3: "Franka FR3 真机成功率（碰撞减半：4 → 2）",
      methodKicker: "方法设计",
      methodHeading: "不到 1M 参数的轨迹级表征塑形与重排序。",
      p1Title: "目标条件潜轨迹代价",
      p1Body: "逐帧聚合潜状态 $z_t$、差分 $\\Delta z_t$、目标残差 $d_t^g = z_g - z_t$ 与归一化相位 $\\eta_t$。",
      p2Title: "轨迹偏好监督",
      p2Body: "对比专家轨迹与目标错配、固定首尾扰动及闭环 CEM 真实失败序列。",
      p3Title: "四分位距校准重排",
      p3Body: "规划期按候选池 IQR 与终点代价 $C_0$ 对齐量纲，兼顾终端精度与路径可行性。",
      expKicker: "实验结果 · 表 2–4",
      expHeading: "闭环仿真、双轴消融与 Franka FR3 真机。",
      tabSim: "闭环仿真 (表 2)",
      tabAblation: "双轴消融 (表 4)",
      tabControlled: "受控路径诊断",
      tabRobot: "Franka 真机 (表 3)",
      figKicker: "论文图表",
      figHeading: "框架总览、受控检验与真机部署。",
      zoomFig: "放大 ↗",
      f1Title: "三阶段流程",
      f1Cap: "潜轨迹编码、合成+失败偏好训练与联合 CEM 评分。",
      f2Title: "表征与重排分离",
      f2Cap: "区分编码器 AUC 提升与显式 LTC 难例重排贡献。",
      f3Title: "终点受控测试",
      f3Cap: "终点代价 $C_0$ 匹配或锁定时，LTC 仍准确识别可行路径。",
      f4Title: "Franka FR3 部署",
      f4Cap: "20 组配对三视角视觉目标任务（10/20 → 14/20）。",
      f5Title: "门洞注意力迁移",
      f5Cap: "偏好监督引导编码器聚焦中央隔墙与门洞瓶颈。",
      scopeKicker: "边界说明",
      scopeTitle: "补充排序信号与适用范围",
      scopeP1:
        "<strong>轻量端到端定位：</strong>LTC 不依赖外部视觉预训练；在 Two-Room 上冻结 DINOv2 特征仍具优势（100% vs. 94%）。",
      scopeP2:
        "<strong>真机样本量：</strong>Franka FR3 的 20 组配对结果定位为物理可行性的初步证据。",
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
