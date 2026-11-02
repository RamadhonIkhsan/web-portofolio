"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "./useReducedMotion";

export interface ScrollAnimationSetupContext {
  isReducedMotion: boolean;
  scope: HTMLElement;
  mm: gsap.MatchMedia;
}

export type AnimationSetupCallback = (ctx: ScrollAnimationSetupContext) => void | (() => void);

/**
 * Standard hook for scroll-driven animations adhering to all project rules:
 * 1. Checks `useReducedMotion` before initializing rich motion.
 * 2. Scopes all animations inside `gsap.context()` and automatically reverts on unmount.
 * 3. Provides `gsap.matchMedia()` / `ScrollTrigger.matchMedia()` for responsive variants.
 * 4. Animates strictly transform (x, y, scale, rotation) and opacity.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  setup: AnimationSetupCallback,
  dependencies: unknown[] = []
): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Create isolated GSAP context
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      setup({
        isReducedMotion: prefersReducedMotion,
        scope: element,
        mm,
      });
    }, element);

    return () => {
      ctx.revert(); // Reverts all animations and kills associated ScrollTriggers
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, ...dependencies]);

  return containerRef;
}

export default useScrollAnimation;
