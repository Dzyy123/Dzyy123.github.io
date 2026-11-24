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

  let regime = "occlusion";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Slots $(S_t, S_{t+\\Delta})$",
        title: "Frozen DINOv2 + Slot Attention group patches across $(o_t, o_{t+\\Delta})$.",
        body: "Feature reconstruction $\\mathcal{L}_{\\mathrm{feat}}$ and cross-frame patch similarity $\\mathcal{L}_{\\mathrm{sim}}$ track objects without pose labels at inference.",
      },
      {
        short: "2 · Hand Queries",
        title: "Left/right hand queries pool 8 object slots at $1{,}180.45$ cached pairs/s.",
        body: "Keypoint supervision $\\mathcal{L}_{\\mathrm{hand}}$ focuses attention on the acting hand and manipulated object ($1.35\\mathrm{M}$-param action branch).",
      },
      {
        short: "3 · Wrist Readout",
        title: "3D wrist supervision lifts unseen decoding to $R^2 = 0.5343$.",
        body: "Expressing both wrists in the earlier head frame recovers cup-lift direction within $17^\\circ$, versus $126^\\circ$ for LAPA and $103^\\circ$ for GeoLAM.",
      },
      {
        short: "4 · Camera Split",
        title: "Head motion $n_t$ feeds the FDM while GRL + warps guard $z_t$.",
        body: "Gradient reversal $\\mathcal{L}_{\\mathrm{adv}}$ and 2D warps $\\mathcal{L}_{\\mathrm{inv}}$ cut sensitivity to $0.7673$ (IC-camera) and $0.1699$ (IC-photo).",
      },
      {
        short: "5 · LIBERO Policy",
        title: "Latent action pretraining reaches $79.38\\%$ mean LIBERO success.",
        body: "Pretraining $\\pi_\\phi(o_{\\le t})$ on frozen $z_t$ before 7D fine-tuning gains $+28.73$ pp over Expert BC and $+9.76$ pp over the strongest competing LAM.",
      },
    ],
    zh: [
      {
        short: "1 · 物体槽 $(S_t, S_{t+\\Delta})$",
        title: "冻结 DINOv2 与槽注意力提取双帧物体槽 $(S_t, S_{t+\\Delta})$",
        body: "特征重建 $\\mathcal{L}_{\\mathrm{feat}}$ 与跨帧块相似度 $\\mathcal{L}_{\\mathrm{sim}}$ 建立时序对应，推理阶段无需任何位姿标注。",
      },
      {
        short: "2 · 手部查询",
        title: "双手查询聚合 8 个物体槽，缓存吞吐达 $1{,}180.45$ 对/秒",
        body: "关键点区域损失 $\\mathcal{L}_{\\mathrm{hand}}$ 引导查询聚焦于操作手与接触物体（动作分支仅 $1.35\\mathrm{M}$ 参数）。",
      },
      {
        short: "3 · 手腕解码",
        title: "统一头部参考系下的三维手腕监督使未见集 $R^2$ 达 $0.5343$",
        body: "举杯实验中操作左手三维位移方向误差仅为 $17^\\circ$，显著优于 LAPA（$126^\\circ$）与 GeoLAM（$103^\\circ$）。",
      },
      {
        short: "4 · 视角解耦",
        title: "头部运动 $n_t$ 单独送入 FDM，GRL 与图像变换约束 $z_t$",
        body: "梯度反转 $\\mathcal{L}_{\\mathrm{adv}}$ 与二维变换一致性 $\\mathcal{L}_{\\mathrm{inv}}$ 将相机与光照敏感度压低至 $0.7673$ 与 $0.1699$。",
      },
      {
        short: "5 · 策略迁移",
        title: "潜动作预训练在三大 LIBERO 套件取得 $79.38\\%$ 平均成功率",
        body: "预测冻结教师编码 $z_t$ 并经 7 自由度微调后，较专家行为克隆提升 $+28.73$ 个百分点，较最强对比潜动作模型提升 $+9.76$ 个百分点。",
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

    const occ = regime === "occlusion";
    const { phand, pcam, rgb, slots, idm, out, headm, fdm } = map;
    if (!rgb || !slots || !idm || !out || !headm || !fdm) return;

    // 1. Top supervision/occlusion pills -> Slots & IDM
    if (phand) {
      drawLineArrow(phand.cx, phand.bottom + 2.5, slots.cx, slots.top - 3, {
        color: occ ? C.clay : step === 1 ? C.accent : C.muted,
        width: step === 1 || occ ? 1.85 : 1.4,
        dash: occ ? "3 2.5" : "",
        headLen: 5.8,
        headHalfW: 2.9,
      });
    }
    if (pcam) {
      drawLineArrow(pcam.cx, pcam.bottom + 2.5, idm.cx, idm.top - 3, {
        color: step === 3 ? C.accent : C.muted,
        width: step === 3 ? 1.85 : 1.4,
        dash: "3 2.5",
        headLen: 5.8,
        headHalfW: 2.9,
      });
    }

    // 2. Main RGB -> Slots -> Hand-Pooled IDM -> Wrist/Policy readout spine
    const ySpine = idm.cy;
    drawLineArrow(rgb.right + 3, ySpine, slots.left - 3, ySpine, {
      color: step >= 0 ? C.deep : C.muted,
      width: step >= 1 ? 1.95 : 1.55,
    });

    drawLineArrow(slots.right + 3, ySpine, idm.left - 3, ySpine, {
      color: step >= 1 ? C.deep : C.muted,
      width: step >= 1 ? 1.95 : 1.5,
      dash: step >= 1 ? "" : "4 3",
    });

    drawLineArrow(idm.right + 3, ySpine, out.left - 3, ySpine, {
      color: occ && step >= 2 ? C.clay : step >= 2 ? C.deep : C.muted,
      width: step >= 2 ? 2.0 : 1.5,
      dash: step >= 2 ? "" : "4 3",
    });

    // 3. Bottom camera-conditioned forward dynamics branch (IDM z_t -> FDM <- Head motion n_t)
    drawLineArrow(idm.cx, idm.bottom + 2.5, fdm.cx, fdm.top - 3, {
      color: step === 3 ? C.deep : C.muted,
      width: step === 3 ? 1.9 : 1.45,
      dash: step === 3 ? "" : "3 2.5",
      headLen: 5.8,
      headHalfW: 2.9,
    });

    drawLineArrow(headm.right + 3, fdm.cy, fdm.left - 3, fdm.cy, {
      color: step === 3 ? C.accent : C.muted,
      width: step === 3 ? 1.9 : 1.45,
      dash: step === 3 ? "" : "3 2.5",
      headLen: 5.8,
      headHalfW: 2.9,
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
    const occ = regime === "occlusion";
    const zh = lang() === "zh";

    const stripTitle = occ
      ? (zh ? "LIBERO 三套件闭环成功率（表 3）与手腕解码（表 2）" : "LIBERO Closed-Loop Mean Success (Table 3) & Wrist AD")
      : (zh ? `未见集三维手腕运动解码 ${T("R^2")} ↑（表 2 · 1,180.45 对/秒）` : `Unseen 3D Wrist Decoding ${T("R^2")} ↑ (Table 2 · 1,180.45 pairs/s)`);
    const stripSub = occ
      ? (zh ? `专家 BC 50.65% → EgoLAM 79.38%（+28.73 pp）· ${T("R^2 = 0.534")}` : `Expert BC 50.65% → EgoLAM 79.38% (+28.73 pp) · ${T("R^2 = 0.534")}`)
      : (zh ? "GeoLAM 0.431 → EgoLAM 0.534（IC-cam 0.767 · IC-photo 0.170）" : "GeoLAM 0.431 → EgoLAM 0.534 (IC-cam 0.767 · IC-photo 0.170)");
    const bPct = occ ? 50.6 : 43.1;
    const oPct = occ ? 79.4 : 53.4;
    const bLabel = occ ? "50.7%" : "0.431";
    const oLabel = occ ? "79.4%" : "0.534";

    nodesHost.innerHTML = `
      <div class="ego-grid">
        <span class="stage-pill ego-pill-hand ${step === 1 && !occ ? "is-active" : ""} ${occ ? "is-clay" : ""}" data-node="phand">
          ${occ ? (zh ? "5×5 遮挡峰值锁手" : "5×5 mask on hand") : T("\\mathcal{L}_{\\mathrm{hand}}") + " · " + (zh ? "关键点引导" : "8-slot pool")}
        </span>

        <span class="stage-pill ego-pill-cam ${step === 3 ? "is-active" : ""}" data-node="pcam">
          ${T("\\operatorname{GRL}")} + ${T("\\mathcal{L}_{\\mathrm{inv}}")} · ${zh ? "抗视角扰动" : "IC 0.767"}
        </span>

        <div class="stage-box ego-cell-rgb ${step === 0 ? "is-active" : ""}" data-node="rgb">
          <div class="stage-box-title">${zh ? "双帧图像" : "RGB Pair"}</div>
          <div class="stage-box-sub">${T("(o_t,\\, o_{t+\\Delta})")}</div>
        </div>

        <div class="stage-box ego-cell-slots ${step === 0 || step === 1 ? "is-active" : ""}" data-node="slots">
          <div class="stage-box-title">${zh ? "冻结物体槽" : "DINO + Slots"}</div>
          <div class="stage-box-sub">${T("(S_t,\\, S_{t+\\Delta})")}</div>
        </div>

        <div class="stage-box ego-cell-idm ${step === 1 || step === 2 ? "is-active" : ""}" data-node="idm">
          <div class="stage-box-title">${zh ? "手部查询 IDM" : "Hand-Query IDM"}</div>
          <div class="stage-box-sub">${T("z_t = f_\\theta(q_{t+\\Delta} - q_t)")}</div>
        </div>

        <div class="stage-box ego-cell-out ${step >= 2 && !occ ? "is-active" : ""} ${occ && step >= 2 ? "is-clay" : ""}" data-node="out">
          <div class="stage-box-title">${occ ? (zh ? "手腕方向对齐" : "3D Wrist Vector") : (zh ? "手腕读出与策略" : "Wrist & Policy")}</div>
          <div class="stage-box-sub">${occ ? `${T("17^\\circ")} vs. LAPA ${T("126^\\circ")}` : `${T("g_{\\mathrm{hand}}(z_t)")} · 79.38%`}</div>
        </div>

        <div class="stage-box ego-cell-head ${step === 3 ? "is-active" : ""}" data-node="headm">
          <div class="stage-box-title">${zh ? "头部运动" : "Head Motion"} ${T("n_t")}</div>
          <div class="stage-box-sub">${occ ? (zh ? `大转头 ${T("5.47")} vs. ${T("9.63\\,\\mathrm{cm}")}` : `Turn: ${T("5.47")} vs. ${T("9.63\\,\\mathrm{cm}")}`) : (zh ? "仅训练期输入" : "Train-only pose")}</div>
        </div>

        <div class="stage-box ego-cell-fdm ${step === 3 ? "is-active" : ""}" data-node="fdm">
          <div class="stage-box-title">${zh ? "前向槽预测" : "Slot FDM"}</div>
          <div class="stage-box-sub">${T("\\hat{S}_{t+\\Delta} = \\operatorname{FDM}(S_t, z_t, n_t)")}</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${occ ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill base" style="width:${bPct}%"></i></div>
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
