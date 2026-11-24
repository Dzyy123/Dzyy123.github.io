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

  let regime = "geo";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Frozen VLA",
        title: "Frozen base VLA predicts nominal chunk $A_{\\mathrm{nominal}}$.",
        body: "Supports $\\pi_{0.5}$, FastWAM, BridgeVLA, WMPO, and unseen OpenVLA-OFT without modifying or retraining backbone weights.",
      },
      {
        short: "2 · 0.9M Adapter",
        title: "Benchmark adapter aligns 7-DoF actions $a_t = [\\Delta x..\\Delta r_z, g]$.",
        body: "Fixed converters + 4-layer MLPs unify heterogeneous embodiments; Stage-3 adaptation tunes only 0.9M parameters (<1% of 400M) on 100 trajectories.",
      },
      {
        short: "3 · 3D Geometry",
        title: "Two-view DINOv2 & QFormer extract geometry $G$ and regions $R$.",
        body: "Pretrained in Stage 1 with depth and Grounded-SAM region supervision over 120k RGB pairs, staying stable under lighting and background shifts.",
      },
      {
        short: "4 · Gate $\\gamma \\odot \\Delta A$",
        title: "Residual refiner predicts gate $\\gamma$ and bounded $\\Delta A = s\\tanh(\\cdot)$.",
        body: "Trajectory tokens $T$ cross-attend to $(G, R)$; removing $\\gamma$ causes over-correction under lighting shifts ($-2.3$ pp on LIBERO-Plus Light).",
      },
      {
        short: "5 · Execution",
        title: "$A_{\\mathrm{refined}} = A_{\\mathrm{nominal}} + \\gamma \\odot \\Delta A$ lifts precision across robots.",
        body: "Boosts MimicGen by +13.8 pp avg ($\\pi_{0.5}$ +18.2 pp), unseen OpenVLA-OFT by +10.1 pp, Franka by +22%, and AgileX Piper by +25%.",
      },
    ],
    zh: [
      {
        short: "1 · 冻结基座",
        title: "冻结基座 VLA 输出名义动作块 $A_{\\mathrm{nominal}}$",
        body: "即插即用兼容 $\\pi_{0.5}$、FastWAM、BridgeVLA、WMPO 以及训练期未见过的 OpenVLA-OFT，无需改动或重训基座。",
      },
      {
        short: "2 · 0.9M 适配器",
        title: "基准适配器统一 7 自由度末端动作空间 $a_t = [\\Delta x..\\Delta r_z, g]$",
        body: "固定坐标变换配合 4 层校准 MLP 消除跨平台分布差异；阶段三仅需 100 条轨迹微调 0.9M 参数（占 400M 总量不足 1%）。",
      },
      {
        short: "3 · 三维几何",
        title: "双视角 DINOv2 与 QFormer 提取几何特征 $G$ 与关键区域 $R$",
        body: "阶段一在 12 万组双视角图像上联合深度与 Grounded-SAM 区域热力图预训练，在光照与背景扰动下保持稳定关注。",
      },
      {
        short: "4 · 门控残差",
        title: "残差精修器预测逐维门控 $\\gamma$ 与有界修正 $\\Delta A = s\\tanh(\\cdot)$",
        body: "轨迹动力学特征 $T$ 与 $(G, R)$ 交叉注意力融合；去掉门控 $\\gamma$ 会在光照变化下过度修正（LIBERO-Plus Light 跌 $-2.3$ pp）。",
      },
      {
        short: "5 · 精修执行",
        title: "$A_{\\mathrm{refined}} = A_{\\mathrm{nominal}} + \\gamma \\odot \\Delta A$ 显著提升接触与抗扰精度",
        body: "MimicGen 平均提升 +13.8 pp（$\\pi_{0.5}$ +18.2 pp），未见过的 OpenVLA-OFT 提升 +10.1 pp，Franka +22%，AgileX Piper +25%。",
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

  function arrowHead(tipX, tipY, ux, uy, color, headLen = 6.5, headHalfW = 3.25, opacity = 1) {
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

    const isBase = regime === "base";
    const { vla, nom, skip, obs, enc, ref, out } = map;
    if (!vla || !nom || !skip || !obs || !enc || !ref || !out) return;

    // 1. Top nominal spine: Frozen Base VLA -> Benchmark Adapter -> Skip Pill -> Output (upper entry)
    const topCol = isBase ? C.clay : step >= 1 ? C.deep : C.muted;
    drawLineArrow(vla.right + 3, vla.cy, nom.left - 3, nom.cy, {
      color: topCol,
      width: 1.9,
    });

    svgEl("line", {
      x1: (nom.right + 3).toFixed(2),
      y1: nom.cy.toFixed(2),
      x2: (skip.left - 4).toFixed(2),
      y2: skip.cy.toFixed(2),
      stroke: isBase ? C.clay : C.accent,
      "stroke-width": 1.65,
      "stroke-dasharray": isBase ? "" : "4 3",
      "stroke-linecap": "round",
    });

    drawLineArrow(skip.right + 4, skip.cy, out.left - 3, skip.cy, {
      color: isBase ? C.clay : C.accent,
      width: 1.75,
      dash: isBase ? "" : "4 3",
    });

    // 2. Action trajectory tokens T curved cleanly from Adapter bottom into Refiner top (open space under skip pill)
    const branchAlpha = isBase ? 0.32 : 1;
    const dynCol = isBase ? C.muted : step >= 3 ? C.deep : C.muted;
    drawCubicArrow(
      nom.cx + 12,
      nom.bottom + 2.5,
      nom.cx + 12,
      (nom.bottom + ref.top) / 2 + 4,
      ref.cx - 10,
      (nom.bottom + ref.top) / 2 - 4,
      ref.cx - 10,
      ref.top - 3,
      {
        color: dynCol,
        width: 1.65,
        dash: isBase || step < 3 ? "4 3" : "",
        opacity: branchAlpha,
      }
    );

    // 3. Bottom geometry spine: 2-View RGB + Lang -> 3D Geometry Encoder -> Residual Refiner -> Output (lower entry)
    const geoCol = isBase ? C.muted : step >= 2 ? C.deep : C.muted;
    drawLineArrow(obs.right + 3, obs.cy, enc.left - 3, enc.cy, {
      color: geoCol,
      width: 1.8,
      dash: isBase || step < 2 ? "4 3" : "",
      opacity: branchAlpha,
    });

    drawLineArrow(enc.right + 3, enc.cy, ref.left - 3, ref.cy, {
      color: isBase ? C.muted : step >= 3 ? C.deep : C.muted,
      width: 1.85,
      dash: isBase || step < 3 ? "4 3" : "",
      opacity: branchAlpha,
    });

    drawLineArrow(ref.right + 3, ref.cy, out.left - 3, ref.cy, {
      color: isBase ? C.muted : step >= 4 ? C.deep : C.accent,
      width: isBase ? 1.5 : 2.0,
      dash: isBase || step < 4 ? "4 3" : "",
      opacity: branchAlpha,
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
    const isBase = regime === "base";
    const zh = lang() === "zh";

    const stripTitle = isBase
      ? zh
        ? `名义基座 VLA 在视觉扰动下退化（COLOSSEUM MO-Color，${T("\\pi_{0.5}")}）`
        : `Nominal Base VLA Under Perturbation (COLOSSEUM MO-Color, ${T("\\pi_{0.5}")})`
      : zh
        ? `即插即用增益总览（${T("\\pi_{0.5}")} · MimicGen 与双平台真机）`
        : `Plug-and-Play Gains on ${T("\\pi_{0.5}")} (MimicGen · Franka · AgileX Piper)`;

    const stripSub = isBase
      ? zh
        ? `无扰动 66.3% 跌至 43.8%（−22.5 pp）；接入 GeoRefiner 恢复至 57.4%`
        : `Clean 66.3% drops to 43.8% (−22.5 pp); +GeoRefiner restores 57.4%`
      : zh
        ? `MimicGen 36.3% → 54.5%（+18.2 pp）· Franka +22% · Piper +25%`
        : `MimicGen 36.3% → 54.5% (+18.2 pp) · Franka +22% · Piper +25%`;

    const bPct = isBase ? 43.8 : 36.3;
    const oPct = isBase ? 57.4 : 54.5;

    nodesHost.innerHTML = `
      <div class="geo-grid">
        <div class="stage-box geo-vla ${step === 0 ? "is-active" : ""}" data-node="vla">
          <div class="stage-box-title">${zh ? "冻结基座 VLA" : "Frozen Base VLA"}</div>
          <div class="stage-box-sub">${T("\\pi_{0.5}")} · FastWAM · OpenVLA</div>
        </div>

        <div class="stage-box geo-nom ${isBase ? "is-clay" : step === 1 ? "is-active" : ""}" data-node="nom">
          <div class="stage-box-title">${zh ? "0.9M 适配器" : "0.9M Adapter"}</div>
          <div class="stage-box-sub">${zh ? "名义" : "Nominal"} ${T("A_{\\mathrm{nominal}}")}</div>
        </div>

        <span class="stage-pill geo-skip ${!isBase && step >= 3 ? "is-active" : ""}" data-node="skip">
          ${zh ? "直连" : "Pass"} ${T("A_{\\mathrm{nominal}}")}
        </span>

        <div class="stage-box geo-obs ${isBase ? "is-dim" : step === 2 ? "is-active" : ""}" data-node="obs">
          <div class="stage-box-title">${zh ? "双视角 RGB + 语言" : "2-View RGB + CLIP"}</div>
          <div class="stage-box-sub">${zh ? "全局 / 腕部相机" : "Global & Wrist RGB"}</div>
        </div>

        <div class="stage-box geo-enc ${isBase ? "is-dim" : step === 2 ? "is-active" : ""}" data-node="enc">
          <div class="stage-box-title">${zh ? "三维几何编码器" : "3D Geometry"}</div>
          <div class="stage-box-sub">DINOv2 ${T("G")} + QFormer ${T("R")}</div>
        </div>

        <div class="stage-box geo-ref ${isBase ? "is-dim" : step === 3 ? "is-active" : ""}" data-node="ref">
          <div class="stage-box-title">${zh ? "门控残差精修" : "Residual Refiner"}</div>
          <div class="stage-box-sub">${T("\\gamma \\odot \\Delta A,\\; |\\Delta A| \\le s")}</div>
        </div>

        <div class="stage-box geo-out ${isBase ? "is-clay" : step === 4 ? "is-active" : ""}" data-node="out">
          <div class="stage-box-title">${isBase ? (zh ? "未精修执行" : "Unrefined Action") : (zh ? "精修输出动作" : "Refined Action")}</div>
          <div class="stage-box-sub">${
            isBase
              ? zh
                ? `${T("A_{\\mathrm{nominal}}")}（局部接触偏差）`
                : `${T("A_{\\mathrm{nominal}}")} (contact drift)`
              : T("A_{\\mathrm{nominal}} + \\gamma \\odot \\Delta A")
          }</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:8px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${isBase ? "is-clay" : ""}">${stripSub}</div>
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
