import React, { useState } from 'react';
import { X, Calculator, Copy, Check, Sparkles } from 'lucide-react';

interface CoverCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageCount: number;
  themeTitle: string;
}

export const CoverCalculatorModal: React.FC<CoverCalculatorModalProps> = ({
  isOpen,
  onClose,
  pageCount,
  themeTitle,
}) => {
  const [pages, setPages] = useState(pageCount);
  const [paperType, setPaperType] = useState<'white' | 'cream'>('white');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // KDP Paperback Formulas (8.5 x 11 inches)
  // White paper thickness factor = 0.002252 in / page
  // Cream paper thickness factor = 0.0025 in / page
  const thicknessFactor = paperType === 'white' ? 0.002252 : 0.0025;
  const spineWidthInches = pages * thicknessFactor;
  const bleedInches = 0.125;
  const trimWidthInches = 8.5;
  const trimHeightInches = 11.0;

  const totalWidthInches = bleedInches + trimWidthInches + spineWidthInches + trimWidthInches + bleedInches;
  const totalHeightInches = bleedInches + trimHeightInches + bleedInches; // 11.25

  // 300 DPI calculations
  const pixelWidth = Math.round(totalWidthInches * 300);
  const pixelHeight = Math.round(totalHeightInches * 300);
  const spinePixels = Math.round(spineWidthInches * 300);

  const aiCoverPrompt = `Stunning commercial book cover illustration for an Amazon KDP paperback activity book titled "${themeTitle}". Vibrant high-contrast digital art, bold central character artwork, clean empty title banner area at top, 300 DPI, commercial vector graphic style, professional graphic design, masterpiece.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiCoverPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <Calculator className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">KDP Cover & Spine Calculator</h2>
              <p className="text-xs text-slate-400">
                Exact dimensions for designing your full wrap-around paperback cover
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Total Interior Page Count:
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(Math.max(24, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                (100 puzzle pages + 19 solutions pages = 119 pages)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Paper Type:
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPaperType('white')}
                  className={`flex-1 py-2 text-xs font-medium transition ${
                    paperType === 'white' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  White Paper
                </button>
                <button
                  type="button"
                  onClick={() => setPaperType('cream')}
                  className={`flex-1 py-2 text-xs font-medium transition ${
                    paperType === 'cream' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Cream Paper
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Spine Width
              </span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {spineWidthInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                {spinePixels} px @ 300 DPI
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Total Cover Width
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {totalWidthInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                {pixelWidth} px @ 300 DPI
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Total Cover Height
              </span>
              <span className="text-base font-bold text-indigo-400 font-mono">
                {totalHeightInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                {pixelHeight} px @ 300 DPI
              </span>
            </div>
          </div>

          {/* Visual Wrap Diagram */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-400 mb-2">
              Full Wrap-Around Cover Blueprint
            </span>
            <div className="flex w-full max-w-md h-24 border-2 border-dashed border-slate-600 rounded-sm overflow-hidden text-center text-[10px]">
              <div className="flex-1 bg-slate-800/60 flex flex-col justify-center border-r border-slate-700">
                <span className="font-bold text-slate-300">BACK COVER</span>
                <span className="text-slate-500 text-[9px]">8.5" + 0.125" Bleed</span>
              </div>
              <div
                className="bg-amber-500/20 border-r border-slate-700 flex flex-col justify-center px-1 font-mono text-[9px] text-amber-300"
                style={{ width: `${Math.max(12, Math.min(24, spineWidthInches * 60))}%` }}
              >
                <span>SPINE</span>
                <span>{spineWidthInches.toFixed(2)}"</span>
              </div>
              <div className="flex-1 bg-indigo-900/40 flex flex-col justify-center">
                <span className="font-bold text-indigo-200">FRONT COVER</span>
                <span className="text-indigo-400 text-[9px]">8.5" + 0.125" Bleed</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-mono">
              Canva Custom Size setting: {pixelWidth} px × {pixelHeight} px
            </span>
          </div>

          {/* AI Cover Prompt Generator */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles size={13} className="text-purple-400" />
                Suggested AI Cover Prompt (for Gemini / Midjourney)
              </span>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
              "{aiCoverPrompt}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
