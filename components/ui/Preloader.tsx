"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { lenis } = useLenis();
  const prefersReducedMotion = useReducedMotion();

  const [percentage, setPercentage] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  // Lock scroll on mount and when lenis changes
  useEffect(() => {
    if (isFinished) return;

    if (lenis) {
      lenis.stop();
    }
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
      lenis?.start();
    };
  }, [lenis, isFinished]);

  // Track asset loading progress + enforce min 1.2s display
  useEffect(() => {
    const startTime = performance.now();
    const MIN_DURATION = 1200; // minimum display 1.2s
    let animationFrameId: number;
    let isCancelled = false;

    let fontPromiseResolved = false;
    let imagesPromiseResolved = false;

    // 1. Track fonts with safety fallback
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready
        .then(() => {
          if (!isCancelled) {
            fontPromiseResolved = true;
            setFontsLoaded(true);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            fontPromiseResolved = true;
            setFontsLoaded(true);
          }
        });
    } else {
      fontPromiseResolved = true;
      requestAnimationFrame(() => {
        if (!isCancelled) {
          setFontsLoaded(true);
        }
      });
    }

    // 2. Track critical above-the-fold images in the DOM (excluding offscreen lazy images)
    const checkImages = () => {
      const allImgs = Array.from(document.querySelectorAll("img"));
      // Target critical images (Hero images or eager/priority images)
      const criticalImgs = allImgs.filter(
        (img) =>
          img.closest("#hero") ||
          img.getAttribute("loading") === "eager" ||
          img.getAttribute("fetchpriority") === "high"
      );

      const targetImgs = criticalImgs.length > 0 ? criticalImgs : allImgs.slice(0, 1);

      if (targetImgs.length === 0) {
        imagesPromiseResolved = true;
        requestAnimationFrame(() => {
          if (!isCancelled) {
            setImagesLoaded(true);
          }
        });
        return;
      }

      let loadedCount = 0;
      const onImageResolved = () => {
        loadedCount += 1;
        if (loadedCount >= targetImgs.length) {
          imagesPromiseResolved = true;
          setImagesLoaded(true);
        }
      };

      targetImgs.forEach((img) => {
        if (img.complete) {
          onImageResolved();
        } else {
          img.addEventListener("load", onImageResolved, { once: true });
          img.addEventListener("error", onImageResolved, { once: true });
        }
      });
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      checkImages();
    } else {
      window.addEventListener("DOMContentLoaded", checkImages, { once: true });
    }

    // Safety fallback: if images or fonts don't report within 1400ms, force resolution
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        if (!fontPromiseResolved) {
          fontPromiseResolved = true;
          setFontsLoaded(true);
        }
        if (!imagesPromiseResolved) {
          imagesPromiseResolved = true;
          setImagesLoaded(true);
        }
      }
    }, 1400);

    // Smooth ticker tracking real progress toward 100%
    let currentVal = 0;

    const tick = (now: number) => {
      if (isCancelled) return;

      const elapsed = now - startTime;
      const timeRatio = Math.min(1, elapsed / MIN_DURATION);

      // Calculate real weight of assets:
      // Fonts: 40% weight, Images: 40% weight, Base runtime: 20% weight
      let assetProgress = 0.2;
      if (fontPromiseResolved) assetProgress += 0.4;
      if (imagesPromiseResolved) assetProgress += 0.4;

      // Effective target can only reach 100% once BOTH assets are ready AND min 1.2s has elapsed
      let targetProgress = Math.min(assetProgress, timeRatio);
      if (
        (fontPromiseResolved && imagesPromiseResolved && elapsed >= MIN_DURATION) ||
        elapsed >= 1800
      ) {
        targetProgress = 1.0;
        fontPromiseResolved = true;
        imagesPromiseResolved = true;
      } else {
        // Cap below 99% while assets or min duration are not complete
        targetProgress = Math.min(targetProgress, 0.98);
      }

      // Smooth interpolation for fluid HUD ticker
      const targetInt = Math.floor(targetProgress * 100);
      if (currentVal < targetInt) {
        // Increment smoothly
        const step = Math.max(1, Math.ceil((targetInt - currentVal) * 0.15));
        currentVal = Math.min(targetInt, currentVal + step);
      }

      setPercentage(currentVal);

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${currentVal}%`;
      }

      // Check for completion
      if (
        currentVal >= 100 &&
        fontPromiseResolved &&
        imagesPromiseResolved &&
        elapsed >= MIN_DURATION
      ) {
        completePreloader();
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    const completePreloader = () => {
      if (!overlayRef.current) return;

      const onTransitionEnd = () => {
        setIsFinished(true);

        // Unlock scroll
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        if (lenis) {
          lenis.start();
        }

        // Fire ready event for Hero and other listeners
        if (typeof window !== "undefined") {
          (window as unknown as { __PORTFOLIO_READY__?: boolean }).__PORTFOLIO_READY__ = true;
          window.dispatchEvent(new CustomEvent("ready"));
        }
      };

      if (prefersReducedMotion) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: onTransitionEnd,
        });
      } else {
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
          onComplete: onTransitionEnd,
        });
      }
    };

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [lenis, prefersReducedMotion]);

  if (isFinished) {
    return null;
  }

  return (
    <aside
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-label="Application loading progress"
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#080808] p-6 sm:p-12 lg:p-16 text-white select-none pointer-events-auto"
    >
      {/* Top HUD Telemetry */}
      <div className="flex items-center justify-between font-hud text-[11px] uppercase tracking-[0.2em] text-[var(--text-dim)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--lime)] animate-ping" />
          <span>RIP // INITIALIZING SYSTEM</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>FONTS: {fontsLoaded ? "[ READY ]" : "[ SYNCING ]"}</span>
          <span>ASSETS: {imagesLoaded ? "[ READY ]" : "[ QUEUED ]"}</span>
        </div>
      </div>

      {/* Main Counter Display */}
      <div className="my-auto w-full max-w-5xl">
        <div className="font-hud text-xs sm:text-sm uppercase tracking-widest text-[var(--lime)] mb-3">
          [ 00 // BUFFERING RUNTIME ARTIFACTS ]
        </div>

        <div className="flex items-baseline gap-2 sm:gap-4">
          <span className="font-display text-8xl sm:text-9xl md:text-[13rem] font-bold leading-none tracking-tighter tabular-nums text-white">
            {percentage.toString().padStart(2, "0")}
          </span>
          <span className="font-hud text-2xl sm:text-4xl md:text-5xl font-bold text-[var(--lime)]">
            %
          </span>
        </div>

        {/* Tactical 1px progress track */}
        <div className="relative mt-6 sm:mt-8 h-[2px] w-full bg-white/10 overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-[var(--lime)] transition-all duration-75 ease-out shadow-[0_0_12px_var(--lime)]"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Bottom HUD Diagnostics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-hud text-[11px] uppercase tracking-[0.2em] text-[var(--text-dim)] border-t border-white/10 pt-6">
        <div>LOCATION: SUMEDANG, WEST JAVA, INDONESIA</div>
        <div className="flex items-center gap-3">
          <span>120FPS GPU COMPOSITOR</span>
          <span className="text-white/20">|</span>
          <span className="text-[var(--lime)]">OPTIMIZED // 0MS JANK</span>
        </div>
      </div>
    </aside>
  );
}

export default Preloader;
