"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SKILL_GROUPS = [
  {
    number: "01",
    title: "Frontend",
    skills: ["React.js", "Next.js", "Tailwind CSS", "SCSS", "Ant Design", "Framer Motion"],
  },
  {
    number: "02",
    title: "Full-stack",
    skills: ["Laravel", "API Integration", "Database Structure"],
  },
  {
    number: "03",
    title: "UI/UX Implementation",
    skills: ["Responsive Design", "Design Systems", "Custom Component Libraries"],
  },
  {
    number: "04",
    title: "DevOps & Tools",
    skills: ["Git", "Docker", "CI/CD", "Debugging"],
  },
];

export function StatsTools() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const context = gsap.context(() => {
      gsap.from(".skill-card", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="stats-tools"
      aria-labelledby="stats-tools-title"
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 border-b border-white/10 bg-[var(--bg-dark)]"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-widest font-hud text-[var(--text-dim)] border-b border-white/10 pb-4">
        <h2 id="stats-tools-title" className="font-semibold text-xs tracking-widest uppercase text-[var(--purple-light)]">
          [ 03 // TECH STACK & SKILLS ]
        </h2>
        <span className="hidden sm:inline text-[var(--lime)]">FRONTEND // FULL-STACK // DEVOPS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-auto py-12 max-w-7xl w-full mx-auto">
        {SKILL_GROUPS.map((group) => (
          <article key={group.number} className="skill-card border border-white/15 bg-white/[0.03] p-6 sm:p-8 min-h-64 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <h3 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">{group.title}</h3>
              <span className="font-hud text-xs text-[var(--lime)]">[{group.number}]</span>
            </div>
            <ul className="flex flex-wrap gap-2 pt-6">
              {group.skills.map((skill) => (
                <li key={skill} className="font-hud text-xs sm:text-sm text-[var(--text-dim)] border border-white/15 px-3 py-2">
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-white/10 font-hud text-xs text-[var(--text-dim)]">
        <span>TECHNOLOGIES & PRACTICES FROM MY CV</span>
        <span className="text-[var(--lime)]">RESPONSIVE DESIGN // API INTEGRATION // PRODUCTION DEPLOYMENT</span>
      </div>
    </section>
  );
}

export default StatsTools;
