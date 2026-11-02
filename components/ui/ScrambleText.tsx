"use client";
import React, { useRef } from "react";
import { useScramble, UseScrambleOptions } from "@/hooks/useScramble";
export interface ScrambleTextProps extends Omit<UseScrambleOptions, "text"> {
    text: string;
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
    className?: string;
    style?: React.CSSProperties;
    alignJustify?: boolean;
}
export function ScrambleText({
    text,
    as: Component = "div",
    className = "",
    style,
    alignJustify = false,
    mode = "scroll",
    scrub = 0.6,
    start = "top 10%",
    end = "bottom 10%",
    duration = 1.4,
    triggerRef,
}: ScrambleTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Bind scramble hook to the container
    useScramble(containerRef, {
        text,
        mode,
        scrub,
        start,
        end,
        duration,
        triggerRef,
    });
    // Tokenize text into words preserving word boundaries
    const words = text.trim().split(/\s+/);

    return (
        <Component className={`relative w-full ${className}`} style={style}>
            {/* 1. Accessible Screen Reader Text */}
            <span className="sr-only">{text}</span>
            {/* 2. Visual Animated Display with Locked Char Spans */}
            <div
                ref={containerRef}
                aria-hidden="true"
                style={{
                    ...(alignJustify ? { textAlign: "justify", textAlignLast: "justify" } : {}),
                    ...style,
                }}
                className="w-full select-none"
            >
                {words.map((word, wordIdx) => (
                    <React.Fragment key={wordIdx}>
                        <span className="scramble-word inline-block whitespace-nowrap">
                            {Array.from(word).map((char, charIdx) => (
                                <span
                                    key={charIdx}
                                    data-char={char}
                                    className="scramble-char inline-block"
                                >
                                    {char}
                                </span>
                            ))}
                        </span>
                        {wordIdx < words.length - 1 && " "}
                    </React.Fragment>
                ))}
            </div>
        </Component>
    );
}
export default ScrambleText;