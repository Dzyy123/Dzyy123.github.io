(() => {
  // Exact values from EMNLP 2026 (arXiv:2605.25891) Tables 1, 3, 10, Figure 5 & Section 6.3
  const SCALING_MODELS = [
    { name: "Qwen2.5-0.5B-Instruct", meta: "494M · Best L16 · Haar 57.1%", probe: 96.9, out: 35.0, gap: "+0.619", star: true },
    { name: "Qwen2.5-1.5B-Instruct", meta: "1.54B · Best L16 · Haar 57.4%", probe: 99.4, out: 47.5, gap: "+0.519" },
    { name: "Qwen2.5-3B-Instruct", meta: "3.09B · Best L28 · Haar 59.7%", probe: 98.8, out: 46.3, gap: "+0.525" },
    { name: "DeepSeek-LLM-7B-Chat", meta: "6.91B · Best L16 · Cross-family", probe: 97.5, out: 47.5, gap: "+0.500" },
    { name: "Mistral-7B-Instruct-v0.3", meta: "7.25B · Best L16 · Cross-family", probe: 98.1, out: 48.7, gap: "+0.494" },
    { name: "Qwen2.5-7B-Instruct", meta: "7.62B · Best L8 · Primary audit", probe: 99.4, out: 50.0, gap: "+0.494", star: true },
    { name: "Qwen2.5-14B-Instruct", meta: "14.8B · Best L28 · Haar 65.9%", probe: 99.4, out: 52.5, gap: "+0.469" },
    { name: "Qwen2.5-32B-NF4", meta: "32.8B · Best L32 · 4-bit NF4", probe: 99.4, out: 48.7, gap: "+0.506" },
    { name: "Qwen2.5-72B-NF4", meta: "72.7B · Best L32 · $144\\times$ scale", probe: 100.0, out: 50.0, gap: "+0.500", star: true },
  ];

  // Table 1: Counterfactual-KL Lesion on Qwen-7B Layer 27 (N=30 minimal pairs)
  const LESION_KL = [
    { name: "Project out $V_{\\mathrm{cs}}$ (Target)", meta: "$D_{\\mathrm{KL}}^{\\mathrm{cs}}: 0.252 \\to 0.009$ · 95% CI $[−97.0\\%, −95.4\\%]$", mag: 96.3, label: "−96.3% KL", highlight: true, clay: false },
    { name: "Project out $V_{\\mathrm{ns}}$ (Sham)", meta: "Nonsense-subset matched-rank subspace $[−33.7\\%, −29.7\\%]$", mag: 31.7, label: "−31.7% KL" },
    { name: "LEACE Label Erasure", meta: "Closed-form linear concept erasure baseline", mag: 21.6, label: "−21.6% KL" },
    { name: "Project out $V_{\\mathrm{rand}}$ (Haar)", meta: "Haar-random direction of identical rank $[−1.3\\%, +2.8\\%]$", mag: 1.5, label: "+0.7% (Null)", clay: true },
  ];

  // Figure 5: Activation Patching on N=42 wrong anti-CS items (Qwen-7B Layer 27)
  const PATCH_DATA = [
    { name: "Patch A · Full Matched-CS State", meta: "Copy layer-27 last-token state from matched CS donor", acc: 57.1, tag: "Flips 57.1%", highlight: true },
    { name: "Control · Random Donor State", meta: "Unmatched random hidden-state donor", acc: 31.0, tag: "Below chance" },
    { name: "Patch B · Mean $V_{\\mathrm{cs}}$ Direction", meta: "Single-direction mean injection", acc: 19.0, tag: "Partial" },
    { name: "No Patch / Self-Injection", meta: "Baseline on the $N = 42$ initially wrong items", acc: 0.0, tag: "0.0% baseline", clay: true },
  ];

  // Section 6.3 & Table 22: Answer-Interface Ladder (Qwen-7B anti-CS)
  const INTERFACE_LADDER = [
    { name: "Directed-Edge Choice ($c \\to e$ vs. $e \\to c$)", meta: "Contrasting the two explicit edge directions", acc: 98.8, tag: "98.8%", highlight: true },
    { name: "Symbolic Arrow Readout", meta: "Structured $c \\to e$ vs. $e \\to c$ completion", acc: 71.3, tag: "71.3%" },
    { name: "Correct-Edge Bridge", meta: "Intermediate structured edge bridge", acc: 58.8, tag: "58.8%" },
    { name: "A/B Proposition Reframe (Table 22)", meta: "(A) Yes, $c$ causes $e$ · (B) No, $c$ does not ($\\Delta = +0.595$)", acc: 37.5, tag: "Still fails", clay: true },
    { name: "Plain Yes/No (“Did $c$ cause $e$?”)", meta: "Standard benchmark answer slot", acc: 26.3, tag: "Bottleneck", clay: true },
  ];

  // Table 3: Cross-Dataset Probe Transfer (Qwen-7B Layer 24)
  const TRANSFER_DATA = [
    { name: "CLadder anti-CS $\\to$ CLadder CS", meta: "Symmetry check (in-dist CV: $97.5\\% \\pm 2.3\\%$)", acc: 97.5, tag: "Gap 0.000", highlight: true },
    { name: "CLadder CS $\\to$ CLadder anti-CS", meta: "Symmetry check (in-dist CV: $99.4\\% \\pm 1.3\\%$)", acc: 96.9, tag: "$|\\Delta_{\\mathrm{sym}}| = 0.006$", highlight: true },
    { name: "CLadder CS $\\to$ CounterBench Transitive", meta: "Zero-shot transfer to nonsense-entity multi-hop ($N = 160$)", acc: 91.3, tag: "In-dist 98.8%" },
    { name: "CLadder CS $\\to$ CounterBench Adjacent", meta: "Zero-shot transfer to nonsense-entity direct edges ($N = 160$)", acc: 84.4, tag: "In-dist 98.1%" },
  ];

  let audit = "scaling";
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

    if (audit === "scaling") {
      legendEl.innerHTML = isZh()
        ? `<span><i class="swatch swatch--ours"></i> 冻结隐状态探针（$\\mathrm{Acc}_{\\mathrm{probe}}$）</span><span><i class="swatch swatch--clay"></i> 口头 Yes/No 输出（$\\mathrm{Acc}_{\\mathrm{out}}$）</span>`
        : `<span><i class="swatch swatch--ours"></i> Frozen hidden-state probe ($\\mathrm{Acc}_{\\mathrm{probe}}$)</span><span><i class="swatch swatch--clay"></i> Verbal Yes/No output ($\\mathrm{Acc}_{\\mathrm{out}}$)</span>`;

      SCALING_MODELS.forEach((m) => {
        const row = document.createElement("div");
        row.className = "paired-row" + (m.star ? " highlight" : "");
        row.innerHTML = `
          <div class="paired-name">${m.name}<small>${m.meta}</small></div>
          <div class="bars-stack">
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill ours" style="width:${m.probe}%"></i></div>
              <span class="bar-num ours">${m.probe.toFixed(1)}%</span>
            </div>
            <div class="bar-line">
              <div class="bar-track"><i class="bar-fill warn" style="width:${m.out}%"></i></div>
              <span class="bar-num">${m.out.toFixed(1)}%</span>
            </div>
          </div>
          <span class="delta-pill">$\\Delta$ ${m.gap}</span>
        `;
        rowsHost.appendChild(row);
      });

      takeawayEl.innerHTML = isZh()
        ? "表 10：8 个主模型（0.5B–72B）+ DeepSeek-7B 复现中，$\\mathrm{Acc}_{\\mathrm{probe}}$ 达 96.9%–100%，口头 $\\mathrm{Acc}_{\\mathrm{out}}$ 仅 35.0%–52.5%。"
        : "Table 10: Across 8 primary models (0.5B–72B) + DeepSeek-7B replication, $\\mathrm{Acc}_{\\mathrm{probe}}$ hits 96.9%–100% while $\\mathrm{Acc}_{\\mathrm{out}}$ stays at 35.0%–52.5%.";
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    if (audit === "lesion") {
      const tabs = [
        isZh() ? "$V_{\\mathrm{cs}}$ KL 擦除 (表 1)" : "$V_{\\mathrm{cs}}$ KL Lesion (Table 1)",
        isZh() ? "L27 激活修补 (图 5)" : "L27 Patching (Fig. 5)",
      ];
      if (subIdx >= 2) subIdx = 0;
      tabs.forEach((lbl, idx) => {
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

      if (subIdx === 0) {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> 成对反事实 KL 下降幅度（Qwen-7B L27, $N = 30$）</span>`
          : `<span><i class="swatch swatch--ours"></i> Counterfactual-KL drop magnitude (Qwen-7B L27, $N = 30$)</span>`;
        LESION_KL.forEach((item) => {
          const row = document.createElement("div");
          row.className = "paired-row" + (item.highlight ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${item.meta}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ${item.clay ? "warn" : item.highlight ? "ours" : "base"}" style="width:${Math.max(2, item.mag)}%"></i></div>
                <span class="bar-num ours">${item.mag.toFixed(1)}%</span>
              </div>
            </div>
            <span class="delta-pill ${item.clay ? "neutral" : ""}">${item.label}</span>
          `;
          rowsHost.appendChild(row);
        });
        takeawayEl.innerHTML = isZh()
          ? "表 1：正交消去 $V_{\\mathrm{cs}}$ 抹除 96.3% 反事实 KL，同秩随机方向 $V_{\\mathrm{rand}}$（+0.7%）与 LEACE（−21.6%）无此效应。"
          : "Table 1: Projecting out $V_{\\mathrm{cs}}$ erases 96.3% of counterfactual KL; Haar $V_{\\mathrm{rand}}$ (+0.7%) and LEACE (−21.6%) do not.";
      } else {
        legendEl.innerHTML = isZh()
          ? `<span><i class="swatch swatch--ours"></i> $N = 42$ 道原答错反常识题翻转准确率</span>`
          : `<span><i class="swatch swatch--ours"></i> Accuracy on $N = 42$ wrong anti-CS items after L27 patching</span>`;
        PATCH_DATA.forEach((item) => {
          const row = document.createElement("div");
          row.className = "paired-row" + (item.highlight ? " highlight" : "");
          row.innerHTML = `
            <div class="paired-name">${item.name}<small>${item.meta}</small></div>
            <div class="bars-stack">
              <div class="bar-line">
                <div class="bar-track"><i class="bar-fill ${item.highlight ? "ours" : item.clay ? "warn" : "base"}" style="width:${Math.max(2, item.acc)}%"></i></div>
                <span class="bar-num ours">${item.acc.toFixed(1)}%</span>
              </div>
            </div>
            <span class="delta-pill ${item.clay ? "drop" : item.highlight ? "" : "neutral"}">${item.tag}</span>
          `;
          rowsHost.appendChild(row);
        });
        takeawayEl.innerHTML = isZh()
          ? "图 5：单向 $V_{\\mathrm{cs}}$ 均值注入仅翻转 19.0%，整层匹配激活替换可翻转 57.1% 错题（随机供体 31.0%）。"
          : "Fig. 5: Mean-$V_{\\mathrm{cs}}$ steering flips 19.0%, whereas full matched-donor state patching flips 57.1% (random: 31.0%).";
      }
      if (window.renderMathIn) window.renderMathIn(workbenchEl);
      return;
    }

    // Interface & Transfer
    const tabs = [
      isZh() ? "回答接口阶梯 (图 6 & 表 22)" : "Interface Ladder (Fig. 6 & Tab. 22)",
      isZh() ? "CounterBench 零样本迁移 (表 3)" : "CounterBench Transfer (Table 3)",
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

    const data = subIdx === 0 ? INTERFACE_LADDER : TRANSFER_DATA;
    legendEl.innerHTML = subIdx === 0
      ? (isZh()
        ? `<span><i class="swatch swatch--ours"></i> 相同题干下仅改变回答槽位（Qwen-7B anti-CS）</span>`
        : `<span><i class="swatch swatch--ours"></i> Identical story, varying only the answer slot (Qwen-7B anti-CS)</span>`)
      : (isZh()
        ? `<span><i class="swatch swatch--ours"></i> 冻结探针零样本迁移准确率（Qwen-7B L24）</span>`
        : `<span><i class="swatch swatch--ours"></i> Frozen probe zero-shot transfer (Qwen-7B Layer 24)</span>`);

    data.forEach((item) => {
      const row = document.createElement("div");
      row.className = "paired-row" + (item.highlight ? " highlight" : "");
      row.innerHTML = `
        <div class="paired-name">${item.name}<small>${item.meta}</small></div>
        <div class="bars-stack">
          <div class="bar-line">
            <div class="bar-track"><i class="bar-fill ${item.clay ? "warn" : item.highlight ? "ours" : "base"}" style="width:${item.acc}%"></i></div>
            <span class="bar-num ours">${item.acc.toFixed(1)}%</span>
          </div>
        </div>
        <span class="delta-pill ${item.clay ? "drop" : ""}">${item.tag}</span>
      `;
      rowsHost.appendChild(row);
    });

    takeawayEl.innerHTML = subIdx === 0
      ? (isZh()
        ? "关键区分：仅把 Yes/No 改写成 A/B 命题仍失败（37.5%）；显式对比两条有向边（$c \\to e$ vs. $e \\to c$）才能跃升至 98.8%。"
        : "Key distinction: Reframing Yes/No into A/B propositions still fails (37.5%); contrasting directed edges ($c \\to e$ vs. $e \\to c$) reaches 98.8%.")
      : (isZh()
        ? "表 3：CLadder 常识探针零样本迁移至无意义实体 CounterBench 达 84.4% / 91.3%，正反子集对称差 $|\\Delta_{\\mathrm{sym}}| = 0.006$。"
        : "Table 3: CLadder-CS probe transfers zero-shot to nonsense-entity CounterBench at 84.4% / 91.3% ($|\\Delta_{\\mathrm{sym}}| = 0.006$).");
    if (window.renderMathIn) window.renderMathIn(workbenchEl);
  }

  document.querySelectorAll("#audit-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      audit = btn.dataset.audit;
      subIdx = 0;
      document.querySelectorAll("#audit-tabs button").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.audit === audit))
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
      navMethod: "2×2 视角",
      navResults: "实验证据",
      navFigures: "图表",
      navCite: "引用",
      navPaper: "论文 ↗",
      topicBadge: "大模型因果推理",
      fullTitle: "大模型隐状态能够编码因果方向，但其 Yes/No 输出无法表达",
      authorNotes: "* 通讯作者。",
      affilSummary: "作者单位",
      heroLead:
        "口头答错，内部可恢复。跨 8 个指令微调模型（0.5B–72B），冻结隐状态探针在反常识 CLADDER 上达 ≥96.9%，而口头 Yes/No 停留在 35.0%–52.5%。",
      btnPaper: "论文 PDF ↗",
      btnPoster: "海报 ↗",
      stageEyebrow: "单次前向传播",
      stageTitle: "同一隐状态，相反因果结论",
      modeReadout: "双路读出",
      modeLesion: "$V_{\\mathrm{cs}}$ 擦除",
      metric1: "隐层线性探针准确率 vs. 口头 Yes/No（35.0–52.5%）",
      metric2: "擦除 $V_{\\mathrm{cs}}$ 导致的反事实 KL 坍缩（随机基线 $+0.7\\%$）",
      metric3: "普通 Yes/No vs. 显式对比有向边（$c \\to e$ vs. $e \\to c$）",
      methodKicker: "2×2 诊断",
      methodHeading: "分离“内部可恢复性”与“外部语言表达”。",
      p1Title: "常识拟合，跨集冻结",
      p1Body: "仅在常识样本拟合探针 $g_w(h)$ 与子空间 $V_{\\mathrm{cs}}$，全程不更新任何大模型权重。",
      p2Title: "内部参与，出口受阻",
      p2Body: "擦除 $V_{\\mathrm{cs}}$ 抹去 96.3% 反事实 KL；第 27 层整层修补可翻转 57.1% 错题。",
      p3Title: "对比有向边而非改标签",
      p3Body: "仅改写成 A/B 命题仍失败（37.5%），显式对比 $c \\to e$ 与 $e \\to c$ 才能达 98.8%。",
      expKicker: "实验证据 · 表 1、3、10、22",
      expHeading: "尺度扫描、子空间擦除与回答接口对比。",
      tabScaling: "0.5B–72B 尺度 (表 10)",
      tabLesion: "KL 擦除与激活修补",
      tabInterface: "接口对比与跨库迁移",
      figKicker: "原图与海报",
      figHeading: "论文图表与 EMNLP 2026 海报。",
      zoomFig: "放大 ↗",
      zoomPoster: "放大海报 ↗",
      f3Title: "内部信号饱和，口头回答停滞",
      f3Cap: "参数放大 $144\\times$（$0.5\\text{B} \\to 72\\text{B}$）仍无法闭合 $\\Delta \\approx +0.50$ 读出鸿沟。",
      f1Title: "2×2 基准分类",
      f1Cap: "区分因果失语（格 b）与表面捷径的因果鹦鹉（格 c）。",
      f2Title: "一次前向传播，两个相反答案",
      f2Cap: "两条读出分支共享同一末尾词冻结残差激活 $h^{(\\ell^\\star)}$ / $h^{(L)}$。",
      f4Title: "−96.3% 反事实 KL 擦除",
      f4Cap: "伪控制 $V_{\\mathrm{ns}}$（−31.7%）、LEACE（−21.6%）与随机方向 $V_{\\mathrm{rand}}$（+0.7%）均无此坍缩。",
      f6Title: "回答接口阶梯",
      f6Cap: "显式对比有向边在 7B–72B 上一致解锁高准确率。",
      posterTitle: "EMNLP 2026 获奖提名海报",
      posterCap: "2×2 框架、尺度曲线、KL 擦除与边对比实验总览。",
      scopeKicker: "边界说明",
      scopeTitle: "这是一项测量诊断，而非通用修复",
      scopeP1:
        "<strong>操作性定义：</strong>线性可恢复性诊断的是受控文本问答上的表征—输出落差，不等同于人类式理解或传感器因果发现。",
      scopeP2:
        "<strong>控制与模板边界：</strong>单标量 $V_{\\mathrm{cs}}$ 推拉不足以翻转 Yes/No（整层修补翻转 57.1%），且探针方向具有模板与层位条件化特征（跨模板均值 0.672）。",
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
