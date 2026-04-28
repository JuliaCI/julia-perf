// Dark mode bootstrap. Sets <html data-theme="..."> from (in priority order):
//   1. ?theme=dark|light|system  URL parameter
//   2. sessionStorage (set when an embedding parent posts a theme)
//   3. postMessage from a trusted parent: { type: "set-theme", theme: ... }
// Default = light when nothing is set. (rustc-perf upstream is light-only;
// users explicitly opt in to dark via the URL param or the embedding parent.)
// sessionStorage is used (not localStorage) so the theme survives in-frame
// navigation within a tab without a flash, but a brand-new visit still
// starts from the default.
// Kept as a separate file so upstream rustc-perf merges don't conflict.
(function () {
  var ALLOWED_PARENTS = [
    "https://juliaci.github.io",
    "https://perf.julialang.org",
    "http://localhost:8080",
  ];
  var STORAGE_KEY = "julia-perf-theme";
  function isAllowedOrigin(origin) {
    if (ALLOWED_PARENTS.indexOf(origin) !== -1) return true;
    try {
      var host = new URL(origin).hostname;
      return host === "julialang.org" || host.endsWith(".julialang.org");
    } catch (e) { return false; }
  }
  function apply(theme) {
    var root = document.documentElement;
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }
  function normalize(t) {
    return t === "dark" || t === "light" || t === "system" ? t : null;
  }
  function store(t) {
    try { sessionStorage.setItem(STORAGE_KEY, t); } catch (e) {}
  }
  function read() {
    try {
      var fromUrl = normalize(new URLSearchParams(location.search).get("theme"));
      if (fromUrl) return fromUrl;
    } catch (e) {}
    try {
      var fromStore = normalize(sessionStorage.getItem(STORAGE_KEY));
      if (fromStore) return fromStore;
    } catch (e) {}
    return "light";
  }
  apply(read());
  window.addEventListener("message", function (e) {
    if (e.source !== window.parent) return;
    if (!isAllowedOrigin(e.origin)) return;
    var d = e.data;
    if (!d || d.type !== "set-theme") return;
    var t = normalize(d.theme);
    if (!t) return;
    store(t);
    apply(t);
  });
})();
