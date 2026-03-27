const nav = [
  { label: "Debates", href: "/" },
  // TODO: Separate /history (personal debates)
  //       from /stats (global leaderboard)
  //       when user auth is added
  { label: "Stats", href: "/stats" },
  { label: "API", href: "#" },
] as const;

export function ArbiterHeader() {
  const switchSpace = (s: string) => {
    if (s !== "research" && s !== "explore" && s !== "enterprise") return;
    window.localStorage.setItem("arbiter.space", s);
    if (s === "enterprise" && !window.localStorage.getItem("arbiter.auth")) {
      window.localStorage.setItem("arbiter.pendingSpace", "enterprise");
      window.__TIRAMISU_NAVIGATE__?.("/login");
      return;
    }
    window.__TIRAMISU_NAVIGATE__?.("/");
  };

  const navToDebates = () => {
    const space = window.localStorage.getItem("arbiter.space");
    const authed = !!window.localStorage.getItem("arbiter.auth");
    if ((space === "enterprise" || space === "audit") && !authed) {
      window.__TIRAMISU_NAVIGATE__?.("/entry");
      return;
    }
    window.__TIRAMISU_NAVIGATE__?.("/");
  };

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-arb-border bg-arb-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navToDebates();
          }}
          className="font-bebas text-2xl tracking-[0.02em]"
        >
          <span className="text-arb-accent">ARB</span>
          <span className="text-arb-text">ITER</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-4">
          <ul className="flex items-center gap-3 sm:gap-5">
            {nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.href.startsWith("/")) {
                      e.preventDefault();
                      if (item.href === "/") {
                        navToDebates();
                      } else {
                        window.__TIRAMISU_NAVIGATE__?.(item.href);
                      }
                    }
                  }}
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-arb-muted transition hover:text-arb-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <select
            defaultValue={window.localStorage.getItem("arbiter.space") ?? "explore"}
            onChange={(e) => switchSpace(e.target.value)}
            className="hidden border border-arb-border bg-arb-bg px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-arb-muted sm:block"
            aria-label="Switch space"
          >
            <option value="explore">Explore</option>
            <option value="research">Research</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <span className="ml-2 border border-arb-border bg-arb-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted">
            Beta
          </span>
        </nav>
      </div>
    </header>
  );
}
