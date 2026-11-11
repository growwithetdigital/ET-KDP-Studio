import React from 'react';
import { X, BookOpen, ShieldAlert, Sparkles, CheckCircle2, TrendingUp, Layers, BookCheck } from 'lucide-react';

interface KdpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KdpGuideModal: React.FC<KdpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Amazon KDP Bestseller Blueprint & Publishing Strategy
              </h2>
              <p className="text-xs text-slate-500">
                Data-backed strategies from top-earning puzzle publishers & industry research
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-slate-600">
          {/* Rule 1: Sub-Niche Targeting Banner */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-indigo-950 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              1. Never Publish Generic Titles (The #1 Mistake)
            </h3>
            <p className="text-indigo-900 text-xs">
              Titles like <i>"Word Search Book"</i> or <i>"Sudoku Puzzles"</i> face over 50,000+ established competitors. 
              Instead, dominate high-buyer intent sub-niches:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[11px] text-indigo-950">
              <li><b>Kids Ages 4–8:</b> <i>"Construction Vehicle Coloring and Maze Book for Kids Ages 4–8"</i></li>
              <li><b>Adults / Pet Enthusiasts:</b> <i>"Dog Lovers Word Search & Sudoku Combo"</i></li>
              <li><b>Seniors / Low-Vision:</b> <i>"Large Print Brain Games & Word Searches for Seniors"</i></li>
            </ul>
          </div>

          {/* Rule 2: Age-Appropriate Puzzle Sizing */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white">2</span>
              Match Age Group to Puzzle Calibration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs">Kids (Ages 4–8)</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Thick vector lines, 10x10 word search (forward & down only), 15x15 wide-corridor mazes, and junior 6x6 Sudoku.
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs">Teens & Adults</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  13x13 word searches with full 8 directions, 23x23 to 27x27 intricate labyrinths, and progressive 9x9 Sudoku.
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block text-xs">Seniors (Large Print)</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  18pt extra-bold text, high-contrast spacious grids, gentle cognitive stimulation, zero eye strain.
                </p>
              </div>
            </div>
          </div>

          {/* Rule 3: The Golden Rule (Solutions Section) */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <BookCheck className="w-4 h-4 text-emerald-700" />
              <span>3. The Golden Rule: 100% Verified Matching Solution Keys</span>
            </div>
            <p className="text-[11px] text-emerald-900">
              Missing, mismatched, or misnumbered answer keys are the <b>#1 reason activity books receive 1-star reviews</b> on Amazon KDP. 
              VibeBook Forge Studio programmatically links every Sudoku grid, Word Search placement, and Maze path directly to its corresponding solution key at the back of the book with zero manual errors.
            </p>
          </div>

          {/* Rule 4: Volume & Page Count Guidelines */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white">4</span>
              Industry Standard Puzzle Counts
            </div>
            <ul className="pl-5 list-disc space-y-1 text-slate-600 text-[11px]">
              <li><b>Word Search Books:</b> 50 to 100 puzzles per book (use the 50p or 100p volume selector).</li>
              <li><b>Sudoku Books:</b> 50 to 100 large-print puzzles, or 200+ puzzles in compact layouts.</li>
              <li><b>Mazes & Coloring Workbooks:</b> 30 to 80 pages with escalating difficulty.</li>
              <li><b>Combo 4-in-1 Books:</b> 100 pages combining all 4 formats to rank across multiple Amazon categories simultaneously!</li>
            </ul>
          </div>

          {/* Rule 5: Series Scaling */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>5. Scale into an Amazon Brand & Series</span>
            </div>
            <p className="text-[11px] text-amber-900">
              Once you publish a winning book (e.g. <i>Dog Lovers Word Search</i>), use the <b>Series Cloner</b> bar to instantly duplicate the exact interior structure for <i>Cat Lovers</i>, <i>Horse Lovers</i>, and <i>Bird Watchers</i>. Consistent branding encourages Amazon's algorithm to recommend your books together!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
