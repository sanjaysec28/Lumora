import React from 'react';
import { Route } from '../types';
import { Navigation } from '../components/Navigation';
import { HeroSection } from '../components/HeroSection';
import { ProblemSection } from '../components/ProblemSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { MemoryExperiencePreview } from '../components/MemoryExperiencePreview';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { Footer } from '../components/Footer';

interface LandingPageProps {
  onNavigate: (route: Route) => void;
  onOpenLogin: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenLogin,
  onOpenSearch,
  onOpenProfile,
  isDemoMode = false,
  onToggleDemoMode,
}) => {
  return (
    <div className="relative min-h-screen bg-[#FFF9FC] overflow-x-hidden py-3 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8 selection:bg-[#6D5DFB]/15 selection:text-[#3B267E]">
      {/* 
        PREMIUM GLOSSY AMBIENT BACKGROUND
        Base: Warm White #FFF9FC with large soft-focus liquid light reflections:
        Lavender #B8A7FF, Purple #6D5DFB, Soft Pink #F4A7D8, Sky Blue #8DDCFF, Cyan #69E1D4
        Behaves like large soft-focus light reflections on liquid glass with slow (8-22s) calm motion.
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft Lavender / Purple Upper Light Field */}
        <div className="absolute -top-[12%] right-[4%] w-[720px] h-[720px] rounded-full bg-gradient-to-br from-[#B8A7FF]/22 via-[#6D5DFB]/12 to-transparent blur-[140px] animate-ambient-1" />

        {/* Soft Pink Ambient Glow (Center-Right) */}
        <div className="absolute top-[28%] -right-[8%] w-[640px] h-[640px] rounded-full bg-gradient-to-bl from-[#F4A7D8]/20 via-[#B8A7FF]/12 to-transparent blur-[130px] animate-ambient-2" />

        {/* Sky Blue & Cyan Soft Liquid Reflection (Left / Mid) */}
        <div className="absolute top-[38%] -left-[10%] w-[740px] h-[740px] rounded-full bg-gradient-to-tr from-[#8DDCFF]/18 via-[#69E1D4]/14 to-transparent blur-[150px] animate-ambient-3" />

        {/* Deep Warm Lavender Field (Bottom-Left) */}
        <div className="absolute -bottom-[10%] left-[8%] w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-[#B8A7FF]/20 via-[#6D5DFB]/10 to-transparent blur-[140px] animate-ambient-1" />

        {/* Subtle Rosy Glow (Bottom-Right) */}
        <div className="absolute bottom-[6%] right-[14%] w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-[#F4A7D8]/16 via-[#8DDCFF]/10 to-transparent blur-[130px] animate-ambient-2" />
      </div>

      {/* 
        MAIN HERO PRESENTATION SURFACE
        Floating rounded luxury canvas floating above the ambient lighting:
        - Warm translucent white
        - Subtle backdrop blur
        - Extremely soft border with delicate inner specular highlight
        - Soft ambient shadow
      */}
      <main className="relative z-10 max-w-[1480px] mx-auto bg-white/70 sm:bg-[#FFF9FC]/75 backdrop-blur-3xl rounded-[28px] sm:rounded-[40px] md:rounded-[48px] shadow-[0_32px_100px_rgba(59,38,126,0.08),0_12px_36px_rgba(109,93,251,0.04),inset_0_1px_2px_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.4)] border border-white/80 overflow-hidden">
        {/* Subtle Inner Highlight Border for Main Floating Surface */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-white/50 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)] z-30" />

        {/* Glossy Ambient Light Background across Hero Surface */}
        <div
          className="absolute -top-[10%] right-[5%] w-[620px] h-[620px] rounded-full blur-[120px] opacity-40 pointer-events-none animate-ambient-1"
          style={{
            background: 'radial-gradient(circle, #6D5DFB 0%, rgba(184, 167, 255, 0.4) 45%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[10%] -left-[8%] w-[560px] h-[560px] rounded-full blur-[110px] opacity-35 pointer-events-none animate-ambient-2"
          style={{
            background: 'radial-gradient(circle, #F4A7D8 0%, rgba(184, 167, 255, 0.3) 45%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-0 left-[25%] w-[480px] h-[480px] rounded-full blur-[100px] opacity-30 pointer-events-none animate-ambient-3"
          style={{
            background: 'radial-gradient(circle, #B8A7FF 0%, rgba(244, 167, 216, 0.25) 50%, transparent 70%)',
          }}
        />
        <div className="absolute top-[48%] -left-[80px] w-[460px] h-[460px] bg-gradient-to-tr from-[#69E1D4]/10 via-[#8DDCFF]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Navigation */}
        <Navigation
          currentRoute="/"
          onNavigate={onNavigate}
          onOpenLogin={onOpenLogin}
          onOpenSearch={onOpenSearch}
          onOpenProfile={onOpenProfile}
          isDemoMode={isDemoMode}
          onToggleDemoMode={onToggleDemoMode}
        />

        {/* 2. Hero Section with 3D Abstract Artwork */}
        <HeroSection onNavigate={onNavigate} />

        {/* 3. The Problem Section */}
        <ProblemSection />

        {/* 4. How Lumora Works */}
        <HowItWorksSection />

        {/* 5. Memory Experience Interactive Preview */}
        <MemoryExperiencePreview onNavigate={onNavigate} />

        {/* 6. Final CTA */}
        <FinalCtaSection onNavigate={onNavigate} />

        {/* 7. Footer */}
        <Footer onNavigate={onNavigate} />
      </main>
    </div>
  );
};
