"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/home", label: "Today", ic: "◐" },
  { href: "/sos", label: "SOS", ic: "≈", sos: true },
  { href: "/progress", label: "Progress", ic: "↗" },
  { href: "/support", label: "Support", ic: "♡" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`${path === it.href ? "on" : ""} ${it.sos ? "sos-tab" : ""}`}
            aria-current={path === it.href ? "page" : undefined}
          >
            <span className="ic" aria-hidden="true">
              {it.ic}
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
