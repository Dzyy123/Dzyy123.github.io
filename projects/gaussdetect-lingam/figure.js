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

  let regime = "nongauss";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · OLS Residuals",
        title: "Fit forward and reverse OLS regressions on standardized $(X, Y)$.",
        body: "Algorithm 1 computes residuals $r_{Y|X} = Y - \\hat{a}X$ and $r_{X|Y} = X - \\hat{b}Y$ directly—no ex-ante non-Gaussianity assumption is required.",
      },
      {
        short: "2 · Skitovich–Darmois",
        title: "Theorem 4.2 links reverse independence to Gaussianity.",
        body: "Because $(Y, \\epsilon_X)^\\top$ is an invertible linear transform of $(X, \\epsilon_Y)^\\top$, $Y \\perp\\!\\!\\!\\perp \\epsilon_X$ holds iff $X \\perp\\!\\!\\!\\perp \\epsilon_Y$ and both variables are Gaussian.",
      },
      {
        short: "3 · Skip Normality Test",
        title: "Theorem 4.3 proves $\\varphi_{\\mathrm{IT}i}(S) = \\varphi_{\\mathrm{GT}i}(S)$.",
        body: "Kernel independence tests on $(X, r_{Y|X})$ and $(Y, r_{X|Y})$ replace sample-sensitive Shapiro–Wilk, Anderson–Darling, and Jarque–Bera pre-tests.",
      },
      {
        short: "4 · Joint Verdict",
        title: "Two independence tests identify direction or abstain safely.",
        body: "$(\\varphi_1, \\varphi_2) = (0, 1)$ identifies $X \\to Y$; $(1, 1)$ detects Gaussian disturbances and abstains in $2.00$ tests per decision.",
      },
    ],
    zh: [
      {
        short: "1 · 双向回归残差",
        title: "对标准化变量 $(X, Y)$ 拟合正向与反向 OLS 回归",
        body: "算法 1 直接提取正向残差 $r_{Y|X} = Y - \\hat{a}X$ 与反向残差 $r_{X|Y} = X - \\hat{b}Y$，无需先验假设噪声非高斯。",
      },
      {
        short: "2 · Skitovich–Darmois",
        title: "定理 4.2 建立反向残差独立性与高斯性的充要等价",
        body: "由于 $(Y, \\epsilon_X)^\\top$ 是 $(X, \\epsilon_Y)^\\top$ 的满秩线性组合，$Y \\perp\\!\\!\\!\\perp \\epsilon_X$ 当且仅当 $X \\perp\\!\\!\\!\\perp \\epsilon_Y$ 且二者均服从正态分布。",
      },
      {
        short: "3 · 免除正态性预检",
        title: "定理 4.3 证明 $\\varphi_{\\mathrm{IT}i}(S) = \\varphi_{\\mathrm{GT}i}(S)$ 样本级一致",
        body: "用稳健核独立性检验替代对样本量敏感的 Shapiro–Wilk、Anderson–Darling 与 Jarque–Bera 正态性检验。",
      },
      {
        short: "4 · 四态联合判决",
        title: "仅需 2.00 次独立性检验即可识别因果方向或安全弃权",
        body: "$(\\varphi_1, \\varphi_2) = (0, 1)$ 判定 $X \\to Y$；双高斯时输出 $(1, 1)$ 自动声明不可识别并安全弃权。",
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

    const { scm, olsF, olsR, it2, it1, verdict } = map;
    if (!scm || !olsF || !olsR || !it2 || !it1 || !verdict) return;

    const isGauss = regime === "gauss";
    const c1 = step >= 0 ? C.deep : C.muted;
    const c2 = step >= 2 ? C.deep : C.muted;
    const cRev = step >= 1 ? (isGauss ? C.clay : C.accent) : C.muted;
    const c3 = step >= 3 ? (isGauss ? C.clay : C.deep) : C.muted;

    const mid1 = (scm.right + olsF.left) / 2;
    drawCubicArrow(scm.right + 3, scm.cy - 6, mid1, scm.cy - 6, mid1, olsF.cy, olsF.left - 3, olsF.cy, {
      color: c1,
      width: step === 0 ? 2.0 : 1.65,
    });
    drawCubicArrow(scm.right + 3, scm.cy + 6, mid1, scm.cy + 6, mid1, olsR.cy, olsR.left - 3, olsR.cy, {
      color: c1,
      width: step === 0 ? 2.0 : 1.65,
    });

    drawLineArrow(olsF.right + 3, olsF.cy, it2.left - 3, it2.cy, {
      color: c2,
      width: step >= 2 ? 1.95 : 1.5,
      dash: step >= 2 ? "" : "4 3",
    });
    drawLineArrow(olsR.right + 3, olsR.cy, it1.left - 3, it1.cy, {
      color: cRev,
      width: step >= 1 ? 1.95 : 1.5,
      dash: step >= 1 ? "" : "4 3",
    });

    const mid3 = (it2.right + verdict.left) / 2;
    drawCubicArrow(it2.right + 3, it2.cy, mid3, it2.cy, mid3, verdict.cy - 7, verdict.left - 3, verdict.cy - 7, {
      color: c3,
      width: step === 3 ? 2.0 : 1.5,
      dash: step >= 3 ? "" : "4 3",
    });
    drawCubicArrow(it1.right + 3, it1.cy, mid3, it1.cy, mid3, verdict.cy + 7, verdict.left - 3, verdict.cy + 7, {
      color: c3,
      width: step === 3 ? 2.0 : 1.5,
      dash: step >= 3 ? "" : "4 3",
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
    const isGauss = regime === "gauss";
    const zh = lang() === "zh";

    const stripTitle = isGauss
      ? (zh ? "双高斯分布诊断（定理 4.2 & 4.3）" : "Linear-Gaussian Regime (Theorems 4.2 & 4.3)")
      : (zh ? `Laplace 噪声（${T("n = 800")}）· 每次决策平均检验数 TPD` : `Laplace Noise (${T("n = 800")}) · Tests per Decision (TPD)`);
    const stripSub = isGauss
      ? (zh ? `双向残差均独立 ${T("(1, 1)")} → 自动判定高斯噪声并安全弃权` : `Both residuals independent ${T("(1, 1)")} → diagnoses Gaussian noise & abstains`)
      : (zh ? "Pairwise-LiNGAM ~2.63 次 → GaussDetect-LiNGAM 恒定 2.00 次" : "Pairwise-LiNGAM ~2.63 tests → GaussDetect-LiNGAM 2.00 tests");

    const barBaseW = isGauss ? 100 : (2.63 / 3.0) * 100;
    const barOursW = (2.0 / 3.0) * 100;
    const barBaseLbl = isGauss ? "3 tests" : "~2.63";
    const barOursLbl = "2.00";

    nodesHost.innerHTML = `
      <div class="gd-grid">
        <span class="stage-pill gd-skip-pill ${step >= 2 ? "is-active" : ""}" data-node="skipgt">
          ${zh ? "定理 4.3：" : "Thm. 4.3:"} ${T("\\varphi_{\\mathrm{IT}i} = \\varphi_{\\mathrm{GT}i}")} · ${zh ? "0 次正态性预检" : "0 normality pre-tests"}
        </span>

        <div class="stage-box gd-cell-scm ${step === 0 ? "is-active" : ""}" data-node="scm">
          <div class="stage-box-title">${zh ? "观测对" : "Data"} ${T("(X, Y)")}</div>
          <div class="stage-box-sub">${
            isGauss
              ? T("X, \\epsilon_Y \\sim \\mathcal{N}")
              : `${T("Y = aX + \\epsilon_Y")} (${zh ? "非高斯" : "non-"}${T("\\mathcal{N}")})`
          }</div>
        </div>

        <div class="stage-box gd-cell-olsf ${step === 0 ? "is-active" : ""}" data-node="olsF">
          <div class="stage-box-title">${zh ? "正向 OLS" : "Forward OLS"}</div>
          <div class="stage-box-sub">${T("r_{Y|X} = Y - \\hat{a}X")}</div>
        </div>

        <div class="stage-box gd-cell-olsr ${step === 0 ? "is-active" : ""}" data-node="olsR">
          <div class="stage-box-title">${zh ? "反向 OLS" : "Reverse OLS"}</div>
          <div class="stage-box-sub">${T("r_{X|Y} = X - \\hat{b}Y")}</div>
        </div>

        <div class="stage-box gd-cell-it2 ${step === 2 ? "is-active" : ""}" data-node="it2">
          <div class="stage-box-title">${zh ? "正向检验" : "Test"} ${T("X \\perp\\!\\!\\!\\perp r_{Y|X}")}</div>
          <div class="stage-box-sub">${T("\\varphi_2 = 1")} (${zh ? "独立" : "accept"})</div>
        </div>

        <div class="stage-box gd-cell-it1 ${step === 1 || step === 2 ? "is-active" : ""} ${!isGauss && step >= 1 ? "is-clay" : ""}" data-node="it1">
          <div class="stage-box-title">${zh ? "反向检验" : "Test"} ${T("Y \\perp\\!\\!\\!\\perp r_{X|Y}")}</div>
          <div class="stage-box-sub">${
            isGauss
              ? `${T("\\varphi_1 = 1")} (${T("\\epsilon_Y \\sim \\mathcal{N}")})`
              : `${T("\\varphi_1 = 0")} (${T("Y \\not\\perp r_{X|Y}")})`
          }</div>
        </div>

        <div class="stage-box gd-cell-verdict ${step === 3 ? "is-active" : ""} ${isGauss && step === 3 ? "is-clay" : ""}" data-node="verdict">
          <div class="stage-box-title">${T(isGauss ? "(\\varphi_1,\\varphi_2)=(1,1)" : "(\\varphi_1,\\varphi_2)=(0,1)")}</div>
          <div class="stage-box-sub">${
            isGauss
              ? (zh ? "高斯噪声 · 弃权" : "Gaussian · Abstain")
              : `${zh ? "输出" : "Identify"} ${T("X \\to Y")}`
          }</div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">${stripTitle}</div>
          <div class="stage-strip-sub ${isGauss ? "is-clay" : ""}">${stripSub}</div>
        </div>
        <div class="stage-mini-bars">
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill base" style="width:${barBaseW.toFixed(1)}%"></i></div>
            <span class="stage-mini-num">${barBaseLbl}</span>
          </div>
          <div class="stage-mini-row">
            <div class="stage-mini-track"><i class="stage-mini-fill ours" style="width:${barOursW.toFixed(1)}%"></i></div>
            <span class="stage-mini-num ours">${barOursLbl}</span>
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
