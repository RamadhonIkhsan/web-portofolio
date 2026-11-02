"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
});

export const useLenis = () => useContext(SmoothScrollContext);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll instance
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    requestAnimationFrame(() => {
      setLenisInstance(lenis);
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger to calculate correct layout
    ScrollTrigger.refresh();

    // Ensure ScrollTrigger refreshes accurately after fonts, window assets, and preloader ready
    const handleRefresh = () => {
      ScrollTrigger.refresh();
    };

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(handleRefresh);
    }

    window.addEventListener("load", handleRefresh);
    window.addEventListener("ready", handleRefresh);
    window.addEventListener("resize", handleRefresh);

    // Destroy Lenis and remove ticker on unmount
    return () => {
      window.removeEventListener("load", handleRefresh);
      window.removeEventListener("ready", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScroll;
