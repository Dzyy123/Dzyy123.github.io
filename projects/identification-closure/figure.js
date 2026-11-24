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
    gold: "#9e6216",
    clay: "#984b2a",
    muted: "#a5b0a1",
  };

  let regime = "iic";
  let step = 2;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · HTC Bottleneck",
        title: "Confounded siblings $T, W \\in \\mathrm{sib}(Y)$ block standard HTC.",
        body: "Node $Y$ has $|\\mathrm{pa}(Y)| = 3$ parents ($T, U, W$), two of which share latent confounders with $Y$, leaving all $3$ incoming edges of $Y$ unresolved.",
      },
      {
        short: "2 · Seed $\\mathcal{I}_0$ ($t=0$)",
        title: "Seed function $\\mathcal{S}_0$ identifies $Z \\to T$ and $Z \\to U$.",
        body: "Instrumental variables, interventions, or prior knowledge initialize $\\mathcal{I}_0$ soundly without distributional assumptions on the remaining graph.",
      },
      {
        short: "3 · Reduced HTC ($t=1$)",
        title: "Coefficient substitution unlocks $T \\to Y$, $U \\to Y$, and $W \\to Y$.",
        body: "Theorem 4.3 proves that subtracting known parent contributions shrinks $|R|$ while preserving generic full rank of the half-trek Jacobian $J = [\\Sigma_{w_l, r_m}]$.",
      },
      {
        short: "4 · Fixed Point $\\mathcal{I}^\\star$ ($t=2$)",
        title: "Closure reaches $5/5$ edges ($97.5\\%$ on $n = 6$ random mixed graphs).",
        body: "IIC converges monotonically in $\\le 2$ iterations across all tested graphs, amplifying $2$ seeds ($\\sim 3\\%$ of edges) by $\\gamma \\approx 4.0\\times$ with zero false positives.",
      },
    ],
    zh: [
      {
        short: "1 · HTC 瓶颈",
        title: "混杂同胞节点 $T, W \\in \\mathrm{sib}(Y)$ 阻断传统单步 HTC",
        body: "节点 $Y$ 含 $|\\mathrm{pa}(Y)| = 3$ 个父节点（$T, U, W$），其中 $T, W$ 与 $Y$ 存在双向混杂边，导致指向 $Y$ 的 3 条因果边全部无法识别。",
      },
      {
        short: "2 · 初始种子 ($t=0$)",
        title: "种子函数 $\\mathcal{S}_0$ 识别初始边 $Z \\to T$ 与 $Z \\to U$",
        body: "工具变量、实验干预或先验知识提供可靠初始边集 $\\mathcal{I}_0$，对图其余部分无需附加非高斯分布假设。",
      },
      {
        short: "3 · 约化 HTC ($t=1$)",
        title: "代入已知系数，一举解锁 $T \\to Y$、$U \\to Y$ 与 $W \\to Y$",
        body: "定理 4.3 证明：消去已知父节点贡献可将未知父集缩减为 $R$，且修改后的协方差雅可比矩阵 $J = [\\Sigma_{w_l, r_m}]$ 保持泛型满秩。",
      },
      {
        short: "4 · 不动点闭包 ($t=2$)",
        title: "收敛至 $5/5$ 全图识别（$n=6$ 混合图达 $97.5\\%$）",
        body: "IIC 在实证测试中均于 $\\le 2$ 轮内单调收敛，仅凭 2 个种子（约 $3\\%$ 边）实现 $\\gamma \\approx 4.0\\times$ 识别放大且零假阳性。",
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
      "stroke-width": opts.width || 1.85,
      "stroke-linecap": "round",
      opacity,
    };
    if (opts.dash) attrs["stroke-dasharray"] = opts.dash;
    svgEl("line", attrs);
    arrowHead(x2, y2, ux, uy, color, headLen, headHalfW, opacity);
  }

  function drawCircleEdge(c1, c2, opts = {}) {
    const r1 = c1.width / 2;
    const r2 = c2.width / 2;
    const dx = c2.cx - c1.cx;
    const dy = c2.cy - c1.cy;
    const len = Math.hypot(dx, dy);
    if (len <= r1 + r2 + 6) return;
    const ux = dx / len;
    const uy = dy / len;
    drawLineArrow(
      c1.cx + ux * (r1 + 3),
      c1.cy + uy * (r1 + 3),
      c2.cx - ux * (r2 + 3),
      c2.cy - uy * (r2 + 3),
      opts
    );
  }

  function drawBidirectedArc(c1, c2, normalOffset, opts = {}) {
    const r1 = c1.width / 2 + 3;
    const r2 = c2.width / 2 + 3;
    const dx = c2.cx - c1.cx;
    const dy = c2.cy - c1.cy;
    const len = Math.hypot(dx, dy);
    if (len <= r1 + r2 + 8) return;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const sign = normalOffset >= 0 ? 1 : -1;

    // Shift attachment points onto the bowed side of each circle perimeter so arrowheads never touch directed edges
    const a1x = ux * 0.88 + nx * sign * 0.47;
    const a1y = uy * 0.88 + ny * sign * 0.47;
    const a2x = -ux * 0.88 + nx * sign * 0.47;
    const a2y = -uy * 0.88 + ny * sign * 0.47;

    const sx = c1.cx + a1x * r1;
    const sy = c1.cy + a1y * r1;
    const ex = c2.cx + a2x * r2;
    const ey = c2.cy + a2y * r2;

    const midX = (sx + ex) / 2 + nx * normalOffset;
    const midY = (sy + ey) / 2 + ny * normalOffset;

    const color = opts.color || C.clay;
    const headLen = 5.4;
    const headHalfW = 2.7;

    let t1x = sx - midX;
    let t1y = sy - midY;
    const l1 = Math.hypot(t1x, t1y) || 1;
    t1x /= l1;
    t1y /= l1;

    let t2x = ex - midX;
    let t2y = ey - midY;
    const l2 = Math.hypot(t2x, t2y) || 1;
    t2x /= l2;
    t2y /= l2;

    const p1x = sx - t1x * headLen * 0.65;
    const p1y = sy - t1y * headLen * 0.65;
    const p2x = ex - t2x * headLen * 0.65;
    const p2y = ey - t2y * headLen * 0.65;

    svgEl("path", {
      d: `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} Q ${midX.toFixed(2)} ${midY.toFixed(2)} ${p2x.toFixed(2)} ${p2y.toFixed(2)}`,
      fill: "none",
      stroke: color,
      "stroke-width": opts.width || 1.45,
      "stroke-dasharray": "4 3",
      "stroke-linecap": "round",
      opacity: opts.opacity ?? 0.88,
    });
    arrowHead(sx, sy, t1x, t1y, color, headLen, headHalfW, opts.opacity ?? 0.88);
    arrowHead(ex, ey, t2x, t2y, color, headLen, headHalfW, opts.opacity ?? 0.88);
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

    const { nZ, nT, nU, nY, nW, p0, p1, p2 } = map;
    if (!nZ || !nT || !nU || !nY || !nW) return;

    const isIIC = regime === "iic";

    // Latent confounding bidirected arcs (T <-> Y bowed left, Y <-> W bowed downward)
    drawBidirectedArc(nT, nY, 20, { color: C.clay, width: step === 0 ? 1.65 : 1.35 });
    drawBidirectedArc(nY, nW, 18, { color: C.clay, width: step === 0 ? 1.65 : 1.35 });

    // Seed / exogenous edges Z -> T and Z -> U
    const seedCol = step >= 1 ? C.deep : C.muted;
    const seedW = step >= 1 ? 2.15 : 1.55;
    drawCircleEdge(nZ, nT, { color: seedCol, width: seedW });
    drawCircleEdge(nZ, nU, { color: seedCol, width: seedW });

    // Confounded incoming edges of Y: T -> Y, U -> Y, W -> Y
    let yEdgeCol = C.muted;
    let yEdgeW = 1.6;
    let yDash = "";
    if (!isIIC) {
      yEdgeCol = step >= 2 ? C.clay : C.muted;
      yDash = step >= 2 ? "4 3" : "";
    } else if (step === 2) {
      yEdgeCol = C.gold;
      yEdgeW = 2.25;
    } else if (step >= 3) {
      yEdgeCol = C.deep;
      yEdgeW = 2.15;
    }
    drawCircleEdge(nT, nY, { color: yEdgeCol, width: yEdgeW, dash: yDash });
    drawCircleEdge(nU, nY, { color: yEdgeCol, width: yEdgeW, dash: yDash });
    drawCircleEdge(nW, nY, { color: yEdgeCol, width: yEdgeW, dash: yDash });

    // Right-hand phase progression arrows
    if (p0 && p1 && p2) {
      drawLineArrow(p0.cx, p0.bottom + 2.5, p1.cx, p1.top - 2.5, {
        color: step >= 2 ? (isIIC ? C.deep : C.clay) : C.muted,
        width: 1.7,
        headLen: 5.5,
        headHalfW: 2.8,
      });
      drawLineArrow(p1.cx, p1.bottom + 2.5, p2.cx, p2.top - 2.5, {
        color: step >= 3 ? (isIIC ? C.deep : C.clay) : C.muted,
        width: 1.7,
        headLen: 5.5,
        headHalfW: 2.8,
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
    const isIIC = regime === "iic";
    const zh = lang() === "zh";

    const clsZ = step >= 1 ? "is-id" : "";
    const clsTU = step >= 1 ? "is-id" : "";
    let clsW = "";
    let clsY = "";
    if (!isIIC && step >= 2) {
      clsY = "is-gap";
      clsW = "is-gap";
    } else if (isIIC && step === 2) {
      clsY = "is-new";
      clsW = "is-new";
    } else if (isIIC && step >= 3) {
      clsY = "is-id";
      clsW = "is-id";
    }

    const stripTitle = isIIC
      ? (zh ? `随机混合图（${T("n = 6")}，10,283 条边）· 传播放大 ${T("\\gamma \\approx 4.0\\times")}` : `Random Mixed Graphs (${T("n = 6")}, 10,283 edges) · Amplification ${T("\\gamma \\approx 4.0\\times")}`)
      : (zh ? "冠心病孟德尔随机化网络（9 节点，13 条有向边 · 图 5）" : "9-Node CHD Mendelian Randomization Network (13 edges · Fig. 5)");
    const stripSub = isIIC
      ? (zh ? `标准 HTC 85.6% → IIC (${T("k = 2")} 种子) 97.5%（+11.9 pp，0 假阳性）` : `Standard HTC 85.6% → IIC (${T("k = 2")} seeds) 97.5% (+11.9 pp, 0 FP)`)
      : (zh ? "单步 HTC 仅识别 8/13 (61.5%) vs. IIC 13/13 (100%)" : "One-Shot HTC 8/13 (61.5%) vs. IIC Closure 13/13 (100%)");
    const bPct = isIIC ? 85.6 : 61.5;
    const oPct = isIIC ? 97.5 : 100.0;

    nodesHost.innerHTML = `
      <div class="iic-main">
        <div class="iic-graph-card">
          <div class="iic-graph-head">
            <strong>${zh ? "5 节点混杂线性 SEM（图 2）" : "5-Node Confounded SEM (Fig. 2)"}</strong>
            <span>${T("T, W \\in \\mathrm{sib}(Y)")}</span>
          </div>
          <div class="iic-arena">
            <span class="iic-node ${clsZ}" style="left:19%;top:25%;" data-node="nZ">${T("Z")}</span>
            <span class="iic-node ${clsTU}" style="left:58%;top:25%;" data-node="nT">${T("T")}</span>
            <span class="iic-node ${clsTU}" style="left:16%;top:72%;" data-node="nU">${T("U")}</span>
            <span class="iic-node ${clsY}" style="left:54%;top:72%;" data-node="nY">${T("Y")}</span>
            <span class="iic-node ${clsW}" style="left:87%;top:72%;" data-node="nW">${T("W")}</span>
          </div>
        </div>

        <div class="iic-steps-col">
          <div class="stage-box ${step === 1 ? "is-active" : ""}" data-node="p0">
            <div class="stage-box-title">${T("t = 0")} · ${zh ? "初始集" : "Seed"} ${T("\\mathcal{I}_0")}</div>
            <div class="stage-box-sub">${T("Z \\to T,\\; Z \\to U")} (2 / 5)</div>
          </div>

          <div class="stage-box ${step === 2 && isIIC ? "is-active" : ""} ${!isIIC && step >= 2 ? "is-clay" : ""}" data-node="p1">
            <div class="stage-box-title">${T("t = 1")} · ${isIIC ? (zh ? "约化 HTC" : "Reduced HTC") : (zh ? "单步 HTC 受阻" : "HTC Blocked")}</div>
            <div class="stage-box-sub">${
              isIIC
                ? `${zh ? "解锁" : "Unlocks"} ${T("T, U, W \\to Y")}`
                : `${zh ? "混杂缺失见证集" : "Fails on"} ${T("\\mathrm{pa}(Y)")}`
            }</div>
          </div>

          <div class="stage-box ${step === 3 && isIIC ? "is-active" : ""} ${!isIIC && step === 3 ? "is-clay" : ""}" data-node="p2">
            <div class="stage-box-title">${T("t = 2")} · ${zh ? "不动点" : "Closure"} ${T("\\mathcal{I}^\\star")}</div>
            <div class="stage-box-sub">${
              isIIC
                ? (zh ? "5 / 5 边可识别 (100%)" : "5 / 5 identified (100%)")
                : (zh ? "2 / 5 · 3 条边陷入盲区" : "2 / 5 · 3 edges in gap")
            }</div>
          </div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${!isIIC ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill base" style="width:${bPct}%"></i></div>
            <span class="stage-mini-num">${bPct.toFixed(1)}%</span>
          </div>
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ours" style="width:${oPct}%"></i></div>
            <span class="stage-mini-num ours">${oPct.toFixed(1)}%</span>
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
