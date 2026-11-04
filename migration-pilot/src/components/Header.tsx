import React, { useState, useRef } from 'react';
import { 
  GitBranch, 
  Github, 
  UploadCloud, 
  Play, 
  RotateCw, 
  FileArchive, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  branch?: string;
  setBranch?: (branch: string) => void;
  simulationState: 'idle' | 'scanning' | 'migrating' | 'typecheck' | 'healed' | 'completed' | 'error';
  onStartScan: () => void;
  onReset: () => void;
  onUploadZip: (fileName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  simulationState,
  onStartScan,
  onReset,
  onUploadZip
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy = simulationState !== 'idle' && simulationState !== 'completed' && simulationState !== 'error';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      onUploadZip(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      onUploadZip(file.name);
    }
  };

  const getStatusBadge = () => {
    switch (simulationState) {
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-palette-stone/10 border border-palette-stone/30 text-palette-sand">
            <span className="w-2 h-2 rounded-full bg-palette-stone animate-pulse" />
            Ready / Idle
          </span>
        );
      case 'scanning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-400/10 border border-amber-400/30 text-amber-300">
            <RotateCw size={12} className="animate-spin" />
            AST Ingestion Active
          </span>
        );
      case 'migrating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-400/10 border border-purple-400/30 text-purple-300">
            <Cpu size={12} className="animate-pulse" />
            Muse-Spark-1.3 Translating
          </span>
        );
      case 'typecheck':
      case 'healed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-sky-400/10 border border-sky-400/30 text-sky-300">
            <Terminal size={12} className="animate-spin" />
            TSC & Vitest Healer
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 size={12} />
            Migration Verified (0 Errors)
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Connection Error / Retry
          </span>
        );
    }
  };

  return (
    <header className="border-b border-palette-taupe/20 bg-obsidian-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-palette-light/20 via-palette-sand/10 to-obsidian-950 border border-palette-sand/30 shadow-inner">
              <Sparkles size={20} className="text-palette-light" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-obsidian-900" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold tracking-tight text-palette-light font-mono">
                  Migration<span className="text-palette-sand font-normal">Pilot</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-palette-stone/15 text-palette-stone border border-palette-stone/20">
                  v2.4-preview
                </span>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-palette-stone tracking-wide">
                Autonomous JavaScript to Strict TypeScript Code Migration Engine
              </p>
            </div>
          </div>

          {/* Repository & Zip Ingestion Bar */}
          <div className="flex flex-1 max-w-4xl items-center gap-2.5">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center bg-obsidian-950 border border-palette-taupe/25 rounded-lg p-1.5 shadow-inner focus-within:border-palette-sand transition-all">
              
              {/* GitHub Input */}
              <div className="flex-1 flex items-center gap-2 px-2.5 py-1 text-sm">
                <Github size={16} className="text-palette-stone shrink-0" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/legacy-react-repo"
                  disabled={isBusy}
                  className="w-full bg-transparent border-none text-palette-light placeholder:text-palette-stone/50 font-mono text-xs sm:text-sm focus:outline-none"
                />
              </div>

              {/* Action Button: Fetch & Scan */}
              <button
                onClick={onStartScan}
                disabled={isBusy || !repoUrl}
                className={`mt-1.5 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                  isBusy 
                    ? 'bg-palette-stone/30 text-palette-stone cursor-not-allowed'
                    : simulationState === 'error'
                    ? 'bg-amber-400 text-obsidian-950 hover:bg-amber-300 active:scale-95 shadow-sm shadow-amber-400/20 font-bold'
                    : 'bg-palette-light text-obsidian-950 hover:bg-palette-sand active:scale-95 shadow-sm shadow-palette-light/20'
                }`}
              >
                {isBusy ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : simulationState === 'error' ? (
                  <>
                    <RotateCw size={13} />
                    <span>Retry Migration</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current" />
                    <span>Fetch & Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Reset Button if Completed */}
            {simulationState === 'completed' && (
              <button
                onClick={onReset}
                title="Reset simulation"
                className="p-2.5 rounded-lg border border-palette-taupe/25 text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
              >
                <RotateCw size={15} />
              </button>
            )}
          </div>

          {/* Alternative Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-dashed transition-all cursor-pointer ${
              isDragging
                ? 'border-palette-light bg-palette-light/10 text-palette-light scale-[1.02]'
                : uploadedFileName
                ? 'border-palette-sand/40 bg-palette-sand/5 text-palette-sand'
                : 'border-palette-taupe/25 bg-obsidian-950/60 hover:border-palette-stone/60 text-palette-stone hover:text-palette-light'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".zip,.tar.gz,.js,.jsx"
              className="hidden"
            />
            {uploadedFileName ? (
              <>
                <FileArchive size={15} className="text-palette-sand" />
                <div className="text-left">
                  <div className="text-xs font-mono font-medium text-palette-light truncate max-w-[120px]">
                    {uploadedFileName}
                  </div>
                  <div className="text-[10px] text-palette-stone">Local archive loaded</div>
                </div>
              </>
            ) : (
              <>
                <UploadCloud size={16} className="text-palette-stone group-hover:text-palette-light transition-colors" />
                <div className="text-left">
                  <div className="text-xs font-mono font-medium text-palette-sand">Upload .zip</div>
                  <div className="text-[10px] text-palette-stone">Local code archive</div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
