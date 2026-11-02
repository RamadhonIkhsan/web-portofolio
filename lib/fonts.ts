import { Rajdhani, JetBrains_Mono } from "next/font/google";

export const fontDisplay = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

export const fontHud = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hud",
  display: "swap",
  preload: true,
});
