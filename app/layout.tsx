import type { Metadata } from "next";
import { fontDisplay, fontHud } from "@/lib/fonts";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { Preloader } from "@/components/ui/Preloader";
import { Header } from "@/components/ui/Header";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ramadhon Ikhsan Prasetya | Frontend & Full-stack Developer",
  description:
    "Ramadhon Ikhsan Prasetya is a frontend and full-stack developer with over five years of experience building web applications with React.js, Next.js, and Laravel.",
  keywords: [
    "Ramadhon Ikhsan",
    "Frontend Developer",
    "Full-stack Developer",
    "Laravel",
    "Next.js",
    "Docker",
    "CI/CD",
  ],
  authors: [{ name: "Ramadhon Ikhsan Prasetya" }],
  creator: "Ramadhon Ikhsan Prasetya",
  openGraph: {
    title: "Ramadhon Ikhsan Prasetya | Frontend & Full-stack Developer",
    description: "Frontend and full-stack developer with over five years of experience.",
    siteName: "Ramadhon Ikhsan Prasetya",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ramadhon Ikhsan Prasetya — Frontend & Full-stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramadhon Ikhsan Prasetya | Frontend & Full-stack Developer",
    description: "Frontend and full-stack developer with over five years of experience.",
    images: ["/og-image.jpg"],
    creator: "@ramadhonikhsan",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ramadhon Ikhsan Prasetya",
  alternateName: "RIP",
  jobTitle: "Frontend & Full-stack Developer",
  image: "/profile.png",
  description:
    "Frontend and full-stack developer with over five years of experience building interactive web applications using React.js, Next.js, and Laravel.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sumedang",
    addressRegion: "West Java",
    addressCountry: "ID",
  },
  knowsAbout: [
    "Next.js",
    "React",
    "Laravel",
    "Tailwind CSS",
    "SCSS",
    "Ant Design",
    "Framer Motion",
    "Docker",
    "CI/CD",
  ],
  sameAs: [
    "https://github.com/RamadhonIkhsan",
    "https://www.linkedin.com/in/ramadhon-ikhsan-prasetya-1b585921b",
    "https://git.basys.co.id/RamadhonIkhsan",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontHud.variable} antialiased selection:bg-[var(--lime)] selection:text-black`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <noscript>
          <style>{`
            aside[role="status"] { display: none !important; }
            html, body { overflow: auto !important; }
            .hero-name-line { transform: none !important; }
          `}</style>
        </noscript>
      </head>
      <body className="min-h-screen bg-[var(--bg-dark)] text-white font-hud">
        <CustomCursor />
        <AudioProvider>
          <SmoothScroll>
            <Preloader />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2.5 focus:bg-[var(--lime)] focus:text-black focus:font-bold focus:border focus:border-black shadow-2xl tracking-widest text-xs uppercase"
            >
              SKIP TO CONTENT
            </a>
            <Header />
            <main id="main-content" tabIndex={-1} className="outline-none focus:outline-none">
              {children}
            </main>
          </SmoothScroll>
        </AudioProvider>
      </body>
    </html>
  );
}
