const nav = [
  { label: "Debates", href: "#" },
  { label: "History", href: "#" },
  { label: "API", href: "#" },
] as const;

export function ArbiterHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-arb-border bg-arb-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="font-bebas text-2xl tracking-[0.02em] text-arb-accent">
          ARBITER
        </a>
        <nav className="flex items-center gap-1 sm:gap-4">
          <ul className="flex items-center gap-3 sm:gap-5">
            {nav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-arb-muted transition hover:text-arb-text"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="ml-2 border border-arb-border bg-arb-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted">
            Beta
          </span>
        </nav>
      </div>
    </header>
  );
}
