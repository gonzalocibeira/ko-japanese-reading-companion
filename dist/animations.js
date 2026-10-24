"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/ui-theme.ts
  var uiTheme;
  var init_ui_theme = __esm({
    "src/ui-theme.ts"() {
      "use strict";
      uiTheme = `:root,:host{
  color-scheme:light;
  --ink:#242b2d;--muted:#625d50;--accent:#234e64;--seal:#9f3e2d;
  --paper:#f4ecd8;--surface:#e6d8b9;--line:#242b2d;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
  --body:system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif;
}
*{box-sizing:border-box}
button,input,select{border-radius:0}
button.primary{background:var(--seal);color:var(--paper)}
button.primary:hover{background:var(--ink)}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{
  outline:3px solid var(--accent);outline-offset:3px;
}
[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;
    }
  });

  // src/animations.ts
  var require_animations = __commonJS({
    "src/animations.ts"() {
      init_ui_theme();
      var theme = document.createElement("style");
      theme.textContent = uiTheme;
      document.head.append(theme);
      var gallery = document.querySelector(".gallery");
      var status = document.querySelector("#status");
      var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      var asset = (file) => chrome.runtime.getURL(`art/ko-kun/${file}`);
      var tiles = [];
      var raf = 0;
      var last = 0;
      function paint(tile) {
        let time = reducedMotion.matches ? 0 : tile.elapsed % tile.clips.reduce((sum, clip2) => sum + clip2.durationMs, 0);
        let clip = tile.clips[0];
        for (const candidate of tile.clips) {
          clip = candidate;
          if (time < clip.durationMs) break;
          time -= clip.durationMs;
        }
        let frame = 0;
        while (frame < clip.frameDurationsMs.length - 1 && time >= clip.frameDurationsMs[frame]) time -= clip.frameDurationsMs[frame++];
        const image = tile.images.get(clip.file), key = `${clip.id}:${frame}`;
        if (!image?.complete || !image.naturalWidth || tile.painted === key) return;
        const [x, y, w, h] = clip.frameRectangles[frame];
        tile.context.clearRect(0, 0, 256, 256);
        tile.context.drawImage(image, x, y, w, h, 0, 0, 256, 256);
        tile.painted = key;
      }
      function tick(now) {
        const delta = last ? Math.min(now - last, 100) : 0;
        last = now;
        for (const tile of tiles) if (tile.visible) {
          tile.elapsed += delta;
          paint(tile);
        }
        raf = requestAnimationFrame(tick);
      }
      function syncPlayback() {
        cancelAnimationFrame(raf);
        last = 0;
        if (!document.hidden) {
          for (const tile of tiles) if (tile.visible) paint(tile);
          if (!reducedMotion.matches && tiles.some((tile) => tile.visible)) raf = requestAnimationFrame(tick);
        }
      }
      document.addEventListener("visibilitychange", syncPlayback);
      reducedMotion.addEventListener("change", syncPlayback);
      async function openGallery() {
        const response = await fetch(asset("index.json"));
        if (!response.ok) throw new Error("Gallery unavailable");
        const manifest = await response.json();
        const routines = manifest.routines;
        const assigned = new Set(routines.flatMap((routine) => routine.clips));
        const entries = [
          ...routines.map((routine) => ({ name: routine.name, clips: routine.clips })),
          ...manifest.clips.filter((clip) => !assigned.has(clip.id)).map((clip) => ({ name: clip.id.replaceAll("-", " ").replace(/^./, (letter) => letter.toUpperCase()), clips: [clip.id] }))
        ];
        const observer = new IntersectionObserver((changes) => {
          for (const change of changes) {
            const tile = tiles.find((tile2) => tile2.canvas === change.target);
            tile.visible = change.isIntersecting;
            if (tile.visible) {
              for (const clip of tile.clips) if (!tile.images.has(clip.file)) {
                const image = new Image();
                tile.images.set(clip.file, image);
                image.onload = () => {
                  tile.painted = "";
                  paint(tile);
                };
                image.onerror = () => {
                  tile.canvas.closest("figure").querySelector("figcaption").textContent += " \xB7 unavailable";
                };
                image.src = asset(clip.file);
              }
            }
          }
          syncPlayback();
        });
        for (const entry of entries) {
          const figure = document.createElement("figure"), canvas = document.createElement("canvas"), caption = document.createElement("figcaption");
          canvas.width = canvas.height = 256;
          canvas.setAttribute("aria-hidden", "true");
          caption.textContent = entry.name;
          figure.append(canvas, caption);
          gallery.append(figure);
          tiles.push({ canvas, context: canvas.getContext("2d"), clips: entry.clips.map((id) => manifest.clips.find((clip) => clip.id === id)), images: /* @__PURE__ */ new Map(), visible: false, elapsed: 0, painted: "" });
          observer.observe(canvas);
        }
        status.textContent = "";
      }
      void openGallery().catch(() => {
        status.textContent = "The gallery could not load. Reload this page to try again.";
      });
    }
  });
  require_animations();
})();
//# sourceMappingURL=animations.js.map
