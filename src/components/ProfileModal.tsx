import React from 'react';
import { Route } from '../types';
import { X, Sparkles, FolderHeart, ShieldCheck, HardDrive, ExternalLink, LogOut, User as UserIcon } from 'lucide-react';
import { logoutUser, isFirebaseConfigured } from '../lib/firebase';
import { User } from 'firebase/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: Route) => void;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentUser,
  onSignOut,
}) => {
  const hasFirebase = isFirebaseConfigured();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await logoutUser();
    if (onSignOut) onSignOut();
    onClose();
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Team Zyphra';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#FFF9FC] border border-white shadow-[0_24px_80px_rgba(59,38,126,0.3)] p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-[#171522] p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6D5DFB] via-[#8576FF] to-[#F4A7D8] flex items-center justify-center text-white text-xl font-bold shadow-md">
            {initial}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-lg text-[#171522] truncate">
              {displayName}
            </h3>
            <p className="text-xs text-[#665F78] truncate">
              {currentUser?.email || 'Cloudinary AI Hackathon 2026 · Track 3'}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6D5DFB] font-semibold">
              <span className={`w-2 h-2 rounded-full ${hasFirebase && currentUser ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-amber-500'}`} />
              <span>{hasFirebase && currentUser ? 'Live Vault Connected' : 'Demo Sandbox Mode'}</span>
            </div>
          </div>
        </div>

        {/* User UID and Security Info */}
        {currentUser && (
          <div className="p-3 rounded-xl bg-white border border-[#B8A7FF]/30 text-xs mb-5">
            <div className="text-[10px] font-mono text-[#665F78] uppercase tracking-wider mb-0.5">
              Owner Identifier (ownerId)
            </div>
            <div className="font-mono text-xs text-[#3B267E] truncate font-semibold">
              {currentUser.uid}
            </div>
          </div>
        )}

        {/* Storage & Stats Breakdown */}
        <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#B8A7FF]/30 shadow-2xs mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-[#171522]">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#6D5DFB]" />
              <span>Media Ingestion Pipeline</span>
            </span>
            <span className="font-mono text-[#6D5DFB]">Vault Active</span>
          </div>
          <div className="w-full bg-[#EDE6F7] h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#6D5DFB] to-[#69E1D4] h-full w-[65%] rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#665F78] pt-1">
            <span>Living Story Capsules</span>
            <span>Cloudinary Media Ready</span>
          </div>
        </div>

        {/* Quick Menu Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onNavigate('/dashboard');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EDE6F7]/50 border border-neutral-200/70 text-xs font-semibold text-[#171522] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-[#6D5DFB]" />
              <span>My Memory Collections</span>
            </span>
            <span className="text-[#6D5DFB]">View</span>
          </button>

          <button
            onClick={() => {
              onNavigate('/create');
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#EDE6F7]/50 border border-neutral-200/70 text-xs font-semibold text-[#171522] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6D5DFB]" />
              <span>Create New Memory</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {currentUser && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100/70 border border-red-200/70 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </span>
            </button>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#3B267E]/8 flex items-center justify-between text-[11px] text-[#665F78]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#69E1D4]" />
            Client Encryption Verified
          </span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-[#171522] font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
