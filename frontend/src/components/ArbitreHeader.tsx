import { useTiramisuPath } from "@/hooks/useTiramisuPath";

const nav = [
  { label: "Debates", href: "/debate", byom: false },
  { label: "Stats", href: "/stats", byom: false },
  { label: "BYO Model", href: "/byom", byom: true },
  { label: "Plans", href: "/plans", byom: false },
  { label: "API", href: "#", byom: false },
] as const;

export function ArbitreHeader() {
  const path = useTiramisuPath();

  const switchSpace = (s: string) => {
    if (s !== "research" && s !== "explore" && s !== "enterprise") return;
    window.localStorage.setItem("arbiter.space", s);
    if (s === "enterprise" && !window.localStorage.getItem("arbiter.auth")) {
      window.localStorage.setItem("arbiter.pendingSpace", "enterprise");
      window.__TIRAMISU_NAVIGATE__?.("/login");
      return;
    }
    window.__TIRAMISU_NAVIGATE__?.("/debate");
  };

  const navToHome = () => {
    window.__TIRAMISU_NAVIGATE__?.("/");
  };

  const navToDebates = () => {
    const space = window.localStorage.getItem("arbiter.space");
    const authed = !!window.localStorage.getItem("arbiter.auth");
    if ((space === "enterprise" || space === "audit") && !authed) {
      window.__TIRAMISU_NAVIGATE__?.("/entry");
      return;
    }
    window.__TIRAMISU_NAVIGATE__?.("/debate");
  };

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-arb-border bg-arb-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navToHome();
          }}
          className="font-bebas text-2xl tracking-[0.02em]"
        >
          <span className="text-arb-accent">ar</span>
          <span className="text-arb-text">bitre</span>
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
                      if (item.href === "/debate") {
                        navToDebates();
                      } else {
                        window.__TIRAMISU_NAVIGATE__?.(item.href);
                      }
                    }
                  }}
                  className={
                    item.byom
                      ? [
                          "inline-block border-b pb-0.5 font-mono text-[11px] uppercase tracking-[0.12em] transition",
                          path === "/byom"
                            ? "border-[var(--purple)] text-[var(--purple)]"
                            : "border-transparent text-arb-muted hover:border-[var(--purple)] hover:text-[var(--purple)]",
                        ].join(" ")
                      : [
                          "font-mono text-[11px] uppercase tracking-[0.12em] transition",
                          path === item.href ? "text-arb-text" : "text-arb-muted hover:text-arb-text",
                        ].join(" ")
                  }
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
