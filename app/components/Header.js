"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoLink } from "react-icons/go";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/data", label: "Data" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-theme-border bg-theme-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-theme-primary text-xl text-white shadow-focus">
            <GoLink />
          </span>
          <div className="leading-tight">
            <p className="text-xl font-semibold text-theme-text">LinkPluck</p>
            <p className="text-sm text-theme-subtle">Links Plucked from people worldwide</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);
            const baseClasses = "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors";
            const activeClasses = "bg-theme-primary text-white shadow-focus";
            const inactiveClasses = "text-theme-subtle hover:bg-theme-surfaceMuted hover:text-theme-text";
            const computedClasses = [
              baseClasses,
              isActive ? activeClasses : inactiveClasses,
            ].join(" ");

            return (
              <Link
                key={href}
                href={href}
                className={computedClasses}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
