import React from "react";

const EXPERIENCE = [
  {
    period: "MAY 2023 — PRESENT",
    company: "PT BAYU SINERGI SOLUSI",
    location: "Bandung, West Java, Indonesia",
    role: "Frontend & Full-stack Developer",
    description:
      "Build banking administration systems, CMS platforms, system activity monitoring, BSMR accounting systems, auto-reconciliation, regional bank landing pages, online assessments, and other applications. Develop responsive interfaces from UI/UX designs, integrate APIs with backend teams, and manage deployments across development, staging, and production. Maintain and extend applications serving thousands of users while supporting stability and performance.",
  },
  {
    period: "OCTOBER 2021 — MAY 2023",
    company: "PT GISTEX GARMEN INDONESIA",
    location: "Cileunyi, West Java, Indonesia",
    role: "Staff IT & DT",
    description:
      "Built internal applications for HR, PPIC, Production, QC, Sewing, and other departments to help managers monitor work progress. Developed frontend, backend, and database structures from workflows analyzed by the analytics team, and optimized frontend performance with API integrations for dynamic data.",
  },
  {
    period: "JUNE 2018 — AUGUST 2021",
    company: "STMIK JABAR",
    location: "Bandung, West Java, Indonesia",
    role: "Bachelor of Informatics Engineering · GPA 3.52 / 4.00",
    description:
      "Served on the Faculty Student Executive Board in the Talent and Interests Division, helping organize seminars, workshops, and community activities. Represented the faculty in futsal and soccer competitions, including a second-place finish in the 2019 Al-Ghifari University Inter-Faculty Futsal Tournament.",
  },
];

export function WorkAt() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="relative w-full bg-[#0a0a0a] text-white border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-6 py-24 sm:px-12 lg:px-16 lg:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-12 md:mb-16">
          <h2 id="experience-title" className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight">
            Experience
            <span className="block text-[var(--lime)]">& Education</span>
          </h2>
          <p className="font-hud text-xs sm:text-sm uppercase tracking-widest text-white/60 max-w-xs">
            Professional experience and education from my CV.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {EXPERIENCE.map((item, index) => (
            <article key={item.company} className="border border-white/15 bg-white/[0.03] p-6 sm:p-8 flex flex-col min-h-[360px]">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <span className="font-hud text-xs tracking-widest text-[var(--lime)]">[{String(index + 1).padStart(2, "0")}]</span>
                <span className="font-hud text-[10px] sm:text-xs text-white/60 text-right">{item.period}</span>
              </div>
              <div className="pt-6">
                <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight">{item.company}</h3>
                <p className="font-hud text-[10px] sm:text-xs text-white/55 mt-2">{item.location}</p>
                <p className="font-hud text-sm text-[var(--lime)] mt-5">{item.role}</p>
              </div>
              <p className="font-hud text-xs sm:text-sm text-white/70 leading-relaxed mt-6">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkAt;
