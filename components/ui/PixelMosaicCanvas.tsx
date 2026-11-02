"use client";

import React, { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface PixelMosaicCanvasProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  className?: string;
  onProgress?: (progress: number) => void;
}

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  threshold: number;
}

export function PixelMosaicCanvas({
  triggerRef,
  className = "",
  onProgress,
}: PixelMosaicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;
    if (!canvas || !trigger) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let blocks: Block[] = [];
    let width = 0;
    let height = 0;
    let currentProgress = 0;

    // Pseudo-random deterministic hash function based on coordinate seeds
    const pseudoRand = (x: number, y: number): number => {
      const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return sin - Math.floor(sin);
    };

    // Generate dynamic composition of large, medium, standard, and micro squares
    const buildMosaic = () => {
      const rect = trigger.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Base grid unit (responsive: 32px mobile, 48px desktop)
      const base = width < 768 ? 32 : 48;
      const cols = Math.ceil(width / base);
      const rows = Math.ceil(height / base);

      // 2D occupancy matrix to guarantee 100% gapless and overlap-free tiling
      const occupied: boolean[][] = Array.from({ length: rows }, () =>
        Array(cols).fill(false)
      );
      blocks = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (occupied[r][c]) continue;

          const pr = pseudoRand(c + 1, r + 1);
          const pr2 = pseudoRand(r * 3 + 7, c * 5 + 11);

          // 1. Large 3x3 Hero Square (approx 7% probability if space allows)
          if (
            pr < 0.07 &&
            r + 3 <= rows &&
            c + 3 <= cols &&
            !occupied[r][c + 1] &&
            !occupied[r][c + 2] &&
            !occupied[r + 1][c] &&
            !occupied[r + 1][c + 1] &&
            !occupied[r + 1][c + 2] &&
            !occupied[r + 2][c] &&
            !occupied[r + 2][c + 1] &&
            !occupied[r + 2][c + 2]
          ) {
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                occupied[r + i][c + j] = true;
              }
            }
            const bx = c * base;
            const by = r * base;
            const bw = 3 * base;
            const bh = 3 * base;
            const normY = (by + bh / 2) / height;
            // Progress threshold: top-to-bottom with digital jitter
            const threshold = Math.min(
              0.95,
              Math.max(0.04, normY * 0.72 + pr2 * 0.28)
            );
            blocks.push({
              x: bx,
              y: by,
              w: bw,
              h: bh,
              threshold,
            });
            continue;
          }

          // 2. Medium 2x2 Square (approx 24% probability if space allows)
          if (
            pr < 0.31 &&
            r + 2 <= rows &&
            c + 2 <= cols &&
            !occupied[r][c + 1] &&
            !occupied[r + 1][c] &&
            !occupied[r + 1][c + 1]
          ) {
            for (let i = 0; i < 2; i++) {
              for (let j = 0; j < 2; j++) {
                occupied[r + i][c + j] = true;
              }
            }
            const bx = c * base;
            const by = r * base;
            const bw = 2 * base;
            const bh = 2 * base;
            const normY = (by + bh / 2) / height;
            const threshold = Math.min(
              0.95,
              Math.max(0.04, normY * 0.73 + pr2 * 0.27)
            );
            blocks.push({
              x: bx,
              y: by,
              w: bw,
              h: bh,
              threshold,
            });
            continue;
          }

          // 3. Subdivided Fine Micro-Squares (0.5x0.5 each, approx 20% probability)
          if (pr < 0.51) {
            occupied[r][c] = true;
            const half = base / 2;
            for (let subR = 0; subR < 2; subR++) {
              for (let subC = 0; subC < 2; subC++) {
                const bx = c * base + subC * half;
                const by = r * base + subR * half;
                const subPr = pseudoRand(bx + 13, by + 17);
                const normY = (by + half / 2) / height;
                const threshold = Math.min(
                  0.96,
                  Math.max(0.03, normY * 0.74 + subPr * 0.26)
                );
                blocks.push({
                  x: bx,
                  y: by,
                  w: half,
                  h: half,
                  threshold,
                });
              }
            }
            continue;
          }

          // 4. Standard 1x1 Square
          occupied[r][c] = true;
          const bx = c * base;
          const by = r * base;
          const normY = (by + base / 2) / height;
          const threshold = Math.min(
            0.95,
            Math.max(0.04, normY * 0.73 + pr2 * 0.27)
          );
          blocks.push({
            x: bx,
            y: by,
            w: base,
            h: base,
            threshold,
          });
        }
      }
    };

    // Draw routine: renders clean solid blocks with NO grid lines or wireframe strokes
    const render = (progress: number) => {
      currentProgress = progress;

      if (prefersReducedMotion || progress >= 0.99) {
        // Fast path: solid seamless lime background
        ctx.fillStyle = "#a6ff2e";
        ctx.fillRect(0, 0, width, height);
        return;
      }

      // Base canvas background: solid dark
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Render each activated square block step by step (no grid lines)
      blocks.forEach((b) => {
        const isActivated = progress >= b.threshold;

        if (isActivated) {
          // Digital step activation: lime or transient glitch-flash
          const isGlitchFlash =
            progress - b.threshold < 0.04 && progress < 0.95;

          if (isGlitchFlash) {
            ctx.fillStyle = "#f0ffb3"; // Bright digital white-lime flash
          } else {
            ctx.fillStyle = "#a6ff2e"; // Core neon lime
          }

          // Fill clean square pixel block without borders or grid lines
          ctx.fillRect(b.x, b.y, b.w, b.h);
        }
      });
    };

    buildMosaic();
    render(0);

    // ScrollTrigger to scrub progress from start: "top 70%" to end: "top 20%"
    const st = ScrollTrigger.create({
      trigger,
      start: "top 70%",
      end: "top 20%",
      scrub: true,
      onUpdate: (self) => {
        render(self.progress);
        if (onProgressRef.current) {
          onProgressRef.current(self.progress);
        }
      },
    });

    // Resize handler to regenerate modular grid on dimension changes
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildMosaic();
        render(currentProgress);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      st.kill();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [triggerRef, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}

export default PixelMosaicCanvas;
