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

  let regime = "srd";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Context $z_t$",
        title: "Encoder $f_\\theta$ maps $o_t \\to z_t$ and goal $o_g \\to z_g$.",
        body: "SRD initializes $h_{\\mathrm{init}} = g_\\phi(z_t)$ while keeping the visual encoder, target latents, and CEM planner unchanged.",
      },
      {
        short: "2 · Carrier $h_{0:H-1}$",
        title: "GRU advances persistent hidden states $h_k = F_\\phi(h_{k-1}, u_k)$.",
        body: "Only hidden states and action embeddings $u_k = e_a(a_{t+k})$ propagate across the horizon, using 53.0–58.2% fewer parameters than AR.",
      },
      {
        short: "3 · Readout $R_\\phi$",
        title: "Shared readout projects $\\hat{z}_{t+k+1} = R_\\phi(h_k)$ without feedback.",
        body: "Planner-facing latents are supervised via $\\mathcal{L}_{\\mathrm{SRD}}$ and scored by CEM, never returned into subsequent transitions.",
      },
      {
        short: "4 · Horizon $H = 20$",
        title: "TwoRoom $H = 20$ success holds at 46% vs. 14% for AR (+32 pp).",
        body: "Removing $e_{k+1} \\approx J_k e_k + \\epsilon_k$ feedback cuts terminal MSE by 17.2% (0.417 $\\to$ 0.345) and runtime by 86.8% (515 s $\\to$ 68 s).",
      },
    ],
    zh: [
      {
        short: "1 · 潜表示 $z_t$",
        title: "编码器 $f_\\theta$ 映射 $o_t \\to z_t$ 与目标 $o_g \\to z_g$",
        body: "SRD 通过 $h_{\\mathrm{init}} = g_\\phi(z_t)$ 初始化循环状态，视觉编码器、目标潜变量与 CEM 规划器保持完全不变。",
      },
      {
        short: "2 · 隐状态 $h_{0:H-1}$",
        title: "GRU 沿时域推进持续隐状态 $h_k = F_\\phi(h_{k-1}, u_k)$",
        body: "跨步转移仅依赖隐状态与动作嵌入 $u_k = e_a(a_{t+k})$，预测器参数量比自回归基线减少 53.0–58.2%。",
      },
      {
        short: "3 · 共享读出 $R_\\phi$",
        title: "共享读出头单向投射 $\\hat{z}_{t+k+1} = R_\\phi(h_k)$，切断回流",
        body: "规划潜变量仅用于 $\\mathcal{L}_{\\mathrm{SRD}}$ 时域对齐监督与 CEM 代价评估，不再回流至后续状态转移。",
      },
      {
        short: "4 · 长程 $H = 20$",
        title: "TwoRoom 在 $H = 20$ 下保持 46% 成功率（AR 仅 14%，+32 pp）",
        body: "消除 $e_{k+1} \\approx J_k e_k + \\epsilon_k$ 误差回流后，末端开环 MSE 降低 17.2%（0.417 $\\to$ 0.345），评估耗时缩短 86.8%（515 s $\\to$ 68 s）。",
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
    const headLen = opts.headLen || 6.4;
    const headHalfW = opts.headHalfW || 3.2;
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
      "stroke-width": opts.width || 1.75,
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

    const isAR = regime === "ar";
    const { a1, a2, a3, zt, s1, s2, s3, z1, z2, z3 } = map;
    if (!a1 || !a2 || !a3 || !zt || !s1 || !s2 || !s3 || !z1 || !z2 || !z3) return;

    // 1. Action inputs down into rollout cells
    const actCol = step >= 1 ? (isAR ? C.clay : C.accent) : C.muted;
    [
      [a1, s1],
      [a2, s2],
      [a3, s3],
    ].forEach(([aBox, sBox]) => {
      drawLineArrow(aBox.cx, aBox.bottom + 2.5, sBox.cx, sBox.top - 3, {
        color: actCol,
        width: 1.55,
        headLen: 5.8,
        headHalfW: 2.9,
      });
    });

    // 2. Context z_t into first transition
    drawLineArrow(zt.right + 3, zt.cy, s1.left - 3, s1.cy, {
      color: step >= 0 ? C.deep : C.muted,
      width: 1.9,
    });

    if (!isAR) {
      // SRD: Persistent recurrent hidden spine h_0 -> h_1 -> ... -> h_{H-1}
      const spineCol = step >= 1 ? C.deep : C.muted;
      const spineW = step === 1 ? 2.15 : 1.85;
      drawLineArrow(s1.right + 3, s1.cy, s2.left - 3, s2.cy, {
        color: spineCol,
        width: spineW,
        dash: step >= 1 ? "" : "4 3",
      });
      drawLineArrow(s2.right + 3, s2.cy, s3.left - 3, s3.cy, {
        color: spineCol,
        width: spineW,
        dash: "4 3",
      });

      // One-way shared readout R_phi arrows straight down (NO upward feedback!)
      const readCol = step >= 2 ? C.accent : C.muted;
      const readW = step >= 2 ? 1.9 : 1.45;
      [
        [s1, z1],
        [s2, z2],
        [s3, z3],
      ].forEach(([sBox, zBox]) => {
        drawLineArrow(sBox.cx, sBox.bottom + 2.5, zBox.cx, zBox.top - 3, {
          color: readCol,
          width: readW,
          dash: step >= 2 ? "" : "3.5 2.5",
        });
      });
    } else {
      // AR: Each step outputs \hat{z}_{t+k}, then feeds \hat{z}_{t+k} diagonally back up into next P_phi!
      [
        [s1, z1, C.deep],
        [s2, z2, C.clay],
        [s3, z3, C.clay],
      ].forEach(([sBox, zBox, col]) => {
        drawLineArrow(sBox.cx, sBox.bottom + 2.5, zBox.cx, zBox.top - 3, {
          color: step >= 1 ? col : C.muted,
          width: 1.8,
        });
      });

      const mid12 = (z1.right + s2.left) / 2;
      drawCubicArrow(z1.right + 3, z1.cy, mid12 + 2, z1.cy, mid12 - 2, s2.cy, s2.left - 3, s2.cy, {
        color: C.clay,
        width: 1.95,
      });

      const mid23 = (z2.right + s3.left) / 2;
      drawCubicArrow(z2.right + 3, z2.cy, mid23 + 2, z2.cy, mid23 - 2, s3.cy, s3.left - 3, s3.cy, {
        color: C.clay,
        width: 1.95,
        dash: "4 3",
      });
    }
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
    const isAR = regime === "ar";
    const zh = lang() === "zh";

    const stripTitle = zh
      ? `TwoRoom 长时域规划压力测试（${T("H = 20")}，LeWM）`
      : `TwoRoom Long-Horizon Stress Test (${T("H = 20")}, LeWM)`;
    const stripSub = isAR
      ? zh
        ? `读出误差回流：成功率 88% → 14% · 评估耗时 515 s`
        : `Readout feedback drift: success 88% → 14% · runtime 515 s`
      : zh
        ? `AR 14.0%（515 s）→ SRD 46.0%（68 s，耗时 −86.8%）`
        : `AR 14.0% (515 s) → SRD 46.0% (68 s, −86.8% time)`;

    nodesHost.innerHTML = `
      <div class="srd-grid">
        <span class="stage-pill srd-act-1 ${step >= 1 ? "is-active" : ""}" data-node="a1">${zh ? "动作" : "Action"} ${T("a_t")}</span>
        <span class="stage-pill srd-act-2 ${step >= 1 ? "is-active" : ""}" data-node="a2">${zh ? "动作" : "Action"} ${T("a_{t+1}")}</span>
        <span class="stage-pill srd-act-3 ${step >= 1 ? "is-active" : ""}" data-node="a3">${zh ? "末步" : "Step"} ${T("a_{t+H-1}")}</span>

        <div class="stage-box srd-zt ${step === 0 ? "is-active" : ""}" data-node="zt">
          <div class="stage-box-title">${zh ? "当前潜状态" : "Latent"} ${T("z_t")}</div>
          <div class="stage-box-sub">${T("f_\\theta(o_t)")}</div>
        </div>

        <div class="stage-box srd-s1 ${!isAR && step === 1 ? "is-active" : ""}" data-node="s1">
          <div class="stage-box-title">${isAR ? `${zh ? "单步预测" : "Predictor"} ${T("P_\\phi")}` : `${zh ? "隐状态" : "Hidden"} ${T("h_0")}`}</div>
          <div class="stage-box-sub">${isAR ? T("P_\\phi(z_t, a_t)") : T("F_\\phi(h_{\\mathrm{init}}, u_0)")}</div>
        </div>

        <div class="stage-box srd-s2 ${isAR ? "is-clay" : step === 1 ? "is-active" : ""}" data-node="s2">
          <div class="stage-box-title">${isAR ? `${zh ? "耦合转移" : "Coupled"} ${T("P_\\phi")}` : `${zh ? "隐状态" : "Hidden"} ${T("h_1")}`}</div>
          <div class="stage-box-sub">${isAR ? T("P_\\phi(\\hat{z}_{t+1}, a_{t+1})") : T("F_\\phi(h_0, u_1)")}</div>
        </div>

        <div class="stage-box srd-s3 ${isAR ? "is-clay" : step === 1 || step === 3 ? "is-active" : ""}" data-node="s3">
          <div class="stage-box-title">${isAR ? `${zh ? "累积转移" : "Coupled"} ${T("P_\\phi")}` : `${zh ? "隐状态" : "Hidden"} ${T("h_{H-1}")}`}</div>
          <div class="stage-box-sub">${isAR ? T("P_\\phi(\\hat{z}_{t+H-1}, a_{t+H-1})") : T("F_\\phi(h_{H-2}, u_{H-1})")}</div>
        </div>

        <span class="stage-pill srd-tag ${isAR ? "is-clay" : "is-active"}" data-node="tag">
          ${isAR ? T("e_{k+1} \\approx J_k e_k + \\epsilon_k") : zh ? `无 ${T("\\hat{z}")} 回流` : `No ${T("\\hat{z}")} feedback`}
        </span>

        <div class="stage-box srd-z1 ${isAR ? "is-clay" : step === 2 ? "is-active" : ""}" data-node="z1">
          <div class="stage-box-title">${zh ? "读出" : "Readout"} ${T("\\hat{z}_{t+1}")}</div>
          <div class="stage-box-sub">${isAR ? (zh ? `回流误差 ${T("+e_1")}` : `Fed back ${T("(+e_1)")}`) : T("R_\\phi(h_0)")}</div>
        </div>

        <div class="stage-box srd-z2 ${isAR ? "is-clay" : step === 2 ? "is-active" : ""}" data-node="z2">
          <div class="stage-box-title">${zh ? "读出" : "Readout"} ${T("\\hat{z}_{t+2}")}</div>
          <div class="stage-box-sub">${isAR ? T("J_1 e_1 + \\epsilon_1") : T("R_\\phi(h_1)")}</div>
        </div>

        <div class="stage-box srd-z3 ${isAR ? "is-clay" : step >= 2 ? "is-active" : ""}" data-node="z3">
          <div class="stage-box-title">${zh ? "规划读出" : "Goal Cost"} ${T("\\hat{z}_{t+H}")}</div>
          <div class="stage-box-sub">${isAR ? `${T("H=20")}: 14.0%` : `${T("R_\\phi(h_{H-1})")} · 46.0%`}</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:8px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${isAR ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill base" style="width:14%"></i></div>
            <span class="stage-mini-num">14.0%</span>
          </div>
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ours" style="width:46%"></i></div>
            <span class="stage-mini-num ours">46.0%</span>
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
