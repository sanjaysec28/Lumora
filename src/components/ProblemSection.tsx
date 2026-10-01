import React, { useState } from 'react';
import { Search, Sparkles, FolderX, Compass, MapPin, Calendar, Film } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'lumora'>('lumora');

  return (
    <section className="relative px-6 sm:px-10 lg:px-16 py-20 sm:py-28 border-t border-[#3B267E]/8 bg-gradient-to-b from-transparent via-white/50 to-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6D5DFB]">
            The Missing Narrative
          </span>
          <h2
            className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171522] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Your memories are more than files.
          </h2>
          <p
            className="mt-4 text-base sm:text-lg text-[#665F78] leading-relaxed"
            style={{ textWrap: 'balance' }}
          >
            Standard cloud drives organize byte sizes and nested folders.
            They index filenames like <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#EDE6F7] text-[#3B267E]">IMG_9042.heic</code>.
            They miss the places you explored, the activities you shared, and the narrative that connects each moment.
          </p>
        </div>

        {/* Interactive Comparison Surface */}
        <div className="glass-panel rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 border border-white shadow-[0_24px_70px_rgba(59,38,126,0.06)] relative overflow-hidden">
          {/* Ambient subtle light accents */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-[#B8A7FF]/20 to-[#F4A7D8]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-[#69E1D4]/20 to-[#8DDCFF]/15 blur-3xl pointer-events-none" />

          {/* Perspective Toggle Selector */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex p-1.5 rounded-full bg-[#EDE6F7]/70 border border-[#B8A7FF]/30 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('traditional')}
                className={`px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'traditional'
                    ? 'bg-white text-[#171522] shadow-[0_2px_12px_rgba(59,38,126,0.08)]'
                    : 'text-[#665F78] hover:text-[#171522]'
                }`}
              >
                Traditional Camera Roll
              </button>
              <button
                onClick={() => setActiveTab('lumora')}
                className={`px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'lumora'
                    ? 'bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white shadow-[0_4px_16px_rgba(109,93,251,0.3)]'
                    : 'text-[#665F78] hover:text-[#171522]'
                }`}
              >
                Lumora Intelligence
              </button>
            </div>
          </div>

          {/* Comparative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left: Traditional File Archive */}
            <div
              className={`rounded-2xl p-6 sm:p-8 transition-all duration-300 border ${
                activeTab === 'traditional'
                  ? 'bg-white border-neutral-300 shadow-md ring-2 ring-[#6D5DFB]/15'
                  : 'bg-white/50 border-neutral-200/60 opacity-65'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <FolderX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171522]">
                    The Fragmented Storage Vault
                  </h3>
                  <span className="text-xs text-neutral-400">Generic cloud storage approach</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs text-neutral-600">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                  <span>/DCIM/2026_07/IMG_4412.MOV</span>
                  <span className="text-neutral-400">412 MB</span>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                  <span>/Uploads/P1080392.RAW</span>
                  <span className="text-neutral-400">48.2 MB</span>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                  <span>/Backups/Unsorted_Album_14/</span>
                  <span className="text-neutral-400">1,829 items</span>
                </div>
              </div>

              <ul className="mt-7 space-y-2.5 text-xs text-neutral-500">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>Files trapped in date-stamped silos without narrative flow</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>No scene or activity comprehension (hiking, concerts, coastal drives)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>Search limited to mechanical dates, filenames, or manual tags</span>
                </li>
              </ul>
            </div>

            {/* Right: The Lumora Living Narrative */}
            <div
              className={`rounded-2xl p-6 sm:p-8 transition-all duration-300 border relative overflow-hidden ${
                activeTab === 'lumora'
                  ? 'bg-gradient-to-br from-[#FFF9FC] to-[#F5EFFF] border-[#B8A7FF]/60 shadow-[0_16px_40px_rgba(109,93,251,0.12)] ring-2 ring-[#6D5DFB]/25'
                  : 'bg-white/50 border-neutral-200/60 opacity-65'
              }`}
            >
              {/* Subtle top accent */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#6D5DFB]/12 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D5DFB] to-[#3B267E] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(109,93,251,0.25)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171522]">
                    Living Story Capsules
                  </h3>
                  <span className="text-xs text-[#6D5DFB] font-medium">Lumora media intelligence</span>
                </div>
              </div>

              {/* Story Narrative Preview */}
              <div className="space-y-3.5 text-sm">
                <div className="p-4 rounded-xl bg-white/90 border border-[#B8A7FF]/30 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#3B267E]">
                      Solstice by the Arno River
                    </span>
                    <span className="text-[11px] text-[#6D5DFB] font-medium">
                      Story Arc · 18 Moments
                    </span>
                  </div>
                  <p className="text-xs text-[#665F78] leading-relaxed">
                    "A warm dusk in Florence along the riverbank. Acoustic street guitars, terracotta rooftops at golden hour, and an open-air dinner."
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#3B267E]">
                    <span className="px-2 py-0.5 rounded-md bg-[#EDE6F7] font-medium">Florence, Italy</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EDE6F7] font-medium">Golden Hour</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EDE6F7] font-medium">Acoustic Music</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/70 border border-[#B8A7FF]/25 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#6D5DFB]" />
                    <span className="text-[#171522] font-medium">"Scenic drives along the coast at sunset"</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6D5DFB]">Grounded media found</span>
                </div>
              </div>

              <ul className="mt-7 space-y-2.5 text-xs text-[#3B267E]">
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFB]" />
                  <span>Synthesizes visual scenes, activities, daylight, and locations</span>
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#69E1D4]" />
                  <span>Natural semantic recall with grounded photo & video evidence</span>
                </li>
                <li className="flex items-center gap-2.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F4A7D8]" />
                  <span>Autonomously clusters moments into chronological chapters</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
