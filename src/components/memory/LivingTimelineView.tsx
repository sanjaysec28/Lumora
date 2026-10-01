import React from 'react';
import { TimelineMoment, MemoryCollectionItem } from '../../types';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { TimelineOrbCanvas } from './TimelineOrbCanvas';
import { Film, Camera, Play, ArrowRight, Sparkles, MapPin, Clock } from 'lucide-react';

interface LivingTimelineViewProps {
  moments: TimelineMoment[];
  memory?: MemoryCollectionItem;
  onSelectMoment: (moment: TimelineMoment) => void;
}

export const LivingTimelineView: React.FC<LivingTimelineViewProps> = ({
  moments,
  memory,
  onSelectMoment,
}) => {
  const currentTitle = memory?.title || 'Hackathon 2026';
  const currentMonthYear = memory?.monthYear || 'September 2026';
  const currentLocation = memory?.location || 'Chennai';
  const featuredMoment = moments[0];

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* ================================================== */}
      {/* TIMELINE HERO: FEATURED MEMORY MOMENT */}
      {/* ================================================== */}
      <section className="relative rounded-[32px] sm:rounded-[44px] overflow-hidden bg-gradient-to-br from-[#20133E] via-[#2E1A5B] to-[#140E26] text-white p-8 sm:p-12 lg:p-16 shadow-[0_28px_90px_rgba(35,18,68,0.35)] border border-white/15">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#B8A7FF]/20 via-[#F4A7D8]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-[#69E1D4]/18 via-[#6D5DFB]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Oversized Editorial Typography */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Clean Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#B8A7FF] tracking-wide mb-4">
              <Sparkles className="w-4 h-4 text-[#69E1D4]" />
              <span className="uppercase tracking-wider font-semibold">Featured Opening</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="text-white/80">{currentMonthYear}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Your story, <br />
              <span className="bg-gradient-to-r from-[#B8A7FF] via-[#F4A7D8] to-[#8DDCFF] bg-clip-text text-transparent">
                as it happened.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/80 leading-relaxed font-normal max-w-xl">
              From the initial gathering at {currentLocation} through intense collaboration and final presentation.
              Watch media unfold as a continuous, living narrative arc.
            </p>

            {/* Subtle Floating Metadata */}
            {featuredMoment && (
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/70">
                <span className="flex items-center gap-1.5 text-white/90 font-medium">
                  <Clock className="w-4 h-4 text-[#69E1D4]" />
                  <span>{featuredMoment.time}</span>
                </span>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span className="flex items-center gap-1.5 text-white/90">
                  <MapPin className="w-4 h-4 text-[#F4A7D8]" />
                  <span>{featuredMoment.scene || currentLocation}</span>
                </span>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span className="text-[#8DDCFF] font-mono text-xs">
                  {moments.length} key chapters
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Large Cinematic Media Composition */}
          <div className="lg:col-span-6 relative">
            {featuredMoment && (
              <div
                onClick={() => onSelectMoment(featuredMoment)}
                className="group relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl sm:rounded-[36px] overflow-hidden cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 transition-all duration-300 hover:scale-[1.015]"
              >
                {featuredMoment.secure_url ? (
                  <img
                    src={getOptimizedImageUrl(featuredMoment.secure_url, { width: 1200, height: 800, crop: 'fill' })}
                    alt={featuredMoment.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : memory?.isDemo ? (
                  <div className={`w-full h-full bg-gradient-to-tr ${featuredMoment.coverGradient}`} />
                ) : null}

                {/* Soft Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Floating Media Tag Overlay */}
                <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-xs font-semibold text-white tracking-wider uppercase">
                    {featuredMoment.momentType || 'Opening Chapter'}
                  </span>
                  {featuredMoment.mediaType === 'video' ? (
                    <span className="p-1.5 rounded-full bg-black/45 backdrop-blur-md text-[#8DDCFF] border border-white/20">
                      <Film className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1.5 rounded-full bg-black/45 backdrop-blur-md text-[#F4A7D8] border border-white/20">
                      <Camera className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Floating Bottom Metadata Banner directly over media */}
                <div className="absolute bottom-5 inset-x-5 z-10 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/70 font-mono">
                      {featuredMoment.time} · {featuredMoment.scene || currentLocation}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                      {featuredMoment.title}
                    </h3>
                  </div>

                  <div className="w-11 h-11 rounded-full bg-white/25 hover:bg-white text-white hover:text-[#171522] backdrop-blur-md border border-white/40 flex items-center justify-center transition-colors shadow-lg shrink-0">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* TIMELINE SECTION HEADER & 3D ORB ACCENT */}
      {/* ================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3B267E]/8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6D5DFB] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#69E1D4] shadow-[0_0_8px_#69E1D4]" />
            <span>Living Story Journey</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#171522] tracking-tight">
            LIVING TIMELINE
          </h2>
          <p className="mt-2 text-base text-[#665F78] max-w-xl font-normal">
            Watch your media unfold as a connected story.
          </p>
        </div>

        {/* 3D Floating Orb Accent */}
        <div className="w-32 h-32 hidden md:block shrink-0 relative">
          <TimelineOrbCanvas />
        </div>
      </div>

      {/* Cluster Flow Breadcrumb Progression (when clusters exist) */}
      {memory?.clusters && memory.clusters.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/70 border border-[#B8A7FF]/30 backdrop-blur-md shadow-2xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6D5DFB] mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Memory Story Chapters ({memory.clusters.length} clusters)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-bold text-[#171522]">
            {memory.clusters.map((cl, idx) => (
              <React.Fragment key={cl.id}>
                <span className="px-3 py-1.5 rounded-xl bg-white border border-[#B8A7FF]/40 text-[#3B267E] shadow-2xs flex items-center gap-1.5">
                  <span>{cl.title.toUpperCase()}</span>
                  <span className="font-mono text-[10px] text-[#665F78] font-normal">
                    ({cl.mediaIds.length} media)
                  </span>
                </span>
                {idx < memory.clusters!.length - 1 && (
                  <span className="text-[#6D5DFB] font-bold text-base">↓</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VERTICAL EDITORIAL JOURNEY (VARIED COMPOSITIONS) */}
      {/* ================================================== */}
      <div className="relative pl-6 sm:pl-10 space-y-16 sm:space-y-24 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-8 before:w-[2px] before:bg-gradient-to-b before:from-[#6D5DFB] via-[#B8A7FF] to-[#69E1D4]">
        {moments.map((moment, index) => {
          // Layout rhythm:
          // 0: Large Image Left + Text Right
          // 1: Text Left + Large Image Right
          // 2: Full-Width Cinematic Canvas
          // 3: Small Media Collage
          // 4: Video-Focused Reel
          const rhythm = index % 5;

          // Associated cluster if available
          const parentCluster = memory?.clusters?.find(
            (c) => c.momentIds?.includes(moment.id) || c.mediaIds?.includes(moment.id)
          );

          // Check if this moment is the first in its cluster to display a meaningful section header
          const isFirstInCluster = parentCluster && (
            index === 0 ||
            !memory?.clusters?.find((c) => c.momentIds?.includes(moments[index - 1]?.id)) ||
            memory?.clusters?.find((c) => c.momentIds?.includes(moments[index - 1]?.id))?.id !== parentCluster.id
          );

          // Moment label floating tag
          const momentLabel =
            parentCluster?.title?.toUpperCase() ||
            moment.momentType?.toUpperCase() ||
            (index === 0
              ? 'ARRIVAL & DAWN'
              : index === 1
              ? 'BREAKTHROUGH SPRINT'
              : index === 2
              ? 'STAGE PRESENTATION'
              : index === 3
              ? 'COLLABORATION ARC'
              : 'VICTORY CELEBRATION');

          return (
            <div key={moment.id} className="space-y-6">
              {/* Cluster Section Header */}
              {isFirstInCluster && parentCluster && (
                <div className="relative -ml-3 sm:-ml-5 pb-2 pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#3B267E] to-[#6D5DFB] text-white shadow-md text-xs sm:text-sm font-bold uppercase tracking-wider">
                    <span>{parentCluster.title.toUpperCase()}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#69E1D4]" />
                    <span className="text-[11px] font-mono font-normal text-white/80">
                      {parentCluster.mediaIds.length} media · {parentCluster.momentIds.length} moments
                    </span>
                  </div>
                  {parentCluster.narrativeSummary && (
                    <p className="mt-2 text-xs sm:text-sm text-[#665F78] max-w-xl font-normal leading-relaxed pl-1">
                      {parentCluster.narrativeSummary}
                    </p>
                  )}
                </div>
              )}

              <article
                onClick={() => onSelectMoment(moment)}
                className="relative group cursor-pointer"
              >
              {/* Timeline Illuminating Node Dot */}
              <div className="absolute -left-[30px] sm:-left-[38px] top-6 w-5 h-5 rounded-full bg-[#FFF9FC] border-[3.5px] border-[#6D5DFB] shadow-[0_0_12px_rgba(109,93,251,0.5)] group-hover:scale-130 group-hover:border-[#3B267E] group-hover:shadow-[0_0_18px_#69E1D4] transition-all duration-300 z-10" />

              {/* -------------------------------------------------- */}
              {/* MOMENT TYPE 0: LARGE IMAGE LEFT + STORY RIGHT */}
              {/* -------------------------------------------------- */}
              {rhythm === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-[0_16px_45px_rgba(59,38,126,0.12)] border border-white/80 group-hover:shadow-[0_24px_65px_rgba(59,38,126,0.2)] transition-all">
                      {moment.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(moment.secure_url, { width: 900, height: 600, crop: 'fill' })}
                          alt={moment.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : memory?.isDemo ? (
                        <div className={`w-full h-full bg-gradient-to-tr ${moment.coverGradient}`} />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Moment Label directly on media */}
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 text-[11px] font-semibold tracking-wider">
                        {momentLabel}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#6D5DFB] font-semibold">
                      <span>{moment.time}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#665F78] font-sans">{moment.scene || currentLocation}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors leading-tight">
                      {moment.title}
                    </h3>

                    <p className="text-base text-[#665F78] leading-relaxed italic">
                      "{moment.description}"
                    </p>

                    <div className="pt-3 flex flex-wrap items-center gap-3 text-xs text-[#665F78]">
                      {moment.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[#3B267E] font-medium">
                          #{t}
                        </span>
                      ))}
                      <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#6D5DFB] group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOMENT TYPE 1: STORY LEFT + LARGE IMAGE RIGHT */}
              {/* -------------------------------------------------- */}
              {rhythm === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 order-2 lg:order-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#6D5DFB] font-semibold">
                      <span>{moment.time}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#665F78] font-sans">{moment.scene || currentLocation}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors leading-tight">
                      {moment.title}
                    </h3>

                    <p className="text-base text-[#665F78] leading-relaxed italic">
                      "{moment.description}"
                    </p>

                    <div className="pt-3 flex flex-wrap items-center gap-3 text-xs text-[#665F78]">
                      {moment.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[#3B267E] font-medium">
                          #{t}
                        </span>
                      ))}
                      <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[#6D5DFB] group-hover:translate-x-1 transition-transform">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-[0_16px_45px_rgba(59,38,126,0.12)] border border-white/80 group-hover:shadow-[0_24px_65px_rgba(59,38,126,0.2)] transition-all">
                      {moment.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(moment.secure_url, { width: 900, height: 600, crop: 'fill' })}
                          alt={moment.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : memory?.isDemo ? (
                        <div className={`w-full h-full bg-gradient-to-tr ${moment.coverGradient}`} />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 text-[11px] font-semibold tracking-wider">
                        {momentLabel}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOMENT TYPE 2: FULL-WIDTH CINEMATIC IMAGE CANVAS */}
              {/* -------------------------------------------------- */}
              {rhythm === 2 && (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl sm:rounded-[36px] overflow-hidden shadow-[0_20px_60px_rgba(59,38,126,0.18)] border border-white/80 group-hover:shadow-[0_28px_80px_rgba(59,38,126,0.28)] transition-all">
                  {moment.secure_url ? (
                    <img
                      src={getOptimizedImageUrl(moment.secure_url, { width: 1400, height: 700, crop: 'fill' })}
                      alt={moment.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : memory?.isDemo ? (
                    <div className={`w-full h-full bg-gradient-to-tr ${moment.coverGradient}`} />
                  ) : null}
                  {/* Dramatic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-xs font-semibold text-white tracking-wider uppercase">
                      {momentLabel}
                    </span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-6 inset-x-6 sm:bottom-8 sm:inset-x-8 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="text-xs uppercase tracking-wider text-white/80 font-mono">
                        {moment.time} · {moment.scene || currentLocation}
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">
                        {moment.title}
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-white/85 line-clamp-2 italic">
                        "{moment.description}"
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/25 hover:bg-white text-white hover:text-[#171522] backdrop-blur-md border border-white/40 text-xs font-semibold transition-colors shrink-0">
                      <span>View Full Canvas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOMENT TYPE 3: SMALL MEDIA COLLAGE / DUAL-FRAME */}
              {/* -------------------------------------------------- */}
              {rhythm === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                    <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-white/80 group-hover:scale-[1.02] transition-transform">
                      {moment.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(moment.secure_url, { width: 600, height: 450, crop: 'fill' })}
                          alt={moment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : memory?.isDemo ? (
                        <div className={`w-full h-full bg-gradient-to-tr ${moment.coverGradient}`} />
                      ) : null}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold">
                        Angle 01
                      </span>
                    </div>

                    <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-white/80 translate-y-4 group-hover:translate-y-2 transition-transform">
                      {moment.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(
                            (memory?.mediaItems && memory.mediaItems.length > 1
                              ? memory.mediaItems.find((i) => i.id !== moment.id)?.secure_url || moment.secure_url
                              : moment.secure_url),
                            { width: 600, height: 450, crop: 'fill' }
                          )}
                          alt={moment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : memory?.isDemo ? (
                        <div className={`w-full h-full bg-gradient-to-tr from-[#69E1D4] to-[#6D5DFB]`} />
                      ) : null}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold">
                        Angle 02
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#6D5DFB] font-semibold">
                      <span>{moment.time}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#665F78] font-sans">Dual-Perspective Capture</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#171522] group-hover:text-[#6D5DFB] transition-colors leading-tight">
                      {moment.title}
                    </h3>

                    <p className="text-base text-[#665F78] leading-relaxed italic">
                      "{moment.description}"
                    </p>

                    <div className="pt-3 flex items-center gap-2 text-xs font-semibold text-[#6D5DFB]">
                      <span>Open Multi-Frame Reel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------- */}
              {/* MOMENT TYPE 4: VIDEO-FOCUSED MOMENT */}
              {/* -------------------------------------------------- */}
              {rhythm === 4 && (
                <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden bg-[#1B1130] text-white p-6 sm:p-8 border border-white/20 shadow-[0_20px_60px_rgba(27,17,48,0.25)]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                      {moment.secure_url ? (
                        <img
                          src={getOptimizedImageUrl(moment.secure_url, { width: 800, height: 450, crop: 'fill' })}
                          alt={moment.title}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      ) : memory?.isDemo ? (
                        <div className={`w-full h-full bg-gradient-to-tr ${moment.coverGradient}`} />
                      ) : null}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white group-hover:scale-115 transition-transform shadow-xl">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs font-mono text-[10px] text-white">
                        00:42 HD
                      </span>
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-[#8DDCFF] font-mono">
                        <Film className="w-3.5 h-3.5" />
                        <span>Continuous Motion Capture · {moment.time}</span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-white">
                        {moment.title}
                      </h3>

                      <p className="text-sm sm:text-base text-white/80 leading-relaxed italic">
                        "{moment.description}"
                      </p>

                      <div className="pt-2 text-xs font-semibold text-[#69E1D4] flex items-center gap-1.5">
                        <span>Play Video Reel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>
          );
        })}
      </div>
    </div>
  );
};
