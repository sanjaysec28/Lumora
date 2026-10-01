import React from 'react';
import { LumoraLogo } from './LumoraLogo';
import { Route } from '../types';

interface FooterProps {
  onNavigate: (route: Route) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative px-6 sm:px-10 lg:px-16 pt-16 pb-12 border-t border-[#3B267E]/8 bg-white/40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#3B267E]/8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <button
              onClick={() => onNavigate('/')}
              className="text-left focus-visible:outline-none cursor-pointer"
            >
              <LumoraLogo size="lg" showTagline={true} />
            </button>
            <p className="text-sm text-[#665F78] max-w-sm leading-relaxed">
              AI-powered media intelligence transforming scattered photos, 4K videos, and ambient audio into searchable, living stories.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#6D5DFB]/10 text-[#3B267E] border border-[#6D5DFB]/15">
                Pixels to Products · Cloudinary AI Hackathon 2026 · Track 3: Media-Savvy Startup
              </span>
            </div>
          </div>

          {/* Navigation Mirrors */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171522]">
              Navigation
            </div>
            <ul className="space-y-2 text-sm text-[#665F78]">
              <li>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="hover:text-[#6D5DFB] transition-colors cursor-pointer"
                >
                  Memories Vault
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/memory/demo')}
                  className="hover:text-[#6D5DFB] transition-colors cursor-pointer"
                >
                  Explore Story Demo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/create')}
                  className="hover:text-[#6D5DFB] transition-colors cursor-pointer"
                >
                  Create a Memory
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon & Credits */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#171522]">
              Engineering
            </div>
            <p className="text-xs text-[#665F78] leading-relaxed">
              Crafted with artistic precision by <strong className="text-[#171522]">Team Zyphra</strong>.
            </p>
            <p className="text-xs text-[#665F78] leading-relaxed">
              Powered by 3D WebGL, Gemini multi-modal vision perception, and Cloudinary media pipelines.
            </p>
          </div>
        </div>

        {/* Quiet Legal & Status Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#665F78]">
          <div>
            © {new Date().getFullYear()} Lumora by Zyphra. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="font-medium text-[#3B267E]">Every moment, illuminated.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
