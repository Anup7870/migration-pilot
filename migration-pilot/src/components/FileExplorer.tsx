import React, { useState } from 'react';
import { 
  FileCode, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  Loader2, 
  Search, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FileItem, FileStatus } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  viewTargetExtensions: boolean;
  onToggleTargetExtensions: (val: boolean) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFileId,
  onSelectFile,
  viewTargetExtensions,
  onToggleTargetExtensions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FileStatus>('all');

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: FileStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
            <CheckCircle2 size={10} />
            Passed
          </span>
        );
      case 'healed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-purple-300 bg-purple-400/10 border border-purple-400/20">
            <Wrench size={10} />
            Healed
          </span>
        );
      case 'migrating':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-400/10 border border-amber-400/20">
            <Loader2 size={10} className="animate-spin" />
            Translating
          </span>
        );
      case 'queued':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-palette-stone/70 bg-palette-stone/10 border border-palette-stone/20">
            <Clock size={10} />
            Queued
          </span>
        );
    }
  };

  const getFileDisplayName = (file: FileItem) => {
    if (viewTargetExtensions) {
      // Show output TS filename
      const base = file.name.substring(0, file.name.lastIndexOf('.'));
      return `${base || file.name}${file.targetExt}`;
    }
    return file.name;
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 border border-palette-taupe/20 rounded-xl overflow-hidden shadow-xl">
      {/* Header with Title and Mode Switcher */}
      <div className="p-3.5 border-b border-palette-taupe/15 bg-obsidian-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-palette-light" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-palette-light">
              File Explorer & AST Tree
            </h3>
          </div>
          <span className="text-[11px] font-mono text-palette-stone px-2 py-0.5 rounded bg-palette-stone/10">
            {files.length} artifacts
          </span>
        </div>

        {/* View mode toggle (.js/.jsx vs .ts/.tsx) */}
        <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-palette-taupe/20 text-xs font-mono">
          <button
            onClick={() => onToggleTargetExtensions(false)}
            className={`flex-1 py-1 px-2.5 rounded text-center transition-all ${
              !viewTargetExtensions
                ? 'bg-palette-stone/20 text-palette-light font-semibold shadow-sm'
                : 'text-palette-stone hover:text-palette-sand'
            }`}
          >
            Legacy (.js / .jsx)
          </button>
          <button
            onClick={() => onToggleTargetExtensions(true)}
            className={`flex-1 py-1 px-2.5 rounded text-center transition-all flex items-center justify-center gap-1.5 ${
              viewTargetExtensions
                ? 'bg-palette-light text-obsidian-950 font-bold shadow-sm'
                : 'text-palette-stone hover:text-palette-sand'
            }`}
          >
            <Sparkles size={11} className={viewTargetExtensions ? 'text-obsidian-950' : 'text-palette-sand'} />
            Target (.ts / .tsx)
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-2.5 border-b border-palette-taupe/10 flex items-center gap-2 bg-obsidian-950/80">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-palette-stone" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbols or files..."
            className="w-full pl-8 pr-3 py-1 bg-obsidian-900 border border-palette-taupe/20 rounded text-xs font-mono text-palette-light placeholder:text-palette-stone/50 focus:outline-none focus:border-palette-sand"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={12} className="text-palette-stone" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-obsidian-900 border border-palette-taupe/20 rounded px-2 py-1 text-[11px] font-mono text-palette-sand focus:outline-none cursor-pointer"
            aria-label="Filter files by conversion status"
          >
            <option value="all">All ({files.length})</option>
            <option value="passed">Passed</option>
            <option value="healed">Healed</option>
            <option value="migrating">Migrating</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto divide-y divide-palette-taupe/10 p-1.5">
        {filteredFiles.length === 0 ? (
          <div className="p-6 text-center text-palette-stone font-mono text-xs">
            No files matched criteria
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = selectedFileId === file.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all group ${
                  isSelected
                    ? 'bg-palette-stone/20 border border-palette-sand/40 text-palette-light shadow-sm'
                    : 'hover:bg-obsidian-900/80 text-palette-taupe hover:text-palette-light'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded ${
                    file.targetExt === '.tsx' || file.targetExt === '.ts'
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    <FileCode size={14} />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-medium truncate">
                        {getFileDisplayName(file)}
                      </span>
                      {file.status === 'healed' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Auto-healed file" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-palette-stone/70 block truncate">
                      {file.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {getStatusBadge(file.status)}
                  <ChevronRight size={13} className={`transition-transform text-palette-stone ${isSelected ? 'translate-x-0.5 text-palette-light' : 'opacity-40 group-hover:opacity-100'}`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Stats */}
      <div className="p-2.5 border-t border-palette-taupe/15 bg-obsidian-900/60 flex items-center justify-between text-[11px] font-mono text-palette-stone">
        <span>Transmuted: {files.filter(f => f.status === 'passed' || f.status === 'healed').length}/{files.length}</span>
        <span className="text-emerald-400 font-medium">100% Strict Coverage</span>
      </div>
    </div>
  );
};
