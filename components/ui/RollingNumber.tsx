"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface RollingNumberProps {
  value: number | string;
  suffix?: string;
  className?: string;
  duration?: number;
  stagger?: number;
}

export function RollingNumber({
  value,
  suffix = "",
  className = "",
  duration = 1.4,
  stagger = 0.12,
}: RollingNumberProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Parse string / number into clean digit array and suffix
  const strVal = String(value);
  const numericMatch = strVal.match(/\d+/);
  const rawDigits = numericMatch ? numericMatch[0].split("") : ["0"];
  const derivedSuffix = suffix || (strVal.includes("+") ? "+" : "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const strips = container.querySelectorAll<HTMLDivElement>(".digit-strip");
    if (strips.length === 0) return;

    if (prefersReducedMotion) {
      strips.forEach((strip, i) => {
        const targetDigit = parseInt(rawDigits[i] || "0", 10);
        gsap.set(strip, { yPercent: -targetDigit * 10 });
      });
      return;
    }

    // Set initial position to 0
    gsap.set(strips, { yPercent: 0 });

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      once: true,
      onEnter: () => {
        strips.forEach((strip, i) => {
          const targetDigit = parseInt(rawDigits[i] || "0", 10);
          gsap.to(strip, {
            yPercent: -targetDigit * 10,
            duration,
            delay: i * stagger,
            ease: "power3.out",
          });
        });
      },
    });

    return () => {
      st.kill();
    };
  }, [rawDigits, duration, stagger, prefersReducedMotion]);

  return (
    <span ref={containerRef} className={`inline-flex items-baseline ${className}`}>
      {/* Screen reader accessible label */}
      <span className="sr-only">
        {rawDigits.join("")}
        {derivedSuffix}
      </span>

      {/* Visual Odometer Rolls */}
      <span aria-hidden="true" className="inline-flex items-baseline">
        {rawDigits.map((_, idx) => (
          <span
            key={idx}
            className="relative inline-block h-[1em] overflow-hidden leading-none tabular-nums"
          >
            <div className="digit-strip flex flex-col will-change-transform">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <span
                  key={digit}
                  className="flex h-[1em] items-center justify-center leading-none"
                >
                  {digit}
                </span>
              ))}
            </div>
          </span>
        ))}
        {derivedSuffix && (
          <span className="inline-block leading-none select-none">
            {derivedSuffix}
          </span>
        )}
      </span>
    </span>
  );
}

export default RollingNumber;
