import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Hero3DCanvas } from './Hero3DCanvas';
import { Route } from '../types';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Canvas caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface HeroSectionProps {
  onNavigate: (route: Route) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative mx-3 sm:mx-6 lg:mx-8 mt-2 mb-10 sm:mb-16 rounded-[28px] sm:rounded-[36px] md:rounded-[44px] bg-white/45 sm:bg-[#FFF9FC]/55 backdrop-blur-2xl border border-white/80 shadow-[0_24px_65px_rgba(59,38,126,0.06),0_8px_24px_rgba(109,93,251,0.03),inset_0_1px_2px_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(255,255,255,0.4)] px-6 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden">
      {/* Subtle Inner Highlight Border */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-white/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)] z-20" />

      {/* 
        GLOSSY AMBIENT LIGHT BACKGROUND
        Blurred radial light sources (#B8A7FF, #6D5DFB, #F4A7D8)
        Creates a soft liquid glass / cinematic editorial lighting environment
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Primary Blurred Radial Light Source: Deep Purple #6D5DFB (Center-Right behind 3D composition) */}
        <div
          className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[520px] h-[520px] sm:w-[650px] sm:h-[650px] rounded-full blur-[110px] sm:blur-[135px] opacity-45 animate-ambient-1"
          style={{
            background: 'radial-gradient(circle, #6D5DFB 0%, rgba(109, 93, 251, 0.45) 45%, transparent 70%)',
          }}
        />

        {/* Secondary Blurred Radial Light Source: Soft Lavender #B8A7FF (Upper Center & Right) */}
        <div
          className="absolute -top-[12%] right-[4%] w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[125px] opacity-55 animate-ambient-2"
          style={{
            background: 'radial-gradient(circle, #B8A7FF 0%, rgba(184, 167, 255, 0.5) 45%, transparent 70%)',
          }}
        />

        {/* Tertiary Blurred Radial Light Source: Soft Pink #F4A7D8 (Lower Left behind Editorial Headline & CTAs) */}
        <div
          className="absolute -bottom-[16%] left-[3%] w-[460px] h-[460px] sm:w-[580px] sm:h-[580px] rounded-full blur-[100px] sm:blur-[130px] opacity-50 animate-ambient-3"
          style={{
            background: 'radial-gradient(circle, #F4A7D8 0%, rgba(244, 167, 216, 0.45) 45%, transparent 70%)',
          }}
        />

        {/* Soft Lavender & Rose Ambient Light Bridge (Center) */}
        <div
          className="absolute top-[22%] left-[28%] w-[380px] h-[380px] rounded-full blur-[115px] opacity-35 animate-ambient-1"
          style={{
            background: 'radial-gradient(circle, #B8A7FF 0%, rgba(244, 167, 216, 0.35) 45%, transparent 70%)',
          }}
        />

        {/* Soft Liquid Glass Specular Highlight (Gentle diagonal luminous reflection) */}
        <div
          className="absolute -top-[35%] -left-[15%] w-[130%] h-[140px] rotate-[-12deg] bg-gradient-to-r from-transparent via-white/35 to-transparent blur-3xl opacity-35"
        />
      </div>

      {/* Editorial Kicker */}
      <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 mb-6 text-xs sm:text-sm font-medium text-[#665F78]">
        <span className="text-[#6D5DFB] font-semibold tracking-wide">Cloudinary AI Hackathon 2026</span>
        <span aria-hidden="true" className="text-[#B8A7FF]">·</span>
        <span>Track 3: Media-Savvy Startup</span>
        <span aria-hidden="true" className="text-[#B8A7FF]">·</span>
        <span className="text-[#3B267E] font-medium">Team Zyphra</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Oversized Editorial Typography & Intent */}
        <div className="lg:col-span-6 z-20 flex flex-col justify-center">
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#171522] leading-[1.02]"
            style={{ textWrap: 'balance' }}
          >
            Every moment, <br />
            <span className="bg-gradient-to-r from-[#6D5DFB] via-[#6552F7] to-[#3B267E] bg-clip-text text-transparent">
              illuminated.
            </span>
          </h1>

          <p
            className="mt-6 text-base sm:text-lg md:text-xl text-[#665F78] leading-relaxed max-w-xl font-normal"
            style={{ textWrap: 'balance' }}
          >
            Turn scattered photos and videos into intelligent, searchable stories. Lumora understands the moments, places, activities, and stories behind your media.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
            {/* Primary: Create a Memory → */}
            <button
              onClick={() => onNavigate('/create')}
              className="group relative inline-flex items-center justify-center gap-2.5 px-7.5 py-4 text-base font-semibold text-white rounded-full bg-gradient-to-r from-[#6D5DFB] via-[#7869FB] to-[#3B267E] shadow-[0_8px_24px_rgba(109,93,251,0.32)] hover:shadow-[0_12px_36px_rgba(109,93,251,0.48)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-250 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Create a Memory</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-1" />
              </span>
              {/* Subtle highlight sweep */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
                aria-hidden="true"
              />
            </button>

            {/* Secondary: Explore Demo */}
            <button
              onClick={() => onNavigate('/memory/demo')}
              className="group inline-flex items-center justify-center gap-2.5 px-6.5 py-4 text-base font-medium text-[#3B267E] rounded-full bg-white/80 hover:bg-white border border-[#B8A7FF]/40 hover:border-[#6D5DFB]/60 shadow-[0_4px_16px_rgba(59,38,126,0.06)] hover:shadow-[0_8px_24px_rgba(59,38,126,0.12)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-250 cursor-pointer backdrop-blur-md"
            >
              <div className="w-6 h-6 rounded-full bg-[#6D5DFB]/12 flex items-center justify-center text-[#6D5DFB] group-hover:bg-[#6D5DFB] group-hover:text-white transition-colors duration-250">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span>Explore Demo</span>
            </button>
          </div>

          {/* Quiet Trust Footnote */}
          <div className="mt-10 pt-6 border-t border-[#3B267E]/8 flex flex-wrap items-center gap-6 text-xs text-[#665F78]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFB]" />
              <span>Multi-modal media analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#69E1D4]" />
              <span>Natural semantic recall</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4A7D8]" />
              <span>Autonomous story synthesis</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero 3D Composition with ErrorBoundary */}
        <div className="lg:col-span-6 relative">
          <CanvasErrorBoundary
            fallback={
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#6D5DFB] to-[#F4A7D8] blur-xl" />
              </div>
            }
          >
            <Hero3DCanvas />
          </CanvasErrorBoundary>
        </div>
      </div>
    </section>
  );
};
