import Link from "next/link";
import { nav } from "@/lib/content";

export function Header({ current }: { current?: string }) {
  return (
    <header className="site-header">
      <Link className="mark" href="/" aria-label="Accueil Michel Mouhani">
        MM
      </Link>
      <nav className="site-nav" aria-label="Principal">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="btn" href="/contact">
        Me contacter
      </Link>
    </header>
  );
}
