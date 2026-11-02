"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
export const SCRAMBLE_GLYPHS = "!<>-_\\/[]{}=+*^?#$%&";
export interface UseScrambleOptions {
    text: string;
    mode?: "scroll" | "playOnEnter";
    scrub?: number | boolean;
    start?: string;
    end?: string;
    duration?: number;
    triggerRef?: React.RefObject<HTMLElement | null>;
}
interface CharData {
    el: HTMLSpanElement;
    realChar: string;
    lineIndex: number;
    charIndexInLine: number;
    totalCharsInLine: number;
    threshold: number;
    isResolved: boolean;
    lastGlyph: string;
}
export function useScramble(
    containerRef: React.RefObject<HTMLElement | null>,
    options: UseScrambleOptions
) {
    const prefersReducedMotion = useReducedMotion();
    const optionsRef = useRef(options);
    optionsRef.current = options;
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Accessibility check: immediately render clean text on reduced motion
        if (prefersReducedMotion) {
            const charElements = container.querySelectorAll<HTMLSpanElement>(".scramble-char");
            charElements.forEach((el) => {
                const real = el.getAttribute("data-char") || el.textContent || "";
                el.textContent = real;
                el.className = "scramble-char inline-block text-white";
            });
            return;
        }

        let charItems: CharData[] = [];
        let rafId: number | null = null;
        let stInstance: ScrollTrigger | null = null;
        let tweenInstance: gsap.core.Tween | null = null;
        // Function to measure layout, group by offsetTop, and lock span widths
        const setupLayout = () => {
            const wordElements = Array.from(
                container.querySelectorAll<HTMLSpanElement>(".scramble-word")
            );
            if (wordElements.length === 0) return;
            // 1. Group words into visual lines based on their offsetTop
            const lines: HTMLSpanElement[][] = [];
            let currentLine: HTMLSpanElement[] = [];
            let currentTop = -1;
            wordElements.forEach((wordEl) => {
                const top = wordEl.offsetTop;
                if (currentTop === -1 || Math.abs(top - currentTop) < 6) {
                    currentLine.push(wordEl);
                    currentTop = top;
                } else {
                    lines.push(currentLine);
                    currentLine = [wordEl];
                    currentTop = top;
                }
            });
            if (currentLine.length > 0) {
                lines.push(currentLine);
            }

            const totalLines = lines.length;
            // 2. Measure every character width and lock it via inline style
            charItems = [];
            lines.forEach((lineWords, lineIdx) => {
                // Collect all character spans in this line
                const lineChars: HTMLSpanElement[] = [];
                lineWords.forEach((w) => {
                    const chars = Array.from(w.querySelectorAll<HTMLSpanElement>(".scramble-char"));
                    lineChars.push(...chars);
                });
                const totalCharsInLine = lineChars.length;
                lineChars.forEach((charEl, cIdx) => {
                    const realChar = charEl.getAttribute("data-char") || charEl.textContent || "";

                    // Measure exact width
                    const rect = charEl.getBoundingClientRect();
                    const measuredWidth = Math.ceil(rect.width * 100) / 100;
                    if (measuredWidth > 0) {
                        charEl.style.width = `${measuredWidth}px`;
                        charEl.style.textAlign = "center";
                    }
                    // Random jitter between -0.05 and +0.05
                    const jitter = (Math.random() - 0.5) * 0.08;
                    const rawThreshold = totalCharsInLine > 1 ? cIdx / totalCharsInLine : 0;
                    const threshold = Math.max(0, Math.min(0.98, rawThreshold + jitter));
                    charItems.push({
                        el: charEl,
                        realChar,
                        lineIndex: lineIdx,
                        charIndexInLine: cIdx,
                        totalCharsInLine,
                        threshold,
                        isResolved: false,
                        lastGlyph: "",
                    });
                });
            });
        };

        setupLayout();

        // Batch update state for performance
        let pendingProgress = 0;
        const applyScramble = () => {
            rafId = null;
            const progress = pendingProgress;
            const totalLines = Math.max(
                1,
                ...charItems.map((c) => c.lineIndex + 1)
            );
            charItems.forEach((item) => {
                // Calculate progress for this character's specific line [lineIndex / totalLines, (lineIndex + 1) / totalLines]
                const lineStart = item.lineIndex / totalLines;
                const lineEnd = (item.lineIndex + 1) / totalLines;
                let lineProgress = 0;
                if (progress >= lineEnd) {
                    lineProgress = 1;
                } else if (progress <= lineStart) {
                    lineProgress = 0;
                } else {
                    lineProgress = (progress - lineStart) / (lineEnd - lineStart);
                }
                const shouldResolve = lineProgress > item.threshold || progress >= 0.99;
                if (shouldResolve) {
                    if (!item.isResolved) {
                        item.el.textContent = item.realChar;
                        item.el.className = "scramble-char inline-block text-white";
                        item.isResolved = true;
                        item.lastGlyph = item.realChar;
                    }
                } else {
                    // If was previously resolved (user scrolled back up), mark unresolved
                    if (item.isResolved) {
                        item.isResolved = false;
                    }
                    // Active scramble before resolving: pick random glyph in lime
                    const randomGlyph =
                        SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
                    if (item.lastGlyph !== randomGlyph) {
                        item.el.textContent = randomGlyph;
                        item.el.className = "scramble-char inline-block text-[var(--lime)] font-mono";
                        item.lastGlyph = randomGlyph;
                    }
                }
            });
        };

        const updateProgress = (p: number) => {
            pendingProgress = Math.max(0, Math.min(1, p));
            if (rafId === null) {
                rafId = requestAnimationFrame(applyScramble);
            }
        };
        // ------------------------------------------------------------------
        // ScrollTrigger Binding
        // ------------------------------------------------------------------
        const {
            mode = "scroll",
            scrub = 0.6,
            start = "top 80%",
            end = "bottom 40%",
            duration = 1.4,
            triggerRef,
        } = optionsRef.current;

        const triggerElement = triggerRef?.current || container;
        if (mode === "playOnEnter") {
            const proxy = { p: 0 };
            stInstance = ScrollTrigger.create({
                trigger: triggerElement,
                start,
                once: true,
                onEnter: () => {
                    tweenInstance = gsap.to(proxy, {
                        p: 1,
                        duration,
                        ease: "power2.out",
                        onUpdate: () => updateProgress(proxy.p),
                    });
                },
            });
        } else {
            // Default: scrub mode
            stInstance = ScrollTrigger.create({
                trigger: triggerElement,
                start,
                end,
                scrub,
                onUpdate: (self) => {
                    updateProgress(self.progress);
                },
            });
        }

        // Handle viewport resize: re-measure word lines without full rerender
        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupLayout();
                applyScramble();
            }, 150);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimer);
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (stInstance) stInstance.kill();
            if (tweenInstance) tweenInstance.kill();
        };
    }, [prefersReducedMotion, containerRef]);
}
export default useScramble;
