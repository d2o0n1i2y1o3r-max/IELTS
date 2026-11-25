'use client';

import React, { useState } from 'react';
import { Check, Crown, Sparkles, X, Zap, ShieldCheck } from 'lucide-react';
import { PRO_PRICING, upgradePlan } from '@/lib/userAuth';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialBilling?: 'monthly' | 'yearly';
}

export default function UpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  initialBilling = 'yearly',
}: UpgradeModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(initialBilling);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentPlan = PRO_PRICING[billing];

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate activation / save PRO plan
    setTimeout(() => {
      upgradePlan(billing === 'yearly' ? 'pro_yearly' : 'pro');
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" />
            IELTSPrep PRO
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Eng aqlli AI modellarini oching
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Claude 3.5 Sonnet va Claude 3 Opus yordamida IELTS ballingizni 8.0+ darajaga chiqaring.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Oylik
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              billing === 'yearly'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Yillik</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
              -25%
            </span>
          </button>
        </div>

        {/* Price Box */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-center space-y-1">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {currentPlan.formattedPrice}
            </span>
            <span className="text-sm font-semibold text-slate-400">{currentPlan.period}</span>
          </div>
          <p className="text-xs text-slate-400">{currentPlan.desc}</p>
          {billing === 'yearly' && (
            <p className="text-xs font-bold text-emerald-400 pt-1">
              ✨ 30 000 so'm tejaladi (oyiga atigi 7 500 so'm)
            </p>
          )}
        </div>

        {/* Features list */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          {[
            { text: "Claude 3.5 Sonnet & Claude 3 Opus (Thinking) to'liq ochiq", highlight: true },
            { text: "IELTS Writing insholariga Band 8.5+ darajali chuqur tahlil", highlight: false },
            { text: "AI Maskot va Ovozli suhbatda cheksiz savol-javob", highlight: false },
            { text: "Gemini 2.0 Flash va ChatGPT (GPT-4o) tezkor modeli", highlight: false },
            { text: "Imtihon topshirish vaqtigacha barcha yangi imkoniyatlar", highlight: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-300">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.highlight
                    ? 'bg-amber-400/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className={item.highlight ? 'font-bold text-white' : ''}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Success Message or Action Button */}
        {success ? (
          <div className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm animate-in zoom-in-95">
            🎉 Tabriklaymiz! PRO tarif muvaffaqiyatli faollashtirildi!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>
                  PRO ga o'tish ({currentPlan.formattedPrice} {currentPlan.period})
                </span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Istalgan vaqtda bekor qilish yoki qayta yangilash mumkin</span>
        </div>
      </div>
    </div>
  );
}
