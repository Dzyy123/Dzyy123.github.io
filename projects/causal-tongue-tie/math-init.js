(() => {
  window.tex = function tex(expr, displayMode = false) {
    if (!window.katex) return expr;
    return window.katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  };

  window.renderMathIn = function renderMathIn(root) {
    if (!root || !window.renderMathInElement) return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      ignoredClasses: ["katex"],
      throwOnError: false,
      strict: false,
    });
  };
})();
