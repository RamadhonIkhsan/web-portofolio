"use client";

import React, { useRef } from "react";
import { ScrambleText } from "@/components/ui/ScrambleText";

const MANIFESTO_STATEMENT =
  "I BUILD INTERACTIVE WEB APPLICATIONS WITH REACT.JS AND NEXT.JS FOR FRONTEND, AND LARAVEL FOR FULL-STACK DEVELOPMENT. I HAVE OVER FIVE YEARS OF EXPERIENCE, INCLUDING PRODUCTION DEPLOYMENTS WITH CI/CD AND DOCKER.";

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      aria-labelledby="manifesto-title"
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b border-white/10 bg-[var(--bg-dark)] overflow-hidden"
    >
      {/* Top Section Telemetry Bar */}
      <div className="flex items-center justify-between text-xs uppercase tracking-widest font-hud text-[var(--text-dim)] border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--purple-light)] animate-pulse" />
          <span className="text-[var(--purple-light)] font-semibold">[ 02 // PROFILE ]</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>FRONTEND & FULL-STACK DEVELOPMENT</span>
          <span className="text-white/20">|</span>
          <span className="text-[var(--lime)]">OVER 5 YEARS OF EXPERIENCE</span>
        </div>
      </div>

      {/* Main Full-Width Scramble Statement */}
      <div className="my-auto py-12 sm:py-16 w-full max-w-7xl mx-auto">
        <ScrambleText
          as="h2"
          // id="manifesto-title"
          text={MANIFESTO_STATEMENT}
          alignJustify
          mode="scroll"
          scrub={0.6}
          start="top 80%"
          end="bottom 40%"
          triggerRef={sectionRef}
          className="font-display font-bold uppercase tracking-tight text-white leading-[1.05]"
          style={{
            fontSize: "clamp(32px, 5vw, 80px)",
          }}
        />
      </div>

      {/* Bottom Section Metadata & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 font-hud text-xs text-[var(--text-dim)]">
        <div>
            <span className="text-white uppercase block mb-1">01 / DEVELOPMENT</span>
          <p className="leading-relaxed">
            Frontend development with React.js, Next.js, Tailwind CSS, SCSS, Ant Design, and Framer Motion.
          </p>
        </div>
        <div>
            <span className="text-white uppercase block mb-1">02 / FULL-STACK</span>
          <p className="leading-relaxed">
            Laravel development, API integration, responsive interfaces, and reusable component libraries.
          </p>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-white uppercase block mb-1">03 / DELIVERY</span>
            <p className="text-[var(--lime)] font-semibold">GIT // DOCKER // CI/CD // DEBUGGING</p>
          </div>
          <div className="text-[10px] text-white/70 pt-2 font-mono">
            SUMEDANG, WEST JAVA, INDONESIA
          </div>
        </div>
      </div>
    </section>
  );
}

export default Manifesto;
