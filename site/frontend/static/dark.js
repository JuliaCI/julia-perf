// Dark mode bootstrap. Sets <html data-theme="..."> from (in priority order):
//   1. ?theme=dark|light|system  URL parameter
//   2. localStorage["theme"]
//   3. postMessage from a trusted parent: { type: "set-theme", theme: "dark"|"light"|"system" }
// Default = light when nothing is set. (rustc-perf upstream is light-only;
// users explicitly opt in to dark via the URL param, localStorage, or the
// embedding parent.)
// Kept as a separate file so upstream rustc-perf merges don't conflict.
(function () {
  var ALLOWED_PARENTS = [
    "https://juliaci.github.io",
    "https://julialang.org",
    "https://perf.julialang.org",
  ];
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
  function read() {
    try {
      var p = new URLSearchParams(location.search).get("theme");
      if (p) { localStorage.setItem("theme", p); return p; }
      return localStorage.getItem("theme") || "light";
    } catch (e) { return "light"; }
  }
  apply(read());
  window.addEventListener("message", function (e) {
    if (!isAllowedOrigin(e.origin)) return;
    var d = e.data;
    if (!d || d.type !== "set-theme") return;
    try { localStorage.setItem("theme", d.theme || "system"); } catch (_) {}
    apply(d.theme);
  });
})();
