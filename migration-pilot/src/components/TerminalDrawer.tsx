import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Trash2, 
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { LogEntry, LogLevel } from '../types';

interface TerminalDrawerProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
  activeEngine?: string;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  logs,
  isOpen,
  onToggle,
  onClear,
  activeEngine
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && isOpen) {
      terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen, autoScroll]);

  const handleCopyLogs = () => {
    const rawText = logs.map(l => `${l.prefix} ${l.message}`).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter(log => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'muse') return log.level === 'muse' || log.level === 'llama';
    return log.level === filterLevel;
  });

  const getLogBadgeColor = (level: LogLevel) => {
    switch (level) {
      case 'ast':
        return 'text-amber-300 border-amber-400/30 bg-amber-400/10';
      case 'muse':
      case 'llama':
        return 'text-purple-300 border-purple-400/30 bg-purple-400/10';
      case 'tsc':
        return 'text-sky-300 border-sky-400/30 bg-sky-400/10';
      case 'success':
        return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case 'warn':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'error':
        return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
      case 'info':
      default:
        return 'text-palette-stone border-palette-stone/30 bg-palette-stone/10';
    }
  };

  return (
    <div className="border border-palette-taupe/20 bg-obsidian-950 rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* Drawer Header / Bar */}
      <div 
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2.5 bg-obsidian-900/80 border-b border-palette-taupe/15 cursor-pointer hover:bg-obsidian-850 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-palette-sand font-mono text-xs font-semibold">
            <TerminalIcon size={14} className="text-palette-light" />
            <span>MIGRATIONPILOT TELEMETRY CONSOLE</span>
          </div>
          
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-palette-stone/15 text-palette-stone">
            {logs.length} stream events
          </span>

          {activeEngine && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine: {activeEngine}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isOpen && (
            <>
              {/* Filter */}
              <div className="flex items-center gap-1 bg-obsidian-950 px-2 py-1 rounded border border-palette-taupe/20 text-[11px] font-mono text-palette-stone">
                <Filter size={11} />
                <select 
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="bg-transparent text-palette-sand focus:outline-none cursor-pointer"
                  aria-label="Filter console telemetry by log level"
                >
                  <option value="all" className="bg-obsidian-900">All levels</option>
                  <option value="ast" className="bg-obsidian-900">AST parser</option>
                  <option value="muse" className="bg-obsidian-900">Muse-Spark-1.3</option>
                  <option value="tsc" className="bg-obsidian-900">TSC sandbox</option>
                  <option value="success" className="bg-obsidian-900">Success</option>
                </select>
              </div>

              {/* Copy */}
              <button
                onClick={handleCopyLogs}
                title="Copy terminal logs"
                className="p-1.5 rounded text-palette-stone hover:text-palette-light hover:bg-palette-stone/15 transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>

              {/* Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse height" : "Expand height"}
                className="hidden sm:block p-1.5 rounded text-palette-stone hover:text-palette-light hover:bg-palette-stone/15 transition-colors"
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              {/* Clear */}
              <button
                onClick={onClear}
                title="Clear console"
                className="p-1.5 rounded text-palette-stone hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          <button 
            onClick={onToggle}
            className="p-1 rounded text-palette-sand hover:bg-palette-stone/15 transition-colors ml-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

        {/* Collapsible Content */}
      {isOpen && (
        <div className={`p-3 font-mono text-xs overflow-y-auto bg-obsidian-950/95 transition-all duration-200 ${
          isExpanded ? 'h-80' : 'h-48'
        }`}>
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-palette-stone/50 space-y-1">
              <span>No telemetry logs emitted for this filter criteria.</span>
              <span className="text-[10px]">Start scan to stream live compiler AST events.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2.5 font-mono leading-relaxed group hover:bg-palette-stone/5 px-2 py-0.5 rounded transition-colors"
                >
                  <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 border ${getLogBadgeColor(log.level)}`}>
                    {log.prefix}
                  </span>

                  <span className={`break-all ${
                    log.level === 'warn' ? 'text-amber-200' :
                    log.level === 'error' ? 'text-rose-300' :
                    log.level === 'success' ? 'text-emerald-300' :
                    (log.level === 'muse' || log.level === 'llama') ? 'text-purple-200' :
                    log.level === 'ast' ? 'text-palette-sand' :
                    'text-palette-taupe'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
