import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { StatsTools } from "@/components/sections/StatsTools";
import { WorkAt } from "@/components/sections/WorkAt";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="relative flex flex-col w-full min-h-screen">
      <Hero />
      <Manifesto />
      <StatsTools />
      <WorkAt />
      <Footer />
    </div>
  );
}
