"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const nameWrapperRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const introParaRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const portraitWrapperRef = useRef<HTMLDivElement>(null);

  const redLayerRef = useRef<HTMLDivElement>(null);
  const cyanLayerRef = useRef<HTMLDivElement>(null);
  const sliceOverlayRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const ctx = gsap.context(() => {
      const nameLines = heroEl.querySelectorAll(".hero-name-line");
      const pill = pillRef.current;
      const introPara = introParaRef.current;
      const scrollHint = scrollHintRef.current;
      const portrait = portraitWrapperRef.current;
      const redLayer = redLayerRef.current;
      const cyanLayer = cyanLayerRef.current;
      const sliceOverlay = sliceOverlayRef.current;

      // ------------------------------------------------------------------
      // 1. Initial State Setup
      // ------------------------------------------------------------------
      if (prefersReducedMotion) {
        gsap.set(nameLines, { yPercent: 0, opacity: 1 });
        gsap.set([pill, introPara, scrollHint, portrait], { opacity: 1, y: 0 });
        if (redLayer && cyanLayer) {
          gsap.set(redLayer, { x: -2 });
          gsap.set(cyanLayer, { x: 2 });
        }
        return;
      }

      // Hide elements behind mask / initial opacity for intro sequence
      gsap.set(nameLines, { yPercent: 110 });
      gsap.set([pill, introPara, scrollHint], { opacity: 0, y: 24 });
      gsap.set(portrait, { opacity: 0, scale: 0.96 });
      if (redLayer && cyanLayer) {
        gsap.set(redLayer, { x: -3 });
        gsap.set(cyanLayer, { x: 3 });
      }

      // ------------------------------------------------------------------
      // 2. Intro Animation (orchestrated on preloader "ready" event)
      // ------------------------------------------------------------------
      const runIntroSequence = () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Intro paragraph & pill fade in
        tl.to([introPara, pill], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });

        // Giant name lines slide up from masked overflow-hidden wrapper with stagger
        tl.to(
          nameLines,
          {
            yPercent: 0,
            duration: 1.15,
            stagger: 0.16,
            ease: "power4.out",
          },
          "-=0.5"
        );

        // Portrait fades in with a quick high-energy glitch burst
        tl.to(
          portrait,
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            onStart: () => {
              if (redLayer && cyanLayer) {
                // Quick glitch burst
                gsap.fromTo(
                  [redLayer, cyanLayer],
                  { x: (i) => (i === 0 ? -12 : 12) },
                  {
                    x: (i) => (i === 0 ? -3 : 3),
                    duration: 0.25,
                    ease: "elastic.out(1, 0.3)",
                  }
                );
              }
            },
          },
          "-=0.7"
        );

        // Scroll hint at bottom-left
        tl.to(
          scrollHint,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        );
      };

      const isReady =
        typeof window !== "undefined" &&
        Boolean((window as unknown as { __PORTFOLIO_READY__?: boolean }).__PORTFOLIO_READY__);

      if (isReady) {
        runIntroSequence();
      } else {
        const handleReady = () => runIntroSequence();
        window.addEventListener("ready", handleReady, { once: true });
      }

      // ------------------------------------------------------------------
      // 3. Idle Glitch Bursts (Every 3–6s, random clip-path slices & shift)
      // ------------------------------------------------------------------
      let burstTimer: NodeJS.Timeout;

      const triggerIdleGlitch = () => {
        if (!sliceOverlay || !redLayer || !cyanLayer) return;

        const sliceTop = Math.floor(Math.random() * 70);
        const sliceHeight = Math.floor(Math.random() * 20) + 8;
        const sliceBottom = sliceTop + sliceHeight;
        const shiftX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 6 + 6); // ±6px to ±12px

        // Clip slice layer
        gsap.set(sliceOverlay, {
          clipPath: `polygon(0% ${sliceTop}%, 100% ${sliceTop}%, 100% ${sliceBottom}%, 0% ${sliceBottom}%)`,
          x: shiftX,
          opacity: 0.9,
        });

        // Jitter RGB layers
        gsap.to(redLayer, { x: -shiftX * 1.3, duration: 0.08, yoyo: true, repeat: 1 });
        gsap.to(cyanLayer, { x: shiftX * 1.3, duration: 0.08, yoyo: true, repeat: 1 });

        // Reset burst after 90-140ms
        const burstDuration = Math.random() * 50 + 90;
        setTimeout(() => {
          gsap.set(sliceOverlay, { opacity: 0, x: 0, clipPath: "none" });
          gsap.set(redLayer, { x: -3 });
          gsap.set(cyanLayer, { x: 3 });
        }, burstDuration);

        scheduleNextBurst();
      };

      const scheduleNextBurst = () => {
        const delay = Math.random() * 3000 + 3000; // 3 to 6 seconds
        burstTimer = setTimeout(triggerIdleGlitch, delay);
      };

      scheduleNextBurst();

      // ------------------------------------------------------------------
      // 4. Scroll Velocity RGB Distortion (ScrollTrigger onUpdate)
      // ------------------------------------------------------------------
      const velocityProxy = { offset: 3 };

      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity()); // px/sec
          // Map velocity to RGB offset (up to 20px)
          const targetOffset = Math.min(22, (velocity / 140) + 3);

          gsap.to(velocityProxy, {
            offset: targetOffset,
            duration: 0.1,
            overwrite: "auto",
            onUpdate: () => {
              if (redLayer && cyanLayer) {
                gsap.set(redLayer, { x: -velocityProxy.offset });
                gsap.set(cyanLayer, { x: velocityProxy.offset });
              }
            },
            onComplete: () => {
              // Smoothly ease back to base offset (3px) when scroll stops
              gsap.to(velocityProxy, {
                offset: 3,
                duration: 0.45,
                ease: "power2.out",
                onUpdate: () => {
                  if (redLayer && cyanLayer) {
                    gsap.set(redLayer, { x: -velocityProxy.offset });
                    gsap.set(cyanLayer, { x: velocityProxy.offset });
                  }
                },
              });
            },
          });
        },
      });

      // ------------------------------------------------------------------
      // 5. Scroll Parallax Animation (scrub: true from top top to bottom top)
      // ------------------------------------------------------------------
      const scrubTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroEl,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Name moves up and fades slightly
      if (nameWrapperRef.current) {
        scrubTimeline.to(
          nameWrapperRef.current,
          {
            yPercent: -35,
            opacity: 0.25,
            ease: "none",
          },
          0
        );
      }

      // Portrait moves up at a slower rate (parallax)
      if (portraitWrapperRef.current) {
        scrubTimeline.to(
          portraitWrapperRef.current,
          {
            yPercent: -18,
            ease: "none",
          },
          0
        );
      }

      // Cleanup idle burst timer on revert
      return () => {
        clearTimeout(burstTimer);
      };
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-labelledby="hero-title"
      className="relative min-h-screen w-full flex flex-col justify-between pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12 px-6 sm:px-12 lg:px-16 border-b border-white/10 overflow-hidden bg-[var(--bg-dark)]"
    >
      {/* Hidden SVG Filters for Pure RGB Channel Isolation */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Red Channel Split Filter */}
          <filter id="rgb-split-red" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
          </filter>
          {/* Cyan Channel Split Filter (Green + Blue) */}
          <filter id="rgb-split-cyan" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full">
        {/* Left Column: Intro Paragraph, Pill, Giant Name, Scroll Hint */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-8 sm:space-y-12">
          {/* Top-left: Short Intro Paragraph */}
          <p
            ref={introParaRef}
            className="max-w-xl text-base sm:text-lg lg:text-xl font-hud text-[var(--text-dim)] leading-relaxed tracking-wide"
          >
            Frontend and full-stack developer with over five years of experience building
            interactive web applications with React.js, Next.js, and Laravel. Experienced in
            CI/CD and Docker deployments for production environments.
          </p>

          {/* Bottom-left: Role pill + Giant 2-line name */}
          <div ref={nameWrapperRef} className="space-y-4">
            {/* Lime Pill Tag [ROLE] */}
            <div ref={pillRef}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 text-xs uppercase tracking-widest font-hud bg-[var(--lime)]/10 text-[var(--lime)] border border-[var(--lime)]/30 rounded-full select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)] animate-ping" />
                [ FRONTEND & FULL-STACK DEVELOPER ]
              </span>
            </div>

            {/* Giant two-line name as semantic H1 in condensed uppercase font clamp(42px, 11vw, 140px) */}
            <h1
              id="hero-title"
              className="font-display font-bold uppercase tracking-tight text-white select-none"
              style={{
                fontSize: "clamp(42px, 11vw, 140px)",
                lineHeight: "0.85",
              }}
            >
              {/* Line 1 in overflow-hidden mask */}
              <div className="overflow-hidden">
                <span className="hero-name-line block">RAMADHON IKHSAN</span>
              </div>
              {/* Line 2 in overflow-hidden mask */}
              <div className="overflow-hidden">
                <span className="hero-name-line block text-[var(--lime)]">PRASETYA</span>
              </div>
            </h1>
          </div>

          {/* Bottom-left: Scroll down hint */}
          <div
            ref={scrollHintRef}
            className="flex items-center gap-3 font-hud text-xs uppercase tracking-widest text-[var(--text-dim)] pt-4"
          >
            <span className="text-[var(--lime)] animate-bounce font-mono">↓</span>
            <span>SCROLL DOWN // DISCOVER RUNTIME</span>
          </div>
        </div>

        {/* Right Column: Grayscale Portrait with RGB Glitch & Scanlines */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div
            ref={portraitWrapperRef}
            className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px] aspect-[3/4] bg-[#0c0c0c] border border-white/15 p-2 shadow-2xl select-none"
          >
            {/* Outer HUD Corner Accents */}
            <div className="absolute -top-1.5 -left-1.5 font-hud text-[10px] text-[var(--lime)] select-none pointer-events-none">
              ┌
            </div>
            <div className="absolute -top-1.5 -right-1.5 font-hud text-[10px] text-[var(--lime)] select-none pointer-events-none">
              ┐
            </div>
            <div className="absolute -bottom-1.5 -left-1.5 font-hud text-[10px] text-[var(--lime)] select-none pointer-events-none">
              └
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 font-hud text-[10px] text-[var(--lime)] select-none pointer-events-none">
              ┘
            </div>

            {/* Inner Glitch Viewport */}
            <div className="relative w-full h-full overflow-hidden bg-black">
              {/* 1. Base Grayscale Portrait */}
              <div className="relative w-full h-full">
                <Image
                  src="/profile.png"
                  alt="Portrait of Ramadhon Ikhsan Prasetya"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                  className="object-cover grayscale-90 contrast-100"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/100 via-black/0 to-black/100" />
              </div>

              <div
                ref={redLayerRef}
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{ filter: "url(#rgb-split-red)" }}
                aria-hidden="true"
              >
                <Image
                  src="/profile.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                  className="object-cover grayscale contrast-125"
                />
              </div>

              <div
                ref={cyanLayerRef}
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{ filter: "url(#rgb-split-cyan)" }}
                aria-hidden="true"
              >
                <Image
                  src="/profile.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 440px"
                  className="object-cover grayscale contrast-125"
                />
              </div>

              <div
                ref={sliceOverlayRef}
                className="absolute inset-0 pointer-events-none opacity-0 mix-blend-difference"
                aria-hidden="true"
              >
                <Image
                  src="/profile.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 440px"
                  className="object-cover invert contrast-200"
                />
              </div>

              {/* 5. Repeating-linear-gradient Scanline Layer (2px lines, 15% opacity) */}
              <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)",
                }}
                aria-hidden="true"
              />

              {/* Bottom Telemetry Overlay on Image */}
              <div className="absolute bottom-2 left-2 right-2 z-30 flex items-center justify-between font-hud text-[9px] uppercase tracking-widest text-white/70 px-2 py-1 bg-black/70 backdrop-blur-sm border border-white/10 pointer-events-none">
                <span>PORTRAIT // SCAN 01</span>
                <span className="text-[var(--lime)]">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
