import React from 'react';
import { Route } from '../types';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface FinalCtaSectionProps {
  onNavigate: (route: Route) => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-20 sm:py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Grand Illuminated Callout Canvas */}
        <div className="relative rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 lg:p-16 bg-gradient-to-br from-[#2E1B6B] via-[#21124C] to-[#140F24] text-white shadow-[0_32px_90px_rgba(59,38,126,0.32)] overflow-hidden border border-white/20">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-[#6D5DFB]/35 via-[#F4A7D8]/18 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#69E1D4]/25 via-[#8DDCFF]/18 to-transparent blur-3xl pointer-events-none" />

          {/* Abstract Optical Orbit Geometry Accent (SVG) */}
          <div className="absolute top-8 right-8 w-32 h-32 hidden sm:block pointer-events-none opacity-85">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full animate-pulse" style={{ animationDuration: '6s' }}>
              <ellipse cx="50" cy="50" rx="42" ry="20" transform="rotate(-25 50 50)" stroke="url(#ctaRingGrad)" strokeWidth="3" strokeDasharray="5 5" />
              <circle cx="50" cy="50" r="14" fill="url(#ctaCoreGrad)" />
              <defs>
                <linearGradient id="ctaRingGrad" x1="0" y1="0" x2="100" y2="100">
                  <stop stopColor="#B8A7FF" />
                  <stop offset="1" stopColor="#69E1D4" />
                </linearGradient>
                <radialGradient id="ctaCoreGrad" cx="50%" cy="50%" r="50%">
                  <stop stopColor="#FFF9FC" />
                  <stop offset="100%" stopColor="#6D5DFB" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#8DDCFF] mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#69E1D4]" />
              <span>Begin Your Living Archive</span>
            </div>

            <h2
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Give your memories a story.
            </h2>

            <p
              className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed font-normal"
              style={{ textWrap: 'balance' }}
            >
              Stop letting years of cherished captures disappear into forgotten photo albums.
              Let Lumora illuminate the moments, places, and stories that matter most.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
              {/* Primary: Create a Memory */}
              <button
                onClick={() => onNavigate('/create')}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-[#171522] rounded-full bg-white hover:bg-[#FFF9FC] shadow-[0_8px_28px_rgba(255,255,255,0.35)] hover:shadow-[0_12px_36px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Create a Memory</span>
                  <ArrowRight className="w-4 h-4 text-[#6D5DFB] transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
                  aria-hidden="true"
                />
              </button>

              {/* Secondary: Explore Demo */}
              <button
                onClick={() => onNavigate('/memory/demo')}
                className="group inline-flex items-center justify-center gap-2.5 px-6.5 py-4 text-base font-medium text-white/90 hover:text-white rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer backdrop-blur-md"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#8DDCFF]" />
                <span>Explore Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
