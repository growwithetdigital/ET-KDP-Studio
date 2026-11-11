import React, { useState } from 'react';
import {
  BookSectionConfig,
  PuzzleType,
  TargetAudience,
} from '../types';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Grid3X3,
  Search,
  Compass,
  Palette,
  CheckCircle2,
  FileText,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface SectionComposerProps {
  sections: BookSectionConfig[];
  onUpdateSections: (sections: BookSectionConfig[]) => void;
  totalPages: number;
  totalSolutionPages: number;
  targetAudience: TargetAudience;
  onExportBookPdf: () => void;
  isExporting: boolean;
}

export const SectionComposer: React.FC<SectionComposerProps> = ({
  sections,
  onUpdateSections,
  totalPages,
  totalSolutionPages,
  targetAudience,
  onExportBookPdf,
  isExporting,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState<PuzzleType>('sudoku');
  const [selectedCountToAdd, setSelectedCountToAdd] = useState<number>(25);

  const getSectionIcon = (type: PuzzleType) => {
    switch (type) {
      case 'sudoku':
        return <Grid3X3 size={15} className="text-indigo-600" />;
      case 'wordsearch':
        return <Search size={15} className="text-emerald-600" />;
      case 'maze':
        return <Compass size={15} className="text-amber-600" />;
      case 'coloring':
        return <Palette size={15} className="text-purple-600" />;
    }
  };

  const getSectionDefaultTitle = (type: PuzzleType, count: number) => {
    switch (type) {
      case 'sudoku':
        return `Sudoku Puzzles (${count} Pages • Easy to Hard)`;
      case 'wordsearch':
        return `Word Searches (${count} Pages • 8 Directions)`;
      case 'maze':
        return `Labyrinth Mazes (${count} Pages • 3 Difficulty Tiers)`;
      case 'coloring':
        return `Mindful Coloring Art (${count} Pages • Sacred Motifs)`;
    }
  };

  const handleAddSection = () => {
    const newSection: BookSectionConfig = {
      id: `sec-${Date.now()}`,
      type: selectedTypeToAdd,
      title: getSectionDefaultTitle(selectedTypeToAdd, selectedCountToAdd),
      pageCount: selectedCountToAdd,
      splitDifficulty: true,
    };
    onUpdateSections([...sections, newSection]);
    setShowAddMenu(false);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) {
      alert('A book must contain at least one section.');
      return;
    }
    onUpdateSections(sections.filter((s) => s.id !== id));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    onUpdateSections(updated);
  };

  const handleChangePageCount = (id: string, count: number) => {
    onUpdateSections(
      sections.map((s) =>
        s.id === id
          ? {
              ...s,
              pageCount: count,
              title: getSectionDefaultTitle(s.type, count),
            }
          : s
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Book Formats & Section Composer
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {sections.length} Formats Selected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, combine, and arrange custom puzzle sections into a unified deluxe activity book
          </p>
        </div>

        {/* Total Book Summary Pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <FileText size={13} className="text-indigo-600" />
            <span className="font-bold text-slate-900">{totalPages}</span>
            <span className="text-slate-500">Interior Pages</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="text-[11px] text-slate-500">
            + <span className="font-semibold text-slate-700">{totalSolutionPages}</span> Solution Pages
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            1/3 Easy • 1/3 Med • 1/3 Hard
          </span>
        </div>
      </div>

      {/* Sections Stack */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const easyCount = Math.ceil(section.pageCount / 3);
          const medCount = Math.ceil(section.pageCount / 3);
          const hardCount = section.pageCount - easyCount - medCount;

          return (
            <div
              key={section.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shadow-2xs">
                  {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {getSectionIcon(section.type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {section.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
                        ● Easy ({easyCount}p)
                      </span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold bg-amber-50 px-1 rounded">
                        ●● Med ({medCount}p)
                      </span>
                      <span>•</span>
                      <span className="text-rose-700 font-semibold bg-rose-50 px-1 rounded">
                        ●●● Hard ({hardCount}p)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Page Count Selector */}
                <select
                  value={section.pageCount}
                  onChange={(e) => handleChangePageCount(section.id, Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none shadow-2xs"
                >
                  <option value={10}>10 Pages</option>
                  <option value={15}>15 Pages</option>
                  <option value={20}>20 Pages</option>
                  <option value={25}>25 Pages (Standard)</option>
                  <option value={30}>30 Pages</option>
                  <option value={40}>40 Pages</option>
                  <option value={50}>50 Pages</option>
                </select>

                {/* Move Up/Down */}
                <div className="flex bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 border-r border-slate-100"
                    title="Move section up"
                  >
                    <MoveUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30"
                    title="Move section down"
                  >
                    <MoveDown size={13} />
                  </button>
                </div>

                {/* Delete Section */}
                <button
                  onClick={() => handleRemoveSection(section.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove this section"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Section Drawer / Bar */}
      {showAddMenu ? (
        <div className="bg-slate-50 p-4 rounded-xl border border-indigo-200 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Configure New Book Section
            </span>
            <button
              onClick={() => setShowAddMenu(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { id: 'sudoku', label: 'Sudoku', icon: Grid3X3 },
                { id: 'wordsearch', label: 'Word Search', icon: Search },
                { id: 'maze', label: 'Mazes', icon: Compass },
                { id: 'coloring', label: 'Coloring Art', icon: Palette },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedTypeToAdd === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedTypeToAdd(opt.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Pages for this section:</span>
              <select
                value={selectedCountToAdd}
                onChange={(e) => setSelectedCountToAdd(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                <option value={10}>10 Pages</option>
                <option value={15}>15 Pages</option>
                <option value={20}>20 Pages</option>
                <option value={25}>25 Pages</option>
                <option value={30}>30 Pages</option>
                <option value={50}>50 Pages</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition"
            >
              <Plus size={13} />
              <span>Add to Book</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 transition"
          >
            <Plus size={13} />
            <span>Add Another Book Format / Section</span>
          </button>

          <button
            type="button"
            onClick={onExportBookPdf}
            disabled={isExporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm shadow-indigo-600/25 transition disabled:opacity-50"
          >
            <span>Download Curated Book PDF ({totalPages} Pages + Solutions)</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
