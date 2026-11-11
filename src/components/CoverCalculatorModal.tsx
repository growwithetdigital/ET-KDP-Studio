import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Palette, Image as ImageIcon, Layers, Book } from 'lucide-react';
import { generate4kCoverPrompt } from '../generators/coverPrompt';
import { BookTheme, TargetAudience } from '../types';

interface CoverCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageCount: number;
  theme: BookTheme;
  audience: TargetAudience;
}

export const CoverCalculatorModal: React.FC<CoverCalculatorModalProps> = ({
  isOpen,
  onClose,
  pageCount,
  theme,
  audience,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState<'midjourney' | 'dalle' | null>(null);
  const [activeTab, setActiveTab] = useState<'midjourney' | 'dalle' | 'dimensions'>('midjourney');
  const [paperType, setPaperType] = useState<'white' | 'cream'>('white');

  if (!isOpen) return null;

  const coverData = generate4kCoverPrompt(theme, audience, pageCount);

  const thicknessFactor = paperType === 'white' ? 0.002252 : 0.0025;
  const spineWidthInches = pageCount * thicknessFactor;
  const bleedInches = 0.125;
  const trimWidthInches = 8.5;
  const trimHeightInches = 11.0;

  const totalWidthInches = bleedInches + trimWidthInches + spineWidthInches + trimWidthInches + bleedInches;
  const totalHeightInches = bleedInches + trimHeightInches + bleedInches; // 11.25

  const pixelWidth = Math.round(totalWidthInches * 300);
  const pixelHeight = Math.round(totalHeightInches * 300);
  const spinePixels = Math.round(spineWidthInches * 300);

  const handleCopy = (text: string, type: 'midjourney' | 'dalle') => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(type);
    setTimeout(() => setCopiedPrompt(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-700 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                4K Book Cover Prompt & Dimensions Studio
              </h2>
              <p className="text-xs text-slate-500">
                Commercial prompt blueprints tailored for Midjourney v6, DALL-E 3 & Canvas Covers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('midjourney')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'midjourney'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Midjourney v6.1 (4K Wrap)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dalle')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'dalle'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            DALL-E 3 / Gemini Prompt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dimensions')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'dimensions'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Spine & Print Specs ({pageCount}p)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Midjourney Tab */}
          {activeTab === 'midjourney' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    Midjourney v6.1 Full Wrap Prompt
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Engineered for cinematic lighting, embossed typography, and 4K commercial resolution
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(coverData.fullMidjourneyPrompt, 'midjourney')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                >
                  {copiedPrompt === 'midjourney' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPrompt === 'midjourney' ? 'Copied Prompt!' : 'Copy 4K Prompt'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner select-all">
                {coverData.fullMidjourneyPrompt}
              </div>

              {/* Recommended Color Palette */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Palette size={13} className="text-indigo-600" />
                  Recommended Theme Color Harmony:
                </span>
                <div className="flex items-center gap-2">
                  {coverData.recommendedPalette.map((hex, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-[10px] text-slate-600">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DALL-E / Gemini Tab */}
          {activeTab === 'dalle' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    DALL-E 3 & Gemini Imagen Prompt
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Optimized natural-language prompt emphasizing typography and thematic elegance
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(coverData.dalleGeminiPrompt, 'dalle')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                >
                  {copiedPrompt === 'dalle' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPrompt === 'dalle' ? 'Copied Prompt!' : 'Copy Prompt'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 text-slate-800 rounded-xl font-serif text-xs leading-relaxed border border-slate-200 select-all">
                "{coverData.dalleGeminiPrompt}"
              </div>
            </div>
          )}

          {/* Dimensions Tab */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              {/* Paper selector */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">Calculated for {pageCount} Interior Pages:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperType('white')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      paperType === 'white'
                        ? 'bg-white border-indigo-600 text-indigo-700 shadow-2xs'
                        : 'bg-transparent border-slate-200 text-slate-600'
                    }`}
                  >
                    White Paper (0.00225" / page)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperType('cream')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      paperType === 'cream'
                        ? 'bg-white border-indigo-600 text-indigo-700 shadow-2xs'
                        : 'bg-transparent border-slate-200 text-slate-600'
                    }`}
                  >
                    Cream Paper (0.0025" / page)
                  </button>
                </div>
              </div>

              {/* Stats 3 columns */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Spine Thickness
                  </span>
                  <span className="text-base font-bold text-indigo-700 font-mono">
                    {spineWidthInches.toFixed(3)}"
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {spinePixels} px
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Total Wrap Width
                  </span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {totalWidthInches.toFixed(3)}"
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {pixelWidth} px @ 300 DPI
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Total Wrap Height
                  </span>
                  <span className="text-base font-bold text-slate-800 font-mono">
                    {totalHeightInches.toFixed(3)}"
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {pixelHeight} px @ 300 DPI
                  </span>
                </div>
              </div>

              {/* Visual Wrap Diagram */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                <div className="flex w-full max-w-md h-24 border-2 border-dashed border-slate-300 rounded-sm overflow-hidden text-center text-[10px]">
                  <div className="flex-1 bg-white flex flex-col justify-center border-r border-slate-200 p-2">
                    <span className="font-bold text-slate-700">BACK COVER</span>
                    <span className="text-slate-400 text-[9px]">8.5" × 11" + Bleed</span>
                  </div>
                  <div className="w-14 bg-indigo-50 border-r border-slate-200 flex flex-col justify-center font-mono text-[9px] text-indigo-700 font-bold">
                    <span>SPINE</span>
                    <span>{spineWidthInches.toFixed(2)}"</span>
                  </div>
                  <div className="flex-1 bg-white flex flex-col justify-center p-2">
                    <span className="font-bold text-indigo-950 uppercase">{theme.name}</span>
                    <span className="text-indigo-600 text-[9px]">FRONT COVER</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Canva / Photoshop Canvas Size: <b>{pixelWidth} px</b> × <b>{pixelHeight} px</b> at 300 DPI
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
