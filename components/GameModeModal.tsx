'use client';

import React, { useState } from 'react';
import { GameMode, GAME_MODES } from '@/lib/types';
import { Sparkles, Trophy, Zap, Shield, Crown, Gem, X, ArrowRight } from 'lucide-react';

interface GameModeModalProps {
  isOpen: boolean;
  lessonTitle: string;
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

export default function GameModeModal({
  isOpen,
  lessonTitle,
  onClose,
  onSelectMode,
}: GameModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('gold');

  if (!isOpen) return null;

  const modes: GameMode[] = ['normal', 'gold', 'diamond'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-300 ${
            selectedMode === 'diamond'
              ? 'bg-cyan-500'
              : selectedMode === 'gold'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />

        {/* Header */}
        <div className="space-y-1 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            O'yin Rejimini Tanlang
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {lessonTitle}
          </h2>
          <p className="text-xs text-slate-400">
            Qiyinlik darajasini tanlang: yuqori rejimda savollar ko'proq, qiyinroq va XP 2x gacha oshiriladi!
          </p>
        </div>

        {/* 3 Modes Grid */}
        <div className="space-y-3 relative z-10">
          {modes.map((modeKey) => {
            const config = GAME_MODES[modeKey];
            const isSelected = selectedMode === modeKey;

            return (
              <div
                key={modeKey}
                onClick={() => setSelectedMode(modeKey)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-4 text-left ${
                  isSelected
                    ? `${config.borderColor} bg-slate-800/90 ring-2 ring-white/20 shadow-xl scale-[1.02]`
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${
                      modeKey === 'diamond'
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/30'
                        : modeKey === 'gold'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
                        : 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30'
                    }`}
                  >
                    {modeKey === 'diamond' ? (
                      <Gem className="w-6 h-6 animate-pulse" />
                    ) : modeKey === 'gold' ? (
                      <Crown className="w-6 h-6" />
                    ) : (
                      <Shield className="w-6 h-6" />
                    )}
                  </div>

                  {/* Title & Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        {config.title}
                      </h3>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${config.gradient}`}
                      >
                        {config.multiplierText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {config.questionCount} ta topshiriq · {config.difficultyLabel}
                    </p>
                  </div>
                </div>

                {/* Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-white bg-white' : 'border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={() => onSelectMode(selectedMode)}
            className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r ${GAME_MODES[selectedMode].gradient}`}
          >
            <span>
              {GAME_MODES[selectedMode].name} Rejimda Boshlash ({GAME_MODES[selectedMode].multiplierText})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
