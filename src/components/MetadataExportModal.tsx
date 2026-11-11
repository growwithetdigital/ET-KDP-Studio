import React, { useState } from 'react';
import { X, Tag, Copy, Check, FileText } from 'lucide-react';
import { BookTheme } from '../types';

interface MetadataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: BookTheme;
}

export const MetadataExportModal: React.FC<MetadataExportModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/30">
              <Tag className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Amazon KDP Listing Metadata</h2>
              <p className="text-xs text-slate-400">
                SEO-optimized title, subtitle, 7 backend keywords & HTML description
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">Book Title</span>
              <button
                onClick={() => copyToClipboard(theme.kdpTitle, 'title')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedKey === 'title' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedKey === 'title' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-medium">
              {theme.kdpTitle}
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">Subtitle</span>
              <button
                onClick={() => copyToClipboard(theme.kdpSubtitle, 'subtitle')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedKey === 'subtitle' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedKey === 'subtitle' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300">
              {theme.kdpSubtitle}
            </div>
          </div>

          {/* 7 Amazon KDP Backend Keywords */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200">
                7 Amazon KDP Backend Search Keywords
              </span>
              <button
                onClick={() => copyToClipboard(theme.kdpKeywords.join(', '), 'all-keywords')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedKey === 'all-keywords' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedKey === 'all-keywords' ? 'Copied All' : 'Copy All 7'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {theme.kdpKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-[11px]"
                >
                  <span className="text-slate-300 font-mono">
                    <span className="text-slate-600 mr-1.5">{i + 1}.</span>
                    {kw}
                  </span>
                  <button
                    onClick={() => copyToClipboard(kw, `kw-${i}`)}
                    className="text-slate-500 hover:text-slate-300 ml-2"
                  >
                    {copiedKey === `kw-${i}` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <span className="font-semibold text-slate-200 block mb-1">Recommended Amazon Categories</span>
            <div className="flex flex-wrap gap-2">
              {theme.kdpCategories.map((cat, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 font-mono text-[11px]"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* HTML Book Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">Formatted HTML Description</span>
              <button
                onClick={() => copyToClipboard(theme.kdpDescription, 'desc')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedKey === 'desc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedKey === 'desc' ? 'Copied HTML' : 'Copy HTML'}
              </button>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
              {theme.kdpDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
