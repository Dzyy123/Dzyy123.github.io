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
    deep: "#233f35",
    clay: "#984b2a",
    muted: "#95a293",
  };

  let viewMode = "readout";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Prompt",
        title: "Anti-commonsense evidence flips the everyday prior.",
        body: "Stipulation: “smoking prevents lung cancer.” Query: “Does smoking cause lung cancer?” (Gold: NO · Prior: YES).",
      },
      {
        short: "2 · Probe $h^{(\\ell^\\star)}$",
        title: "Frozen CS-trained probe reads $h^{(\\ell^\\star)} \\to$ NO ($\\ge 96.9\\%$).",
        body: "Fit once on commonsense items with zero LLM updates; recovers the stipulated direction from 0.5B to 72B.",
      },
      {
        short: "3 · $\\mathrm{lm\\_head}$",
        title: "Spoken $\\mathrm{lm\\_head}$ reverts to commonsense $\\to$ YES (35–52.5%).",
        body: "On the exact same forward pass, $144\\times$ scaling to 72B leaves the $\\Delta \\approx +0.50$ gap unchanged.",
      },
      {
        short: "4 · $V_{\\mathrm{cs}}$ &amp; Edges",
        title: "Erasing $V_{\\mathrm{cs}}$ drops KL $-96.3\\%$; contrasting edges unlocks 98.8%.",
        body: "Changing Yes/No to A/B propositions still fails (37.5%), whereas contrasting $c \\to e$ vs. $e \\to c$ reaches 98.8%.",
      },
    ],
    zh: [
      {
        short: "1 · 题面",
        title: "反常识题面反转日常因果先验",
        body: "设定“吸烟能预防肺癌”，提问“吸烟会导致肺癌吗？”（证据真值：NO · 常识先验：YES）。",
      },
      {
        short: "2 · 探针 $h^{(\\ell^\\star)}$",
        title: "冻结线性探针读取 $h^{(\\ell^\\star)} \\to$ NO（$\\ge 96.9\\%$）",
        body: "仅在常识样本拟合一次、不改任何模型权重，从 0.5B 到 72B 稳定恢复证据方向。",
      },
      {
        short: "3 · $\\mathrm{lm\\_head}$",
        title: "$\\mathrm{lm\\_head}$ 退回常识先验 $\\to$ YES（35–52.5%）",
        body: "同一次前向传播上，参数放大 $144\\times$ 至 72B 依然无法闭合 $\\Delta \\approx +0.50$ 读出鸿沟。",
      },
      {
        short: "4 · $V_{\\mathrm{cs}}$ 与接口",
        title: "擦除 $V_{\\mathrm{cs}}$ 降低 96.3% KL；对比有向边恢复 98.8%",
        body: "仅把 Yes/No 改写为 A/B 命题仍失败（37.5%），显式对比 $c \\to e$ 与 $e \\to c$ 边方向即可达 98.8%。",
      },
    ],
  };

  function lang() {
    return document.documentElement.lang === "zh-CN" ? "zh" : "en";
  }

  function svgEl(tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    svg.appendChild(n);
    return n;
  }

  function arrowHead(tipX, tipY, ux, uy, color, headLen = 6.6, headHalfW = 3.3) {
    const bx = tipX - ux * headLen;
    const by = tipY - uy * headLen;
    const nx = -uy;
    const ny = ux;
    svgEl("polygon", {
      points: `${tipX.toFixed(2)},${tipY.toFixed(2)} ${(bx + nx * headHalfW).toFixed(2)},${(by + ny * headHalfW).toFixed(2)} ${(bx - nx * headHalfW).toFixed(2)},${(by - ny * headHalfW).toFixed(2)}`,
      fill: color,
    });
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
    const attrs = {
      x1: x1.toFixed(2),
      y1: y1.toFixed(2),
      x2: (x2 - ux * headLen * 0.78).toFixed(2),
      y2: (y2 - uy * headLen * 0.78).toFixed(2),
      stroke: color,
      "stroke-width": opts.width || 1.85,
      "stroke-linecap": "round",
    };
    if (opts.dash) attrs["stroke-dasharray"] = opts.dash;
    svgEl("line", attrs);
    arrowHead(x2, y2, ux, uy, color, headLen, headHalfW);
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

    const isLesion = viewMode === "lesion";
    const { prompt, llm, h8, hl, hL, probe, verbal } = map;
    if (!prompt || !llm || !h8 || !hl || !hL || !probe || !verbal) return;

    // 1. Prompt -> Frozen LLM (dead-level horizontal)
    drawLineArrow(prompt.right + 3, prompt.cy, llm.left - 3, prompt.cy, {
      color: C.deep,
      width: 1.9,
    });

    // 2. Vertical residual stream arrows inside LLM box
    drawLineArrow(h8.cx, h8.bottom + 2, hl.cx, hl.top - 2.5, {
      color: C.muted,
      width: 1.45,
      headLen: 5.0,
      headHalfW: 2.5,
    });
    drawLineArrow(hl.cx, hl.bottom + 2, hL.cx, hL.top - 2.5, {
      color: C.muted,
      width: 1.45,
      headLen: 5.0,
      headHalfW: 2.5,
    });

    // 3. Upper branch: h^(l*) -> exits llm horizontally, then curves smoothly in corridor -> Frozen Probe
    const corrX1 = llm.right + 1;
    const midX = (corrX1 + probe.left) / 2;
    {
      const headLen = 6.8;
      const endX = probe.left - 3 - headLen * 0.76;
      svgEl("path", {
        d: `M ${(hl.right + 2).toFixed(2)} ${hl.cy.toFixed(2)} L ${corrX1.toFixed(2)} ${hl.cy.toFixed(2)} C ${midX.toFixed(2)} ${hl.cy.toFixed(2)}, ${midX.toFixed(2)} ${probe.cy.toFixed(2)}, ${endX.toFixed(2)} ${probe.cy.toFixed(2)}`,
        fill: "none",
        stroke: isLesion ? C.clay : C.deep,
        "stroke-width": step === 1 || isLesion ? 2.15 : 1.8,
        "stroke-linecap": "round",
      });
      arrowHead(probe.left - 3, probe.cy, 1, 0, isLesion ? C.clay : C.deep, headLen, 3.4);
    }

    // 4. Lower branch: h^(L) -> exits llm horizontally, then curves smoothly in corridor -> Verbal lm_head
    {
      const headLen = 6.8;
      const endX = verbal.left - 3 - headLen * 0.76;
      svgEl("path", {
        d: `M ${(hL.right + 2).toFixed(2)} ${hL.cy.toFixed(2)} L ${corrX1.toFixed(2)} ${hL.cy.toFixed(2)} C ${midX.toFixed(2)} ${hL.cy.toFixed(2)}, ${midX.toFixed(2)} ${verbal.cy.toFixed(2)}, ${endX.toFixed(2)} ${verbal.cy.toFixed(2)}`,
        fill: "none",
        stroke: C.clay,
        "stroke-width": step === 2 ? 2.15 : 1.8,
        "stroke-dasharray": "5 3",
        "stroke-linecap": "round",
      });
      arrowHead(verbal.left - 3, verbal.cy, 1, 0, C.clay, headLen, 3.4);
    }
  }

  function syncModeButtons() {
    document.querySelectorAll("[data-viewmode]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.viewmode === viewMode))
    );
  }

  function renderPills() {
    pillsHost.replaceChildren();
    chapters[lang()].forEach((ch, idx) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = ch.short;
      b.setAttribute("aria-pressed", String(idx === step));
      b.addEventListener("click", () => {
        stopPlay();
        step = idx;
        viewMode = step === 3 ? "lesion" : "readout";
        syncModeButtons();
        draw();
      });
      pillsHost.appendChild(b);
    });
    if (window.renderMathIn) window.renderMathIn(pillsHost);
  }

  function draw() {
    const zh = lang() === "zh";
    const isLesion = viewMode === "lesion";

    const scales = [
      ["0.5B", "96.9", "35.0"],
      ["1.5B", "99.4", "47.5"],
      ["3B", "98.8", "46.3"],
      ["7B", "99.4", "50.0"],
      ["14B", "99.4", "52.5"],
      ["32B", "99.4", "48.7"],
      ["72B", "100", "50.0"],
    ];

    nodesHost.innerHTML = `
      <div class="tt-main">
        <div class="stage-box tt-prompt-card ${step === 0 ? "is-active" : ""}" data-node="prompt">
          <span class="tt-eyebrow">Anti-CS CLADDER</span>
          <p class="tt-quote">
            ${
              zh
                ? "“假设在某世界中，<strong>吸烟可预防肺癌</strong>。问：吸烟会导致肺癌吗？”"
                : "“Suppose <strong>smoking prevents lung cancer</strong>. Does smoking cause lung cancer?”"
            }
          </p>
          <div class="tt-gold-box">
            <div>${zh ? "证据真值 (Gold): NO" : "Evidence Gold: NO"}</div>
            <div>${zh ? "常识先验 (Prior): YES" : "Commonsense Prior: YES"}</div>
          </div>
        </div>

        <div class="stage-box tt-llm-card ${isLesion ? "is-clay" : ""}" data-node="llm">
          <div>
            <div class="stage-box-title">${zh ? "冻结模型" : "Frozen LLM"} ${T("f_\\theta")}</div>
            <div class="stage-box-sub">0.5B → 72B (no grad)</div>
          </div>
          <div class="tt-stream">
            <div class="tt-state-pill" data-node="h8">${T("h^{(8)}")} · ${zh ? "浅层" : "early"}</div>
            <div class="tt-state-pill ${step >= 1 ? "is-active" : ""} ${isLesion ? "is-clay" : ""}" data-node="hl">
              ${isLesion ? T("(I - V_{\\mathrm{cs}}V_{\\mathrm{cs}}^\\top)h^{(\\ell)}") : `${T("h^{(\\ell^\\star)}")} · ${zh ? "探针层" : "mid-late"}`}
            </div>
            <div class="tt-state-pill ${step >= 2 ? "is-active" : ""}" data-node="hL">${T("h^{(L)}")} · ${zh ? "末层" : "final"}</div>
          </div>
        </div>

        <div class="tt-branches">
          <div class="stage-box tt-readout-card tt-readout-probe ${step === 1 ? "is-active" : ""}" data-node="probe">
            <div class="stage-box-title">${zh ? "内部线性探针" : "Frozen Probe"} ${T("g_w(h^{(\\ell^\\star)})")}</div>
            <div class="${isLesion ? "tt-verdict-bad" : "tt-verdict-good"}">
              ${
                isLesion
                  ? (zh ? `${T("V_{\\mathrm{cs}}")} 消去：−96.3% KL` : `${T("V_{\\mathrm{cs}}")} Erased: −96.3% KL`)
                  : (zh ? "读取：NO ✓（符合证据）" : "Reads: NO ✓ (Evidence-aligned)")
              }
            </div>
            <div class="tt-readout-meta">
              ${
                isLesion
                  ? `${T("V_{\\mathrm{ns}}")}: −31.7% · ${T("V_{\\mathrm{rand}}")}: +0.7%`
                  : `${T("\\mathrm{Acc}_{\\mathrm{probe}}")}: 96.9%–100%`
              }
            </div>
          </div>

          <div class="stage-box tt-readout-card tt-readout-verbal ${step === 2 ? "is-clay" : ""}" data-node="verbal">
            <div class="stage-box-title">${zh ? "口头输出" : "Verbal"} ${T("\\mathrm{lm\\_head}(h^{(L)})")}</div>
            <div class="tt-verdict-bad">${zh ? "输出：YES ✗（退回常识）" : "Says: YES ✗ (Prior fallback)"}</div>
            <div class="tt-readout-meta">${T("\\mathrm{Acc}_{\\mathrm{out}}")}: 35.0%–52.5% (${T("\\Delta \\approx +0.50")})</div>
            <div class="tt-readout-edge">
              ${zh ? `对比有向边（${T("c \\to e")} / ${T("e \\to c")}）：98.8%` : `Edge choice (${T("c \\to e")} / ${T("e \\to c")}): 98.8%`}
            </div>
          </div>
        </div>
      </div>

      <div class="tt-scale-strip" style="margin-top:10px;">
        <div class="tt-scale-head">
          ${
            zh
              ? `Qwen2.5 尺度扫描（0.5B → 72B，${T("N=80")} 反常识题）：${T("\\mathrm{Acc}_{\\mathrm{probe}}")} / ${T("\\mathrm{Acc}_{\\mathrm{out}}")}`
              : `Qwen2.5 Scale Sweep (0.5B → 72B, ${T("N=80")} anti-CS): ${T("\\mathrm{Acc}_{\\mathrm{probe}}")} / ${T("\\mathrm{Acc}_{\\mathrm{out}}")}`
          }
        </div>
        <div class="tt-scale-grid">
          ${scales
            .map(
              ([sz, p, o]) => `
            <div class="tt-scale-col">
              <span>${sz}</span>
              <strong>${p}% / ${o}%</strong>
            </div>`
            )
            .join("")}
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
      viewMode = step === 3 ? "lesion" : "readout";
      syncModeButtons();
      draw();
      if (step === 3) stopPlay();
    }, 2900);
  }

  playBtn.addEventListener("click", () => {
    if (timer) stopPlay();
    else {
      if (step === 3) step = 0;
      draw();
      startPlay();
    }
  });

  document.querySelectorAll("[data-viewmode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      stopPlay();
      viewMode = btn.dataset.viewmode;
      if (viewMode === "lesion") step = 3;
      else if (step === 3) step = 2;
      syncModeButtons();
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
