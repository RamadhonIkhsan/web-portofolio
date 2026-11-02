"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { CursorState, useCursor } from "@/hooks/useCursor";

export { useCursor };
export type { CursorState };

export function CustomCursor() {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isOnInput, setIsOnInput] = useState<boolean>(false);
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [cursorText, setCursorText] = useState<string>("");
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const outerRef = useRef<HTMLDivElement>(null);
  const hasMovedRef = useRef<boolean>(false);
  const stateRef = useRef<{
    cursorState: CursorState;
    cursorText: string;
    isOnInput: boolean;
  }>({
    cursorState: "default",
    cursorText: "",
    isOnInput: false,
  });

  // Check hardware and preference: desktop with hover & fine pointer, no reduced motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const hoverQuery = window.matchMedia("(hover: hover)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkSupport = () => {
      const isDesktopPointer = hoverQuery.matches && pointerQuery.matches;
      const prefersReducedMotion = motionQuery.matches;
      const active = isDesktopPointer && !prefersReducedMotion;
      setIsEnabled(active);
    };

    checkSupport();

    hoverQuery.addEventListener("change", checkSupport);
    pointerQuery.addEventListener("change", checkSupport);
    motionQuery.addEventListener("change", checkSupport);

    return () => {
      hoverQuery.removeEventListener("change", checkSupport);
      pointerQuery.removeEventListener("change", checkSupport);
      motionQuery.removeEventListener("change", checkSupport);
    };
  }, []);

  // Manage body class for native cursor hiding
  useEffect(() => {
    if (!isEnabled) {
      document.body.classList.remove("has-custom-cursor");
      return;
    }

    document.body.classList.add("has-custom-cursor");

    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isEnabled]);

  // GSAP quickTo mouse follower & event listeners
  useEffect(() => {
    if (!isEnabled || !outerRef.current) return;

    // Smooth lag mouse follower using gsap.quickTo (duration: 0.35, ease: "power3")
    const xTo = gsap.quickTo(outerRef.current, "x", {
      duration: 0.35,
      ease: "power3",
    });
    const yTo = gsap.quickTo(outerRef.current, "y", {
      duration: 0.35,
      ease: "power3",
    });

    const updateTargetState = (target: Element | null) => {
      if (!target) return;

      // 1. Keep native cursor on form inputs
      const isInput = Boolean(
        target.closest(
          'input, textarea, select, option, [contenteditable="true"], [data-cursor="native"]'
        )
      );

      // 2. Check for data-cursor states
      const cursorTarget = target.closest<HTMLElement>("[data-cursor]");
      let nextState: CursorState = "default";
      let nextText = "";

      if (cursorTarget) {
        const type = cursorTarget.getAttribute("data-cursor") as CursorState;
        const text = cursorTarget.getAttribute("data-cursor-text");

        if (type === "link") {
          nextState = "link";
        } else if (type === "view") {
          nextState = "view";
          nextText = text || "VIEW";
        } else if (type === "hidden") {
          nextState = "hidden";
        }
      }

      // Avoid unnecessary state updates
      const current = stateRef.current;
      if (
        current.cursorState !== nextState ||
        current.cursorText !== nextText ||
        current.isOnInput !== isInput
      ) {
        stateRef.current = {
          cursorState: nextState,
          cursorText: nextText,
          isOnInput: isInput,
        };
        setIsOnInput(isInput);
        setCursorState(nextState);
        setCursorText(nextText);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch pointers if device supports both
      if (e.pointerType === "touch") return;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        gsap.set(outerRef.current, { x: e.clientX, y: e.clientY });
        setIsVisible(true);
      } else {
        xTo(e.clientX);
        yTo(e.clientY);
      }

      updateTargetState(e.target as Element | null);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsMouseDown(true);
      }
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsMouseDown(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
      setIsMouseDown(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isEnabled]);

  // Render nothing on touch devices or when prefers-reduced-motion is active
  if (!isEnabled) {
    return null;
  }

  // Calculate dynamic transform and dimensions based on state
  const isView = cursorState === "view";
  const isLink = cursorState === "link";

  // Scale: 1.8x on link, shrinks slightly on mousedown
  let scale = 1;
  if (isLink) {
    scale = isMouseDown ? 1.55 : 1.8;
  } else if (isView) {
    scale = isMouseDown ? 0.9 : 1;
  } else {
    scale = isMouseDown ? 0.85 : 1;
  }

  const diameter = isView ? 68 : 28;

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[99999] will-change-transform"
      style={{
        mixBlendMode: "difference",
        opacity: isVisible && !isOnInput && cursorState !== "hidden" ? 1 : 0,
        transition: "opacity 0.2s ease-out",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${diameter}px`,
          height: `${diameter}px`,
          border: "1px solid rgba(255, 255, 255, 0.95)",
          backgroundColor: isLink
            ? "rgba(166, 255, 46, 0.2)"
            : isView
            ? "rgba(166, 255, 46, 0.15)"
            : "transparent",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transition:
            "width 0.22s cubic-bezier(0.16, 1, 0.3, 1), height 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        <span
          className="select-none pointer-events-none font-hud text-[9px] font-bold tracking-[0.14em] text-white uppercase text-center leading-none"
          style={{
            opacity: isView ? 1 : 0,
            transform: isView ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          {cursorText || "VIEW"}
        </span>
      </div>
    </div>
  );
}

export default CustomCursor;
