"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PixelRevealProps {
  src: string;
  alt: string;
  cols?: number;
  rows?: number;
  color?: string;
  duration?: number;
  trigger?: "enter" | "hover" | "manual";
  hover?: boolean;
  direction?: "in" | "out";
  variant?: "canvas" | "dom";
  containerAnimation?: gsap.core.Animation;
  className?: string;
  progress?: number; // For manual trigger
}

export const PixelReveal: React.FC<PixelRevealProps> = ({
  src,
  alt,
  cols = 16,
  rows = 10,
  color = "var(--purple)",
  duration = 0.9,
  trigger = "enter",
  hover = false,
  direction = "in",
  variant = "canvas",
  containerAnimation,
  className = "",
  progress: manualProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Grid cell delays
  const gridDelays = useRef<number[]>([]);

  // Initialize grid delays with a slight left-to-right weighting
  useEffect(() => {
    const total = cols * rows;
    const delays = new Array(total);
    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Random base [0, 0.7] + horizontal weight [0, 0.3]
      delays[i] = Math.random() * 0.7 + (col / cols) * 0.3;
    }
    gridDelays.current = delays;
  }, [cols, rows]);

  const drawFrame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !isLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    
    ctx.clearRect(0, 0, width, height);

    // Calculate object-fit: cover metrics
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    const cellW = width / cols;
    const cellH = height / rows;

    for (let i = 0; i < gridDelays.current.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const delay = gridDelays.current[i];
      const x = col * cellW;
      const y = row * cellH;

      // Adjust progress based on direction
      const effectiveProgress = direction === "in" ? progress : 1 - progress;

      if (effectiveProgress < delay) {
        // Step 1: Solid block
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5); // +0.5 to avoid subpixel gaps
      } else if (effectiveProgress < delay + 0.15) {
        // Step 2: Pixelated/Low-res block
        ctx.imageSmoothingEnabled = false;
        
        // Sample a small portion of the image
        const sX = (x - offsetX) * (img.naturalWidth / drawWidth);
        const sY = (y - offsetY) * (img.naturalHeight / drawHeight);
        const sW = cellW * (img.naturalWidth / drawWidth);
        const sH = cellH * (img.naturalHeight / drawHeight);

        // Draw low-res by sampling very few pixels
        const pixelSize = 4;
        ctx.drawImage(img, sX, sY, sW, sH, x, y, cellW, cellH);
        
        // Add a tint or overlay to make it feel more "digital"
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.globalAlpha = 1.0;
      } else {
        // Step 3: Full resolution
        ctx.imageSmoothingEnabled = true;
        const sX = (x - offsetX) * (img.naturalWidth / drawWidth);
        const sY = (y - offsetY) * (img.naturalHeight / drawHeight);
        const sW = cellW * (img.naturalWidth / drawWidth);
        const sH = cellH * (img.naturalHeight / drawHeight);
        
        ctx.drawImage(img, sX, sY, sW, sH, x, y, cellW, cellH);
      }
    }
  }, [cols, rows, color, isLoaded, direction]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    if (tweenRef.current) {
      drawFrame(tweenRef.current.progress());
    } else {
      drawFrame(direction === "in" ? 0 : 1);
    }
  }, [drawFrame, direction]);

  useEffect(() => {
    const container = containerRef.current;
    let observer: IntersectionObserver | null = null;
    let isCancelled = false;

    const loadImage = () => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (!isCancelled) {
          imgRef.current = img;
          setIsLoaded(true);
        }
      };
    };

    if (typeof window !== "undefined" && "IntersectionObserver" in window && container) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadImage();
            if (observer && container) observer.unobserve(container);
          }
        },
        { rootMargin: "400px" }
      );
      observer.observe(container);
    } else {
      loadImage();
    }

    return () => {
      isCancelled = true;
      if (observer && container) {
        observer.unobserve(container);
      }
    };
  }, [src]);

  useEffect(() => {
    if (isLoaded) {
      handleResize();
      window.addEventListener("resize", handleResize);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoaded, handleResize]);

  useEffect(() => {
    if (!isLoaded || variant !== "canvas" || prefersReducedMotion) return;

    const proxy = { p: direction === "in" ? 0 : 1 };
    
    if (trigger === "enter") {
      tweenRef.current = gsap.to(proxy, {
        p: direction === "in" ? 1 : 0,
        duration,
        ease: "power2.inOut", // Stepped feel is handled by the discrete drawing logic or we can use steps(12)
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          containerAnimation,
          toggleActions: "play none none none",
          once: true,
        },
        onUpdate: () => drawFrame(proxy.p),
      });
    }

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [isLoaded, variant, trigger, duration, direction, drawFrame, containerAnimation, prefersReducedMotion]);

  // Handle manual progress
  useEffect(() => {
    if (trigger === "manual" && manualProgress !== undefined) {
      drawFrame(manualProgress);
    }
  }, [trigger, manualProgress, drawFrame]);

  // Hover effect
  const handleMouseEnter = () => {
    if ((trigger === "hover" || hover) && isLoaded && !prefersReducedMotion) {
      const proxy = { p: 0.8 };
      gsap.to(proxy, { 
        p: 1, 
        duration: 0.4, 
        ease: "steps(4)",
        onUpdate: () => drawFrame(proxy.p)
      });
    }
  };

  if (prefersReducedMotion) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (variant === "dom") {
    return (
      <div 
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
      >
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        <div 
          className="absolute inset-0 grid" 
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)` 
          }}
        >
          {Array.from({ length: cols * rows }).map((_, i) => (
            <div 
              key={i}
              className="w-full h-full bg-[var(--purple)] transition-opacity duration-300"
              style={{ 
                opacity: 0,
                transitionDelay: `${gridDelays.current[i] * 500}ms`
              }}
            />
          ))}
        </div>
        <noscript>
          <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </noscript>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      role="img"
      aria-label={alt}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <noscript>
        <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      </noscript>
    </div>
  );
};
