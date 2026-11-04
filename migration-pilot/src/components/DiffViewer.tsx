import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  GitCommit, 
  RotateCw, 
  Columns, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles, 
  Wrench, 
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Loader2,
  XCircle
} from 'lucide-react';
import { FileItem, VerifyMigrationResponse } from '../types';

interface DiffViewerProps {
  selectedFile: FileItem | null;
  onDownloadZip: () => void;
  isDownloading?: boolean;
  onOpenCommitModal: () => void;
  onRerunVerification: () => void;
  isVerifying: boolean;
  verificationResults?: VerifyMigrationResponse | null;
  simulationState: string;
  hasFiles?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  selectedFile,
  onDownloadZip,
  isDownloading = false,
  onOpenCommitModal,
  onRerunVerification,
  isVerifying,
  verificationResults = null,
  simulationState,
  hasFiles = false
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [activeTab, setActiveTab] = useState<'code' | 'notes' | 'healing' | 'sandbox'>('code');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedMigrated, setCopiedMigrated] = useState(false);

  const isCompleted = simulationState === 'completed';
  const canAction = isCompleted || Boolean(selectedFile) || hasFiles;

  // Automatically switch to sandbox tab when verification results arrive
  useEffect(() => {
    if (verificationResults) {
      setActiveTab('sandbox');
    }
  }, [verificationResults]);

  const copyToClipboard = (text: string, isMigrated: boolean) => {
    navigator.clipboard.writeText(text);
    if (isMigrated) {
      setCopiedMigrated(true);
      setTimeout(() => setCopiedMigrated(false), 1800);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 1800);
    }
  };

  // Render lines with line numbers and syntax color styling
  const renderCodeLines = (code: string, isTypeScript: boolean) => {
    const lines = code.split('\n');
    return (
      <div className="font-mono text-xs leading-relaxed overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isComment = line.trim().startsWith('//');
              const isImport = line.trim().startsWith('import') || line.trim().startsWith('export');
              const isInterface = line.trim().startsWith('export interface') || line.trim().startsWith('export type');
              const isHealedHighlight = line.includes('Self-Healing') || line.includes('TS2322') || line.includes('TS2345');

              let textClass = 'text-palette-light';
              if (isComment) textClass = 'text-palette-stone/70 italic';
              else if (isInterface) textClass = 'text-sky-300 font-semibold';
              else if (isImport) textClass = 'text-purple-300';
              else if (line.includes('const ') || line.includes('let ') || line.includes('function ') || line.includes('class ')) {
                textClass = 'text-palette-sand';
              }

              return (
                <tr 
                  key={idx} 
                  className={`group hover:bg-palette-stone/5 ${
                    isHealedHighlight ? 'bg-purple-900/15 border-l-2 border-purple-400' : ''
                  }`}
                >
                  <td className="w-10 pr-3 py-0.5 text-right select-none text-palette-stone/40 border-r border-palette-taupe/15 text-[11px]">
                    {lineNum}
                  </td>
                  <td className={`pl-3 py-0.5 whitespace-pre ${textClass}`}>
                    {line || ' '}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 border border-palette-taupe/20 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header & Diff Stats */}
      <div className="p-3.5 bg-obsidian-900/80 border-b border-palette-taupe/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-palette-sand/10 text-palette-sand border border-palette-sand/20">
              <FileCode size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-palette-light">
                  {selectedFile ? selectedFile.name : 'No file selected'}
                </span>
                {selectedFile && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-palette-stone/15 text-palette-stone">
                    {selectedFile.path}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-palette-stone">
                Target: {selectedFile ? `${selectedFile.name.split('.')[0]}${selectedFile.targetExt}` : 'N/A'} (Strict TypeScript AST)
              </div>
            </div>
          </div>

          {/* Stats Badge */}
          {selectedFile && (
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-palette-taupe/20 font-mono text-xs">
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{selectedFile.stats.added} lines
              </span>
              <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                -{selectedFile.stats.removed} lines
              </span>
              <span className="text-palette-sand font-semibold bg-palette-sand/10 px-2 py-0.5 rounded border border-palette-sand/20">
                0 type errors
              </span>
            </div>
          )}
        </div>

        {/* View Mode & Tabs */}
        {selectedFile && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-palette-taupe/20 text-xs font-mono">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'code' ? 'bg-palette-stone/20 text-palette-light font-bold' : 'text-palette-stone hover:text-palette-sand'
                }`}
              >
                Side-by-Side Diff
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  activeTab === 'notes' ? 'bg-palette-stone/20 text-palette-light font-bold' : 'text-palette-stone hover:text-palette-sand'
                }`}
              >
                <Sparkles size={11} />
                Inference Notes
              </button>

              {selectedFile.healedReasons && selectedFile.healedReasons.length > 0 && (
                <button
                  onClick={() => setActiveTab('healing')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'healing' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  <Wrench size={11} />
                  Self-Healing ({selectedFile.healedReasons.length})
                </button>
              )}

              {verificationResults && (
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'sandbox' 
                      ? verificationResults.sandbox_results?.passed 
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                      : verificationResults.sandbox_results?.passed
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <Terminal size={11} />
                  Sandbox Results
                  <span className={`w-1.5 h-1.5 rounded-full ${verificationResults.sandbox_results?.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </button>
              )}
            </div>

            {/* Split / Unified toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
              title={`Switch to ${viewMode === 'split' ? 'unified' : 'side-by-side'} view`}
              className="p-1.5 rounded-lg border border-palette-taupe/20 text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
            >
              <Columns size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Diff Content */}
      <div className="flex-1 overflow-y-auto bg-obsidian-950/90 relative">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-palette-stone/10 border border-palette-stone/20 flex items-center justify-center mb-4 text-palette-sand">
              <FileSpreadsheet size={28} />
            </div>
            <h4 className="text-base font-mono font-bold text-palette-light mb-1">
              Code Diff Viewer Standby
            </h4>
            <p className="text-xs text-palette-stone max-w-md font-mono mb-4 leading-relaxed">
              Initiate "Fetch & Scan Repository" above to run the live SSE AST migration. Select any converted file in the explorer tree to view side-by-side syntactic comparisons and type inference notes.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-palette-sand bg-palette-sand/10 px-3 py-1.5 rounded-lg border border-palette-sand/20">
              <Sparkles size={13} />
              <span>Connected to FastAPI Engine (Port 8000)</span>
            </div>
          </div>
        ) : activeTab === 'notes' ? (
          /* Type Inference Notes View */
          <div className="p-6 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-palette-sand font-mono text-sm font-bold">
              <Sparkles size={16} />
              <span>Autonomous Type Inference & Contract Diagnostics</span>
            </div>
            <p className="text-xs font-mono text-palette-stone">
              The AST symbol walker synthesized the following semantic contracts and interface definitions for <code className="text-palette-light">{selectedFile.path}</code>:
            </p>

            <div className="space-y-2.5">
              {selectedFile.typeInferenceNotes?.map((note, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900 border border-palette-taupe/20 text-xs font-mono">
                  <div className="w-5 h-5 rounded bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="text-palette-light leading-relaxed">{note}</span>
                </div>
              ))}
            </div>

            {/* AST Extracted symbols */}
            <div className="pt-4 border-t border-palette-taupe/15">
              <h5 className="text-xs font-mono uppercase text-palette-stone tracking-wider mb-2">
                Exported / Inferred Symbol Table:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedFile.astSymbols.map((sym, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-obsidian-900 border border-palette-taupe/20 text-xs font-mono text-sky-300">
                    type {sym}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'healing' ? (
          /* Self-Healing Tab View */
          <div className="p-6 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-purple-300 font-mono text-sm font-bold">
              <Wrench size={16} />
              <span>Self-Healing Compiler Loop Log</span>
            </div>
            <p className="text-xs font-mono text-palette-stone">
              During the `tsc --noEmit` sandbox verification pass, semantic type errors were flagged and automatically resolved by the Fix-Loop Agent:
            </p>

            <div className="space-y-3">
              {selectedFile.healedReasons?.map((reason, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span>Fix Pass 0{idx + 1} Applied</span>
                  </div>
                  <p className="text-palette-sand leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'sandbox' && verificationResults ? (
          /* Sandbox Verification Results Tab View */
          <div className="p-6 max-w-4xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-palette-taupe/20">
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-palette-sand" />
                <h4 className="text-sm font-mono font-bold text-palette-light">
                  FastAPI Sandbox Execution Results
                </h4>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-palette-stone">Engine Status:</span>
                <span className="px-2 py-0.5 rounded bg-palette-stone/15 text-palette-sand font-semibold">
                  {verificationResults.status}
                </span>
                {verificationResults.sandbox_results?.passed ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={13} />
                    PASSED (Exit 0)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <XCircle size={13} />
                    FAILED (Exit {verificationResults.sandbox_results?.exit_code ?? 1})
                  </span>
                )}
              </div>
            </div>

            {/* Sandbox Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-obsidian-900 border border-palette-taupe/20">
                <div className="text-palette-stone text-[11px] mb-1">Test Result</div>
                <div className={`font-bold text-sm ${verificationResults.sandbox_results?.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {verificationResults.sandbox_results?.passed ? 'Passed (All Tests Succeeded)' : 'Failed'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-obsidian-900 border border-palette-taupe/20">
                <div className="text-palette-stone text-[11px] mb-1">Exit Code</div>
                <div className="font-bold text-palette-light text-sm">
                  {verificationResults.sandbox_results?.exit_code ?? 0}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-obsidian-900 border border-palette-taupe/20">
                <div className="text-palette-stone text-[11px] mb-1">Verified Target</div>
                <div className="font-bold text-palette-sand text-sm truncate">
                  {selectedFile.path}
                </div>
              </div>
            </div>

            {/* Terminal logs block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-palette-stone">
                <span>Sandbox Output Logs:</span>
                <span>Typecheck & Vitest Console</span>
              </div>
              <pre className="p-3.5 rounded-lg bg-[#07080a] border border-palette-taupe/25 font-mono text-xs text-palette-light whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {verificationResults.sandbox_results?.logs || 'No sandbox logs reported by runner.'}
              </pre>
            </div>
          </div>
        ) : viewMode === 'split' ? (
          /* Side-by-Side Diff View */
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-palette-taupe/20 min-h-full">
            
            {/* Left Column: Legacy JavaScript */}
            <div className="flex flex-col bg-obsidian-950">
              <div className="sticky top-0 z-10 px-3.5 py-2 bg-obsidian-900/90 backdrop-blur border-b border-palette-taupe/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-200">
                    Legacy JavaScript ({selectedFile.originalExt})
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedFile.originalCode, false)}
                  className="flex items-center gap-1 text-[11px] font-mono text-palette-stone hover:text-palette-light transition-colors"
                >
                  {copiedOriginal ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 flex-1 overflow-x-auto">
                {renderCodeLines(selectedFile.originalCode, false)}
              </div>
            </div>

            {/* Right Column: Migrated TypeScript */}
            <div className="flex flex-col bg-obsidian-950/80">
              <div className="sticky top-0 z-10 px-3.5 py-2 bg-obsidian-900/90 backdrop-blur border-b border-palette-taupe/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    Strict TypeScript ({selectedFile.targetExt})
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                    Type-Safe
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedFile.migratedCode, true)}
                  className="flex items-center gap-1 text-[11px] font-mono text-palette-stone hover:text-palette-light transition-colors"
                >
                  {copiedMigrated ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedMigrated ? 'Copied TS' : 'Copy TS'}</span>
                </button>
              </div>
              <div className="p-3 flex-1 overflow-x-auto bg-[#07080a]">
                {renderCodeLines(selectedFile.migratedCode, true)}
              </div>
            </div>

          </div>
        ) : (
          /* Unified Single Column View */
          <div className="p-4 bg-obsidian-950">
            <div className="mb-3 flex items-center justify-between border-b border-palette-taupe/15 pb-2">
              <span className="text-xs font-mono font-bold text-palette-light">
                Unified TypeScript Output ({selectedFile.targetExt})
              </span>
              <button
                onClick={() => copyToClipboard(selectedFile.migratedCode, true)}
                className="flex items-center gap-1 text-[11px] font-mono text-palette-stone hover:text-palette-light transition-colors"
              >
                {copiedMigrated ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedMigrated ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            {renderCodeLines(selectedFile.migratedCode, true)}
          </div>
        )}
      </div>

      {/* Bottom Action Control Bar */}
      <div className="p-3.5 bg-obsidian-900/95 border-t border-palette-taupe/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Verification Status info */}
        <div className="flex items-center gap-2.5 text-xs font-mono text-palette-stone">
          {verificationResults ? (
            verificationResults.sandbox_results?.passed ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={16} />
                Sandbox Verified: Passed (Exit 0)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <XCircle size={16} />
                Sandbox Result: Failed (Exit {verificationResults.sandbox_results?.exit_code ?? 1})
              </span>
            )
          ) : (
            <>
              <ShieldCheck size={16} className={isCompleted ? "text-emerald-400" : "text-palette-stone"} />
              <span>
                {isCompleted ? (
                  <span className="text-palette-sand">TypeScript Sandbox: Transformed files ready for verification</span>
                ) : (
                  <span>Engine Status: Waiting for pipeline completion to export artifacts</span>
                )}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Re-run Verification */}
          <button
            onClick={onRerunVerification}
            disabled={!canAction || isVerifying || !selectedFile}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs border transition-all ${
              !canAction || !selectedFile
                ? 'border-palette-taupe/20 text-palette-stone/40 cursor-not-allowed'
                : isVerifying
                ? 'border-palette-sand/40 text-palette-sand bg-palette-sand/10 animate-pulse'
                : 'border-palette-taupe/30 text-palette-sand hover:text-palette-light hover:bg-palette-stone/10 active:scale-95'
            }`}
          >
            <RotateCw size={13} className={isVerifying ? 'animate-spin' : ''} />
            <span>{isVerifying ? 'Verifying Sandbox...' : 'Verify Migrated Code'}</span>
          </button>

          {/* Commit Changes to GitHub */}
          <button
            onClick={onOpenCommitModal}
            disabled={!canAction}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-medium border transition-all ${
              !canAction
                ? 'border-palette-taupe/20 text-palette-stone/40 bg-obsidian-900 cursor-not-allowed'
                : 'border-palette-sand/50 text-palette-light bg-obsidian-850 hover:bg-palette-stone/15 hover:border-palette-sand active:scale-95 shadow-sm'
            }`}
          >
            <GitCommit size={14} className="text-palette-sand" />
            <span>Commit to GitHub</span>
          </button>

          {/* Download Migrated Project (.zip) */}
          <button
            onClick={onDownloadZip}
            disabled={!canAction || isDownloading}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wide uppercase transition-all shadow-md ${
              !canAction || isDownloading
                ? 'bg-palette-stone/20 text-palette-stone/40 cursor-not-allowed'
                : 'bg-palette-light text-obsidian-950 hover:bg-palette-sand active:scale-95 shadow-palette-light/20 glow-pilot'
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download .zip</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
