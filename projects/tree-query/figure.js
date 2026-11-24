(() => {
  const board = document.getElementById("stage-board");
  const svg = document.getElementById("fig-stage");
  const nodesHost = document.getElementById("stage-nodes");
  const pillsHost = document.getElementById("chapter-pills");
  const playBtn = document.getElementById("stage-play");
  const headingEl = document.getElementById("stage-heading");
  const detailEl = document.getElementById("stage-detail");
  if (!board || !svg || !nodesHost) return;

  const NS = "http://www.w3.org/2000/svg";
  const C = {
    accent: "#3c5e42",
    deep: "#233f35",
    clay: "#984b2a",
    muted: "#aeb8a9",
  };

  let regime = "latent";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Query Tree",
        title: "Decompose $(X_1, X_2)$ into 4 coarse-to-fine queries.",
        body: "Backdoor Path $\\to$ Independence $\\to$ Latent Confounder $\\to$ Causal Direction isolates each pair so errors never cascade across conditioning sets.",
      },
      {
        short: "2 · Clinic & MES",
        title: "Clinic Agent routes each query $Q$ to $m$ matched specialists.",
        body: "Graph, statistical, counterfactual, and domain experts vote independently to form baseline consensus $p_0 = 2p_0^{\\mathrm{raw}} - 1$.",
      },
      {
        short: "3 · Adversarial ACE",
        title: "Three adversarial personas challenge the majority verdict.",
        body: "Contrarian, Deceiver, and Hater argue for $\\bar{y}^\\star$; Proposition 4.6 equates $|p_j - p_0^{\\mathrm{raw}}|$ to the Wasserstein-1 shift $W_1(\\hat{\\mu}_{\\mathrm{ans}}, \\hat{\\mu}_{\\mathrm{adv},j})$.",
      },
      {
        short: "4 · Calibrated Graph",
        title: "DecisionRule separates $X_1 \\leftrightarrow X_2$ from $X_1 \\to X_2$.",
        body: "Tree-Query cuts SHD by $20.4$–$21.6$ edges on Latent benchmarks and screens Diet–Weight confounding from $0.67 \\to 0.03$.",
      },
    ],
    zh: [
      {
        short: "1 · 四级查询树",
        title: "将变量对 $(X_1, X_2)$ 解耦为由粗到细的四类因果查询",
        body: "依次检验后门路径 $\\to$ 条件独立 $\\to$ 潜在混杂 $\\to$ 因果方向，误差严格局限于当前变量对，避免 PC/FCI 链式误差传播。",
      },
      {
        short: "2 · 分诊与多专家",
        title: "Clinic Agent 按查询类型路由至 $m$ 位领域专家",
        body: "图结构、统计独立、反事实与机制专家独立投票，聚合得到初始共识强度 $p_0 = 2p_0^{\\mathrm{raw}} - 1$。",
      },
      {
        short: "3 · 对抗置信度 ACE",
        title: "三类对抗人格翻转结论并重询专家组以检验稳定性",
        body: "命题 4.6 证明偏移项 $|p_j - p_0^{\\mathrm{raw}}|$ 精确等于离散 Wasserstein-1 距离 $W_1(\\hat{\\mu}_{\\mathrm{ans}}, \\hat{\\mu}_{\\mathrm{adv},j})$。",
      },
      {
        short: "4 · 校准因果图",
        title: "聚合规则精准区分潜混杂 $X_1 \\leftrightarrow X_2$ 与直接因果 $X_1 \\to X_2$",
        body: "在潜混杂基准上较直接提示减少 $20.4$–$21.6$ 条结构错误（SHD），并将饮食—体重混杂度从 $0.67$ 筛降至 $0.03$。",
      },
    ],
  };

  function lang() {
    return document.documentElement.lang === "zh-CN" ? "zh" : "en";
  }

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    svg.appendChild(node);
    return node;
  }

  function arrowHead(tipX, tipY, ux, uy, color, headLen = 6.2, headHalfW = 3.1, opacity = 1) {
    const bx = tipX - ux * headLen;
    const by = tipY - uy * headLen;
    const nx = -uy;
    const ny = ux;
    const pts = [
      `${tipX.toFixed(2)},${tipY.toFixed(2)}`,
      `${(bx + nx * headHalfW).toFixed(2)},${(by + ny * headHalfW).toFixed(2)}`,
      `${(bx - nx * headHalfW).toFixed(2)},${(by - ny * headHalfW).toFixed(2)}`,
    ].join(" ");
    svgEl("polygon", { points: pts, fill: color, opacity });
  }

  function drawLineArrow(x1, y1, x2, y2, opts = {}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 2) return;
    const ux = dx / len;
    const uy = dy / len;
    const color = opts.color || C.deep;
    const headLen = opts.headLen || 6.2;
    const headHalfW = opts.headHalfW || 3.1;
    const opacity = opts.opacity ?? 1;
    const attrs = {
      x1: x1.toFixed(2),
      y1: y1.toFixed(2),
      x2: (x2 - ux * headLen * 0.78).toFixed(2),
      y2: (y2 - uy * headLen * 0.78).toFixed(2),
      stroke: color,
      "stroke-width": opts.width || 1.8,
      "stroke-linecap": "round",
      opacity,
    };
    if (opts.dash) attrs["stroke-dasharray"] = opts.dash;
    svgEl("line", attrs);
    arrowHead(x2, y2, ux, uy, color, headLen, headHalfW, opacity);
  }

  function measureNodes() {
    const b = board.getBoundingClientRect();
    const map = {};
    board.querySelectorAll("[data-node]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const left = r.left - b.left;
      const top = r.top - b.top;
      const right = r.right - b.left;
      const bottom = r.bottom - b.top;
      map[el.dataset.node] = {
        left,
        top,
        right,
        bottom,
        width: r.width,
        height: r.height,
        cx: (left + right) / 2,
        cy: (top + bottom) / 2,
      };
    });
    return { w: b.width, h: b.height, map };
  }

  function drawWires() {
    svg.replaceChildren();
    const { w, h, map } = measureNodes();
    if (w < 10 || h < 10) return;
    svg.setAttribute("viewBox", `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);

    const { q1, q2, q3, q4, mes, ace, out } = map;
    if (!q1 || !q2 || !q3 || !q4 || !mes || !ace || !out) return;

    const isLat = regime === "latent";

    // Row 1: Query Tree horizontal progression
    drawLineArrow(q1.right + 3, q1.cy, q2.left - 3, q2.cy, {
      color: step === 0 ? C.deep : C.accent,
      width: step === 0 ? 2.0 : 1.65,
    });
    drawLineArrow(q2.right + 3, q2.cy, q3.left - 3, q3.cy, {
      color: isLat ? C.clay : C.deep,
      width: step === 0 ? 2.0 : 1.65,
    });
    drawLineArrow(q3.right + 3, q3.cy, q4.left - 3, q4.cy, {
      color: isLat ? C.muted : C.deep,
      width: isLat ? 1.45 : 1.85,
      dash: isLat ? "4 3" : "",
    });

    // Vertical feed from Query Tree (Col 1) down into MES Panel (Cols 1-2)
    drawLineArrow(q1.cx, q1.bottom + 2.5, q1.cx, mes.top - 2.5, {
      color: step === 1 ? C.deep : C.muted,
      width: step === 1 ? 1.95 : 1.5,
      dash: step >= 1 ? "" : "4 3",
      headLen: 5.6,
      headHalfW: 2.8,
    });

    // Row 2: MES -> ACE -> Aggregated Output
    drawLineArrow(mes.right + 3, mes.cy, ace.left - 3, ace.cy, {
      color: step >= 2 ? C.clay : C.muted,
      width: step === 2 ? 2.0 : 1.55,
      dash: step >= 2 ? "" : "4 3",
    });
    drawLineArrow(ace.right + 3, ace.cy, out.left - 3, out.cy, {
      color: step >= 3 ? (isLat ? C.clay : C.deep) : C.muted,
      width: step === 3 ? 2.0 : 1.55,
      dash: step >= 3 ? "" : "4 3",
    });

    // Vertical branch aggregation from Row 1 into Output (Col 4)
    drawLineArrow(q4.cx, q4.bottom + 2.5, out.cx, out.top - 2.5, {
      color: step === 3 ? (isLat ? C.clay : C.deep) : C.muted,
      width: step === 3 ? 1.9 : 1.45,
      dash: isLat ? "4 3" : "",
      headLen: 5.6,
      headHalfW: 2.8,
    });
  }

  function renderPills() {
    const list = chapters[lang()];
    pillsHost.replaceChildren();
    list.forEach((ch, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = ch.short;
      b.setAttribute("aria-pressed", String(idx === step));
      b.addEventListener("click", () => {
        stopPlay();
        step = idx;
        draw();
      });
      pillsHost.appendChild(b);
    });
    if (window.renderMathIn) window.renderMathIn(pillsHost);
  }

  function draw() {
    const isLat = regime === "latent";
    const zh = lang() === "zh";

    const stripTitle = isLat
      ? (zh ? "潜混杂修改基准（Qwen2.5-7B · 表 1，SHD 越低越好）" : "Modified Latent Benchmark (Qwen2.5-7B · Table 1, SHD ↓)")
      : (zh ? "饮食 → 体重 混杂筛查（加入运动与基础代谢率 BMR · 图 4）" : "Diet → Weight Confounder Screening (+Exercise, BMR · Fig. 4)");
    const stripSub = isLat
      ? (zh ? "Direct LLM SHD 59.1 → Tree-Query 38.7（减少 20.4 处错误，NDCG 0.76）" : "Direct LLM SHD 59.1 → Tree-Query 38.7 (−20.4 errors, NDCG 0.76)")
      : (zh ? "潜在混杂置信度从 0.67 骤降至 0.03 · 因果方向保持 0.97" : "Confounding drops 0.67 → 0.03 · Diet → Weight holds at 0.97");

    const bW = isLat ? (59.1 / 72) * 100 : 67;
    const oW = isLat ? (38.7 / 72) * 100 : 97;
    const bLbl = isLat ? "59.1" : "0.67";
    const oLbl = isLat ? "38.7" : "0.97";

    nodesHost.innerHTML = `
      <div class="tq-grid">
        <div class="stage-box tq-cell-q1 ${step === 0 ? "is-active" : ""}" data-node="q1">
          <div class="stage-box-title">1 · ${zh ? "后门路径" : "Backdoor"}</div>
          <div class="stage-box-sub">${
            isLat
              ? `${T("\\hat{y} = 0")} (${zh ? "无观测后门" : "no obs. path"})`
              : `${T("\\hat{y} = 1")} (${zh ? "阻断协变量" : "after block"})`
          }</div>
        </div>

        <div class="stage-box tq-cell-q2 ${step === 0 ? "is-active" : ""}" data-node="q2">
          <div class="stage-box-title">2 · ${zh ? "条件独立" : "Independence"}</div>
          <div class="stage-box-sub">${T("\\hat{y} = 0")} (${T("X_1 \\not\\perp X_2")})</div>
        </div>

        <div class="stage-box tq-cell-q3 ${step === 0 && !isLat ? "is-active" : ""} ${isLat ? "is-clay" : ""}" data-node="q3">
          <div class="stage-box-title">3 · ${zh ? "潜在混杂" : "Confounder"}</div>
          <div class="stage-box-sub">${
            isLat
              ? `${T("\\hat{y} = 1")} (${T("X_1 \\leftrightarrow X_2")})`
              : `${T("\\hat{y} = 0")} (${T("c_{\\leftrightarrow} = 0.03")})`
          }</div>
        </div>

        <div class="stage-box tq-cell-q4 ${!isLat && step === 0 ? "is-active" : ""} ${isLat ? "tq-box-muted" : ""}" data-node="q4">
          <div class="stage-box-title">4 · ${zh ? "因果方向" : "Direction"}</div>
          <div class="stage-box-sub">${
            isLat
              ? `${zh ? "早停于" : "Early-stop"} ${T("X_1 \\leftrightarrow X_2")}`
              : `${T("X_1 \\to X_2")} (0.97)`
          }</div>
        </div>

        <div class="stage-box tq-cell-mes ${step === 1 ? "is-active" : ""}" data-node="mes">
          <div class="stage-box-title">${zh ? "分诊与多专家组 (MES)" : "Clinic & MES Panel"}</div>
          <div class="stage-box-sub">${
            zh
              ? `路由 ${T("m")} 位领域专家 · 初始共识 ${T("p_0 = 2p_0^{\\mathrm{raw}} - 1")}`
              : `Select ${T("m")} specialists · consensus ${T("p_0 = 2p_0^{\\mathrm{raw}} - 1")}`
          }</div>
        </div>

        <div class="stage-box tq-cell-ace ${step === 2 ? "is-clay" : ""}" data-node="ace">
          <div class="stage-box-title">${zh ? "对抗检验 (ACE)" : "Adversarial ACE"}</div>
          <div class="stage-box-sub">${T("W_1(\\hat{\\mu}_{\\mathrm{ans}}, \\hat{\\mu}_{\\mathrm{adv}})")}</div>
        </div>

        <div class="stage-box tq-cell-out ${step === 3 && !isLat ? "is-active" : ""} ${step === 3 && isLat ? "is-clay" : ""}" data-node="out">
          <div class="stage-box-title">${T(isLat ? "\\hat{R}: X_1 \\leftrightarrow X_2" : "\\hat{R}: \\mathrm{Diet} \\to \\mathrm{Wt}")}</div>
          <div class="stage-box-sub">${
            isLat
              ? `${T("\\hat{c} = 0.84")} (${zh ? "图 1" : "Fig. 1"})`
              : `${T("\\hat{c} = 0.97,\\; c_{\\leftrightarrow} = 0.03")}`
          }</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${isLat ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill base" style="width:${bW.toFixed(1)}%"></i></div>
            <span class="stage-mini-num">${bLbl}</span>
          </div>
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ours" style="width:${oW.toFixed(1)}%"></i></div>
            <span class="stage-mini-num ours">${oLbl}</span>
          </div>
        </div>
      </div>
    `;

    const list = chapters[lang()];
    [...pillsHost.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === step)));
    headingEl.innerHTML = list[step].title;
    detailEl.innerHTML = list[step].body;
    if (window.renderMathIn) {
      window.renderMathIn(headingEl);
      window.renderMathIn(detailEl);
    }

    drawWires();
    requestAnimationFrame(drawWires);
  }

  function stopPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    playBtn.textContent = lang() === "zh" ? "播放" : "Play";
  }

  function startPlay() {
    stopPlay();
    playBtn.textContent = lang() === "zh" ? "暂停" : "Pause";
    timer = setInterval(() => {
      step = (step + 1) % 4;
      draw();
      if (step === 3) stopPlay();
    }, 2800);
  }

  playBtn.addEventListener("click", () => {
    if (timer) stopPlay();
    else {
      if (step === 3) step = 0;
      draw();
      startPlay();
    }
  });

  document.querySelectorAll("[data-regime]").forEach((btn) => {
    btn.addEventListener("click", () => {
      regime = btn.dataset.regime;
      document.querySelectorAll("[data-regime]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.regime === regime))
      );
      draw();
    });
  });

  window.addEventListener("ziyi-lang-change", () => {
    stopPlay();
    renderPills();
    draw();
  });

  if (window.ResizeObserver) {
    new ResizeObserver(() => drawWires()).observe(board);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => drawWires());
  }

  renderPills();
  draw();
})();
