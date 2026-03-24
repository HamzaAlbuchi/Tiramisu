/* Dev: set empty only if head injection did not run. Never overwrite a non-empty API base. */
(function () {
  var u = typeof window.__TIRAMISU_API_BASE__ === "string" ? window.__TIRAMISU_API_BASE__ : "";
  if (!u) window.__TIRAMISU_API_BASE__ = "";
})();
