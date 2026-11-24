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

  let regime = "calibrated";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Frozen $E_\\theta$",
        title: "Frozen visual encoder maps pixels $x \\to z = E_\\theta(x)$.",
        body: "Concept labels align latent axes with physical variables, while scale and nonlinear readout errors remain inside $z_j$.",
      },
      {
        short: "2 · Calibrate $T$",
        title: "Round-robin verified targets ($B_{\\mathrm{cal}}$) fit invertible $T_{\\phi,j}$.",
        body: "Standardized $h(x) = (T(E_\\theta(x)) - \\mu^c)/\\sigma^c$ aligns visual readouts with command settings $q_j(u)$, cutting Domino readout MSE from $22.37 \\to 12.86$ ($\\times 10^{-3}$).",
      },
      {
        short: "3 · Orient $\\hat{G}$",
        title: "Active interventions ($B_{\\mathrm{graph}}$) orient ambiguous CPDAG edges.",
        body: "Observational PC tests leave $6$ unoriented Domino edges; active single-target $\\mathrm{do}(s_j = u)$ recovers $\\mathrm{SHD} = 0$ on Physical Domino and Pick-and-Place.",
      },
      {
        short: "4 · Mechanisms $\\hat{f}_j$",
        title: "Local mechanisms fit parent sets and lock factual residuals $\\eta_j^{\\mathrm{fact}}$.",
        body: "Ridge mechanisms $\\hat{f}_j(h_{\\mathrm{Pa}(j)})$ operate in frozen $h$ coordinates, preserving factual context $\\eta_j^{\\mathrm{fact}}$ on non-descendants.",
      },
      {
        short: "5 · Inverse $T^{-1}$",
        title: "Inverse calibration $T^{-1}$ returns $h^{\\mathrm{cf}}$ to frozen decoder $D_\\psi$.",
        body: "Propagating $q_j(u)$ along $\\hat{G}$ and inverting via $T^{-1}$ achieves the lowest counterfactual RGB MSE in $7/8$ benchmark columns.",
      },
    ],
    zh: [
      {
        short: "1 · 冻结 $E_\\theta$",
        title: "冻结视觉编码器提取节点对齐潜变量 $z = E_\\theta(x)$",
        body: "概念标签对齐节点语义，但原始视觉读出 $z_j$ 仍存在尺度、偏置与非线性数值偏差。",
      },
      {
        short: "2 · 可逆校准 $T$",
        title: "固定轮询核验干预（$B_{\\mathrm{cal}}$）拟合严格单调映射 $T_{\\phi,j}$",
        body: "标准化读出 $h(x) = (T(E_\\theta(x)) - \\mu^c)/\\sigma^c$ 与指令设定 $q_j(u)$ 共享数值单位，使 Domino 读出 MSE 从 $22.37$ 降至 $12.86$（$\\times 10^{-3}$）。",
      },
      {
        short: "3 · 主动定向 $\\hat{G}$",
        title: "主动目标干预（$B_{\\mathrm{graph}}$）消解观测等价类方向歧义",
        body: "等量额外纯观测仍留有 $6$ 条未定向边；主动单目标干预 $\\mathrm{do}(s_j = u)$ 在物理 Domino 与 Pick-and-Place 上实现 $\\mathrm{SHD} = 0$。",
      },
      {
        short: "4 · 局部机制 $\\hat{f}_j$",
        title: "在冻结 $h$ 坐标下拟合父节点机制并提取事实残差 $\\eta_j^{\\mathrm{fact}}$",
        body: "局部回归机制 $\\hat{f}_j(h_{\\mathrm{Pa}(j)})$ 传播后代节点响应，同时保持非后代节点的事实残差 $\\eta_j^{\\mathrm{fact}}$ 不变。",
      },
      {
        short: "5 · 逆映射 $T^{-1}$",
        title: "经逆校准 $T^{-1}$ 回到冻结解码器 $D_\\psi$ 生成反事实像素",
        body: "沿 $\\hat{G}$ 传播 $q_j(u)$ 并通过 $T^{-1}$ 还原坐标，在 $7/8$ 个评测列中取得最低反事实图像 RGB MSE。",
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

  function arrowHead(tipX, tipY, ux, uy, color, headLen = 6.6, headHalfW = 3.3, opacity = 1) {
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
    const headLen = opts.headLen || 6.6;
    const headHalfW = opts.headHalfW || 3.3;
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

  function drawCubicArrow(x1, y1, cx1, cy1, cx2, cy2, x2, y2, opts = {}) {
    const color = opts.color || C.deep;
    const headLen = opts.headLen || 6.4;
    const headHalfW = opts.headHalfW || 3.2;
    const opacity = opts.opacity ?? 1;
    let tx = x2 - cx2;
    let ty = y2 - cy2;
    if (Math.hypot(tx, ty) < 1e-3) {
      tx = x2 - x1;
      ty = y2 - y1;
    }
    const tLen = Math.hypot(tx, ty) || 1;
    const ux = tx / tLen;
    const uy = ty / tLen;
    const endX = x2 - ux * headLen * 0.75;
    const endY = y2 - uy * headLen * 0.75;
    const attrs = {
      d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} C ${cx1.toFixed(2)} ${cy1.toFixed(2)}, ${cx2.toFixed(2)} ${cy2.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`,
      fill: "none",
      stroke: color,
      "stroke-width": opts.width || 1.65,
      "stroke-linecap": "round",
      opacity,
    };
    if (opts.dash) attrs["stroke-dasharray"] = opts.dash;
    svgEl("path", attrs);
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

    const uncal = regime === "uncalibrated";
    const { pcal, pgraph, pix, cal, dag, cf, unit, res } = map;
    if (!pix || !cal || !dag || !cf || !unit || !res) return;

    const mainCol = uncal ? C.clay : C.deep;

    // 1. Top budget pills -> Stage 1 calibration & Stage 2 discovery
    if (pcal) {
      drawLineArrow(pcal.cx, pcal.bottom + 2.5, cal.cx, cal.top - 3, {
        color: uncal ? C.clay : step === 1 ? C.accent : C.muted,
        width: step === 1 ? 1.9 : 1.45,
        dash: uncal ? "3 2.5" : "",
        headLen: 5.8,
        headHalfW: 2.9,
      });
    }
    if (pgraph) {
      drawLineArrow(pgraph.cx, pgraph.bottom + 2.5, dag.cx, dag.top - 3, {
        color: step === 2 ? C.accent : C.muted,
        width: step === 2 ? 1.9 : 1.45,
        dash: step >= 2 ? "" : "3 2.5",
        headLen: 5.8,
        headHalfW: 2.9,
      });
    }

    // 2. Horizontal 4-stage pipeline spine
    const ySpine = cal.cy;
    drawLineArrow(pix.right + 3, ySpine, cal.left - 3, ySpine, {
      color: step >= 1 ? mainCol : C.muted,
      width: step >= 1 ? 1.95 : 1.5,
      dash: step >= 1 ? "" : "4 3",
    });

    drawLineArrow(cal.right + 3, ySpine, dag.left - 3, ySpine, {
      color: step >= 2 ? mainCol : C.muted,
      width: step >= 2 ? 1.95 : 1.5,
      dash: step >= 2 ? "" : "4 3",
    });

    drawLineArrow(dag.right + 3, ySpine, cf.left - 3, ySpine, {
      color: step >= 4 ? mainCol : C.muted,
      width: step >= 4 ? 1.95 : 1.5,
      dash: step >= 4 ? "" : "4 3",
    });

    // 3. Verified target unit -> Calibration box bottom
    drawLineArrow(unit.cx, unit.top - 2.5, cal.cx, cal.bottom + 3, {
      color: uncal ? C.clay : step === 1 ? C.deep : C.muted,
      width: step === 1 ? 1.85 : 1.4,
      dash: uncal ? "3 2.5" : "",
      headLen: 5.8,
      headHalfW: 2.9,
    });

    // 4. Active DAG -> Local mechanism & residual box, then curved into CF decoder bottom
    drawLineArrow(dag.cx, dag.bottom + 2.5, res.cx, res.top - 3, {
      color: step >= 3 ? C.deep : C.muted,
      width: step === 3 ? 1.9 : 1.45,
      dash: step >= 3 ? "" : "3 2.5",
      headLen: 5.8,
      headHalfW: 2.9,
    });

    drawCubicArrow(
      res.right + 3,
      res.cy,
      (res.right + cf.cx) * 0.52,
      res.cy,
      cf.cx,
      res.cy,
      cf.cx,
      cf.bottom + 3,
      {
        color: step >= 4 ? mainCol : C.muted,
        width: step >= 4 ? 1.85 : 1.45,
        dash: step >= 4 ? "" : "4 3",
      }
    );
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
    const uncal = regime === "uncalibrated";
    const zh = lang() === "zh";

    const stripTitle = uncal
      ? (zh ? `配对 Domino 校准对照：读出误差 MSE ↓（${T("\\times 10^3")}，表 2）` : `Paired Domino Control: ID Readout MSE ↓ (${T("\\times 10^3")}, Table 2)`)
      : (zh ? "物理 Domino 因果图发现 AUPRC ↑（表 1 · SHD: 3 → 0）" : "Physical Domino Graph AUPRC ↑ (Table 1 · SHD: 3 → 0)");
    const stripSub = uncal
      ? (zh ? "未校准 22.37 → 可逆校准 12.86（幅度偏移效应 NMSE：6.86 → 6.52）" : "Uncalibrated 22.37 → Calibrated ICD 12.86 (Shift CF: 6.86 → 6.52)")
      : (zh ? "CausalVAE 0.284 → Calibrated ICD 0.982（PnP：0.516 → 0.862）" : "CausalVAE 0.284 → Calibrated ICD 0.982 (PnP: 0.516 → 0.862)");
    const bPct = uncal ? 89.5 : 28.4;
    const oPct = uncal ? 51.5 : 98.2;
    const bLabel = uncal ? "22.37" : "0.284";
    const oLabel = uncal ? "12.86" : "0.982";

    nodesHost.innerHTML = `
      <div class="icd-grid">
        <span class="stage-pill icd-pill-cal ${step === 1 && !uncal ? "is-active" : ""} ${uncal ? "is-clay" : ""}" data-node="pcal">
          ${uncal ? (zh ? "跳过校准" : "Skipped") + " " + T("B_{\\mathrm{cal}} = 0") : T("B_{\\mathrm{cal}}") + " · " + (zh ? "轮询校准" : "Round-robin")}
        </span>

        <span class="stage-pill icd-pill-graph ${step === 2 ? "is-active" : ""}" data-node="pgraph">
          ${T("B_{\\mathrm{graph}}")} · ${zh ? "主动定向" : "Active"} ${T("\\mathrm{do}(s_j = u)")}
        </span>

        <div class="stage-box icd-cell-pix ${step === 0 ? "is-active" : ""}" data-node="pix">
          <div class="stage-box-title">${zh ? "输入像素" : "Pixels"} ${T("x")}</div>
          <div class="stage-box-sub">${zh ? "冻结" : "Frozen"} ${T("z = E_\\theta(x)")}</div>
        </div>

        <div class="stage-box icd-cell-cal ${step === 1 && !uncal ? "is-active" : ""} ${uncal ? "is-clay" : ""}" data-node="cal">
          <div class="stage-box-title">${uncal ? (zh ? "未校准读出" : "Raw Readout") : (zh ? "可逆校准" : "Calibration") + " " + T("T_\\phi")}</div>
          <div class="stage-box-sub">${uncal ? T("T = \\mathrm{Id}\\;(z_j \\neq \\alpha_j)") : T("h = (T(z) - \\mu^c)/\\sigma^c")}</div>
        </div>

        <div class="stage-box icd-cell-dag ${step === 2 ? "is-active" : ""}" data-node="dag">
          <div class="stage-box-title">${zh ? "因果图发现" : "Graph Discovery"} ${T("\\hat{G}")}</div>
          <div class="stage-box-sub">${zh ? "CPDAG + 定向" : "CPDAG + Meek"} ${T("e_{j \\to k}")}</div>
        </div>

        <div class="stage-box icd-cell-cf ${step === 4 && !uncal ? "is-active" : ""} ${uncal && step >= 1 ? "is-clay" : ""}" data-node="cf">
          <div class="stage-box-title">${zh ? "逆解码反事实" : "CF Decode"} ${T("\\hat{x}^{\\mathrm{cf}}")}</div>
          <div class="stage-box-sub">${uncal ? (zh ? "数值尺度失配" : "Unit mismatch") : T("D_\\psi(T^{-1}(\\sigma^c \\odot h^{\\mathrm{cf}} + \\mu^c))")}</div>
        </div>

        <div class="stage-box icd-cell-unit ${step === 1 && !uncal ? "is-active" : ""} ${uncal ? "is-clay" : ""}" data-node="unit">
          <div class="stage-box-title">${zh ? "核验干预值" : "Verified Unit"} ${T("q_j(u)")}</div>
          <div class="stage-box-sub">${T("\\alpha_j(u) = (u - \\mu_j^s)/\\sigma_j^s")}</div>
        </div>

        <div class="stage-box icd-cell-res ${step === 3 ? "is-active" : ""}" data-node="res">
          <div class="stage-box-title">${zh ? "局部机制与残差" : "Mechanisms"} ${T("\\hat{f}_j")}</div>
          <div class="stage-box-sub">${T("\\eta_j^{\\mathrm{fact}} = h_j - \\hat{f}_j(h_{\\mathrm{Pa}(j)})")}</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${uncal ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ${uncal ? "warn" : "base"}" style="width:${bPct}%"></i></div>
            <span class="stage-mini-num">${bLabel}</span>
          </div>
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ours" style="width:${oPct}%"></i></div>
            <span class="stage-mini-num ours">${oLabel}</span>
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
      step = (step + 1) % 5;
      draw();
      if (step === 4) stopPlay();
    }, 2800);
  }

  playBtn.addEventListener("click", () => {
    if (timer) stopPlay();
    else {
      if (step === 4) step = 0;
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
