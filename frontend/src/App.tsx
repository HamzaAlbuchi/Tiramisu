import { DebatePage } from "@/pages/DebatePage";
import { StatsPage } from "@/pages/StatsPage";
import { useEffect, useState } from "react";
import { EntryPage } from "@/pages/EntryPage";
import { HomeLandingPage } from "@/pages/HomeLandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { PricingPage } from "@/pages/PricingPage";
import { ByomPage } from "@/pages/ByomPage";
import { readAuth, readSpace, setPendingSpace } from "@/state/spaceAuth";

declare global {
  interface Window {
    __TIRAMISU_NAVIGATE__?: (to: string) => void;
  }
}

export default function App() {
  const [path, setPath] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname));

  useEffect(() => {
    const sync = () => {
      setPath(window.location.pathname);
      window.dispatchEvent(new Event("tiramisu:nav"));
    };
    const onPop = () => sync();
    window.addEventListener("popstate", onPop);
    window.__TIRAMISU_NAVIGATE__ = (to: string) => {
      if (typeof to !== "string" || !to.startsWith("/")) {
        window.location.href = to;
        return;
      }
      const current = window.location.pathname + window.location.hash;
      if (to === current) {
        return;
      }
      window.history.pushState({}, "", to);
      sync();
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
  if (path === "/plans") {
    return <PricingPage />;
  }
  if (path === "/byom") {
    return <ByomPage />;
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
