"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RollingNumber } from "@/components/ui/RollingNumber";
import { PixelMosaicCanvas } from "@/components/ui/PixelMosaicCanvas";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  experience: string;
  color: string;
  renderMutedIcon: () => React.ReactNode;
  renderColoredIcon: () => React.ReactNode;
}

const TOOLS: ToolItem[] = [
  {
    id: "nextjs",
    name: "NEXT.JS",
    category: "REACT FRAMEWORK",
    experience: "APP ROUTER / SSR",
    color: "#000000",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 180 180">
        <mask height="180" id="mask-next-muted" maskUnits="userSpaceOnUse" width="180" x="0" y="0">
          <circle cx="90" cy="90" fill="white" r="90" />
        </mask>
        <g mask="url(#mask-next-muted)">
          <circle cx="90" cy="90" fill="currentColor" r="90" />
          <path d="M149.508 157.438L69.147 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.138 149.508 157.438Z" fill="white" />
          <rect fill="white" height="72" width="12" x="115" y="54" />
        </g>
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 180 180">
        <mask height="180" id="mask-next-col" maskUnits="userSpaceOnUse" width="180" x="0" y="0">
          <circle cx="90" cy="90" fill="white" r="90" />
        </mask>
        <g mask="url(#mask-next-col)">
          <circle cx="90" cy="90" fill="#000000" r="90" />
          <path d="M149.508 157.438L69.147 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.138 149.508 157.438Z" fill="url(#next-gradient)" />
          <rect fill="#ffffff" height="72" width="12" x="115" y="54" />
        </g>
        <defs>
          <linearGradient id="next-gradient" x1="109" x2="144.5" y1="116.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "laravel",
    name: "LARAVEL",
    category: "PHP ARCHITECTURE",
    experience: "APIS & WORKERS",
    color: "#FF2D20",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 24 24">
        <path d="M8.5 2.5L2 6.25v7.5L8.5 17.5l6.5-3.75V9.5L8.5 5.75v3.5L12 11.25l-3.5 2-4-2.3V7.75l4-2.3 4 2.3v1.5l2.5-1.45V6.25L8.5 2.5zm7 5.25L9 11.5l6.5 3.75 6.5-3.75v-7.5L15.5 0 9 3.75v3.5l4-2.3 4 2.3v3.5l-3.5 2-4-2.3 2.5-1.45L12 7.75l-4 2.3v3.7l6.5 3.75 6.5-3.75v-6L15.5 7.75z" />
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8 fill-[#FF2D20]" viewBox="0 0 24 24">
        <path d="M8.5 2.5L2 6.25v7.5L8.5 17.5l6.5-3.75V9.5L8.5 5.75v3.5L12 11.25l-3.5 2-4-2.3V7.75l4-2.3 4 2.3v1.5l2.5-1.45V6.25L8.5 2.5zm7 5.25L9 11.5l6.5 3.75 6.5-3.75v-7.5L15.5 0 9 3.75v3.5l4-2.3 4 2.3v3.5l-3.5 2-4-2.3 2.5-1.45L12 7.75l-4 2.3v3.7l6.5 3.75 6.5-3.75v-6L15.5 7.75z" />
      </svg>
    ),
  },
  {
    id: "tailwind",
    name: "TAILWIND",
    category: "STYLING SYSTEM",
    experience: "ZERO-RUNTIME CSS",
    color: "#06B6D4",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 24 24">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8 fill-[#06B6D4]" viewBox="0 0 24 24">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    ),
  },
  {
    id: "antdesign",
    name: "ANT DESIGN",
    category: "ENTERPRISE UI",
    experience: "SYSTEM DESIGN",
    color: "#1677FF",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 1024 1024">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm202.9 618.6L448 803.7V629.5l146.7-72.1-146.7-72.1V311.2l266.9 121.1v250.3zM309.1 341.4L576 220.3v174.2l-146.7 72.1 146.7 72.1v174.2L309.1 591.8V341.4z" />
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8 fill-[#1677FF]" viewBox="0 0 1024 1024">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm202.9 618.6L448 803.7V629.5l146.7-72.1-146.7-72.1V311.2l266.9 121.1v250.3zM309.1 341.4L576 220.3v174.2l-146.7 72.1 146.7 72.1v174.2L309.1 591.8V341.4z" />
      </svg>
    ),
  },
  {
    id: "git",
    name: "GIT",
    category: "VERSION CONTROL",
    experience: "CI/CD WORKFLOWS",
    color: "#F05032",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 24 24">
        <path d="M23.546 10.93L13.067.452a1.5 1.5 0 0 0-2.122 0L8.87 2.527l2.929 2.929a1.786 1.786 0 0 1 2.26 2.274l2.82 2.82a1.786 1.786 0 0 1 1.737 2.378l2.93 2.93a1.5 1.5 0 0 0 2-2.122l-.001-.006zM9.467 4.116L7.345 1.994a1.5 1.5 0 0 0-2.122 0L.454 6.763a1.5 1.5 0 0 0 0 2.121l10.48 10.48a1.5 1.5 0 0 0 2.121 0l2.122-2.122-3.036-3.036a1.787 1.787 0 0 1-2.26-2.274l-2.45-2.45a1.785 1.785 0 0 1-1.738-2.378l-2.226-2.226z" />
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8 fill-[#F05032]" viewBox="0 0 24 24">
        <path d="M23.546 10.93L13.067.452a1.5 1.5 0 0 0-2.122 0L8.87 2.527l2.929 2.929a1.786 1.786 0 0 1 2.26 2.274l2.82 2.82a1.786 1.786 0 0 1 1.737 2.378l2.93 2.93a1.5 1.5 0 0 0 2-2.122l-.001-.006zM9.467 4.116L7.345 1.994a1.5 1.5 0 0 0-2.122 0L.454 6.763a1.5 1.5 0 0 0 0 2.121l10.48 10.48a1.5 1.5 0 0 0 2.121 0l2.122-2.122-3.036-3.036a1.787 1.787 0 0 1-2.26-2.274l-2.45-2.45a1.785 1.785 0 0 1-1.738-2.378l-2.226-2.226z" />
      </svg>
    ),
  },
  {
    id: "docker",
    name: "DOCKER",
    category: "CONTAINERIZATION",
    experience: "MICROSERVICES / OPS",
    color: "#2496ED",
    renderMutedIcon: () => (
      <svg className="w-8 h-8 fill-current text-[var(--fg)] opacity-50" viewBox="0 0 24 24">
        <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186H8.1a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H2.208a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185M23.79 9.89a4.84 4.84 0 0 0-3.324-1.42 5.08 5.08 0 0 0-.672.045 4.67 4.67 0 0 0-1.89-1.258l-.488.977a3.86 3.86 0 0 1 1.626 1.114 4.09 4.09 0 0 1 .593 1.13c-.392.176-.84.288-1.345.334a10.4 10.4 0 0 0-4.04-1.235H.208c-.114 0-.208.094-.208.209a9.5 9.5 0 0 0 2.083 5.922C4.195 18.258 7.6 19.5 11.833 19.5c6.582 0 11.233-3.662 12.167-9.61z" />
      </svg>
    ),
    renderColoredIcon: () => (
      <svg className="w-8 h-8 fill-[#2496ED]" viewBox="0 0 24 24">
        <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186H8.1a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H2.208a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185M23.79 9.89a4.84 4.84 0 0 0-3.324-1.42 5.08 5.08 0 0 0-.672.045 4.67 4.67 0 0 0-1.89-1.258l-.488.977a3.86 3.86 0 0 1 1.626 1.114 4.09 4.09 0 0 1 .593 1.13c-.392.176-.84.288-1.345.334a10.4 10.4 0 0 0-4.04-1.235H.208c-.114 0-.208.094-.208.209a9.5 9.5 0 0 0 2.083 5.922C4.195 18.258 7.6 19.5 11.833 19.5c6.582 0 11.233-3.662 12.167-9.61z" />
      </svg>
    ),
  },
];

export function StatsTools() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!wrapper || !section || !grid) return;

    const ctx = gsap.context(() => {
      // ------------------------------------------------------------------
      // 1. Synchronized CSS Variable Colors for Text & Borders
      // Scrubbed concurrently with the pixelated canvas transition
      // ------------------------------------------------------------------
      if (prefersReducedMotion) {
        gsap.set(wrapper, {
          "--fg": "#0a0a0a",
          "--border-color": "rgba(10, 10, 10, 0.18)",
          "--card-bg": "rgba(0, 0, 0, 0.07)",
          "--card-border": "rgba(10, 10, 10, 0.2)",
          "--dim": "rgba(10, 10, 10, 0.72)",
          "--badge-bg": "rgba(0, 0, 0, 0.08)",
        });
      } else {
        gsap.fromTo(
          wrapper,
          {
            "--fg": "#ffffff",
            "--border-color": "rgba(255, 255, 255, 0.16)",
            "--card-bg": "rgba(10, 10, 10, 0.8)",
            "--card-border": "rgba(255, 255, 255, 0.16)",
            "--dim": "rgba(255, 255, 255, 0.65)",
            "--badge-bg": "rgba(255, 255, 255, 0.08)",
          },
          {
            "--fg": "#0a0a0a",
            "--border-color": "rgba(10, 10, 10, 0.18)",
            "--card-bg": "rgba(0, 0, 0, 0.07)",
            "--card-border": "rgba(10, 10, 10, 0.2)",
            "--dim": "rgba(10, 10, 10, 0.72)",
            "--badge-bg": "rgba(0, 0, 0, 0.08)",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "top 20%",
              scrub: true,
            },
          }
        );
      }

      // ------------------------------------------------------------------
      // 2. Entrance Animation: Cards stagger alternating from left/right
      // ------------------------------------------------------------------
      const cardElements = grid.querySelectorAll<HTMLElement>(".stat-card-item");

      if (prefersReducedMotion) {
        gsap.set(cardElements, { x: 0, opacity: 1 });
      } else {
        cardElements.forEach((card, idx) => {
          const xOffset = idx % 2 === 0 ? -40 : 40;
          gsap.set(card, { x: xOffset, opacity: 0 });
        });

        ScrollTrigger.create({
          trigger: grid,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(cardElements, {
              x: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
            });
          },
        });
      }
    }, wrapperRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className="w-full relative transition-colors duration-150 overflow-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        color: "var(--fg, #ffffff)",
        // Initial fallback tokens
        ["--fg" as string]: "#ffffff",
        ["--border-color" as string]: "rgba(255, 255, 255, 0.16)",
        ["--card-bg" as string]: "rgba(10, 10, 10, 0.8)",
        ["--card-border" as string]: "rgba(255, 255, 255, 0.16)",
        ["--dim" as string]: "rgba(255, 255, 255, 0.72)",
        ["--badge-bg" as string]: "rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Pixelated Square Blocks Transition Canvas (z-0) */}
      <PixelMosaicCanvas triggerRef={sectionRef} />

      {/* Main Section Content (z-10 relative) */}
      <section
        ref={sectionRef}
        id="stats-tools"
        aria-labelledby="stats-tools-title"
        className="relative z-10 min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b border-[var(--border-color)]"
      >
        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between text-xs uppercase tracking-widest font-hud border-b border-[var(--border-color)] pb-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            <h2 id="stats-tools-title" className="font-semibold text-xs tracking-widest uppercase">
              [ 03 // METRICS &amp; PRIMARY TOOLING ]
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[var(--dim)]">
            <span>PIXELATED TRANSITION</span>
            <span>|</span>
            <span>MODULAR MATRIX</span>
          </div>
        </div>

        {/* Folder Tab Cards Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 my-auto py-6"
        >
          {/* Card 1: 20+ / products shipped */}
          <div
            className="stat-card-item group relative p-[1px] transition-transform duration-300 hover:-translate-y-1 shadow-lg"
            style={{
              clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% 100%, 0 100%)",
              backgroundColor: "var(--card-border)",
            }}
          >
            <div
              className="h-full w-full p-6 sm:p-8 flex flex-col justify-between min-h-[220px] backdrop-blur-md"
              style={{
                clipPath: "polygon(0 19px, 19px 0, 100% 0, 100% 100%, 0 100%)",
                backgroundColor: "var(--card-bg)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-hud text-[11px] uppercase tracking-widest text-[var(--dim)]">
                  [ 01 // METRIC ]
                </span>
                <span className="text-[10px] font-hud px-2 py-0.5 rounded-none border border-[var(--border-color)] bg-[var(--badge-bg)] text-[var(--fg)]">
                  DEPLOYED
                </span>
              </div>

              <div className="my-auto py-4">
                <div className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-[var(--fg)]">
                  <RollingNumber value={20} suffix="+" />
                </div>
              </div>

              <div>
                <h3 className="font-hud text-sm font-semibold uppercase tracking-wider text-[var(--fg)]">
                  PRODUCTS SHIPPED
                </h3>
                <p className="font-hud text-[11px] text-[var(--dim)] mt-1">
                  ENTERPRISE PORTALS & KINETIC PLATFORMS
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 5+ / years of experience (Highlighted: Blue background, white text) */}
          <div
            className="stat-card-item group relative p-[1px] transition-transform duration-300 hover:-translate-y-1 shadow-xl"
            style={{
              clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% 100%, 0 100%)",
              backgroundColor: "rgba(29, 78, 216, 0.5)",
            }}
          >
            <div
              className="h-full w-full p-6 sm:p-8 flex flex-col justify-between min-h-[220px] bg-[#1d4ed8] text-white shadow-xl backdrop-blur-md"
              style={{
                clipPath: "polygon(0 19px, 19px 0, 100% 0, 100% 100%, 0 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-hud text-[11px] uppercase tracking-widest text-white/80">
                  [ 02 // HIGHLIGHT ]
                </span>
                <span className="text-[10px] font-hud px-2 py-0.5 rounded-none border border-white/30 bg-white/10 text-white font-medium">
                  TENURE
                </span>
              </div>

              <div className="my-auto py-4">
                <div className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-white">
                  <RollingNumber value={5} suffix="+" />
                </div>
              </div>

              <div>
                <h3 className="font-hud text-sm font-semibold uppercase tracking-wider text-white">
                  YEARS OF EXPERIENCE
                </h3>
                <p className="font-hud text-[11px] text-white/80 mt-1">
                  FULL-STACK SYSTEMS // 2020 — PRESENT
                </p>
              </div>
            </div>
          </div>

          {/* Cards 3–8: 6 Tool Cards */}
          {TOOLS.map((tool, idx) => (
            <div
              key={tool.id}
              className="stat-card-item group relative p-[1px] transition-transform duration-300 hover:-translate-y-1 cursor-default shadow-lg"
              style={{
                clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% 100%, 0 100%)",
                backgroundColor: "var(--card-border)",
              }}
            >
              <div
                className="h-full w-full p-6 sm:p-8 flex flex-col justify-between min-h-[220px] backdrop-blur-md"
                style={{
                  clipPath: "polygon(0 19px, 19px 0, 100% 0, 100% 100%, 0 100%)",
                  backgroundColor: "var(--card-bg)",
                }}
              >
                {/* Card Top: Index and Crossfading SVG Icons */}
                <div className="flex items-start justify-between">
                  <span className="font-hud text-[11px] uppercase tracking-widest text-[var(--dim)]">
                    {/* [ 0{idx + 3} // STACK ] */}
                  </span>

                  {/* Dual SVG Icons with Crossfade on Hover */}
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* Default Muted Icon */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
                      {tool.renderMutedIcon()}
                    </div>
                    {/* Hover Colored Icon */}
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 pointer-events-none">
                      {tool.renderColoredIcon()}
                    </div>
                  </div>
                </div>

                {/* Card Middle: Tool Name */}
                <div className="my-auto py-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[var(--fg)] group-hover:tracking-normal transition-all">
                    {tool.name}
                  </h3>
                  <div className="font-hud text-[11px] uppercase tracking-wider text-[var(--dim)] mt-1">
                    {tool.category}
                  </div>
                </div>

                {/* Card Bottom: Technical Tag */}
                <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-hud text-[var(--dim)]">
                  <span>{tool.experience}</span>
                  <span className="group-hover:text-[var(--fg)] transition-colors">↗</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Bottom Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[var(--border-color)] font-hud text-xs text-[var(--dim)]">
          <div>TOTAL PRIMARY ARSENAL // 08 PRODUCTION UNITS</div>
          <div className="flex items-center gap-3">
            <span>PIXEL MOSAIC DECODE</span>
            <span>|</span>
            <span className="font-semibold text-[var(--fg)]">MODULAR LIME GRID</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StatsTools;