"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAudio } from "@/components/providers/AudioProvider";

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const NAV_LINKS = [
  { label: "ABOUT", href: "#manifesto", index: "01" },
  { label: "SKILLS", href: "#stats-tools", index: "02" },
  { label: "EXPERIENCE & EDUCATION", href: "#experience", index: "03" },
  { label: "CONTACT", href: "#footer", index: "04" },
];

const CONNECT_LINKS = [
  { name: "GITHUB", url: "https://github.com/RamadhonIkhsan", num: "01" },
  { name: "LINKEDIN", url: "https://www.linkedin.com/in/ramadhon-ikhsan-prasetya-1b585921b", num: "02" },
  { name: "GIT SERVER", url: "https://git.basys.co.id/RamadhonIkhsan", num: "03" },
  { name: "EMAIL", url: "mailto:ramadhon.ikhsan99@gmail.com", num: "04" },
];

export function MenuPanel({ isOpen, onClose, triggerRef }: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const { lenis } = useLenis();
  const { playClick } = useAudio();
  const prefersReducedMotion = useReducedMotion();

  // Initialize GSAP Open/Close Animation Timeline
  useEffect(() => {
    if (!panelRef.current) return;

    const panel = panelRef.current;
    const items = panel.querySelectorAll(".stagger-link");

    // Set initial transform origin from top-right anchor
    gsap.set(panel, {
      transformOrigin: "top right",
      scaleY: 0,
      opacity: 0,
      pointerEvents: "none",
    });

    if (items.length > 0) {
      gsap.set(items, { opacity: 0, y: 14 });
    }

    const tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        gsap.set(panel, { pointerEvents: "none" });
      },
    });

    if (prefersReducedMotion) {
      tl.to(panel, {
        opacity: 1,
        duration: 0.2,
        ease: "none",
      }).to(
        items,
        {
          opacity: 1,
          duration: 0.15,
        },
        "-=0.1"
      );
    } else {
      tl.to(panel, {
        scaleY: 1,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
      }).to(
        items,
        {
          opacity: 1,
          y: 0,
          stagger: 0.035,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.25"
      );
    }

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [prefersReducedMotion]);

  // Handle open / close animation trigger
  useEffect(() => {
    const tl = timelineRef.current;
    const panel = panelRef.current;
    if (!tl || !panel) return;

    if (isOpen) {
      gsap.set(panel, { pointerEvents: "auto" });
      tl.play();
    } else {
      tl.reverse();
    }
  }, [isOpen]);

  // Trap focus and handle Escape & outside click
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Get all focusable elements inside the dialog
    const getFocusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );

    const focusables = getFocusables();
    // Auto-focus the first element (close button or first link)
    if (focusables.length > 0) {
      focusables[0].focus();
    }

    // Keydown handler for Focus Trap and Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        const currentFocusables = getFocusables();
        if (currentFocusables.length === 0) return;

        const first = currentFocusables[0];
        const last = currentFocusables[currentFocusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Outside click handler
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        panel &&
        !panel.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose, triggerRef]);

  // Smooth scroll handler via Lenis
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();

    const targetEl = document.querySelector(href);
    if (!targetEl) return;

    if (lenis) {
      lenis.scrollTo(targetEl as HTMLElement, {
        offset: -70,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={panelRef}
      id="main-navigation-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation"
      aria-hidden={!isOpen}
      className="fixed top-16 right-4 sm:right-8 lg:right-12 z-50 w-[min(calc(100vw-2rem),380px)] rounded-none border border-white/15 bg-[#0a0a0a]/95 p-6 backdrop-blur-xl shadow-2xl font-hud"
    >
      {/* Top Header of the Card */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--lime)] font-semibold">
          [ 00 // NAVIGATION // INDEX ]
        </span>
        <button
          type="button"
          onClick={() => {
            onClose();
            triggerRef.current?.focus();
          }}
          data-cursor="link"
          aria-label="Close navigation panel"
          className="border border-white/20 px-2 py-0.5 text-[10px] tracking-widest uppercase text-white/70 hover:text-white hover:border-[var(--lime)] transition-colors"
        >
          ✕ ESC
        </button>
      </div>

      {/* Main Internal Navigation Section */}
      <nav aria-label="Primary sections" className="space-y-1 mb-6">
        <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-dim)] mb-2">
          SECTIONS
        </div>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            data-cursor="link"
            onMouseEnter={playClick}
            onClick={(e) => {
              playClick();
              handleScrollTo(e, link.href);
            }}
            className="stagger-link group flex items-center justify-between py-2 border-b border-white/10 hover:border-[var(--lime)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--lime)]"
          >
            <span className="font-display text-2xl font-bold uppercase tracking-wider text-white group-hover:text-[var(--lime)] transition-colors">
              {link.label}
            </span>
            <span className="text-xs text-white/70 group-hover:text-[var(--lime)] transition-colors">
              [{link.index}]
            </span>
          </a>
        ))}
      </nav>

      {/* Connect list: 6 social links numbered 01-06 with ↗ icon */}
      <div className="pt-2 border-t border-white/15">
        <div className="text-[9px] uppercase tracking-[0.25em] text-white/70 mb-3 flex items-center justify-between">
          <span>CONNECT // NETWORKS</span>
          <span className="text-[var(--lime)]">[04]</span>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {CONNECT_LINKS.map((link) => (
            <li key={link.num} className="stagger-link">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                onMouseEnter={playClick}
                onClick={playClick}
                className="flex items-center justify-between p-2 border border-white/15 hover:border-[var(--lime)] bg-white/[0.03] hover:bg-white/[0.08] transition-colors group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--lime)]"
              >
                <span className="text-[10px] text-[var(--lime)]">{link.num}</span>
                <span className="text-[11px] text-white/90 group-hover:text-white transition-colors tracking-wider">
                  {link.name}
                </span>
                <span className="text-xs text-white/70 group-hover:text-[var(--lime)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Card bottom footer */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] text-white/70 uppercase tracking-widest">
        <span>SUMEDANG, WEST JAVA, INDONESIA</span>
        <span>RAMADHON IKHSAN PRASETYA</span>
      </div>
    </div>
  );
}

export default MenuPanel;
