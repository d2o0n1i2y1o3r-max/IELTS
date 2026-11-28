'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, X, Zap, Crown, Flame } from 'lucide-react';

export type ChestRarity = 'rare' | 'super-rare' | 'mythic' | 'legendary';

interface MysteryChestModalProps {
  isOpen: boolean;
  chestId: string;
  onClose: () => void;
  onClaim: (xpWon: number, rarity: ChestRarity) => void;
  userId?: string;
}

interface RarityConfig {
  name: string;
  title: string;
  xp: number;
  badgeColor: string;
  glowColor: string;
  borderColor: string;
  icon: any;
  textColor: string;
  dropRateText: string;
}

const RARITY_CONFIGS: Record<ChestRarity, RarityConfig> = {
  rare: {
    name: 'Rare',
    title: "Noyob Sovg'a (Rare)",
    xp: 25,
    badgeColor: 'bg-emerald-500',
    glowColor: 'shadow-emerald-500/50',
    borderColor: 'border-emerald-500',
    icon: Sparkles,
    textColor: 'text-emerald-500',
    dropRateText: 'Oddiy noyoblik (50%)',
  },
  'super-rare': {
    name: 'Super Rare',
    title: "Juda Noyob Sovg'a (Super Rare)",
    xp: 50,
    badgeColor: 'bg-blue-500',
    glowColor: 'shadow-blue-500/50',
    borderColor: 'border-blue-500',
    icon: Zap,
    textColor: 'text-blue-500',
    dropRateText: 'Katta sovg\'a (30%)',
  },
  mythic: {
    name: 'Mythic',
    title: "Afsonaviy Sovg'a (Mythic)",
    xp: 100,
    badgeColor: 'bg-purple-600',
    glowColor: 'shadow-purple-500/60',
    borderColor: 'border-purple-500',
    icon: Flame,
    textColor: 'text-purple-400',
    dropRateText: 'Kam uchraydigan (15%)',
  },
  legendary: {
    name: 'Legendary',
    title: "Tarixiy Sovg'a (Legendary)",
    xp: 200,
    badgeColor: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600',
    glowColor: 'shadow-amber-500/80',
    borderColor: 'border-amber-400',
    icon: Crown,
    textColor: 'text-amber-400',
    dropRateText: 'Ultra noyob (5%)',
  },
};

export default function MysteryChestModal({
  isOpen,
  chestId,
  onClose,
  onClaim,
  userId = 'user-default',
}: MysteryChestModalProps) {
  const [hitsRemaining, setHitsRemaining] = useState(4);
  const [shaking, setShaking] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [rarity, setRarity] = useState<ChestRarity>('rare');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHitsRemaining(4);
      setIsOpened(false);
      setShaking(false);
      setClaiming(false);

      // Roll rarity
      const rand = Math.random() * 100;
      if (rand < 5) {
        setRarity('legendary'); // 5%
      } else if (rand < 20) {
        setRarity('mythic'); // 15%
      } else if (rand < 50) {
        setRarity('super-rare'); // 30%
      } else {
        setRarity('rare'); // 50%
      }
    }
  }, [isOpen, chestId]);

  if (!isOpen) return null;

  const playHitSound = (freq = 150) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const playVictoryFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch {}
  };

  const handleHit = () => {
    if (hitsRemaining <= 0 || isOpened) return;

    const nextHits = hitsRemaining - 1;
    setHitsRemaining(nextHits);

    // Vibration / Shake
    setShaking(true);
    setTimeout(() => setShaking(false), 250);

    if (nextHits > 0) {
      playHitSound(120 + (4 - nextHits) * 60);
    } else {
      // 4th hit: Burst open!
      setIsOpened(true);
      playVictoryFanfare();
    }
  };

  const handleClaimReward = async () => {
    if (claiming) return;
    setClaiming(true);

    const config = RARITY_CONFIGS[rarity];

    try {
      await fetch('/api/learn/chest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          chestId,
          xpReward: config.xp,
          rarity,
        }),
      });
    } catch (err) {
      console.error('Failed to sync chest reward:', err);
    }

    onClaim(config.xp, rarity);
    onClose();
  };

  const currentConfig = RARITY_CONFIGS[rarity];
  const RarityIcon = currentConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-500 ${
            isOpened ? currentConfig.badgeColor : 'bg-amber-500'
          }`}
        />

        {!isOpened ? (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" />
                Sehrli Sovg'a Sandig'i
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Sandiqni ochish uchun 4 marta bosing!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Har bir zarba sandiqni yorib boradi va ichidagi noyob XP sovg'asini ochadi.
              </p>
            </div>

            {/* Interactive Chest Graphic */}
            <div className="py-4 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={handleHit}
                className={`relative group cursor-pointer transition-all active:scale-90 select-none ${
                  shaking ? 'animate-bounce scale-105' : 'hover:scale-105'
                }`}
              >
                {/* 3D Chest Visual */}
                <div className="w-44 h-40 bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 rounded-2xl border-4 border-amber-300 shadow-2xl shadow-amber-500/30 flex flex-col justify-between p-3 relative overflow-hidden">
                  {/* Metal bands */}
                  <div className="absolute inset-y-0 left-6 w-3 bg-amber-900/60 border-x border-amber-300/40" />
                  <div className="absolute inset-y-0 right-6 w-3 bg-amber-900/60 border-x border-amber-300/40" />

                  {/* Chest Lid Rim */}
                  <div className="w-full h-8 bg-amber-400/80 rounded-lg border-b-2 border-amber-800 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-amber-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-800" />
                    </div>
                  </div>

                  {/* Cracks Overlay depending on hits */}
                  {hitsRemaining <= 3 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <svg className="w-full h-full stroke-amber-200 fill-none" viewBox="0 0 100 100">
                        <path d="M 30,30 L 45,55 L 40,75" strokeWidth="2.5" strokeDasharray="2,1" />
                      </svg>
                    </div>
                  )}

                  {hitsRemaining <= 2 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <svg className="w-full h-full stroke-yellow-100 fill-none" viewBox="0 0 100 100">
                        <path d="M 70,25 L 55,50 L 65,80" strokeWidth="3" />
                      </svg>
                    </div>
                  )}

                  {hitsRemaining === 1 && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pulse">
                      <svg className="w-full h-full stroke-white fill-none" viewBox="0 0 100 100">
                        <path d="M 50,20 L 50,85 M 20,50 L 80,50" strokeWidth="3.5" />
                      </svg>
                    </div>
                  )}

                  {/* Lock badge */}
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-300 border-2 border-amber-800 flex items-center justify-center shadow-md">
                    <span className="text-sm font-black text-amber-900">{hitsRemaining}</span>
                  </div>
                </div>

                {/* Tap hint text */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-slate-900 font-extrabold text-xs shadow-lg shadow-amber-500/40 animate-pulse">
                  👆 Sandiq ustiga bosing! ({hitsRemaining}/4)
                </div>
              </button>
            </div>

            {/* Hits Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Zarbalar: {4 - hitsRemaining} / 4</span>
                <span>
                  {hitsRemaining === 1
                    ? 'Oxirgi kuchli zarba!'
                    : `Yana ${hitsRemaining} ta qoldi`}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${((4 - hitsRemaining) / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Burst Open Reward Screen */
          <div className="space-y-6 animate-in zoom-in-90 duration-300">
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wider mb-2 shadow-lg ${currentConfig.badgeColor}`}
              >
                <RarityIcon className="w-4 h-4" />
                {currentConfig.name} Sovg'a!
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">
                TABRIKLAYMIZ! 🎉
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sandiq ochildi! Sizga quyidagi sovrin tushdi:
              </p>
            </div>

            {/* Glowing Reward Card */}
            <div
              className={`p-6 rounded-3xl bg-slate-800/80 border-2 ${currentConfig.borderColor} shadow-2xl ${currentConfig.glowColor} space-y-3 relative overflow-hidden`}
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border-2 border-white/10 flex items-center justify-center shadow-inner">
                <RarityIcon className={`w-10 h-10 ${currentConfig.textColor} animate-pulse`} />
              </div>

              <div>
                <div className={`text-3xl sm:text-4xl font-black ${currentConfig.textColor}`}>
                  +{currentConfig.xp} XP
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {currentConfig.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentConfig.dropRateText}
                </div>
              </div>
            </div>

            {/* Claim Button */}
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={claiming}
              className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform active:scale-95 ${currentConfig.badgeColor} hover:brightness-110 flex items-center justify-center gap-2`}
            >
              {claiming ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  XP ni qabul qilish va davom etish
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
