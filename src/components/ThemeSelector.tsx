import React, { useState } from 'react';
import { BookTheme } from '../types';
import { THEME_PRESETS } from '../generators/themePresets';
import { Sparkles, Wand2, Shield, Crown, Rocket, Waves, Compass, Loader2 } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme: BookTheme;
  onSelectTheme: (theme: BookTheme) => void;
  onEnrichCustomTheme: (themePrompt: string) => Promise<void>;
  isLoadingAi: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onEnrichCustomTheme,
  isLoadingAi,
}) => {
  const [customInput, setCustomInput] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4 text-cyan-400" />;
      case 'Waves':
        return <Waves className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onEnrichCustomTheme(customInput.trim());
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" />
            Theme & AI Orchestrator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a bestseller preset or vibe-code any custom theme with Gemini AI
          </p>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {THEME_PRESETS.map((preset) => {
          const isActive = currentTheme.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectTheme(preset)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {getIcon(preset.icon)}
                <span className={`text-xs font-semibold ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {preset.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">{preset.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Theme Prompt Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type any custom theme: e.g. 'Spider-Man Avengers', 'Disney Encanto', 'Kawaii Anime Animals'..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-24"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
            Gemini 3.8
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoadingAi || !customInput.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition shadow-lg shadow-indigo-500/20 whitespace-nowrap"
        >
          {isLoadingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating Theme...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Generate Theme
            </>
          )}
        </button>
      </form>
    </div>
  );
};
