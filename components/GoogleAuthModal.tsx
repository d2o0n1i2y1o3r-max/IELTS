'use client';

import React, { useState } from 'react';
import { X, UserCircle2, ArrowRight } from 'lucide-react';
import { setGoogleUser, setDemoUser, UserProfile } from '@/lib/userAuth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: GoogleAuthModalProps) {
  const [step, setStep] = useState<'prompt' | 'select_account' | 'custom_account'>('prompt');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  // Pre-configured accounts for seamless one-click Google login (as shown in user screenshot)
  const defaultAccounts = [
    {
      name: 'Umeda',
      email: 'u49281415@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Umeda',
      status: 'Signed out',
    },
    {
      name: 'Doniyor',
      email: 'd2o0n1i2y1o3r@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doniyor',
      status: 'Signed out',
    },
  ];

  const handleSelectAccount = async (name: string, email: string, avatar?: string) => {
    const user = setGoogleUser(name, email, avatar);
    // Also sync with server database so admin sees it immediately
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
    } catch {}

    onSuccess(user);
    onClose();
    setStep('prompt');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(name, customEmail.trim());
  };

  const handleDemoLogin = () => {
    const demo = setDemoUser();
    onSuccess(demo);
    onClose();
    setStep('prompt');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* ─── 1-BOSQICH: LOG IN OR SIGN UP (1-rasmdagi dizayn) ─────────── */}
      {step === 'prompt' && (
        <div className="bg-[#212121] text-white border border-[#333333] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative text-center space-y-7 animate-in zoom-in-95 duration-150">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="space-y-3 pt-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Log in or sign up
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">
              You'll get smarter responses, IELTS band scores, AI Mascot coach, and more.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Continue with Google button (Exact pill style from image 1) */}
            <button
              onClick={() => setStep('select_account')}
              className="w-full py-3.5 px-6 rounded-full border border-gray-600 hover:border-gray-400 bg-transparent hover:bg-white/5 text-white font-medium text-base transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Demo button */}
            <div className="pt-2">
              <button
                onClick={handleDemoLogin}
                className="text-xs text-gray-400 hover:text-gray-200 underline transition"
              >
                Continue as Demo (limited features, no AI)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2-BOSQICH: SELECT AN ACCOUNT (2-rasmdagi dizayn) ─────────── */}
      {step === 'select_account' && (
        <div className="bg-[#121212] text-white border border-[#2b2b2b] rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-150">
          {/* Close button */}
          <button
            onClick={() => setStep('prompt')}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Select an account
            </h2>
            <p className="text-sm text-blue-400">
              to continue to IELTSPrep
            </p>
          </div>

          {/* Accounts list */}
          <div className="border-t border-[#262626] divide-y divide-[#262626] pt-1">
            {defaultAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSelectAccount(acc.name, acc.email, acc.avatar)}
                className="w-full py-4 px-2 flex items-center justify-between text-left hover:bg-white/5 rounded-xl transition group"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {acc.email}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-gray-500 font-medium">
                  {acc.status}
                </span>
              </button>
            ))}

            {/* Using another account */}
            <button
              onClick={() => setStep('custom_account')}
              className="w-full py-4 px-2 flex items-center gap-3.5 text-left hover:bg-white/5 rounded-xl transition text-gray-300 hover:text-white group"
            >
              <div className="w-10 h-10 rounded-full border border-gray-700 bg-transparent flex items-center justify-center text-gray-400 group-hover:text-white">
                <UserCircle2 size={22} />
              </div>
              <span className="text-sm font-semibold">
                Use another account
              </span>
            </button>
          </div>

          {/* Footer disclaimer (Exact text from image 2) */}
          <div className="border-t border-[#262626] pt-5">
            <p className="text-xs text-gray-400 leading-relaxed">
              Please review IELTSPrep's{' '}
              <span className="text-blue-400 hover:underline cursor-pointer">privacy policy</span>{' '}
              and{' '}
              <span className="text-blue-400 hover:underline cursor-pointer">terms of service</span>{' '}
              before using this app.
            </p>
          </div>
        </div>
      )}

      {/* ─── 3-BOSQICH: CUSTOM ACCOUNT INPUT ───────────────────────────── */}
      {step === 'custom_account' && (
        <div className="bg-[#121212] text-white border border-[#2b2b2b] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-150">
          <button
            onClick={() => setStep('select_account')}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Google hisobingizni kiriting</h2>
            <p className="text-xs text-blue-400">to continue to IELTSPrep</p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-gray-400">Ism Familiya</label>
              <input
                type="text"
                required
                placeholder="Ali Valiyev"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1e1e1e] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs text-gray-400">Gmail manzil</label>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1e1e1e] border border-gray-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('select_account')}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-sm font-semibold text-gray-400 hover:text-white"
              >
                Orqaga
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
              >
                Kirish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
