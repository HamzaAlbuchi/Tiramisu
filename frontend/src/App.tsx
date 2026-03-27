import { DebatePage } from "@/pages/DebatePage";
import { StatsPage } from "@/pages/StatsPage";
import { useEffect, useState } from "react";
import { EntryPage } from "@/pages/EntryPage";
import { HomeLandingPage } from "@/pages/HomeLandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { readAuth, readSpace, setPendingSpace } from "@/state/spaceAuth";

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

  const hasSpace = space === "research" || space === "explore" || space === "enterprise";
  const needsEnterpriseLogin = hasSpace && space === "enterprise" && !authed;

  if (path === "/") {
    return <HomeLandingPage />;
  }
  if (path === "/entry") {
    return <EntryPage />;
  }
  if (path === "/login") {
    return <LoginPage />;
  }

  // Initial render: navigation helper is installed in an effect. Render guarded pages directly
  // instead of returning null (blank screen) while we wait for the effect to run.
  if (!hasSpace) {
    return <EntryPage />;
  }
  if (needsEnterpriseLogin) {
    setPendingSpace("enterprise");
    return <LoginPage />;
  }

  if (path === "/stats") {
    return <StatsPage />;
  }

  return <DebatePage />;
}
