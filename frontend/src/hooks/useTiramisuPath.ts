import { useEffect, useState } from "react";

/** Tracks `window.location.pathname` after SPA navigations (pushState) and browser back/forward. */
export function useTiramisuPath(): string {
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener("popstate", sync);
    window.addEventListener("tiramisu:nav", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("tiramisu:nav", sync);
    };
  }, []);

  return path;
}
