"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { id } from "zod/locales";
import { useAuth } from "../context/AuthContext";




const authNavigationData = [
  { title: "Dashboard", href: "/dashboard" ,id:"dashboard" },
  { title: "Shifts", href: "/shifts", id:"shifts" },
  { title: "Preferences", href: "/preferences", id:"preferences" },

{ title: "Study Priorities", href: "/priorities", id:"priorities" },
  { title: "Profile", href: "/profile", id:"profile" },
];

const publicNavigationData = [
  { title: "Login", href: "/login", id: "login" },
  { title: "Sign Up", href: "/signup", id: "signup" },
];

/** Sections on the home page used for scroll-spy (projects + contact are separate routes). */
const SECTION_IDS = ["home", "about", "techstack", "experience"];

/** @param {{ href?: string; id: string }} navItem */
function isNavHighlighted(navItem, pathname, activeSection, isHome) {
  if (navItem.href) {
    if (navItem.href === "/projects") {
      return pathname === "/projects" || pathname.startsWith("/projects/");
    }
    return pathname === navItem.href;
  }
  if (!isHome) return false;
  return activeSection === navItem.id;
}



const NAV_TOP_OFFSET = 96;

const ctaClassName =
  "inline-flex flex-shrink-0 items-center justify-center rounded-full font-medium border border-zinc-400/45 bg-white/35 text-foreground shadow-sm hover:bg-white/55 hover:border-zinc-400/60";

/**
 * Glass styling lives here as Tailwind classes so they are always scanned and shipped
 * (fixes missing look when custom @layer utilities lose to Tailwind v4 ordering).
 */
const NAV_TX =
  "motion-reduce:transition-none transition-[transform,opacity,padding,background-color,border-color,box-shadow] duration-150 ease-out";

const NAV_SHELL =
  "rounded-full border border-zinc-200/90 bg-white/45 text-foreground shadow-[0_8px_28px_rgba(70,55,110,0.09),0_1px_6px_rgba(70,55,110,0.05),inset_0_1px_0_0_rgba(255,255,255,0.72)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(20px)_saturate(1.3)]";

const NAV_PANEL =
  "border border-zinc-200/90 bg-white/48 text-foreground shadow-[0_14px_36px_rgba(70,55,110,0.1),0_1px_8px_rgba(70,55,110,0.06),inset_0_1px_0_0_rgba(255,255,255,0.75)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(22px)_saturate(1.3)] rounded-[1.75rem] p-2.5 sm:rounded-[2rem]";

const NAV_LINK_IDLE =
  "border border-transparent text-muted-foreground hover:border-zinc-300/60 hover:bg-zinc-950/[0.05] hover:text-foreground";

/** Inverted: dark fill + light label (matches “selected” in light chrome) */
const NAV_LINK_ACTIVE =
  "border border-foreground/25 bg-foreground text-primary-foreground shadow-[0_2px_10px_rgba(30,25,55,0.18)]";

function reorderSectionIds() {
  const pairs = SECTION_IDS.map((id) => [id, document.getElementById(id)]).filter(
    ([, el]) => el
  );
  pairs.sort(([, a], [, b]) => {
    const ya = a.getBoundingClientRect().top + window.scrollY;
    const yb = b.getBoundingClientRect().top + window.scrollY;
    return ya - yb;
  });
  return pairs.length ? pairs.map(([id]) => id) : ["home"];
}

function useSectionNav(pathname) {
  const isHome = (pathname || "/") === "/";
  const [activeSection, setActiveSection] = useState(() =>
    pathname === "/contact" ? "contact" : "home",
  );
  const orderRef = useRef(SECTION_IDS);

  const syncActiveFromScroll = useCallback(() => {
    if (!isHome) return;
    const marker = window.scrollY + NAV_TOP_OFFSET;
    let best = orderRef.current[0] || "home";
    for (const id of orderRef.current) {
      const el = document.getElementById(id);
      if (!el) continue;
      const y = el.getBoundingClientRect().top + window.scrollY;
      if (marker >= y - 0.5) best = id;
    }
    setActiveSection((p) => (p === best ? p : best));
  }, [isHome]);

  const navigateToSection = useCallback((id) => {
    if (!SECTION_IDS.includes(id)) return;
    const el = document.getElementById(id);
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}#${id}`);

    if (el) {
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: instant ? "instant" : "auto", block: "start" });
    }
    setActiveSection(id);
  }, []);

  useEffect(() => {
    if (pathname === "/contact") {
      setActiveSection("contact");
      return;
    }
    if (!isHome) {
      setActiveSection("__route__");
      return;
    }
    setActiveSection("home");
    syncActiveFromScroll();
  }, [pathname, isHome, syncActiveFromScroll]);

  useEffect(() => {
    if (!isHome) return;

    orderRef.current = reorderSectionIds();

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncActiveFromScroll();
      });
    };

    const onResize = () => {
      orderRef.current = reorderSectionIds();
      onScroll();
    };

    syncActiveFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("hashchange", syncActiveFromScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", syncActiveFromScroll);
    };
  }, [isHome, syncActiveFromScroll]);

  return { activeSection, navigateToSection, isHome };
}



const Navbar = () => {

  const { user } = useAuth();
  const navigationData = user ? authNavigationData : publicNavigationData;

  const pathname = usePathname() || "/";
  const { activeSection, navigateToSection, isHome } = useSectionNav(pathname || "/");

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const getNavHref = useCallback(
    (item) => {
      if (item.href) return item.href;
      if (!isHome) return `/#${item.id}`;
      return `#${item.id}`;
    },
    [isHome],
  );

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY >= 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const iconBtnClass = cn(
    NAV_TX,
    "flex md:hidden flex-shrink-0 items-center justify-center rounded-full",
    scrolled ? "size-7" : "size-8",
    menuOpen
      ? NAV_LINK_ACTIVE
      : "border border-zinc-300/80 text-foreground hover:bg-zinc-950/[0.06]"
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-2 sm:px-5 pt-3 sm:pt-4">
      <button
        type="button"
        aria-hidden={!menuOpen}
        tabIndex={-1}
        className={cn(
          NAV_TX,
          "fixed inset-0 z-40 md:hidden",
          "bg-zinc-900/15 motion-reduce:transition-none",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ transitionProperty: "opacity", transitionDuration: "150ms" }}
        onClick={closeMenu}
      />
      <div className="relative z-50 mx-auto flex w-full max-w-[min(100%,calc(100vw-1rem))] justify-start md:justify-center">
        <div className="pointer-events-auto relative w-fit max-w-full">
          <div
            data-nav-shell
            className={cn(
              NAV_TX,
              NAV_SHELL,
              "flex items-center gap-1 sm:gap-2 md:gap-4",
              "md:overflow-x-auto md:overflow-y-hidden md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden",
              scrolled
                ? "px-2.5 py-2 sm:px-3 sm:py-2.5 md:scale-[0.98]"
                : "px-3 py-2.5 sm:px-5 sm:py-3 md:scale-100"
            )}
            style={{ transitionProperty: "transform, padding", transitionDuration: "200ms" }}
          >
            <Link
              href={isHome ? "#home" : "/"}
              prefetch={!isHome}
              className={cn(
                NAV_TX,
                "hidden md:flex flex-shrink-0 items-center justify-center rounded-full",
                scrolled ? "size-7 sm:size-8" : "size-8 sm:size-9",
                activeSection === "home" && isHome ? NAV_LINK_ACTIVE : NAV_LINK_IDLE
              )}
              aria-label="Home"
              aria-current={activeSection === "home" && isHome ? "location" : undefined}
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  navigateToSection("home");
                }
              }}
            >
              <Home size={scrolled ? 15 : 18} strokeWidth={2} />
            </Link>

            <ul className="hidden md:flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
              {navigationData.map((navItem) => (
                <li key={navItem.id} className="flex-shrink-0">
                  <Link
                    href={getNavHref(navItem)}
                    prefetch={Boolean(navItem.href)}
                    className={cn(
                      NAV_TX,
                      "inline-flex items-center rounded-full text-xs font-medium sm:text-sm",
                      scrolled
                        ? "px-3 py-1.5 sm:px-3.5 sm:py-2"
                        : "px-3.5 py-2 sm:px-4 sm:py-2",
                      isNavHighlighted(navItem, pathname, activeSection, isHome)
                        ? NAV_LINK_ACTIVE
                        : NAV_LINK_IDLE,
                    )}
                    aria-current={
                      isNavHighlighted(navItem, pathname, activeSection, isHome)
                        ? "page"
                        : undefined
                    }
                    onClick={(e) => {
                      if (navItem.href) return;
                      if (!isHome) return;
                      e.preventDefault();
                      navigateToSection(navItem.id);
                    }}
                  >
                    {navItem.title}
                  </Link>
                </li>
              ))}
            </ul>

         

            <button
              type="button"
              className={iconBtnClass}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="relative flex size-[18px] items-center justify-center">
                <Menu
                  size={scrolled ? 16 : 18}
                  strokeWidth={2}
                  className={cn(
                    "absolute motion-reduce:transition-none",
                    menuOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
                  )}
                  style={{ transition: "opacity 120ms ease-out, transform 120ms ease-out" }}
                  aria-hidden
                />
                <X
                  size={scrolled ? 16 : 18}
                  strokeWidth={2}
                  className={cn(
                    "absolute motion-reduce:transition-none",
                    menuOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  )}
                  style={{ transition: "opacity 120ms ease-out, transform 120ms ease-out" }}
                  aria-hidden
                />
              </span>
            </button>
          </div>

          <div
            id="mobile-nav-menu"
            role="region"
            aria-label="Mobile navigation"
            aria-hidden={!menuOpen}
            inert={menuOpen ? undefined : true}
            className={cn(
              NAV_TX,
              NAV_PANEL,
              "md:hidden absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-1rem),18rem)] origin-top-left",
              menuOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1.5 scale-[0.99] opacity-0"
            )}
            style={{ transitionProperty: "opacity, transform", transitionDuration: "150ms" }}
          >
            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href={isHome ? "#home" : "/"}
                  prefetch={!isHome}
                  className={cn(
                    NAV_TX,
                    "block rounded-full px-3 py-2.5 text-sm font-medium",
                    activeSection === "home" && isHome ? NAV_LINK_ACTIVE : NAV_LINK_IDLE
                  )}
                  aria-current={activeSection === "home" && isHome ? "page" : undefined}
                  onClick={(e) => {
                    if (isHome) {
                      e.preventDefault();
                      navigateToSection("home");
                    }
                    closeMenu();
                  }}
                >
                  Home
                </Link>
              </li>
              {navigationData.map((navItem) => (
                <li key={navItem.id}>
                  <Link
                    href={getNavHref(navItem)}
                    prefetch={Boolean(navItem.href)}
                    className={cn(
                      NAV_TX,
                      "block rounded-full px-3 py-2.5 text-sm font-medium",
                      isNavHighlighted(navItem, pathname, activeSection, isHome)
                        ? NAV_LINK_ACTIVE
                        : NAV_LINK_IDLE,
                    )}
                    aria-current={
                      isNavHighlighted(navItem, pathname, activeSection, isHome)
                        ? "page"
                        : undefined
                    }
                    onClick={(e) => {
                      if (navItem.href) {
                        closeMenu();
                        return;
                      }
                      if (!isHome) {
                        closeMenu();
                        return;
                      }
                      e.preventDefault();
                      navigateToSection(navItem.id);
                      closeMenu();
                    }}
                  >
                    {navItem.title}
                  </Link>
                </li>
              ))}
            </ul>
            
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;