import { DebatePage } from "@/pages/DebatePage";
import { StatsPage } from "@/pages/StatsPage";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __TIRAMISU_NAVIGATE__?: (to: string) => void;
  }
}

export default function App() {
  const [path, setPath] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    window.__TIRAMISU_NAVIGATE__ = (to: string) => {
      if (typeof to !== "string" || !to.startsWith("/")) {
        window.location.href = to;
        return;
      }
      if (window.location.pathname === to) {
        return;
      }
      window.history.pushState({}, "", to);
      onPop();
    };
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/stats") {
    return <StatsPage />;
  }

  return <DebatePage />;
}
