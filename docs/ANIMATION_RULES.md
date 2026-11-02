# Animation Architectural Rules

All scroll-driven and interactive animations in this codebase must strictly abide by these rules:

---

## 1. Allowed Properties for GSAP Animations
- **ONLY animate `transform` (`x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation`, `skewX`, `skewY`) and `opacity`.**
- **NEVER** animate layout triggers like `top`, `left`, `bottom`, `right`, `width`, `height`, `margin`, or `padding`.
- This ensures animations run on GPU compositor threads with 0ms layout thrashing.

---

## 2. GSAP Context & Lifecycle Management
- **Always scope animations inside `gsap.context()`**:
  ```ts
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create timelines and ScrollTriggers here
    }, containerRef);

    return () => {
      ctx.revert(); // Essential: Kills ScrollTriggers & restores DOM styles cleanly
    };
  }, []);
  ```
- Alternatively, use our custom hook `@/hooks/useScrollAnimation`.

---

## 3. Responsive Variants via MatchMedia
- Always utilize `ScrollTrigger.matchMedia()` or `gsap.matchMedia()` to provide decoupled desktop and mobile variants:
  ```ts
  const mm = gsap.matchMedia();

  // Desktop (>= 768px)
  mm.add("(min-width: 768px)", () => {
    gsap.to(".target", {
      xPercent: 100,
      opacity: 1,
      scrollTrigger: {
        trigger: ".container",
        scrub: true,
      },
    });
  });

  // Mobile (< 768px)
  mm.add("(max-width: 767px)", () => {
    gsap.to(".target", {
      yPercent: 50,
      opacity: 1,
      scrollTrigger: {
        trigger: ".container",
        scrub: true,
      },
    });
  });
  ```

---

## 4. Respect Reduced Motion
- Every animation hook and scroll timeline must check `useReducedMotion()`.
- If reduced motion is preferred by the user, bypass motion effects and present content immediately visible (`opacity: 1`, `transform: none`).
