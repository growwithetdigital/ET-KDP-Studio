import React, { useState } from 'react';
import { BookTheme, TargetAudience } from '../types';
import { THEME_PRESETS } from '../generators/themePresets';
import { Sparkles, Wand2, Dog, Truck, Eye, Flower2, Compass, Loader2, CopyPlus, ArrowRight } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: BookTheme;
  onSelectTheme: (theme: BookTheme) => void;
  onEnrichCustomTheme: (themePrompt: string, targetAudience?: TargetAudience) => Promise<void>;
  isLoadingAi: boolean;
  selectedAudience: TargetAudience;
  onChangeAudience: (aud: TargetAudience) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onEnrichCustomTheme,
  isLoadingAi,
  selectedAudience,
  onChangeAudience,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [targetAudienceInput, setTargetAudienceInput] = useState<TargetAudience>(selectedAudience);

  const getThemeIcon = (id: string) => {
    switch (id) {
      case 'dog-lovers-combo':
        return <Dog className="w-4 h-4 text-amber-600" />;
      case 'construction-kids':
        return <Truck className="w-4 h-4 text-orange-600" />;
      case 'large-print-seniors':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'mindful-botanical':
        return <Flower2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Compass className="w-4 h-4 text-indigo-600" />;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onEnrichCustomTheme(customInput.trim(), targetAudienceInput);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header & Audience Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            Target Niche & Audience Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated for Amazon KDP bestsellers: avoid generic titles with hyper-specific buyer niches
          </p>
        </div>

        {/* Target Audience Pill Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(
            [
              { id: 'kids', label: 'Kids (4–8)' },
              { id: 'adults', label: 'Adults / Calming' },
              { id: 'seniors', label: 'Seniors (Large Print)' },
            ] as const
          ).map((aud) => (
            <button
              key={aud.id}
              onClick={() => {
                onChangeAudience(aud.id);
                setTargetAudienceInput(aud.id);
              }}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedAudience === aud.id
                  ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Hyper-Niches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentTheme.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                onSelectTheme(preset);
                onChangeAudience(preset.targetAudience);
              }}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-1 ring-indigo-400/30'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 w-full justify-between">
                <div className="flex items-center gap-1.5">
                  {getThemeIcon(preset.id)}
                  <span className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {preset.name}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded mb-1">
                {preset.targetAgeLabel}
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2">{preset.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Series Multiplier / Cloner Bar */}
      {currentTheme.sisterThemes && currentTheme.sisterThemes.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <CopyPlus className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Scale into an Amazon Series: </span>
              <span className="text-slate-600">Clone this proven layout into sister niches</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {currentTheme.sisterThemes.map((sister, sIdx) => (
              <button
                key={sIdx}
                onClick={() => onEnrichCustomTheme(sister, currentTheme.targetAudience)}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-medium text-[11px] hover:bg-amber-100/60 transition shadow-2xs flex items-center gap-1"
              >
                <span>{sister}</span>
                <ArrowRight size={10} className="text-amber-600" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Theme Prompt Input with Audience Choice */}
      <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type any hyper-niche: e.g. 'Horse & Equestrian Lovers Combo', 'Construction Diggers for Boys 4-8', '1960s Music Word Search for Seniors'..."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
            Gemini AI
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoadingAi || !customInput.trim()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition shadow-xs whitespace-nowrap"
        >
          {isLoadingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Niche...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Generate Niche Book</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
