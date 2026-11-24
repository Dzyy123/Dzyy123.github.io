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

  let regime = "intervene";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Host $z_t$",
        title: "Host encoder maps $o_t \\to z_t$.",
        body: "Predictive training alone leaves physical factors entangled inside $z_t$.",
      },
      {
        short: "2 · Causal DAG $A$",
        title: "CausalVAE propagates factors along acyclic graph $A$.",
        body: "With host modules frozen, exogenous variables flow through DAG $A$ to form structured $\\tilde{z}_t$.",
      },
      {
        short: "3 · Anchor $\\mathcal{L}_{\\mathrm{align}}$",
        title: "Train-only state alignment fixes coordinate axes.",
        body: "$\\mathcal{L}_{\\mathrm{align}}$ anchors $\\hat{A} = A^\\star$ during Stage 2; inference needs no $s_t$. Without it, factual H@1 drops 91% $\\to$ 9%.",
      },
      {
        short: "4 · $\\alpha$-Gate",
        title: "Stage-3 $\\alpha$-gate blends $z_t$ and $\\tilde{z}_t$.",
        body: "Controlled mixing $z_t^{\\mathrm{gate}} = (1-\\alpha_t)z_t + \\alpha_t\\tilde{z}_t$ prevents drift; disabling it drops Physics H@1 to 1.33%.",
      },
      {
        short: "5 · Retrieval",
        title: "Physics CF-H@1 rises from 11.0% to 41.0% (GNN-NLL).",
        body: "Interventions $\\mathrm{do}(s + \\Delta)$ propagate along $A$ before $F_\\varphi$, lifting mean CF-H@1 by +102.5% across 8 backbones.",
      },
    ],
    zh: [
      {
        short: "1 · 宿主 $z_t$",
        title: "宿主编码器映射 $o_t \\to z_t$",
        body: "纯预测训练容易使物理因子在潜变量 $z_t$ 中相互混杂。",
      },
      {
        short: "2 · 因果图 $A$",
        title: "CausalVAE 沿可学习无环图 $A$ 组织潜变量",
        body: "冻结宿主主干，外生变量经无环矩阵 $A$ 传播生成结构化表示 $\\tilde{z}_t$。",
      },
      {
        short: "3 · 状态锚定",
        title: "训练期状态对齐固定坐标轴（$\\hat{A} = A^\\star$）",
        body: "推理期无需真实状态 $s_t$；去掉 $\\mathcal{L}_{\\mathrm{align}}$ 会使事实 H@1 从 91% 跌至 9%。",
      },
      {
        short: "4 · $\\alpha$ 门控",
        title: "阶段三 $\\alpha$ 门控融合 $z_t$ 与 $\\tilde{z}_t$",
        body: "受控混合 $z_t^{\\mathrm{gate}} = (1-\\alpha_t)z_t + \\alpha_t\\tilde{z}_t$ 抑制多步漂移；关闭门控会使 Physics H@1 跌至 1.33%。",
      },
      {
        short: "5 · 反事实检索",
        title: "Physics 反事实 CF-H@1 从 11.0% 跃升至 41.0%",
        body: "受控干预 $\\mathrm{do}(s + \\Delta)$ 沿因果图 $A$ 传播后再进入 $F_\\varphi$，8 个基线平均相对提升 +102.5%。",
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

  function arrowHead(tipX, tipY, ux, uy, color, headLen = 6.8, headHalfW = 3.4, opacity = 1) {
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
    const headLen = opts.headLen || 6.8;
    const headHalfW = opts.headHalfW || 3.4;
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

  function drawCubicArrow(x1, y1, cx1, cy1, cx2, cy2, x2, y2, opts = {}) {
    const color = opts.color || C.deep;
    const headLen = opts.headLen || 6.6;
    const headHalfW = opts.headHalfW || 3.3;
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

  function drawCircleEdge(c1, c2, opts = {}) {
    const r1 = c1.width / 2;
    const r2 = c2.width / 2;
    const dx = c2.cx - c1.cx;
    const dy = c2.cy - c1.cy;
    const len = Math.hypot(dx, dy);
    if (len <= r1 + r2 + 5) return;
    const ux = dx / len;
    const uy = dy / len;
    drawLineArrow(
      c1.cx + ux * (r1 + 2),
      c1.cy + uy * (r1 + 2),
      c2.cx - ux * (r2 + 2.5),
      c2.cy - uy * (r2 + 2.5),
      { ...opts, headLen: 5.8, headHalfW: 2.9 }
    );
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

    const isInt = regime === "intervene";
    const { skip, enc, dag, anchor, gate, trans, n1, n2, n3, dobadge } = map;
    if (!enc || !dag || !gate || !trans || !anchor) return;

    // 1. Residual skip arc routed cleanly into left of skip-pill and out of right of skip-pill -> gate top
    if (skip) {
      const skipCol = step >= 3 ? C.accent : C.muted;
      const skipW = step === 3 ? 1.9 : 1.45;
      svgEl("path", {
        d: `M ${enc.cx.toFixed(2)} ${(enc.top - 2.5).toFixed(2)} C ${enc.cx.toFixed(2)} ${skip.cy.toFixed(2)}, ${(skip.left - 22).toFixed(2)} ${skip.cy.toFixed(2)}, ${(skip.left - 4).toFixed(2)} ${skip.cy.toFixed(2)}`,
        fill: "none",
        stroke: skipCol,
        "stroke-width": skipW,
        "stroke-dasharray": "4 3",
        "stroke-linecap": "round",
      });
      drawCubicArrow(
        skip.right + 4,
        skip.cy,
        skip.right + 22,
        skip.cy,
        gate.cx,
        skip.cy,
        gate.cx,
        gate.top - 3,
        {
          color: skipCol,
          width: skipW,
          dash: "4 3",
        }
      );
    }

    // 2. Dead-level horizontal pipeline spine arrows
    const ySpine = enc.cy;
    drawLineArrow(enc.right + 3, ySpine, dag.left - 3, ySpine, {
      color: step >= 1 ? C.deep : C.muted,
      width: step >= 1 ? 2.0 : 1.5,
      dash: step >= 1 ? "" : "4 3",
    });

    drawLineArrow(dag.right + 3, ySpine, gate.left - 3, ySpine, {
      color: isInt && step >= 3 ? C.clay : step >= 3 ? C.deep : C.muted,
      width: step >= 3 ? 2.0 : 1.5,
      dash: step >= 3 ? "" : "4 3",
    });

    drawLineArrow(gate.right + 3, ySpine, trans.left - 3, ySpine, {
      color: isInt && step >= 4 ? C.clay : step >= 4 ? C.deep : C.muted,
      width: step >= 4 ? 2.0 : 1.5,
      dash: step >= 4 ? "" : "4 3",
    });

    // 3. Vertical arrow from DAG card bottom to State Anchor top
    drawLineArrow(dag.cx, dag.bottom + 2.5, anchor.cx, anchor.top - 2.5, {
      color: step === 2 ? C.deep : C.muted,
      width: step === 2 ? 1.95 : 1.45,
      dash: step === 2 ? "" : "3 2.5",
      headLen: 6.0,
      headHalfW: 3.0,
    });

    // 4. 3-Node Causal DAG perimeter-to-perimeter edges
    if (n1 && n2 && n3) {
      const edgeCol = isInt && step >= 1 ? C.clay : C.accent;
      const edgeW = step >= 1 ? 1.8 : 1.4;
      drawCircleEdge(n1, n2, { color: edgeCol, width: edgeW });
      drawCircleEdge(n1, n3, { color: edgeCol, width: edgeW });
      drawCircleEdge(n2, n3, { color: edgeCol, width: edgeW });
    }

    // 5. Intervention pointer straight up from do(+Delta) badge into n1
    if (dobadge && n1) {
      drawLineArrow(dobadge.cx, dobadge.top - 2, n1.cx, n1.bottom + 2.5, {
        color: C.clay,
        width: 1.55,
        headLen: 5.2,
        headHalfW: 2.6,
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
    const isInt = regime === "intervene";
    const zh = lang() === "zh";

    const stripTitle = isInt
      ? (zh ? "Physics 反事实检索 CF-H@1（GNN-NLL）" : "Physics Counterfactual CF-H@1 (GNN-NLL)")
      : (zh ? "Physics 事实预测 H@1（GNN-Contrastive）" : "Physics Factual H@1 (GNN-Contrastive)");
    const stripSub = isInt
      ? (zh ? "基线 11.0% → +CausalVAE 41.0%（+30.0 pp）" : "Baseline 11.0% → +CausalVAE 41.0% (+30.0 pp)")
      : (zh ? "1 步：88.0% → 99.0% · 5 步：25.0% → 36.0%" : "1-step: 88.0% → 99.0% · 5-step: 25.0% → 36.0%");
    const bPct = isInt ? 11 : 88;
    const oPct = isInt ? 41 : 99;

    nodesHost.innerHTML = `
      <div class="cvae-grid">
        <span class="stage-pill cvae-skip-cell ${step >= 3 ? "is-active" : ""}" data-node="skip">
          ${zh ? "残差直连" : "Residual skip"} ${T("(1 - \\alpha_t) z_t")}
        </span>

        <div class="cvae-plugin-bg ${step >= 1 && step <= 2 ? "is-active" : ""}">
          <span class="cvae-plugin-label">${zh ? "CausalVAE 结构插件层" : "CausalVAE Structural Plug-in"}</span>
        </div>

        <div class="stage-box cvae-cell-enc ${step === 0 ? "is-active" : ""}" data-node="enc">
          <div class="stage-box-title">${zh ? "编码器" : "Encoder"} ${T("E_\\theta")}</div>
          <div class="stage-box-sub">${T("z_t = E_\\theta(o_t)")}</div>
        </div>

        <div class="stage-box cvae-cell-dag ${step === 1 ? "is-active" : ""}" data-node="dag">
          <div class="stage-box-title">${zh ? "可学习因果图" : "Causal DAG"} ${T("A")}</div>
          <div class="cvae-dag-arena">
            <span class="cvae-node ${isInt ? "is-intervened" : ""}" style="left:21%;top:28%;" data-node="n1">${T("\\tilde{z}_1")}</span>
            <span class="cvae-node" style="left:79%;top:28%;" data-node="n2">${T("\\tilde{z}_2")}</span>
            <span class="cvae-node" style="left:66%;top:78%;" data-node="n3">${T("\\tilde{z}_3")}</span>
            ${isInt ? `<span class="cvae-do-tag" style="left:21%;top:82%;" data-node="dobadge">${T("\\mathrm{do}(+\\Delta)")}</span>` : ""}
          </div>
        </div>

        <div class="stage-box cvae-cell-anchor ${step === 2 ? "is-active" : ""}" data-node="anchor">
          <div class="stage-box-title">${zh ? "状态锚定" : "State Anchor"} ${T("\\mathcal{L}_{\\mathrm{align}}")}</div>
          <div class="stage-box-sub">${
            zh
              ? `${T("\\hat{A} = A^\\star")}（仅训练期 ${T("s_t")}）`
              : `Thm. 1: ${T("\\hat{A} = A^\\star")} (train ${T("s_t")})`
          }</div>
        </div>

        <div class="stage-box cvae-cell-gate ${step === 3 ? "is-active" : ""} ${isInt && step >= 4 ? "is-clay" : ""}" data-node="gate">
          <div class="stage-box-title">${T("\\alpha")}${zh ? " 门控" : "-Gate"}</div>
          <div class="stage-box-sub">${T("z_t^{\\mathrm{gate}}")}</div>
        </div>

        <div class="stage-box cvae-cell-trans ${step === 4 ? "is-active" : ""} ${isInt && step === 4 ? "is-clay" : ""}" data-node="trans">
          <div class="stage-box-title">${zh ? "转移" : "Transition"} ${T("F_\\varphi")}</div>
          <div class="stage-box-sub">${T(isInt ? "\\hat{z}_{t+1}^{\\mathrm{cf}}" : "\\hat{z}_{t+1}")}</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${isInt ? "is-clay" : ""}">${stripSub}</div>
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
