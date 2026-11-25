'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  Lock,
  Sparkles,
  AlertTriangle,
  Info,
  Crown,
  Zap,
  Activity,
  Plus,
} from 'lucide-react';
import {
  AI_MODELS,
  AIModelType,
  ModelDefinition,
  UserProfile,
  canUseModel,
  isProUser,
  setActiveModel,
} from '@/lib/userAuth';
import UpgradeModal from './UpgradeModal';

interface ModelSelectorProps {
  currentUser: UserProfile | null;
  onModelChange?: (model: AIModelType) => void;
  className?: string;
}

export default function ModelSelector({
  currentUser,
  onModelChange,
  className = '',
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPro = isProUser(currentUser);
  const currentModelId = currentUser?.activeModel || 'gemini';
  const activeModelDef =
    AI_MODELS.find((m) => m.id === currentModelId) || AI_MODELS[0];

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModel = (model: ModelDefinition) => {
    if (model.isPro && !isPro) {
      // User is on Free tier trying to select Claude -> show Upgrade modal!
      setShowUpgradeModal(true);
      setOpen(false);
      return;
    }

    setActiveModel(model.id);
    if (onModelChange) {
      onModelChange(model.id);
    }
    setOpen(false);
  };

  return (
    <>
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        {/* Trigger Button (matching Antigravity chat input selector) */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700/80 shadow-xs transition-all select-none"
        >
          <span className="text-slate-400 font-normal">
            <Plus className="w-3.5 h-3.5 inline -mt-0.5" />
          </span>
          <span className="font-bold truncate max-w-[150px]">
            {activeModelDef.name}
          </span>
          {activeModelDef.isPro ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              PRO
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">Medium</span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Popover Menu (Matching screenshot style) */}
        {open && (
          <div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Model
            </div>

            {/* Models List */}
            <div className="space-y-1">
              {AI_MODELS.map((model) => {
                const isSelected = model.id === currentModelId;
                const isLocked = model.isPro && !isPro;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelectModel(model)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors group ${
                      isSelected
                        ? 'bg-slate-800/90 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {model.name}
                          </span>

                          {/* Model Tags */}
                          {model.isPro ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                              <Crown className="w-2.5 h-2.5" />
                              Paid Pro ⓘ
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex-shrink-0">
                              Free
                            </span>
                          )}

                          {model.notice && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400/80">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Notice ⓘ
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    {/* Right status: checkmark or lock */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-400 font-bold" />
                      )}
                      {isLocked && !isSelected && (
                        <span className="text-slate-500 group-hover:text-amber-400 transition">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Section */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between px-3 py-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  View Usage
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isPro ? 'PRO tarif' : 'Free tarif'}
                </span>
              </div>

              {/* Notice Card with Upgrade Link */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/70 rounded-xl space-y-1.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Free foydalanuvchilar <strong className="text-white">Gemini</strong> va{' '}
                  <strong className="text-white">ChatGPT</strong> dan erkin foydalanadilar.
                  Eng yuqori aniqlikdagi <strong className="text-amber-300">Claude</strong> modelini ochish uchun PRO ga o'ting.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setShowUpgradeModal(true);
                    }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
                  >
                    View plans (10 000 so'm/oy) →
                  </button>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Yillik: 90 000 so'm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          // If upgraded, automatically set to claude
          setActiveModel('claude');
          if (onModelChange) onModelChange('claude');
        }}
      />
    </>
  );
}
