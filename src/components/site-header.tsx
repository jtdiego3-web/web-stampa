"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { NAV_LINKS, whatsappLink } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink/90 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1320px] items-center justify-between px-5 sm:h-[76px] sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={onHome ? link.href : `/${link.href}`}
              className="group relative text-[12px] font-semibold uppercase tracking-[0.16em] text-mist transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-acid transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-[12px] font-semibold uppercase tracking-[0.14em] text-mist transition-colors hover:text-acid md:inline-flex"
          >
            WhatsApp
          </a>
          <Link
            href="/socios"
            className="group inline-flex items-center gap-2 rounded-full bg-acid px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-white sm:px-5 sm:text-xs"
          >
            Socios
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path
                d="M2 8h11M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-acid hover:text-acid lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-5 bg-current transition-transform duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-white/5 bg-ink/98 transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-8 pt-5 sm:px-8">
          <nav className="flex flex-col divide-y divide-white/10" aria-label="Navegación móvil">
            {NAV_LINKS.map((link, index) => (
              <Link
                key={link.href}
                href={onHome ? link.href : `/${link.href}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-4 text-2xl font-medium tracking-tight text-white"
              >
                {link.label}
                <span className="label-xs text-fog">0{index + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/socios"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full bg-acid px-5 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-ink"
            >
              Portal de socios
            </Link>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full border border-white/15 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              WhatsApp · {`resolvemos tus dudas`}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
