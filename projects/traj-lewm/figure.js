(() => {
  const board = document.getElementById("stage-board");
  const nodesHost = document.getElementById("stage-nodes");
  const pillsHost = document.getElementById("chapter-pills");
  const playBtn = document.getElementById("stage-play");
  const headingEl = document.getElementById("stage-heading");
  const detailEl = document.getElementById("stage-detail");
  if (!board || !nodesHost) return;

  const NS = "http://www.w3.org/2000/svg";
  const C = {
    ink: "#182920",
    accent: "#3c5e42",
    deep: "#233f35",
    clay: "#984b2a",
    claySoft: "#f6ebe3",
  };

  let scorer = "joint";
  let step = 0;
  let timer = null;

  const T = (expr) => (window.tex ? window.tex(expr) : expr);

  const chapters = {
    en: [
      {
        short: "1 · Endpoint Tie",
        title: "Matched endpoints can still fail under execution.",
        body: "Plans $\\hat{\\tau}_A$ and $\\hat{\\tau}_B$ end within $|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}$ of goal $z_g$, yet $\\hat{\\tau}_A$ clips the wall while $\\hat{\\tau}_B$ clears the doorway.",
      },
      {
        short: "2 · LTC $S_\\psi$",
        title: "LTC scores every step along $(z_t, \\Delta z_t, z_g - z_t, \\eta_t)$.",
        body: "With $<1\\mathrm{M}$ parameters, $S_\\psi$ penalizes implausible intermediate transitions along $\\hat{\\tau}_A$.",
      },
      {
        short: "3 · Preferences",
        title: "Preferences shape both encoder $E_\\theta$ and LTC $S_\\psi$.",
        body: "Fixed-endpoint jitter and mined CEM failures shift visual attention onto walls and doorways (Fig. 5).",
      },
      {
        short: "4 · Re-ranking $C_\\lambda$",
        title: "Joint score $C_\\lambda$ ranks feasible paths ahead 94.4% of the time.",
        body: "On 207 endpoint-matched Reacher pairs, LTC assigns lower cost to successful executions (mean $S_\\psi$: 13.8 vs. 15.8).",
      },
    ],
    zh: [
      {
        short: "1 · 终点盲区",
        title: "预测终点同样接近，真实执行结果却相反",
        body: "候选 $\\hat{\\tau}_A$ 与 $\\hat{\\tau}_B$ 终点距离匹配（$|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}$），但 $\\hat{\\tau}_A$ 穿墙碰撞、$\\hat{\\tau}_B$ 经门洞通行。",
      },
      {
        short: "2 · 路径泛函 $S_\\psi$",
        title: "LTC 逐帧评估 $(z_t, \\Delta z_t, z_g - z_t, \\eta_t)$",
        body: "不到 1M 参数即可对候选 $\\hat{\\tau}_A$ 中间步的穿墙跳变施加高惩罚。",
      },
      {
        short: "3 · 偏好塑形",
        title: "偏好监督同时校准编码器 $E_\\theta$ 与 $S_\\psi$",
        body: "固定首尾扰动与闭环失败样本引导编码器关注隔墙与门洞瓶颈（图 5）。",
      },
      {
        short: "4 · 联合重排 $C_\\lambda$",
        title: "终点匹配难例上正确排序率达 94.4%",
        body: "在 Reacher 207 组终点匹配对上，成功轨迹平均 $S_\\psi$ 显著更低（13.8 vs. 15.8）。",
      },
    ],
  };

  function lang() {
    return document.documentElement.lang === "zh-CN" ? "zh" : "en";
  }

  function svgEl(parent, tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    parent.appendChild(n);
    return n;
  }

  function arrowHead(parent, tipX, tipY, ux, uy, color, headLen = 6.8, headHalfW = 3.4) {
    const bx = tipX - ux * headLen;
    const by = tipY - uy * headLen;
    const nx = -uy;
    const ny = ux;
    svgEl(parent, "polygon", {
      points: `${tipX.toFixed(2)},${tipY.toFixed(2)} ${(bx + nx * headHalfW).toFixed(2)},${(by + ny * headHalfW).toFixed(2)} ${(bx - nx * headHalfW).toFixed(2)},${(by - ny * headHalfW).toFixed(2)}`,
      fill: color,
    });
  }

  function drawArenaSvg() {
    const arenaWrap = nodesHost.querySelector(".traj-arena-wrap");
    const arenaSvg = nodesHost.querySelector("#arena-svg");
    if (!arenaWrap || !arenaSvg) return;
    arenaSvg.replaceChildren();

    const isJoint = scorer === "joint";
    const W = 350;
    const H = 188;
    const rect = arenaWrap.getBoundingClientRect();

    // Helper to convert rendered badge rect to 350x188 viewBox coordinates
    function tagBox(sel) {
      const el = arenaWrap.querySelector(sel);
      if (!el || rect.width < 10 || rect.height < 10) return null;
      const r = el.getBoundingClientRect();
      return {
        left: ((r.left - rect.left) / rect.width) * W,
        right: ((r.right - rect.left) / rect.width) * W,
        top: ((r.top - rect.top) / rect.height) * H,
        bottom: ((r.bottom - rect.top) / rect.height) * H,
        cy: (((r.top + r.bottom) / 2 - rect.top) / rect.height) * H,
      };
    }

    // 1. Central Partition Wall (x=178..185) with Doorway gap y=46..86 (center y=66)
    svgEl(arenaSvg, "rect", { x: 178, y: 12, width: 7, height: 34, rx: 3, fill: "#b5beb1" });
    svgEl(arenaSvg, "rect", { x: 178, y: 86, width: 7, height: 90, rx: 3, fill: "#8e9a8b" });

    // 2. Doorway attention ring & exact leader line to tag-door (step >= 2)
    if (step >= 2) {
      svgEl(arenaSvg, "circle", {
        cx: 181.5,
        cy: 66,
        r: 15.5,
        fill: C.accent,
        "fill-opacity": 0.13,
        stroke: C.accent,
        "stroke-width": 1.3,
        "stroke-dasharray": "3 2",
      });
      const doorRect = tagBox('[data-tag="door"]');
      if (doorRect) {
        const tx = doorRect.left - 3;
        const ty = doorRect.cy;
        const dx = tx - 181.5;
        const dy = ty - 66;
        const len = Math.hypot(dx, dy) || 1;
        svgEl(arenaSvg, "line", {
          x1: (181.5 + (dx / len) * 16.5).toFixed(2),
          y1: (66 + (dy / len) * 16.5).toFixed(2),
          x2: tx.toFixed(2),
          y2: ty.toFixed(2),
          stroke: C.accent,
          "stroke-width": 1.2,
          "stroke-linecap": "round",
        });
      }
    }

    // 3. Candidate B (feasible upper path through doorway (181.5, 66) -> stops 3.8px outside Goal ring at (305.6, 88.7))
    svgEl(arenaSvg, "path", {
      d: "M 47 130 C 86 76, 136 66, 181.5 66 C 226 66, 268 74, 301.2 86.9",
      fill: "none",
      stroke: C.deep,
      "stroke-width": isJoint ? 2.8 : 1.85,
      "stroke-linecap": "round",
    });
    {
      const dx = 305.6 - 268;
      const dy = 88.7 - 74;
      const len = Math.hypot(dx, dy);
      arrowHead(arenaSvg, 305.6, 88.7, dx / len, dy / len, C.deep, 7.0, 3.5);
    }
    [[110, 73.5], [181.5, 66], [248, 70]].forEach(([x, y]) => {
      svgEl(arenaSvg, "circle", {
        cx: x,
        cy: y,
        r: 3.5,
        fill: "#e3ece0",
        stroke: C.deep,
        "stroke-width": 1.5,
      });
    });

    // 4. Candidate A (wall-clipping shortcut piercing wall at (181.5, 121.5) -> stops 3.8px outside Goal ring at (304.9, 97.0))
    svgEl(arenaSvg, "path", {
      d: "M 49 138 Q 181.5 126 300.6 98.0",
      fill: "none",
      stroke: C.clay,
      "stroke-width": !isJoint ? 2.6 : 1.85,
      "stroke-dasharray": "5.5 3.8",
      "stroke-linecap": "round",
    });
    {
      const dx = 304.9 - 181.5;
      const dy = 97.0 - 126;
      const len = Math.hypot(dx, dy);
      arrowHead(arenaSvg, 304.9, 97.0, dx / len, dy / len, C.clay, 6.8, 3.4);
    }
    [[115, 131.5], [181.5, 121.5], [244, 110.5]].forEach(([x, y], i) => {
      const spike = i === 1 && step >= 1;
      svgEl(arenaSvg, "circle", {
        cx: x,
        cy: y,
        r: spike ? 5.6 : 3.5,
        fill: spike ? C.clay : C.claySoft,
        stroke: C.clay,
        "stroke-width": 1.5,
      });
    });

    // 5. Collision spike leader line to tag-clip (step >= 1)
    if (step >= 1) {
      const clipRect = tagBox('[data-tag="clip"]');
      if (clipRect) {
        const tx = clipRect.left - 3;
        const ty = clipRect.cy;
        const dx = tx - 181.5;
        const dy = ty - 121.5;
        const len = Math.hypot(dx, dy) || 1;
        svgEl(arenaSvg, "line", {
          x1: (181.5 + (dx / len) * 7.2).toFixed(2),
          y1: (121.5 + (dy / len) * 7.2).toFixed(2),
          x2: tx.toFixed(2),
          y2: ty.toFixed(2),
          stroke: C.clay,
          "stroke-width": 1.2,
          "stroke-linecap": "round",
        });
      }
    }

    // 6. Start z_0 (40, 136) and Goal z_g (318, 94)
    svgEl(arenaSvg, "circle", { cx: 40, cy: 136, r: 6.8, fill: C.ink });
    svgEl(arenaSvg, "circle", { cx: 318, cy: 94, r: 9.5, fill: "#e3ece0", stroke: C.accent, "stroke-width": 2.0 });
    svgEl(arenaSvg, "circle", { cx: 318, cy: 94, r: 3.3, fill: C.accent });
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
        draw();
      });
      pillsHost.appendChild(b);
    });
    if (window.renderMathIn) window.renderMathIn(pillsHost);
  }

  function draw() {
    const zh = lang() === "zh";
    const isJoint = scorer === "joint";

    const scoreTitle = isJoint
      ? (zh ? "Traj-LeWM 联合评分" : "Traj-LeWM Joint Score")
      : (zh ? "LeWM 仅终点评分" : "LeWM Endpoint-Only");
    const scoreFormula = isJoint
      ? T("C_\\lambda = C_0(\\hat{\\tau}, g) + \\lambda\\tilde{S}_\\psi(\\hat{\\tau} \\mid g)")
      : T("C_0(\\hat{\\tau}, g) = \\|\\hat{z}_H - z_g\\|_2^2");

    nodesHost.innerHTML = `
      <div class="traj-main">
        <div class="traj-arena-card">
          <div class="traj-card-head">
            <strong>${zh ? "潜空间滚动竞技场" : "Latent Rollout Arena"}</strong>
            <span>${zh ? `共享 ${T("z_0")} 与目标 ${T("z_g")}` : `Shared ${T("z_0")} &amp; goal ${T("z_g")}`}</span>
          </div>
          <div class="traj-arena-wrap">
            <svg id="arena-svg" viewBox="0 0 350 188" aria-hidden="true"></svg>
            <span class="arena-tag arena-tag--b" style="left:26%;top:14%;">${T("\\hat{\\tau}_B")} · ${zh ? "可行" : "feasible"}</span>
            ${step >= 2 ? `<span class="arena-tag arena-tag--b" data-tag="door" style="left:77%;top:14%;">${zh ? "门洞聚焦" : "Doorway focus"}</span>` : ""}
            <span class="arena-tag arena-tag--node" style="left:11.4%;top:87%;">${T("z_0")}</span>
            <span class="arena-tag arena-tag--a" style="left:34%;top:87%;">${T("\\hat{\\tau}_A")} · ${zh ? "穿墙" : "shortcut"}</span>
            ${step >= 1 ? `<span class="arena-tag arena-tag--a" data-tag="clip" style="left:76%;top:87%;">${T("+\\ell_\\psi")} ${zh ? "穿墙惩罚" : "wall clip"}</span>` : ""}
            <span class="arena-tag arena-tag--node" style="left:90.8%;top:65%;">${T("z_g")}</span>
          </div>
        </div>

        <div class="traj-score-card">
          <div class="traj-card-head" style="justify-content:center;margin-bottom:3px;">
            <strong>${scoreTitle}</strong>
          </div>
          <div class="traj-score-rule">${scoreFormula}</div>

          <div class="traj-plans">
            <div class="traj-plan ${!isJoint ? "win-bad" : ""}">
              <div class="traj-plan-top">
                <span style="color:#984b2a;">${zh ? "候选" : "Plan"} ${T("\\hat{\\tau}_A")}</span>
                <span style="font-size:10px;color:${!isJoint ? "#984b2a" : "#647064"};">
                  ${!isJoint ? (zh ? `${T("C_0")} 难分 ✗` : `Tied in ${T("C_0")} ✗`) : (zh ? "淘汰" : "Rejected")}
                </span>
              </div>
              <div class="traj-plan-line">${zh ? "终点匹配" : "Endpoint"} ${T("|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}")}</div>
              <div class="traj-plan-line emph-bad">
                ${isJoint ? (zh ? `平均 ${T("S_\\psi = 15.8")}（图 3a）` : `Mean ${T("S_\\psi = 15.8")} (Fig. 3a)`) : (zh ? `未启用 LTC（${T("\\lambda = 0")}）` : `LTC disabled (${T("\\lambda = 0")})`)}
              </div>
            </div>

            <div class="traj-plan ${isJoint ? "win-good" : ""}">
              <div class="traj-plan-top">
                <span style="color:#233f35;">${zh ? "候选" : "Plan"} ${T("\\hat{\\tau}_B")}</span>
                <span style="font-size:10px;color:${isJoint ? "#233f35" : "#647064"};">
                  ${isJoint ? (zh ? "94.4% 胜出 ✓" : "#1 · 94.4% ✓") : (zh ? "混淆" : "Ambiguous")}
                </span>
              </div>
              <div class="traj-plan-line">${zh ? "终点匹配" : "Endpoint"} ${T("|\\Delta C_0| \\le 0.25\\,\\mathrm{IQR}")}</div>
              <div class="traj-plan-line emph-good">
                ${isJoint ? (zh ? `平均 ${T("S_\\psi = 13.8")}（图 3a）` : `Mean ${T("S_\\psi = 13.8")} (Fig. 3a)`) : (zh ? `未启用 LTC（${T("\\lambda = 0")}）` : `LTC disabled (${T("\\lambda = 0")})`)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stage-strip" style="margin-top:10px;">
        <div class="stage-strip-copy">
          <div class="stage-strip-title">
            ${zh ? "闭环成功率：Cube 74% → 88%（+14 pp） · Reacher 86% → 93% · Two-Room 87% → 94%" : "Closed-loop lift: Cube 74% → 88% (+14 pp) · Reacher 86% → 93% · Two-Room 87% → 94%"}
          </div>
          <div class="stage-strip-sub">
            ${zh ? "Franka FR3 真机（20 组配对）：成功率 50% → 70%，碰撞终止减半（4 → 2）" : "Franka FR3 real-robot (20 paired tasks): Success 50% → 70%, collisions halved (4 → 2)"}
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

    drawArenaSvg();
    requestAnimationFrame(drawArenaSvg);
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
      scorer = step === 0 ? "endpoint" : "joint";
      document.querySelectorAll("[data-scorer]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.scorer === scorer))
      );
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

  document.querySelectorAll("[data-scorer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      stopPlay();
      scorer = btn.dataset.scorer;
      document.querySelectorAll("[data-scorer]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.scorer === scorer))
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
    new ResizeObserver(() => drawArenaSvg()).observe(board);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => drawArenaSvg());
  }

  renderPills();
  draw();
})();
