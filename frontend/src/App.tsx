import { DebatePage } from "@/pages/DebatePage";
import { StatsPage } from "@/pages/StatsPage";
import { useEffect, useState } from "react";
import { EntryPage } from "@/pages/EntryPage";
import { LoginPage } from "@/pages/LoginPage";
import { readAuth, readSpace, setPendingSpace, type Space } from "@/state/spaceAuth";

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

  const space = typeof window === "undefined" ? null : readSpace();
  const authed = typeof window === "undefined" ? null : readAuth();

  const guardSpace = (s: Space | null) => {
    if (!s) {
      window.__TIRAMISU_NAVIGATE__?.("/entry");
      return false;
    }
    if (s === "audit" && !authed) {
      setPendingSpace("audit");
      window.__TIRAMISU_NAVIGATE__?.("/login");
      return false;
    }
    return true;
  };

  if (path === "/entry") {
    return <EntryPage />;
  }
  if (path === "/login") {
    return <LoginPage />;
  }

  if (path === "/stats") {
    if (!guardSpace(space)) return null;
    return <StatsPage />;
  }

  if (!guardSpace(space)) return null;
  return <DebatePage />;
}
