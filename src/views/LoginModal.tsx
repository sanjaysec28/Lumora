import React, { useState } from 'react';
import { LumoraLogo } from '../components/LumoraLogo';
import { X, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Key, UserCheck } from 'lucide-react';
import { loginWithEmail, loginAnonymously, isFirebaseConfigured } from '../lib/firebase';
import { User } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: User | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasFirebase = isFirebaseConfigured();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    if (hasFirebase) {
      try {
        const user = await loginWithEmail(email, password || 'Lumora2026!');
        onSuccess(user);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Demo Sandbox Mode
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(null);
        onClose();
      }, 700);
    }
  };

  const handleGuestAccess = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    if (hasFirebase) {
      try {
        const user = await loginAnonymously();
        onSuccess(user);
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Anonymous sign in unavailable.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(null);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-[#FFF9FC] border border-white shadow-[0_24px_80px_rgba(59,38,126,0.25)] p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Soft background aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#B8A7FF]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-[#171522] p-1 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <LumoraLogo size="lg" className="justify-center mb-3" />
          <h2 className="font-display text-2xl font-bold text-[#171522]">
            Welcome to Lumora
          </h2>
          <p className="text-xs sm:text-sm text-[#665F78] mt-1">
            Access your illuminated memory archive.
          </p>

          {/* Mode Badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold">
            {hasFirebase ? (
              <span className="bg-[#6D5DFB]/10 text-[#6D5DFB] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                Live Firebase Auth Connected
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-700 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Demo Sandbox Active
              </span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171522] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#B8A7FF]/40 text-sm text-[#171522] focus:outline-none focus:border-[#6D5DFB] focus:ring-2 focus:ring-[#6D5DFB]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171522] mb-1">
              Password {hasFirebase ? '' : '(Optional in Demo)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#B8A7FF]/40 text-sm text-[#171522] focus:outline-none focus:border-[#6D5DFB] focus:ring-2 focus:ring-[#6D5DFB]/15"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#3B267E] text-white text-sm font-semibold shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{hasFirebase ? 'Sign In or Register' : 'Continue into Sandbox'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleGuestAccess}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#665F78] hover:text-[#171522] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#6D5DFB]" />
            <span>Instant Guest Access</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#665F78] pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#69E1D4]" />
            <span>Client-encrypted private memory storage</span>
          </div>
        </form>
      </div>
    </div>
  );
};
