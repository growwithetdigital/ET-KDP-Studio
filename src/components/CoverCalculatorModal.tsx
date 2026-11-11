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

  const thicknessFactor = paperType === 'white' ? 0.002252 : 0.0025;
  const spineWidthInches = pages * thicknessFactor;
  const bleedInches = 0.125;
  const trimWidthInches = 8.5;
  const trimHeightInches = 11.0;

  const totalWidthInches = bleedInches + trimWidthInches + spineWidthInches + trimWidthInches + bleedInches;
  const totalHeightInches = bleedInches + trimHeightInches + bleedInches; // 11.25

  const pixelWidth = Math.round(totalWidthInches * 300);
  const pixelHeight = Math.round(totalHeightInches * 300);
  const spinePixels = Math.round(spineWidthInches * 300);

  const aiCoverPrompt = `Calming, artistic paperback book cover illustration for a relaxing activity book titled "${themeTitle}". Elegant botanical and nature aesthetic, soft soothing colors, minimalist typography space, commercial vector art, peaceful, 300 DPI masterpiece.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiCoverPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">KDP Cover & Spine Calculator</h2>
              <p className="text-xs text-slate-500">
                Exact pixel and inch dimensions for designing your full paperback cover
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Total Interior Page Count:
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(Math.max(20, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Paper Color:
              </label>
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaperType('white')}
                  className={`flex-1 py-1.5 text-xs font-medium transition ${
                    paperType === 'white' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() => setPaperType('cream')}
                  className={`flex-1 py-1.5 text-xs font-medium transition ${
                    paperType === 'cream' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  Cream
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Spine Width
              </span>
              <span className="text-base font-bold text-indigo-700 font-mono">
                {spineWidthInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {spinePixels} px @ 300 DPI
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Total Cover Width
              </span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {totalWidthInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {pixelWidth} px @ 300 DPI
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Total Cover Height
              </span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {totalHeightInches.toFixed(3)}"
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {pixelHeight} px @ 300 DPI
              </span>
            </div>
          </div>

          {/* Visual Wrap Diagram */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-600 mb-2">
              Full Wrap-Around Cover Blueprint
            </span>
            <div className="flex w-full max-w-sm h-20 border-2 border-dashed border-slate-300 rounded-sm overflow-hidden text-center text-[10px]">
              <div className="flex-1 bg-white flex flex-col justify-center border-r border-slate-200">
                <span className="font-bold text-slate-700">BACK</span>
                <span className="text-slate-400 text-[9px]">8.5" + Bleed</span>
              </div>
              <div className="w-12 bg-indigo-50 border-r border-slate-200 flex flex-col justify-center font-mono text-[9px] text-indigo-700">
                <span>SPINE</span>
                <span>{spineWidthInches.toFixed(2)}"</span>
              </div>
              <div className="flex-1 bg-white flex flex-col justify-center">
                <span className="font-bold text-indigo-900">FRONT</span>
                <span className="text-indigo-600 text-[9px]">8.5" + Bleed</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-mono">
              Canva Custom Canvas Size: <b>{pixelWidth} px</b> × <b>{pixelHeight} px</b>
            </span>
          </div>

          {/* AI Cover Prompt */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-600" />
                Prompt for Cover Art
              </span>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{aiCoverPrompt}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
