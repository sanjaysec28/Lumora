import React from 'react';
import { LumoraLogo } from './LumoraLogo';
import { Route } from '../types';
import { Search, User, Plus } from 'lucide-react';

interface NavigationProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  onOpenLogin: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  onNavigate,
  onOpenLogin,
  onOpenSearch,
  onOpenProfile,
  isDemoMode = false,
  onToggleDemoMode,
}) => {
  const isProductRoute = currentRoute !== '/';

  return (
    <header className="relative z-40 w-full px-5 sm:px-10 pt-6 sm:pt-7 pb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Brand Element */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5DFB] rounded-lg transition-transform hover:opacity-95 cursor-pointer text-left"
            aria-label="Lumora Home"
          >
            <LumoraLogo size="md" />
          </button>
          {isProductRoute && (
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-500/10 text-amber-700 border border-amber-500/25 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 hover:bg-emerald-500/20'
              }`}
              title={isDemoMode ? 'Click to return to Live Vault' : 'Click to explore curated Demo Mode'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDemoMode ? 'bg-amber-500 shadow-[0_0_6px_#F59E0B]' : 'bg-emerald-500 shadow-[0_0_6px_#10B981]'
                }`}
              />
              <span>{isDemoMode ? 'Demo Mode' : 'Live Vault'}</span>
            </button>
          )}
        </div>

        {/* Zone 2: Minimal Text Links */}
        <nav
          className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#665F78]"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => onNavigate('/dashboard')}
            className={`transition-colors duration-200 hover:text-[#171522] cursor-pointer ${
              currentRoute === '/dashboard' ? 'text-[#3B267E] font-semibold' : ''
            }`}
          >
            Memories
          </button>
          <button
            onClick={() => {
              if (onToggleDemoMode && !isDemoMode) {
                onToggleDemoMode();
              }
              onNavigate('/memory/demo');
            }}
            className={`transition-colors duration-200 hover:text-[#171522] cursor-pointer inline-flex items-center gap-1.5 ${
              currentRoute === '/memory/demo' && isDemoMode ? 'text-[#3B267E] font-semibold' : ''
            }`}
          >
            <span>Explore Demo</span>
            <span className="text-[10px] tracking-wider text-amber-600 font-semibold px-1.5 py-0.2 bg-amber-500/10 rounded-full">
              Curated
            </span>
          </button>
          <button
            onClick={() => onNavigate('/create')}
            className={`transition-colors duration-200 hover:text-[#171522] cursor-pointer ${
              currentRoute === '/create' ? 'text-[#3B267E] font-semibold' : ''
            }`}
          >
            Create
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Search + Profile on product routes, CTA on landing) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#665F78] hover:text-[#171522] rounded-full bg-white/70 hover:bg-white border border-[#B8A7FF]/30 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm"
              aria-label="Search memories"
            >
              <Search className="w-3.5 h-3.5 text-[#6D5DFB]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline text-[10px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
          )}

          {isProductRoute ? (
            <>
              {/* "+ Create Memory" quick shortcut on dashboard/demo */}
              {currentRoute !== '/create' && (
                <button
                  onClick={() => onNavigate('/create')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] shadow-[0_4px_14px_rgba(109,93,251,0.25)] hover:shadow-[0_6px_18px_rgba(109,93,251,0.35)] transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
              )}

              {/* Profile Avatar Button */}
              <button
                onClick={onOpenProfile || onOpenLogin}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#6D5DFB] to-[#F4A7D8] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-[0_2px_8px_rgba(109,93,251,0.3)] hover:scale-105 transition-transform duration-200 cursor-pointer border border-white"
                aria-label="Profile"
              >
                Z
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-xs sm:text-sm font-medium text-[#665F78] hover:text-[#171522] px-2.5 py-1.5 transition-colors duration-200 cursor-pointer"
              >
                Log in
              </button>
              {/* Strongest CTA: Create Memory with subtle lift, soft purple glow, tiny scale increase, <200-250ms */}
              <button
                onClick={() => onNavigate('/create')}
                className="group relative inline-flex items-center justify-center px-4.5 sm:px-5.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white rounded-full bg-gradient-to-r from-[#6D5DFB] via-[#7B6BFB] to-[#3B267E] shadow-[0_4px_16px_rgba(109,93,251,0.32)] hover:shadow-[0_8px_24px_rgba(109,93,251,0.48)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <span className="relative z-10 whitespace-nowrap">Create Memory</span>
                {/* Subtle highlight sweep */}
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
                  aria-hidden="true"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
