import React, { useState } from 'react';
import { UploadCloud, BrainCircuit, Share2, Sparkles, CheckCircle2, Layers, Search } from 'lucide-react';

interface StepDetail {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  techAccent: string;
  sampleInsight: string;
  features: string[];
}

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps: StepDetail[] = [
    {
      step: '01',
      title: 'UPLOAD',
      subtitle: 'High-Throughput Media Ingestion',
      description:
        'Feed Lumora your scattered camera rolls. RAW images, 4K video clips, mobile captures, and ambient audio sync seamlessly through Cloudinary media pipelines with instant optimization.',
      techAccent: 'Cloudinary CDN Pipeline · Format Optimization',
      sampleInsight: '824 media assets ingested across 3 sources in 12s',
      features: [
        'Automatic media deduplication & metadata extraction',
        'High-resolution asset delivery with zero compression loss',
        'Direct Cloudinary streaming transformations (f_auto, q_auto)',
      ],
    },
    {
      step: '02',
      title: 'UNDERSTAND',
      subtitle: 'Multi-Modal Vision Perception',
      description:
        'Lumora analyzes the depth of each capture. Gemini multi-modal vision models interpret ambient lighting, scenic geography, environmental audio, and real-world activities.',
      techAccent: 'Gemini Multimodal Vision Intelligence',
      sampleInsight: 'Extracted: "Dolomites ridge, golden hour lighting, packrafting gear, alpine wind"',
      features: [
        'Scene understanding: outdoor terrain, architecture, urban spaces',
        'Activity categorization: hiking, live music, dinners, road trips',
        'Ambient lighting & time-of-day contextual modeling',
      ],
    },
    {
      step: '03',
      title: 'CONNECT',
      subtitle: 'Relational Memory Knowledge Graph',
      description:
        'Moments don’t exist in isolation. Lumora’s knowledge engine links captures across shared geography, chronological sequences, and recurring travel routes into living story threads.',
      techAccent: 'Relational Memory Knowledge Base',
      sampleInsight: 'Linked: "Revisited Tuscany 3 years later along same hillside route"',
      features: [
        'Cross-temporal thematic clustering across multiple albums',
        'Chronological chapter subdivision and narrative arc formation',
        'Shared location, route, and milestone graph linkage',
      ],
    },
    {
      step: '04',
      title: 'EXPERIENCE',
      subtitle: 'Living Stories & Grounded Recall',
      description:
        'Ask anything in natural human prose: "Show me scenic sunset drives along the coast" or "When did we have coffee by the river?". Lumora responds with grounded story capsules and actual media.',
      techAccent: 'Conversational Memory Recall Engine',
      sampleInsight: 'Generated: "The Arno Solstice Story Capsule · 3 Editorial Chapters"',
      features: [
        'Natural language semantic search with grounded media citations',
        'Interactive chronological timeline and interactive 2D graph view',
        'Curated story highlights ready for sharing or cinematic playback',
      ],
    },
  ];

  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-20 sm:py-28 bg-[#FFF9FC]/70 border-t border-[#3B267E]/8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6D5DFB]">
            Process Architecture
          </span>
          <h2
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171522] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            How Lumora illuminates your world.
          </h2>
          <p
            className="mt-4 text-base sm:text-lg text-[#665F78]"
            style={{ textWrap: 'balance' }}
          >
            From scattered camera roll fragments to an interconnected universe of living stories in four frictionless stages.
          </p>
        </div>

        {/* 4 Steps Interactive Navigation Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {steps.map((item, index) => {
            const isSelected = activeStep === index;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(index)}
                className={`relative text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#6D5DFB] shadow-[0_12px_32px_rgba(109,93,251,0.16)] -translate-y-0.5'
                    : 'bg-white/60 border-[#3B267E]/8 hover:bg-white/90 hover:border-[#B8A7FF]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-[#6D5DFB] text-white'
                        : 'bg-[#EDE6F7] text-[#665F78]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                      isSelected ? 'bg-[#69E1D4] scale-125 shadow-[0_0_8px_#69E1D4]' : 'bg-neutral-300'
                    }`}
                  />
                </div>

                <div className="font-display font-bold text-sm sm:text-base text-[#171522] tracking-wide">
                  {item.title}
                </div>
                <div className="text-xs text-[#665F78] mt-1 truncate">
                  {item.subtitle}
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#6D5DFB]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Spotlight Canvas */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 border border-white shadow-[0_24px_70px_rgba(59,38,126,0.08)] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#6D5DFB]">
                <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB]" />
                <span>Stage {steps[activeStep].step} · {steps[activeStep].techAccent}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171522] tracking-tight">
                {steps[activeStep].subtitle}
              </h3>

              <p className="text-base text-[#665F78] leading-relaxed">
                {steps[activeStep].description}
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                {steps[activeStep].features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#171522]">
                    <CheckCircle2 className="w-4 h-4 text-[#6D5DFB] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Real-time Pipeline Signal Pill */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-[#B8A7FF]/30 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#665F78]">
                    Pipeline Intelligence Signal
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#3B267E] mt-0.5">
                    {steps[activeStep].sampleInsight}
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" />
              </div>
            </div>

            {/* Right Column: 3D Visual Accent Presentation */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-[360px] aspect-square rounded-3xl bg-gradient-to-br from-[#EDE6F7] via-[#FFF9FC] to-[#F2E8FA] border border-white/80 p-8 flex flex-col items-center justify-center shadow-[0_16px_40px_rgba(59,38,126,0.08)]">
                {/* Ambient Soft Glow */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#6D5DFB]/20 via-[#F4A7D8]/16 to-[#69E1D4]/18 blur-2xl" />

                {/* 3D Geometry Rendering based on current active step */}
                {activeStep === 0 && (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-48 h-36">
                      <div className="absolute inset-0 rounded-2xl bg-[#3B267E] rotate-6 shadow-xl transform scale-90 opacity-70" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#6D5DFB] to-[#F4A7D8] -rotate-3 shadow-2xl transform scale-95 opacity-90" />
                      <div className="absolute inset-0 rounded-2xl bg-white border border-white/80 p-4 shadow-[0_12px_30px_rgba(109,93,251,0.2)] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <UploadCloud className="w-6 h-6 text-[#6D5DFB]" />
                          <span className="text-[10px] font-mono font-bold text-[#6D5DFB]">RAW / 4K</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#171522]">Florence_GoldenHour.mov</div>
                          <div className="text-[10px] text-neutral-400">120 fps · HDR 10-bit · Cloudinary</div>
                        </div>
                      </div>
                    </div>
                    <span className="mt-6 text-xs font-semibold text-[#3B267E] tracking-wider uppercase">
                      Cloudinary Media Ingestion
                    </span>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#B8A7FF] animate-spin" style={{ animationDuration: '18s' }} />
                      <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#6D5DFB] via-[#8DDCFF] to-[#69E1D4] shadow-[0_10px_30px_rgba(109,93,251,0.35)] flex items-center justify-center">
                        <BrainCircuit className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <span className="mt-6 text-xs font-semibold text-[#3B267E] tracking-wider uppercase">
                      Gemini Visual Perception
                    </span>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-44 h-36">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 176 144">
                        <line x1="40" y1="36" x2="136" y2="40" stroke="#6D5DFB" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="40" y1="36" x2="88" y2="108" stroke="#69E1D4" strokeWidth="2" />
                        <line x1="136" y1="40" x2="88" y2="108" stroke="#F4A7D8" strokeWidth="2" />
                      </svg>
                      <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#6D5DFB] shadow-md flex items-center justify-center text-white text-xs font-bold">
                        A
                      </div>
                      <div className="absolute top-5 right-4 w-10 h-10 rounded-full bg-[#F4A7D8] shadow-md flex items-center justify-center text-white text-xs font-bold">
                        B
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#69E1D4] shadow-md flex items-center justify-center text-[#171522] text-xs font-bold">
                        C
                      </div>
                    </div>
                    <span className="mt-6 text-xs font-semibold text-[#3B267E] tracking-wider uppercase">
                      Relational Graph Construction
                    </span>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative w-44 h-28 rounded-2xl bg-white border border-[#B8A7FF]/40 p-3 shadow-lg flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#6D5DFB]" />
                        <span className="text-[11px] font-semibold text-[#171522]">"Golden hour in Florence"</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#EDE6F7]/60 text-[10px] text-[#3B267E] text-left">
                        Synthesized 18 moments · 3 chapters
                      </div>
                    </div>
                    <span className="mt-6 text-xs font-semibold text-[#3B267E] tracking-wider uppercase">
                      Grounded Story Synthesis
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
