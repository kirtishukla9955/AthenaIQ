'use client'

import { LandingHero } from "@/components/landing-hero";
import { GlassBridge } from "@/components/glass-bridge";
import { Header } from "@/components/header";
import { Leva } from "leva";

export default function Home() {
  return (
    <>
      <Header />
      <LandingHero />
      <GlassBridge />
      <Leva hidden />
    </>
  );
}
