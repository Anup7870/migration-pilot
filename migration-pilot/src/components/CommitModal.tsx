import React, { useState } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  GitBranch, 
  X, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  FileCode,
  Sparkles
} from 'lucide-react';
import { FileItem } from '../types';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  defaultBranch?: string;
  onSuccess: (details: { branch: string; message: string; prCreated: boolean; prUrl?: string }) => void;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  files,
  defaultBranch = 'main',
  onSuccess
}) => {
  const [targetBranch, setTargetBranch] = useState('migration-pilot/strict-typescript');
  const [commitMessage, setCommitMessage] = useState('refactor(types): autonomous migration to strict TypeScript');
  const [openPrImmediately, setOpenPrImmediately] = useState(true);
  const [prTitle, setPrTitle] = useState('feat(ts): autonomous code migration from JavaScript to TypeScript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPushed, setIsPushed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with real endpoint call:
    // await fetch('/api/github/commit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ targetBranch, commitMessage, openPrImmediately, files })
    // });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsPushed(true);

      setTimeout(() => {
        onSuccess({
          branch: targetBranch,
          message: commitMessage,
          prCreated: openPrImmediately,
          prUrl: openPrImmediately ? `https://github.com/owner/legacy-react-repo/pull/42` : undefined
        });
        onClose();
        setIsPushed(false);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-obsidian-900 border border-palette-taupe/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-obsidian-950 border-b border-palette-taupe/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-palette-sand/15 text-palette-sand border border-palette-sand/30">
              <GitCommit size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-palette-light">
                Commit & Push TypeScript Migration
              </h2>
              <p className="text-[11px] text-palette-stone font-sans">
                Create branch and publish transformed codebase to GitHub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isPushed ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={30} />
            </div>
            <h4 className="text-base font-bold text-palette-light">
              Push Successfully Dispatched!
            </h4>
            <p className="text-palette-stone font-sans text-xs max-w-sm">
              Branch <code className="text-palette-sand">{targetBranch}</code> was pushed with 6 transformed TypeScript source files.
              {openPrImmediately && ' Pull Request #42 generated.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Target Branch */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-palette-sand flex items-center gap-1.5 uppercase">
                <GitBranch size={13} />
                Target Branch
              </label>
              <input
                type="text"
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-obsidian-950 border border-palette-taupe/25 rounded-lg text-palette-light focus:outline-none focus:border-palette-sand"
              />
              <span className="text-[10px] text-palette-stone block">
                Branch will be branched from upstream: <code className="text-palette-stone">{defaultBranch}</code>
              </span>
            </div>

            {/* Commit Message */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-palette-sand flex items-center gap-1.5 uppercase">
                <GitCommit size={13} />
                Commit Message
              </label>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                rows={2}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-obsidian-950 border border-palette-taupe/25 rounded-lg text-palette-light focus:outline-none focus:border-palette-sand font-mono resize-none"
              />
            </div>

            {/* Toggle: Open PR Immediately */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-palette-taupe/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GitPullRequest size={16} className="text-palette-sand" />
                <div>
                  <div className="text-xs font-bold text-palette-light">Open Pull Request Immediately</div>
                  <div className="text-[10px] text-palette-stone font-sans">
                    Automates PR description with diff metrics and AST verification badge
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={openPrImmediately}
                  onChange={(e) => setOpenPrImmediately(e.target.checked)}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-palette-stone/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-obsidian-950 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-palette-light after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-palette-sand"></div>
              </label>
            </div>

            {/* If PR is checked, show PR title input */}
            {openPrImmediately && (
              <div className="space-y-1.5 pl-3 border-l-2 border-palette-sand/40">
                <label className="text-[11px] font-bold text-palette-stone uppercase">
                  Pull Request Title
                </label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-1.5 bg-obsidian-950 border border-palette-taupe/25 rounded-lg text-palette-light focus:outline-none focus:border-palette-sand text-xs"
                />
              </div>
            )}

            {/* Change summary chip */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>6 files ready (+178 additions, -54 deletions, 0 TS errors)</span>
              </div>
              <span className="font-bold">Verified Pass</span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-palette-taupe/25 text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-palette-light text-obsidian-950 font-bold uppercase tracking-wider hover:bg-palette-sand transition-all active:scale-95 shadow-md shadow-palette-light/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Pushing Git Tree...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Confirm & Push</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
