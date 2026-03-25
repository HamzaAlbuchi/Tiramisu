import { DebatePage } from "@/pages/DebatePage";
import { StatsPage } from "@/pages/StatsPage";
import { useEffect, useState } from "react";

export default function App() {
  const [path, setPath] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/stats") {
    return <StatsPage />;
  }

  return <DebatePage />;
}
