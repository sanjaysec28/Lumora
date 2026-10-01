import React from 'react';
import { MediaDetailItem } from '../types';
import {
  X,
  Clock,
  Tag,
  Film,
  Camera,
  ArrowRight,
  Sparkles,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  MapPin,
  Activity,
  Box,
} from 'lucide-react';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../lib/cloudinary';

interface MediaDetailModalProps {
  item: MediaDetailItem | null;
  onClose: () => void;
  onSelectRelatedMoment?: (title: string) => void;
  onViewInTimeline?: () => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onSelectRelatedMoment,
  onViewInTimeline,
}) => {
  if (!item) return null;

  const isVideo = item.type === 'video';
  const hasCloudinary = Boolean(item.cloudinaryAsset || (item.secure_url && item.secure_url.includes('cloudinary.com')));

  // Resolve AI insight fields from either item.aiInsight or direct properties
  const aiInsight = item.aiInsight;
  const scene = aiInsight?.scene || item.scene;
  const activity = aiInsight?.activity || item.activity;
  const objects = aiInsight?.objects || item.objects || [];
  const momentType = aiInsight?.momentType || item.momentType;
  const aiDescription = aiInsight?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#FFF9FC] border border-white shadow-[0_24px_80px_rgba(59,38,126,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close Bar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close detail modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cinematic Media Visual Preview */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-black overflow-hidden flex flex-col justify-between text-white shrink-0 shadow-inner">
          {isVideo && item.secure_url ? (
            <video
              src={getOptimizedVideoUrl(item.secure_url)}
              controls
              playsInline
              autoPlay
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : item.secure_url ? (
            <img
              src={getOptimizedImageUrl(item.secure_url, { width: 1400 })}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#171522]" />
          )}

          {/* Gradient Overlays for readable text and badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />

          {/* Top badges */}
          <div className="relative z-10 flex items-center justify-between p-5 text-xs pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/30 font-mono text-[11px] pointer-events-auto">
              {isVideo ? (
                <>
                  <Film className="w-3.5 h-3.5 text-[#8DDCFF]" />
                  <span>4K Video · {item.size}</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-[#F4A7D8]" />
                  <span>Illuminated Photo · {item.size}</span>
                </>
              )}
            </span>

            <div className="flex items-center gap-2 pointer-events-auto">
              {momentType && (
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#6D5DFB]/90 text-white text-[11px] font-bold backdrop-blur-md capitalize border border-white/20">
                  <Sparkles className="w-3 h-3 text-[#69E1D4]" />
                  <span>{momentType}</span>
                </span>
              )}
              {hasCloudinary && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono backdrop-blur-md border border-white/20">
                  <Cloud className="w-3 h-3 text-[#69E1D4]" />
                  <span>Cloudinary CDN</span>
                </span>
              )}
            </div>
          </div>

          {/* Title & Time bottom overlay */}
          <div className="relative z-10 p-5 pt-0 pointer-events-none">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md">
              {item.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/90 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.time}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#69E1D4]" />
                Gemini Vision Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Media Details Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* AI Media Understanding Intelligence Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EDE6F7]/80 via-white to-[#F4EEFA]/80 border border-[#B8A7FF]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#6D5DFB] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#171522] uppercase tracking-wider">
                  AI Media Understanding
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#6D5DFB]/10 text-[#6D5DFB] font-mono font-bold">
                Gemini 3.8 Flash
              </span>
            </div>

            {/* AI Scene & Activity breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#B8A7FF]/25 shadow-2xs">
                <div className="text-[10px] font-bold text-[#665F78] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#6D5DFB]" />
                  <span>Scene / Environment</span>
                </div>
                <div className="font-semibold text-[#171522] mt-1 capitalize">
                  {scene || 'Creative Collaborative Venue'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#B8A7FF]/25 shadow-2xs">
                <div className="text-[10px] font-bold text-[#665F78] uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#69E1D4]" />
                  <span>Observable Activity</span>
                </div>
                <div className="font-semibold text-[#171522] mt-1 capitalize">
                  {activity || 'Sprint Collaboration & Demonstration'}
                </div>
              </div>
            </div>

            {/* Detected Objects */}
            {objects.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-[#665F78] uppercase flex items-center gap-1 mb-2">
                  <Box className="w-3 h-3 text-[#F4A7D8]" />
                  <span>Detected Key Elements & Objects</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {objects.map((obj) => (
                    <span
                      key={obj}
                      className="px-2.5 py-0.5 rounded-md text-[11px] bg-white border border-[#B8A7FF]/30 text-[#3B267E] font-medium shadow-2xs"
                    >
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Narrative Description */}
            {aiDescription && (
              <div className="text-xs text-[#3B267E] bg-white/70 p-3 rounded-xl border border-[#B8A7FF]/20 italic leading-relaxed">
                "{aiDescription}"
              </div>
            )}
          </div>

          {/* Context Narrative */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B267E] mb-1.5">
              Contextual Story Summary
            </h3>
            <p className="text-sm text-[#171522] leading-relaxed">
              {item.context}
            </p>
          </div>

          {/* Semantic Tags */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#665F78] mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Semantic Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#EDE6F7] text-[#3B267E] border border-[#B8A7FF]/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Cloudinary Asset Pipeline Card */}
          {item.cloudinaryAsset && (
            <div className="p-4 rounded-2xl bg-white border border-[#B8A7FF]/35 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3B267E]">
                  <Cloud className="w-4 h-4 text-[#6D5DFB]" />
                  <span>Cloudinary Media Asset Data</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#69E1D4] bg-[#3B267E] px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Ingested</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2 rounded-xl bg-[#EDE6F7]/50 border border-[#B8A7FF]/20">
                  <div className="text-[10px] text-[#665F78] uppercase">Format</div>
                  <div className="font-bold text-[#171522] mt-0.5 uppercase">
                    {item.cloudinaryAsset.format}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#EDE6F7]/50 border border-[#B8A7FF]/20">
                  <div className="text-[10px] text-[#665F78] uppercase">Resolution</div>
                  <div className="font-bold text-[#171522] mt-0.5">
                    {item.cloudinaryAsset.width} × {item.cloudinaryAsset.height}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#EDE6F7]/50 border border-[#B8A7FF]/20">
                  <div className="text-[10px] text-[#665F78] uppercase">Pipeline</div>
                  <div className="font-bold text-[#6D5DFB] mt-0.5">f_auto, q_auto</div>
                </div>
                <div className="p-2 rounded-xl bg-[#EDE6F7]/50 border border-[#B8A7FF]/20">
                  <div className="text-[10px] text-[#665F78] uppercase">Public ID</div>
                  <div className="font-bold text-[#171522] truncate mt-0.5" title={item.cloudinaryAsset.public_id}>
                    {item.cloudinaryAsset.public_id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Moments */}
          {item.relatedMoments && item.relatedMoments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#665F78] mb-2.5">
                Connected Moments in this Story
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {item.relatedMoments.map((momentTitle) => (
                  <button
                    key={momentTitle}
                    onClick={() => {
                      if (onSelectRelatedMoment) {
                        onSelectRelatedMoment(momentTitle);
                      }
                    }}
                    className="p-3 rounded-xl bg-white border border-[#B8A7FF]/30 hover:border-[#6D5DFB] text-left transition-colors cursor-pointer group shadow-2xs"
                  >
                    <div className="text-[10px] uppercase font-mono text-[#6D5DFB] font-bold">
                      Linked Moment
                    </div>
                    <div className="text-xs font-semibold text-[#171522] group-hover:text-[#6D5DFB] truncate mt-0.5">
                      {momentTitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-[#3B267E]/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-[#665F78]">
              Filename: <code className="font-mono text-[11px] text-[#3B267E]">{item.filename}</code>
            </span>
            <div className="flex items-center gap-3">
              {item.secure_url && (
                <a
                  href={item.secure_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#B8A7FF]/30 text-xs font-semibold text-[#665F78] hover:text-[#171522] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Direct CDN URL</span>
                </a>
              )}
              {onViewInTimeline && (
                <button
                  onClick={() => {
                    onViewInTimeline();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-xs font-semibold shadow hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <span>View in Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
