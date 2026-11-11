import React, { useState } from 'react';
import { X, Tag, Copy, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-100 text-purple-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Amazon KDP Listing Metadata</h2>
              <p className="text-xs text-slate-500">
                SEO-optimized title, subtitle, 7 backend keywords & HTML description
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">Book Title</span>
              <button
                onClick={() => copyToClipboard(theme.kdpTitle, 'title')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copiedKey === 'title' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedKey === 'title' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium">
              {theme.kdpTitle}
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">Subtitle</span>
              <button
                onClick={() => copyToClipboard(theme.kdpSubtitle, 'subtitle')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copiedKey === 'subtitle' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedKey === 'subtitle' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
              {theme.kdpSubtitle}
            </div>
          </div>

          {/* 7 Amazon KDP Backend Keywords */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800">
                7 Amazon KDP Backend Search Keywords
              </span>
              <button
                onClick={() => copyToClipboard(theme.kdpKeywords.join(', '), 'all-keywords')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copiedKey === 'all-keywords' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedKey === 'all-keywords' ? 'Copied All' : 'Copy All 7'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {theme.kdpKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-[11px]"
                >
                  <span className="text-slate-700">
                    <span className="text-slate-400 mr-1.5">{i + 1}.</span>
                    {kw}
                  </span>
                  <button
                    onClick={() => copyToClipboard(kw, `kw-${i}`)}
                    className="text-slate-400 hover:text-slate-700 ml-2"
                  >
                    {copiedKey === `kw-${i}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HTML Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">Formatted HTML Description</span>
              <button
                onClick={() => copyToClipboard(theme.kdpDescription, 'desc')}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copiedKey === 'desc' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                <span>{copiedKey === 'desc' ? 'Copied HTML' : 'Copy HTML'}</span>
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {theme.kdpDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
