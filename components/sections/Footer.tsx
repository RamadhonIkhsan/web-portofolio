"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAudio } from "@/components/providers/AudioProvider";
import { DotMatrixCanvas } from "@/components/ui/DotMatrixCanvas";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { playClick } = useAudio();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Entry animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
      .from(".footer-btn", {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4")
      .from(matrixRef.current, {
        y: 100,
        scaleY: 0.5,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      }, "-=0.6");
    }, footerRef.current!);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <footer
      ref={footerRef}
      id="footer"
      aria-labelledby="footer-title"
      className="relative w-full bg-[var(--lime)] text-[#0a0a0a] pt-24 pb-0 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Left Column */}
        <div className="space-y-12">
          <h2 
            ref={headingRef}
            id="footer-title"
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[0.9]"
          >
            LET&apos;S <br />
            CONNECT
          </h2>

          <div ref={buttonsRef} className="flex flex-wrap gap-4">
            <a
              href="mailto:ramadhon.ikhsan99@gmail.com"
              data-cursor="link"
              onMouseEnter={playClick}
              onClick={playClick}
              className="footer-btn px-8 py-4 border border-black font-hud text-xs uppercase tracking-widest hover:bg-black hover:text-[var(--lime)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              RAMADHON.IKHSAN99@GMAIL.COM
            </a>
            <a
              href="#hero"
              data-cursor="link"
              onMouseEnter={playClick}
              onClick={playClick}
              className="footer-btn px-8 py-4 border border-black font-hud text-xs uppercase tracking-widest hover:bg-black hover:text-[var(--lime)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              BACK TO TOP ↑
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="font-hud text-[10px] uppercase tracking-[0.2em] text-black/75 font-bold">PROFILES</h4>
            <ul className="space-y-3 font-hud text-sm">
              <li><FooterLink href="https://github.com/RamadhonIkhsan" onHover={playClick}>GITHUB</FooterLink></li>
              <li><FooterLink href="https://git.basys.co.id/RamadhonIkhsan" onHover={playClick}>GIT SERVER</FooterLink></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-hud text-[10px] uppercase tracking-[0.2em] text-black/75 font-bold">CONTACT</h4>
            <ul className="space-y-3 font-hud text-sm">
              <li><FooterLink href="https://www.linkedin.com/in/ramadhon-ikhsan-prasetya-1b585921b" onHover={playClick}>LINKEDIN</FooterLink></li>
              <li><a href="tel:+6285864620738" className="hover:text-black font-medium transition-colors">+62 858-6462-0738</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dotted Text Bottom */}
      <div 
        ref={matrixRef}
        className="relative w-full overflow-hidden select-none"
        style={{ height: "30vw", maxHeight: "400px" }}
      >
        <DotMatrixCanvas 
          text="RAMADHON IKHSAN PRASETYA" 
          className="w-full h-full"
        />
        
        {/* Visual Fade Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent 75%, var(--lime) 100%)",
          }}
        />

        {/* Real DOM text for accessibility (hidden visually) */}
        <span className="sr-only">RAMADHON IKHSAN PRASETYA</span>
      </div>

      {/* Bottom info */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 py-8 flex justify-between items-center font-hud text-[10px] tracking-widest text-black/75 border-t border-black/15">
        <div>RAMADHON IKHSAN PRASETYA</div>
        <div>SUMEDANG, WEST JAVA, INDONESIA</div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, onHover }: { href: string; children: React.ReactNode; onHover?: () => void }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      data-cursor="link"
      onMouseEnter={onHover}
      onClick={onHover}
      className="group flex items-center gap-1 hover:text-black font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
    >
      <span className="relative overflow-hidden">
        {children}
        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
      </span>
      <span className="text-[10px] translate-y-[-2px]">↗</span>
    </a>
  );
}

export default Footer;
