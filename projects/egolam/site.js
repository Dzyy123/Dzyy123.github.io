(() => {
  // Exact values from EgoLAM Tables 1, 2, 3, 4, S4 and Figures 7–8
  // Table 3: Closed-loop success (%) on LIBERO [Mean, Spatial, Object, Goal]
  const BC_BASE = [50.65, 59.27, 41.07, 51.60];
  const LIBERO_DATA = [
    {
      name: "EgoLAM (Ours)",
      fam: "Hand-pooled slots + 3D wrist & head split (1×128)",
      vals: [79.38, 81.40, 77.33, 79.40],
      deltas: [28.73, 22.13, 36.27, 27.80],
      star: true,
    },
    {
      name: "GeoLAM",
      fam: "Geometry teacher supervision (4×32)",
      vals: [69.22, 74.33, 65.87, 67.47],
      deltas: [18.58, 15.07, 24.80, 15.87],
    },
    {
      name: "LAPA-DINOv2",
      fam: "Frozen DINOv2 feature prediction (16×1024)",
      vals: [59.89, 58.47, 53.40, 67.80],
      deltas: [9.24, -0.80, 12.33, 16.20],
    },
    {
      name: "LAPA-DINOv3",
      fam: "Frozen DINOv3 feature prediction (16×1024)",
      vals: [57.65, 57.40, 46.87, 68.67],
      deltas: [7.00, -1.87, 5.80, 17.07],
    },
    {
      name: "CLAM",
      fam: "Continuous latent action + action decoding (1×8)",
      vals: [54.84, 63.73, 38.53, 62.27],
      deltas: [4.20, 4.47, -2.53, 10.67],
    },
    {
      name: "Moto",
      fam: "Latent motion tokenization (8×32)",
      vals: [52.38, 51.33, 45.87, 59.93],
      deltas: [1.73, -7.93, 4.80, 8.33],
    },
    {
      name: "LAPA",
      fam: "Pixel-reconstruction quantized tokens (4×1024)",
      vals: [52.31, 56.33, 46.47, 54.13],
      deltas: [1.66, -2.93, 5.40, 2.53],
    },
    {
      name: "LAOM",
      fam: "Action-labeled inverse dynamics (1×256)",
      vals: [51.31, 61.33, 43.87, 48.73],
      deltas: [0.66, 2.07, 2.80, -2.87],
    },
  ];

  // Table 2 & Fig. 7–8: [Unseen AD R², IC-Camera ↓, IC-Photo ↓, Cached pairs/s ↑]
  const DIAG_DATA = [
    {
      name: "EgoLAM (Ours)",
      fam: "90.89M params · 17° cup-lift error",
      vals: [0.5343, 0.7673, 0.1699, 1180.45],
      sd: "± 0.0018",
      star: true,
    },
    {
      name: "GeoLAM",
      fam: "300.02M params · 103° cup-lift error",
      vals: [0.4312, 1.1048, 0.6606, 2.00],
      sd: "± 0.0030",
    },
    {
      name: "Moto",
      fam: "333.38M params · 115° cup-lift error",
      vals: [0.1983, 1.5978, 0.7727, 4.58],
      sd: "± 0.0004",
    },
    {
      name: "CLAM",
      fam: "2.69M params · joint CNN from images",
      vals: [0.1170, 1.5578, 0.8292, 105.30],
      sd: "± 0.0012",
    },
    {
      name: "LAPA",
      fam: "206.13M params · 126° cup-lift error",
      vals: [0.1140, 1.2885, 0.3821, 1.76],
      sd: "± 0.0013",
    },
    {
      name: "LAOM",
      fam: "12.07M params · cached endpoint stack",
      vals: [0.0564, 1.1323, 1.2216, 679.34],
      sd: "± 0.0027",
    },
    {
      name: "LAPA-DINOv3",
      fam: "405.20M params · 101° cup-lift error",
      vals: [-0.1068, 1.0032, 0.9987, 0.65],
      sd: "± 0.0021",
      warn: true,
    },
    {
      name: "LAPA-DINOv2",
      fam: "406.44M params · 41° cup-lift error",
      vals: [-0.1118, 1.0018, 1.0014, 0.42],
      sd: "± 0.0018",
      warn: true,
    },
  ];

  // Table 1: LARYBench [Mean Acc ↑, Human Top-1 ↑, Robot Top-1 ↑, Mean MSE ↓, VLABench MSE ↓, CALVIN MSE ↓]
  const LARY_DATA = [
    {
      name: "EgoLAM (Ours)",
      fam: "Latent shape 1×128 · Robo 0.426 · AgiBot 0.493",
      vals: [67.85, 71.81, 63.88, 0.391, 0.132, 0.513],
      star: true,
    },
    {
      name: "GeoLAM",
      fam: "Latent shape 4×32 · Robo 0.681 · AgiBot 0.727",
      vals: [66.06, 70.71, 61.41, 0.539, 0.185, 0.563],
    },
    {
      name: "LAOM",
      fam: "Latent shape 1×256 · Robo 0.495 · AgiBot 0.532",
      vals: [65.37, 70.56, 60.19, 0.450, 0.156, 0.616],
    },
    {
      name: "LAPA",
      fam: "Latent shape 4×1024 · Robo 0.851 · AgiBot 0.858",
      vals: [59.17, 60.95, 57.39, 0.646, 0.341, 0.533],
    },
    {
      name: "CLAM",
      fam: "Latent shape 1×8 · Robo 0.916 · AgiBot 0.917",
      vals: [55.20, 53.76, 56.65, 0.722, 0.430, 0.626],
    },
    {
      name: "Moto",
      fam: "Latent shape 8×32 · Robo 0.856 · AgiBot 0.842",
      vals: [36.76, 32.28, 41.25, 0.699, 0.475, 0.623],
    },
    {
      name: "LAPA-DINOv3",
      fam: "Latent shape 16×1024 · Robo 1.006 · AgiBot 1.014",
      vals: [15.52, 20.43, 10.61, 0.997, 1.004, 0.964],
    },
    {
      name: "LAPA-DINOv2",
      fam: "Latent shape 16×1024 · Robo 1.006 · AgiBot 1.013",
      vals: [14.74, 6.23, 23.25, 0.999, 1.006, 0.970],
    },
  ];

  // Tables 4, S1 & S4: Single-factor ablations [Mean AD R² ↑, IC-Camera ↓, IC-Photo ↓]
  const ABLATION_DATA = [
    {
      name: "EgoLAM Full (128-D)",
      note: "Full slots + wrist readout + FDM camera + GRL + view warp",
      vals: [0.5343, 0.7673, 0.1699],
      ctrl: [0.5343, 0.7673, 0.1699],
      star: true,
    },
    {
      name: "w/o Hand-region loss",
      note: "Removes $\\mathcal{L}_{\\mathrm{hand}}$, keeps wrist motion readout",
      vals: [0.5079, 0.8299, 0.1769],
      ctrl: [0.5343, 0.7673, 0.1699],
    },
    {
      name: "Replace slots with grid",
      note: "Fixed spatial grid features instead of object slots",
      vals: [0.4823, 0.9077, 0.2080],
      ctrl: [0.5343, 0.7673, 0.1699],
    },
    {
      name: "w/o Camera adversary",
      note: "Removes $\\operatorname{GRL}$ branch $\\mathcal{L}_{\\mathrm{adv}}$",
      vals: [0.4660, 0.8420, 0.2300],
      ctrl: [0.5343, 0.7673, 0.1699],
    },
    {
      name: "w/o View consistency",
      note: "Removes 2D warp loss $\\mathcal{L}_{\\mathrm{inv}}$ (IC-cam $> 1$)",
      vals: [0.5323, 1.1276, 0.2682],
      ctrl: [0.5343, 0.7673, 0.1699],
      warn: true,
    },
    {
      name: "Omit FDM camera input",
      note: "Replaces measured $n_t$ with missing-condition token",
      vals: [0.2242, 0.8245, 0.3598],
      ctrl: [0.5343, 0.7673, 0.1699],
      warn: true,
    },
    {
      name: "w/o Hand-motion loss",
      note: "Paired original-head control: AD $0.5592 \\to 0.3502$",
      vals: [0.3502, 0.8235, 0.1965],
      ctrl: [0.5592, 0.7032, 0.1578],
      warn: true,
    },
  ];

  let mode = "libero";
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
    if (mode === "libero") {
      labels = isZh()
        ? ["三套件均值 (%)", "Spatial (%)", "Object (%)", "Goal (%)"]
        : ["3-Suite Mean (%)", "Spatial (%)", "Object (%)", "Goal (%)"];
    } else if (mode === "diag") {
      labels = isZh()
        ? ["手腕解码 $R^2$ ↑", "相机敏感度 IC ↓", "光照敏感度 IC ↓", "缓存吞吐 (对/秒) ↑"]
        : ["Unseen AD $R^2$ ↑", "IC-Camera ↓", "IC-Photo ↓", "Cached Pairs/s ↑"];
    } else if (mode === "lary") {
      labels = isZh()
        ? ["平均准确率 ↑", "人类动作 Top-1 ↑", "机器人 Top-1 ↑", "平均回归 MSE ↓", "VLABench MSE ↓", "CALVIN MSE ↓"]
        : ["Mean Acc. (%) ↑", "Human Top-1 ↑", "Robot Top-1 ↑", "Mean MSE ↓", "VLABench MSE ↓", "CALVIN MSE ↓"];
    } else {
      labels = isZh()
        ? ["手腕解码 $R^2$ ↑", "相机敏感度 IC ↓", "光照敏感度 IC ↓"]
        : ["Unseen AD $R^2$ ↑", "IC-Camera ↓", "IC-Photo ↓"];
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

    if (mode === "libero") {
      const bcVal = BC_BASE[subIdx];
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--base"></i> 专家行为克隆 BC（${bcVal.toFixed(2)}%）</span><span><i class="swatch swatch--ours"></i> 潜动作预训练 + 微调策略</span>`
        : `<span><i class="swatch swatch--base"></i> Expert BC (${bcVal.toFixed(2)}%)</span><span><i class="swatch swatch--ours"></i> LAM Pretrain + Fine-tune</span>`;

      LIBERO_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        const d = item.deltas[subIdx];
        const diffLabel = (d >= 0 ? "+" : "") + d.toFixed(2) + " pp";
        const pillClass = d > 0.05 ? "" : d < -0.05 ? "drop" : "neutral";
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill base" style="width:${bcVal.toFixed(1)}%"></i></div>
              <span class="bar-num">${bcVal.toFixed(2)}%</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : d < 0 ? "warn" : "ours"}" style="width:${v.toFixed(1)}%"></i></div>
              <span class="bar-num ours">${v.toFixed(2)}%</span>
            </div>
          </div>
          <span class="delta-pill ${pillClass}">$\\Delta$ ${diffLabel}</span>
        `;
        rowsHost.appendChild(row);
      });

      const suiteNames = ["3-suite mean", "LIBERO-Spatial", "LIBERO-Object", "LIBERO-Goal"];
      const suiteMargins = ["+9.76", "+7.07", "+11.47", "+10.73"];
      takeawayEl.innerHTML = isZh()
        ? `表 3 · ${suiteNames[subIdx]}：EgoLAM 取得最高闭环成功率（三套件均值 $79.38\\%$），较直接专家 BC 提升 $+28.73$ 个百分点，并在当前维度领先最强其他潜动作模型 ${suiteMargins[subIdx]} 个百分点。`
        : `Table 3 · ${suiteNames[subIdx]}: EgoLAM leads closed-loop success ($79.38\\%$ mean across Spatial, Object, and Goal), beating direct Expert BC by $+28.73$ pp and the strongest competing LAM by ${suiteMargins[subIdx]} pp.`;
    } else if (mode === "diag") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> EgoLAM（本文方法）</span><span><i class="swatch swatch--base"></i> 对比模型</span><span><i class="swatch swatch--clay"></i> 负 $R^2$ 读出</span>`
        : `<span><i class="swatch swatch--ours"></i> EgoLAM (Ours)</span><span><i class="swatch swatch--base"></i> Competing LAMs</span><span><i class="swatch swatch--clay"></i> Negative $R^2$</span>`;

      DIAG_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        let pct = 5;
        let fmt = "";
        let pill = "";
        if (subIdx === 0) {
          pct = Math.max(3, ((v + 0.15) / 0.72) * 95);
          fmt = v.toFixed(4);
          pill = item.sd;
        } else if (subIdx === 1 || subIdx === 2) {
          pct = Math.max(4, (v / 1.65) * 96);
          fmt = v.toFixed(4);
          pill = v < 1.0 ? (isZh() ? "< 真实帧变" : "IC < 1.0") : "IC ≥ 1.0";
        } else {
          pct = Math.max(3, ((Math.log10(Math.max(v, 0.3)) + 0.6) / 3.7) * 96);
          fmt = v >= 100 ? v.toFixed(1) : v.toFixed(2);
          pill = `AD ${item.vals[0].toFixed(3)}`;
        }
        const isWarn = subIdx === 0 && v < 0;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : isWarn ? "warn" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${fmt}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : isWarn ? "drop" : "neutral"}">${pill}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 2 与图 7–9：LAOM 在人类动作分类上达 $70.56\\%$，但手腕运动解码仅 $R^2 = 0.0564$；EgoLAM 同时实现最高手腕解码（$R^2 = 0.5343$）、最低视角/光照敏感度（$0.7673$ / $0.1699$）与最高单线程缓存吞吐（$1{,}180.45$ 对/秒）。"
        : "Table 2 & Figs. 7–9: High action classification alone misses wrist geometry (LAOM reaches $70.56\\%$ human Top-1 yet $R^2 = 0.0564$); EgoLAM combines top wrist decoding ($0.5343$), lowest IC ($0.7673$ / $0.1699$), and $1{,}180.45$ cached pairs/s.";
    } else if (mode === "lary") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> EgoLAM（1×128，56k 步同池训练）</span><span><i class="swatch swatch--base"></i> 同数据池对比潜动作模型</span>`
        : `<span><i class="swatch swatch--ours"></i> EgoLAM (1×128, matched 56k updates)</span><span><i class="swatch swatch--base"></i> Matched-pool LAM baselines</span>`;

      const isAcc = subIdx <= 2;
      LARY_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        const pct = isAcc ? Math.max(3, v) : Math.max(4, (v / 1.05) * 96);
        const fmt = isAcc ? `${v.toFixed(2)}%` : v.toFixed(3);
        const badge = isAcc ? `MSE ${item.vals[3].toFixed(3)}` : `Acc ${item.vals[0].toFixed(1)}%`;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.fam}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${fmt}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : "neutral"}">${badge}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 1（LARYBench 动作分类与连续控制回归）：在相同 $1{,}056.9$ 小时训练池与 56,000 步更新下，EgoLAM 取得全部 8 项指标第一（平均准确率 $67.85\\%$，平均指令回归 MSE $0.391$，VLABench MSE $0.132$）。"
        : "Table 1 (LARYBench): Trained for 56,000 updates on the same $1{,}056.9\\,\\mathrm{h}$ pool, EgoLAM ranks best across all columns ($67.85\\%$ mean accuracy and $0.391$ mean command MSE; $0.132$ on VLABench-5).";
    } else {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 完整配置 / 稳定消融</span><span><i class="swatch swatch--clay"></i> 显著退化项（去手腕监督 / 去相机条件 / 去变换一致性）</span>`
        : `<span><i class="swatch swatch--ours"></i> Full model / minor drop</span><span><i class="swatch swatch--clay"></i> Major degradation when ablated</span>`;

      ABLATION_DATA.forEach((item) => {
        const v = item.vals[subIdx];
        const c = item.ctrl[subIdx];
        const pct = subIdx === 0 ? Math.max(4, (v / 0.58) * 96) : Math.max(4, (v / 1.2) * 96);
        const diff = v - c;
        const bad = (subIdx === 0 && diff < -0.08) || (subIdx > 0 && diff > 0.09);
        const diffTxt = item.star ? "Baseline" : `${diff >= 0 ? "+" : ""}${diff.toFixed(4)}`;
        const row = document.createElement("div");
        row.className = "paired-row" + (item.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${item.name}<small>${item.note}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ${item.star ? "ours" : bad ? "warn" : "base"}" style="width:${pct.toFixed(1)}%"></i></div>
              <span class="bar-num ${item.star ? "ours" : ""}">${v.toFixed(4)}</span>
            </div>
          </div>
          <span class="delta-pill ${item.star ? "" : bad ? "drop" : "neutral"}">${item.star ? (isZh() ? "完整模型" : "Full") : `$\\Delta$ ${diffTxt}`}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 4 与表 S4：去掉手腕运动监督使 AD $R^2$ 从 $0.5592$ 跌至 $0.3502$；省略 FDM 头部运动输入 $n_t$ 使 AD 跌至 $0.2242$；去掉二维变换一致性 $\\mathcal{L}_{\\mathrm{inv}}$ 会令相机敏感度升至 $1.1276$（超过真实动作响应）。"
        : "Tables 4 & S4: Removing wrist supervision drops AD $R^2$ from $0.5592 \\to 0.3502$; omitting FDM camera input $n_t$ drops AD to $0.2242$; removing view consistency $\\mathcal{L}_{\\mathrm{inv}}$ pushes IC-camera to $1.1276$ ($>1$).";
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
      statusBadge: "预印本 · 2026",
      topicBadge: "具身智能 · 第一视角潜动作",
      heroHeading: "Ego<span>LAM</span>",
      fullTitle: "EgoLAM：从手部与头部运动学习第一视角潜动作",
      authorNotes: "* 共同第一作者 · † 通讯作者。",
      affilSummary: "作者单位",
      affil1: "清华大学",
      affil2: "同济大学",
      affil3: "千诀科技（INFIFORCE）",
      affil4: "香港大学",
      affil5: "中国科学院自动化研究所",
      affil6: "华中科技大学",
      affil7: "武汉大学",
      affil8: "浙江大学",
      affil9: "中国科学院大学",
      heroLead:
        "EgoLAM 以统一头部参考系下的三维手腕运动监督潜动作，并将相机运动单独送入前向动力学模型，仅凭两帧第一视角图像即可提取抗转头干扰的操作表征。",
      btnPaper: "论文 PDF ↗",
      btnExplorer: "遮挡敏感度交互页 ↗",
      btnCode: "代码仓库 ↗",
      btnWeights: "模型权重 ↗",
      stageEyebrow: "交互式架构",
      stageTitle: "手部查询物体槽与相机解耦潜动作 $z_t$",
      modeClean: "常规视角",
      modeOcclusion: "遮挡峰值",
      metricVal1: "79.38<span>%</span>",
      metric1: "LIBERO 三大套件闭环平均成功率（较专家 BC 提升 $+28.73$ pp，较最强对比潜动作模型提升 $+9.76$ pp）",
      metricVal2: "0.534<span>3</span>",
      metric2: "8 个评测模型中最高的未见集三维手腕解码 $R^2$，缓存特征吞吐达 $1{,}180.45$ 对/秒",
      metricVal3: "17°<span> vs. 126°</span>",
      metric3: "举杯任务操作手三维位移方向误差对比 LAPA（相机敏感度 $0.767$，光照敏感度 $0.170$）",
      methodKicker: "核心三要素",
      methodHeading: "保留真实手腕操作几何，同时剥离佩戴者头部自运动。",
      p1Num: "01 · 手部查询",
      p1Title: "物体槽聚合与三维手腕读出",
      p1Body:
        "左右手查询在 $(o_t, o_{t+\\Delta})$ 的 8 个冻结 DINOv2 物体槽上聚合交互特征；瓶颈读出头直接监督统一早期头部坐标系下的双手平移与旋转 $a_t$。",
      p2Num: "02 · 视角解耦",
      p2Title: "头部运动条件 FDM 与梯度反转",
      p2Body:
        "实测相机运动 $n_t$ 单独输入前向模型以解释视角位移，配合梯度反转层（$\\operatorname{GRL}$）与二维图像变换一致性（$\\mathcal{L}_{\\mathrm{inv}}$）抑制 $z_t$ 中的相机泄漏。",
      p3Num: "03 · 模仿学习",
      p3Title: "仅需双帧 RGB 的离线标注与策略微调",
      p3Body:
        "推理阶段仅需两帧 RGB 图像而无需位姿标注。视觉策略 $\\pi_\\phi(o_{\\le t})$ 先预测冻结潜动作 $\\tilde{z}_t$，再联合解码器 $D_\\psi$ 微调 7 自由度机器人指令。",
      expKicker: "定量基准 · 表 1–4",
      expHeading: "LIBERO 闭环策略控制、手腕运动解码与视角干预诊断。",
      tabLibero: "LIBERO 闭环控制 (表 3)",
      tabDiag: "手腕解码与吞吐 (表 2)",
      tabLary: "LARYBench 评测 (表 1)",
      tabAblation: "关键消融 (表 4)",
      figKicker: "论文原图",
      figHeading: "物体槽架构、缓存吞吐效率与滑动遮挡敏感度分析。",
      zoomHint1: "放大查看 ↗",
      zoomHint2: "放大查看 ↗",
      zoomHint3: "放大查看 ↗",
      zoomHint4: "放大查看 ↗",
      f2Meta: "图 2 · 方法总览",
      f2Title: "物体槽预训练、手部监督 IDM 与双帧推理",
      f2Cap: "结合冻结 DINOv2 物体槽、双手查询聚合、三维手腕运动读出以及头部运动条件化的前向槽预测。",
      f1Meta: "图 1",
      f1Title: "为何像素重建与纯物体槽易混淆转头运动",
      f1Cap: "将手腕运动监督与相机条件前向预测分离，使佩戴者仅转头而手静止时潜动作保持近零。",
      f7Meta: "图 7",
      f7Title: "未见集动作解码 $R^2$ 与缓存吞吐率权衡",
      f7Cap: "以 $90.89\\mathrm{M}$ 总参数（动作分支 $1.35\\mathrm{M}$）实现 $R^2 = 0.534$ 与 $1{,}180.45$ 对/秒单线程吞吐（单对延迟 $0.85\\,\\mathrm{ms}$）。",
      f8Meta: "图 8 · 遮挡诊断",
      f8Title: "遮挡敏感度峰值窗口与 $17^\\circ$ 手腕方向对齐",
      f8Cap: "对操作手局部遮挡响应最集中，并以 $17^\\circ$ 误差恢复三维举杯方向（LAPA 为 $126^\\circ$，GeoLAM 为 $103^\\circ$）。",
      scopeKicker: "适用范围与边界",
      scopeTitle: "训练期标注假设与真实转头诊断",
      scopeP1:
        "<strong>训练期位姿监督、部署期纯视觉输入：</strong>阶段二在具备标注的样本上使用 EgoVerse 手腕/相机位姿与关键点（$1{,}056.9$ 小时潜动作池），而特征提取与策略伪标签生成仅需两帧 RGB 图像 $(o_t, o_{t+\\Delta})$。",
      scopeP2:
        "<strong>真实大角度转头与批处理吞吐：</strong>在配对 EgoVerse 大角度转头（$\\ge 15^\\circ$）片段上，EgoLAM 较 LAPA 显著抑制手腕平移误差增长（留出集 $+2.75$ vs. $+6.80\\,\\mathrm{cm}$），而旋转误差对比区间跨零；单对缓存延迟领先（$0.85$ vs. $1.47\\,\\mathrm{ms}$），批大小 $32$ 时 LAOM 更快（$8.42$ vs. $10.50\\,\\mathrm{ms}$）。",
      bibTitle: "BibTeX · 预印本 2026",
      morePages: "系列科研主页",
      sib1Tag: "预印本 · 2026",
      sib1Title: "EgoLAM",
      sib1Desc: "从手部与头部运动学习第一视角潜动作。",
      sib2Tag: "arXiv 2026",
      sib2Title: "Traj-LeWM",
      sib2Desc: "融合路径代价的轨迹感知世界模型规划。",
      sib3Tag: "ECCV 2026",
      sib3Title: "CausalVAE Plug-in",
      sib3Desc: "面向世界模型的模块化潜空间因果图插件。",
      sib4Tag: "arXiv 2026",
      sib4Title: "Intervene, Calibrate, Discover",
      sib4Desc: "基于可逆校准的像素级主动因果结构发现。",
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
