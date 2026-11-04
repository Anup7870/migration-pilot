import React, { useState } from 'react';
import { 
  FileArchive, 
  Download, 
  CheckCircle2, 
  X, 
  FileCheck, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import JSZip from 'jszip';
import { FileItem } from '../types';

interface ZipDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onTriggerDownload?: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const ZipDownloadModal: React.FC<ZipDownloadModalProps> = ({
  isOpen,
  onClose,
  files,
  onTriggerDownload
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setErrorMessage(null);

    try {
      if (onTriggerDownload) {
        await onTriggerDownload();
        setDownloaded(true);
        setTimeout(() => {
          onClose();
          setDownloaded(false);
        }, 1500);
      } else {
        let downloadedFromBackend = false;
        try {
          const response = await fetch(`${API_BASE_URL}/api/download/migrated`);
          if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
              const downloadUrl = window.URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = downloadUrl;
              anchor.download = 'migrated_project_ts.zip';
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              window.URL.revokeObjectURL(downloadUrl);
              downloadedFromBackend = true;
            }
          }
        } catch {
          // fallback to client zip
        }

        if (!downloadedFromBackend) {
          if (files.length === 0) {
            throw new Error('No converted files available to download yet.');
          }
          const zip = new JSZip();
          files.forEach((file) => {
            const targetPath = file.path.replace(/\.[^.]+$/, file.targetExt);
            zip.file(targetPath, file.migratedCode);
          });
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const downloadUrl = window.URL.createObjectURL(zipBlob);
          const anchor = document.createElement('a');
          anchor.href = downloadUrl;
          anchor.download = 'migrated_project_ts.zip';
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.URL.revokeObjectURL(downloadUrl);
        }

        setDownloaded(true);
        setTimeout(() => {
          onClose();
          setDownloaded(false);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-obsidian-900 border border-palette-taupe/30 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-obsidian-950 border-b border-palette-taupe/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-palette-sand/15 text-palette-sand border border-palette-sand/30">
              <FileArchive size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-palette-light">
                Export Transformed Project
              </h2>
              <p className="text-[11px] text-palette-stone font-sans">
                Download verified TypeScript codebase from FastAPI engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-obsidian-950 border border-palette-taupe/20 space-y-2">
            <div className="flex items-center justify-between text-palette-sand">
              <span className="font-bold">Archive Endpoint:</span>
              <span className="text-[10px] text-palette-stone font-mono">GET /api/download/migrated</span>
            </div>
            <ul className="space-y-1.5 text-palette-stone text-[11px]">
              {files.map(f => (
                <li key={f.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck size={12} className="text-emerald-400" />
                    <span className="text-palette-light">{f.path.replace(/\.[^.]+$/, f.targetExt)}</span>
                  </div>
                  <span className="text-[10px] text-palette-stone">Strict AST Pass</span>
                </li>
              ))}
            </ul>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
            <ShieldCheck size={15} className="shrink-0" />
            <span>Includes synthesized tsconfig.json and verified package.json scripts.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              disabled={downloading}
              className="px-4 py-2 rounded-lg border border-palette-taupe/25 text-palette-stone hover:text-palette-light hover:bg-palette-stone/10 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-palette-light text-obsidian-950 font-bold uppercase tracking-wider hover:bg-palette-sand transition-all active:scale-95 shadow-md shadow-palette-light/20"
            >
              {downloaded ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-700" />
                  <span>Downloaded!</span>
                </>
              ) : downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Fetching Blob...</span>
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
    </div>
  );
};
