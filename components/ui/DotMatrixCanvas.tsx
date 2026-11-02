"use client";

import React, { useEffect, useRef } from "react";

interface DotMatrixCanvasProps {
  text: string;
  className?: string;
}

export const DotMatrixCanvas: React.FC<DotMatrixCanvasProps> = ({ text, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const pulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Pulse animation when it enters view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const pulseObj = { val: 0 };
        import("gsap").then(({ gsap }) => {
          gsap.to(pulseObj, {
            val: 1,
            duration: 0.8,
            ease: "sine.inOut",
            repeat: 1,
            yoyo: true,
            onUpdate: () => {
              pulseRef.current = pulseObj.val;
            }
          });
        });
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(container);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let dots: { x: number; y: number; baseRadius: number }[] = [];

    const init = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      dots = [];
      const spacing = 6;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          dots.push({ x, y, baseRadius: 1.2 });
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0a0a0a";

      // We need to mask the dots with the text.
      // Easiest way: Draw text on a temporary canvas and check pixel alpha.
      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext("2d");
      if (offCtx) {
        const dpr = window.devicePixelRatio || 1;
        offCtx.scale(dpr, dpr);
        offCtx.font = `black 35vw "Inter", sans-serif`; // Match display font
        offCtx.textAlign = "center";
        offCtx.textBaseline = "bottom";
        offCtx.fillStyle = "black";
        
        // Match the position in Footer.tsx (translateY 25%)
        const { width, height } = container.getBoundingClientRect();
        offCtx.fillText(text, width / 2, height * 1.25);
        
        const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);

        dots.forEach((dot) => {
          const pixelX = Math.round(dot.x * dpr);
          const pixelY = Math.round(dot.y * dpr);
          const index = (pixelY * offscreen.width + pixelX) * 4 + 3; // Alpha channel

          if (imageData.data[index] > 128) {
            const dx = dot.x - mouseRef.current.x;
            const dy = dot.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 80;
            let radius = dot.baseRadius + (pulseRef.current * 1.5);

            if (dist < maxDist) {
              const grow = (1 - dist / maxDist) * 2.5;
              radius += grow;
            }

            ctx.beginPath();
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", init);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    init();
    render();

    return () => {
      window.removeEventListener("resize", init);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <div ref={containerRef} className={`relative w-full h-full pointer-events-auto ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
