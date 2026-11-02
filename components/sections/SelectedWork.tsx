"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PixelReveal } from "@/components/ui/PixelReveal";
import { useAudio } from "@/components/providers/AudioProvider";

export interface ProjectCardData {
  id: string;
  title: string;
  type: "CASE STUDY" | "WEB DESIGN" | "APP DESIGN";
  image: string;
  href: string;
  yOffset: number;
  year: string;
}

export const PROJECTS: ProjectCardData[] = [
  {
    id: "01",
    title: "NEO-SYNAPSE INTERFACE",
    type: "CASE STUDY",
    image: "/projects/project-1.jpg",
    href: "https://github.com",
    yOffset: -45,
    year: "2025",
  },
  {
    id: "02",
    title: "QUANTUM TRADING TERMINAL",
    type: "APP DESIGN",
    image: "/projects/project-1.jpg",
    href: "https://github.com",
    yOffset: 10,
    year: "2024",
  },
  {
    id: "03",
    title: "SPATIAL AUDIO ENGINE",
    type: "WEB DESIGN",
    image: "/projects/project-2.jpg",
    href: "https://github.com",
    yOffset: 55,
    year: "2024",
  },
  {
    id: "04",
    title: "AEROSPACE TELEMETRY HUB",
    type: "CASE STUDY",
    image: "/projects/project-1.jpg",
    href: "https://github.com",
    yOffset: -50,
    year: "2024",
  },
  {
    id: "05",
    title: "HYPERION PROTOCOL",
    type: "APP DESIGN",
    image: "/projects/project-2.jpg",
    href: "https://github.com",
    yOffset: 5,
    year: "2023",
  },
  {
    id: "06",
    title: "CYBERPULSE ARCHITECTURE",
    type: "WEB DESIGN",
    image: "/projects/project-1.jpg",
    href: "https://github.com",
    yOffset: 60,
    year: "2023",
  },
  {
    id: "07",
    title: "KINETIC ARTISTRY V2",
    type: "CASE STUDY",
    image: "/projects/project-2.jpg",
    href: "https://github.com",
    yOffset: -40,
    year: "2023",
  },
  {
    id: "08",
    title: "AUTONOMOUS VECTOR LAB",
    type: "APP DESIGN",
    image: "/projects/project-1.jpg",
    href: "https://github.com",
    yOffset: 25,
    year: "2022",
  },
];

export function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const circuitPathRef = useRef<SVGPathElement>(null);
  const { playClick } = useAudio();
  const prefersReducedMotion = useReducedMotion();
  const [hTween, setHTween] = useState<gsap.core.Animation | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const circuitPath = circuitPathRef.current;
    if (!section || !track) return;

    // Refresh ScrollTrigger after potential layout changes
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);

    const mm = gsap.matchMedia();

    // ------------------------------------------------------------------
    // Desktop: Pinned Horizontal Scroll (>= 768px)
    // ------------------------------------------------------------------
    mm.add("(min-width: 768px)", () => {
      gsap.set(".project-card", { "--card-transform": "translateY(var(--y, 0px))" });
      // Keep the horizontal travel and pin duration tied to the last card's
      // actual position so every card is visible before the next section.
      const getScrollDistance = () => {
        const lastCard = track.querySelector<HTMLElement>(
          ".project-card:last-child"
        );
        if (!lastCard) return 0;

        const trackLeft = track.getBoundingClientRect().left;
        const lastCardRight = lastCard.getBoundingClientRect().right + 100; // Setting Scroll Distance

        console.log({ trackLeft, lastCardRight, section });
        return Math.max(
          0,
          lastCardRight - trackLeft - section.clientWidth
        );
      };
      const getScrollAmount = () => -getScrollDistance();

      const horizontalTween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          end: () => "+=" + getScrollDistance(),
          invalidateOnRefresh: true,
        },
      });

      setHTween(horizontalTween);

      // Circuit lines drawing animation tied to containerAnimation
      if (!prefersReducedMotion && circuitPath) {
        const length = circuitPath.getTotalLength();
        gsap.set(circuitPath, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(circuitPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            containerAnimation: horizontalTween,
            start: "left left",
            end: "right right",
            scrub: 0.8,
          },
        });
      }

      // Per-card image parallax shift (±30px) using containerAnimation
      if (!prefersReducedMotion) {
        const parallaxImages = track.querySelectorAll<HTMLElement>(".card-parallax-image");
        parallaxImages.forEach((img) => {
          const card = img.closest(".project-card");
          if (!card) return;

          gsap.fromTo(
            img,
            { x: -30 },
            {
              x: 30,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      }
    });

    // ------------------------------------------------------------------
    // Mobile (< 768px): Native responsive layout without pin
    // ------------------------------------------------------------------
    mm.add("(max-width: 767px)", () => {
      gsap.set(track, { clearProps: "all" });
      gsap.set(".project-card", { "--card-transform": "none" });
    });

    return () => {
      mm.revert();
      clearTimeout(timer);
    };
  }, [prefersReducedMotion]);

  // Construct circuit polyline path coordinates connecting the 8 cards
  // Base offset: Intro block ~520px, each card spaced ~500px apart
  const CARD_SPACING = 500;
  const INTRO_WIDTH = 520;
  const CARD_WIDTH = 440;
  const MID_Y = 320; // vertical center line in px

  const circuitPoints = PROJECTS.map((p, idx) => {
    const x = INTRO_WIDTH + idx * CARD_SPACING + CARD_WIDTH / 2;
    const y = MID_Y + p.yOffset * 1.5;
    return { x, y, id: p.id };
  });

  const circuitPathD = circuitPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${INTRO_WIDTH - 80} ${MID_Y} L ${pt.x} ${pt.y}`;
    const prev = circuitPoints[i - 1];
    const midX = (prev.x + pt.x) / 2;
    // Step angular routing
    return `${acc} L ${midX} ${prev.y} L ${midX} ${pt.y} L ${pt.x} ${pt.y}`;
  }, "");

  return (    <section
      ref={sectionRef}
      id="selected-work"
      aria-labelledby="selected-work-title"
      className="relative min-h-screen w-full bg-[var(--lime)] text-[#0a0a0a] overflow-hidden select-none border-b border-black/15"
    >
      {/* Horizontal Scroll Track Container */}
      <div
        ref={trackRef}
        className="flex md:flex-row flex-col h-full md:min-h-screen items-center will-change-transform"
      >
        {/* Track Intro Block */}
        <div className="w-full md:w-auto md:min-w-[480px] lg:min-w-[540px] px-6 sm:px-12 lg:px-16 py-12 md:py-0 flex flex-col justify-center flex-shrink-0 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[var(--lime)] font-hud text-xs uppercase tracking-widest self-start mb-6 rounded-none">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] animate-ping" />
            <span>KEEP SCROLLING // 04</span>
          </div>

          <h2
            id="selected-work-title"
            className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight text-[var(--purple)] leading-[0.88] mb-6"
          >
            SELECTED
            <br />
            WORK
          </h2>

          <p className="font-hud text-sm sm:text-base text-black/90 max-w-sm leading-relaxed mb-8">
            Curated digital architectures, high-performance interfaces, and kinetic
            visual systems.
          </p>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playClick}
            onClick={playClick}
            className="inline-flex items-center gap-3 px-6 py-3 border border-black text-black font-hud text-xs uppercase tracking-widest hover:bg-black hover:text-[var(--lime)] transition-colors self-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <span>EXPLORE WORK</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Desktop Circuit Lines SVG Layer */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <svg
            className="h-full overflow-visible"
            style={{ width: `${INTRO_WIDTH + PROJECTS.length * CARD_SPACING + 200}px` }}
            aria-hidden="true"
          >
            {/* Angular connection polyline */}
            <path
              ref={circuitPathRef}
              d={circuitPathD}
              fill="none"
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth="1.5"
            />
            {/* Diamond nodes at card joint positions */}
            {circuitPoints.map((pt) => (
              <g key={pt.id} transform={`translate(${pt.x}, ${pt.y})`}>
                <rect
                  x="-5"
                  y="-5"
                  width="10"
                  height="10"
                  transform="rotate(45)"
                  fill="var(--purple)"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
              </g>
            ))}
          </svg>
        </div>

        {/* Project Cards (Horizontal Runway on Desktop, Native Stack on Mobile) */}
        <div className="flex md:flex-row flex-col md:items-center gap-8 sm:gap-12 md:gap-16 px-6 sm:px-12 md:px-0 md:pr-24 w-full md:w-auto relative z-10 pb-16 md:pb-0">
          {PROJECTS.map((project) => (
            <article
              key={project.id}
              data-cursor="view"
              onMouseEnter={playClick}
              className="project-card group relative w-full sm:w-[420px] lg:w-[460px] flex-shrink-0 cursor-pointer"
              style={{
                ["--y" as string]: `${project.yOffset}px`,
                transform: "var(--card-transform, none)",
              }}
            >
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClick}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                aria-label={`View case study: ${project.title} (${project.type}, ${project.year})`}
              >
                {/* 16:10 Thumbnail Viewport */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-black/20 bg-black/10 shadow-lg">
                  <div className="relative w-[calc(100%+60px)] h-full -ml-[30px] overflow-hidden">
                    <div className="card-parallax-image relative w-full h-full will-change-transform">
                      <PixelReveal
                        src={project.image}
                        alt={`${project.title} visual interface preview`}
                        containerAnimation={hTween || undefined}
                        trigger="enter"
                        hover={true}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Type Tag Overlaid Bottom-Left */}
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className="inline-block px-2.5 py-1 bg-black text-[var(--lime)] group-hover:bg-[var(--purple)] group-hover:text-white transition-colors duration-300 font-hud text-[10px] font-semibold tracking-widest uppercase">
                      {project.type}
                    </span>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-2 right-2 text-[10px] font-hud text-black/75 group-hover:text-black font-semibold transition-colors z-20">
                    [ {project.id} ]
                  </div>
                </div>

                {/* Card Metadata Below Thumbnail */}
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0a0a0a] group-hover:text-[var(--purple)] transition-colors">
                      {project.title}
                    </h3>
                    <div className="font-hud text-xs text-black/85 font-medium uppercase tracking-wider mt-1">
                      REL: {project.year} || SYSTEM
                    </div>
                  </div>

                  {/* Visit ↗ Action */}
                  <div className="font-hud text-xs font-semibold tracking-widest uppercase text-black/90 group-hover:text-[var(--purple)] group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-all flex items-center gap-1 self-start pt-1">
                    <span>VISIT</span>
                    <span>↗</span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SelectedWork;
