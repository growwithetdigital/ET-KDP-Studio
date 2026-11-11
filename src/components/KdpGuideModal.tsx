import React from 'react';
import { X, BookOpen, DollarSign, CheckCircle2, ShieldAlert, Sparkles, Download, Layers } from 'lucide-react';

interface KdpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KdpGuideModal: React.FC<KdpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Amazon KDP Vibe-Coding Playbook: Zero to Published
              </h2>
              <p className="text-xs text-slate-400">
                Complete guide to creating, exporting, and publishing 100-page activity books for free
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-300">
          {/* Quick Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-xl p-4">
            <h3 className="text-sm font-bold text-indigo-300 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              How this framework beats $30/mo tools like LitPal & Book Bolt
            </h3>
            <p className="text-slate-300 text-xs">
              Tools like LitPal and Book Bolt charge monthly subscriptions for basic black-and-white grids. 
              VibeBook Forge Studio gives you an all-in-one generator with <b>100 guaranteed non-repeating puzzles</b>, 
              authentic <b>alternating KDP gutter margins</b> (spine safe), vector crispness, built-in solution keys, 
              and direct Gemini AI theme enrichment completely free.
            </p>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">1</span>
              Step 1: Pick or Prompt Your Niche Theme
            </div>
            <p className="pl-8 text-slate-300">
              Use the Theme & AI Orchestrator at the top. You can choose from proven high-demand presets (Marvel Heroes, Disney Fairytales, Sci-Fi Cyberpunk, Ocean Reefs) or type any custom concept (e.g. <i>"Kawaii Magical Kittens"</i> or <i>"Retro 80s Video Games"</i>).
            </p>
            <div className="pl-8 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              💡 <b>Tip:</b> If Gemini API is connected, clicking <b>Auto-Generate Theme</b> immediately crafts 25 custom word search sub-themes, 25 AI coloring prompts, KDP bestseller title, 7 backend keywords, and HTML description.
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">2</span>
              Step 2: Generate & Review the 100 Dynamic Pages
            </div>
            <p className="pl-8 text-slate-300">
              The internal engine automatically balances the exact 100-page interior structure:
            </p>
            <ul className="pl-12 list-disc space-y-1 text-slate-300">
              <li><b>Pages 1–25:</b> Sudoku puzzles with progressive difficulty (8 Easy, 10 Medium, 7 Hard).</li>
              <li><b>Pages 26–50:</b> 13x13 Word Searches packed with 8–12 theme keywords in 8 directions.</li>
              <li><b>Pages 51–75:</b> Recursive labyrinth mazes with distinct entry & exit gates.</li>
              <li><b>Pages 76–100:</b> Relaxing vector mandalas or Gemini AI black-and-white line art.</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">3</span>
              Step 3: Export Print-Ready KDP Interior PDF
            </div>
            <p className="pl-8 text-slate-300">
              Click <b>Export 100-Page PDF</b> in the top right. You can choose to include the Solutions Appendix (recommended for customer satisfaction and reviews).
            </p>
            <div className="pl-8 grid grid-cols-2 gap-3 mt-1">
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">KDP Trim Size</span>
                <span className="text-indigo-400 font-mono">8.5 x 11 inches (US Letter)</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">KDP Bleed Setting</span>
                <span className="text-emerald-400 font-mono">Bleed (PDF only)</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">Interior Type</span>
                <span className="text-slate-300 font-mono">Black & white on White paper</span>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-0.5">Paperback Cover Finish</span>
                <span className="text-slate-300 font-mono">Matte or Glossy</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">4</span>
              Step 4: KDP Royalties & Passive Income Math
            </div>
            <p className="pl-8 text-slate-300">
              Amazon prints your books on demand (POD) whenever a customer orders. You have <b>$0 inventory risk</b>.
            </p>
            <div className="pl-8 bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-400 font-bold block">List Price: $7.99</span>
                <span className="text-slate-400">Amazon Print Cost: ~$2.15</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Amazon 60% Royalty:</span>
                <span className="text-emerald-300 font-bold text-sm">+$2.64 Net Profit / Sale</span>
              </div>
            </div>
            <p className="pl-8 text-[11px] text-slate-400">
              Selling just 10 copies per day across your catalog = <b>~$800/month recurring passive royalty</b>.
            </p>
          </div>

          {/* Important Trademark Advice */}
          <div className="space-y-2 bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Crucial Trademark Advice for Disney & Marvel Inspired Books
            </div>
            <p className="text-[11px] text-slate-300">
              Amazon KDP enforces strict trademark policies. To stay 100% compliant and avoid account suspension:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
              <li>
                <b>Do NOT use trademarked names in your Title or Subtitle:</b> Avoid "Disney Activity Book" or "Marvel Spider-Man".
              </li>
              <li>
                <b>DO use descriptive theme phrasing:</b> Use <i>"Superhero Multiverse Activity Book"</i>, <i>"Enchanted Princess & Magic Castle Puzzles"</i>, or <i>"Galactic Bounty Hunter Adventure"</i>.
              </li>
              <li>
                The puzzle word search vocabulary inside the book is safe for educational fair use, but the public cover and metadata must avoid direct brand logos.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            Got It, Let's Vibe Code!
          </button>
        </div>
      </div>
    </div>
  );
};
