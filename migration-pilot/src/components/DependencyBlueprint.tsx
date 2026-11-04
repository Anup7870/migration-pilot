import React, { useState } from 'react';
import { 
  Network, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DependencyItem, DomBinding, BlueprintStrategy } from '../types';

interface DependencyBlueprintProps {
  dependencies: DependencyItem[];
  domBindings: DomBinding[];
  blueprint: BlueprintStrategy;
}

export const DependencyBlueprint: React.FC<DependencyBlueprintProps> = ({
  dependencies,
  domBindings,
  blueprint
}) => {
  const [activeTab, setActiveTab] = useState<'deps' | 'dom' | 'blueprint'>('deps');
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-obsidian-950 border border-palette-taupe/20 rounded-xl overflow-hidden shadow-xl mt-4">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-obsidian-900/60 border-b border-palette-taupe/15 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Network size={15} className="text-palette-light" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-palette-light">
            Dependency & Symbol Blueprint
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-palette-sand/15 text-palette-sand border border-palette-sand/30">
            {blueprint.typeSafetyConfidence}% Confidence
          </span>
          <button className="text-palette-stone hover:text-palette-light">
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div>
          {/* Sub tabs */}
          <div className="flex border-b border-palette-taupe/15 bg-obsidian-950 px-2 pt-2 gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab('deps')}
              className={`px-3 py-1.5 rounded-t-lg transition-all ${
                activeTab === 'deps'
                  ? 'bg-obsidian-900 text-palette-light border-t border-l border-r border-palette-taupe/25 font-semibold'
                  : 'text-palette-stone hover:text-palette-sand'
              }`}
            >
              Dependencies ({dependencies.length})
            </button>
            <button
              onClick={() => setActiveTab('dom')}
              className={`px-3 py-1.5 rounded-t-lg transition-all ${
                activeTab === 'dom'
                  ? 'bg-obsidian-900 text-palette-light border-t border-l border-r border-palette-taupe/25 font-semibold'
                  : 'text-palette-stone hover:text-palette-sand'
              }`}
            >
              DOM & Globals ({domBindings.length})
            </button>
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-1.5 rounded-t-lg transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-obsidian-900 text-palette-light border-t border-l border-r border-palette-taupe/25 font-semibold'
                  : 'text-palette-stone hover:text-palette-sand'
              }`}
            >
              AST Blueprint
            </button>
          </div>

          <div className="p-3 bg-obsidian-950/90 max-h-56 overflow-y-auto">
            {/* Dependencies Tab */}
            {activeTab === 'deps' && (
              <div className="space-y-2">
                {dependencies.map((dep, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900/60 border border-palette-taupe/15 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <div>
                        <span className="text-palette-light font-medium">{dep.name}</span>
                        <span className="text-palette-stone text-[10px] ml-1.5">{dep.currentVersion}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dep.typesPackage && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-palette-stone/10 border border-palette-stone/20 text-palette-sand">
                          {dep.typesPackage}
                        </span>
                      )}
                      {dep.typesInstalled && (
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DOM Bindings Tab */}
            {activeTab === 'dom' && (
              <div className="space-y-2">
                {domBindings.map((dom, idx) => (
                  <div 
                    key={idx}
                    className="p-2 rounded-lg bg-obsidian-900/60 border border-palette-taupe/15 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe size={13} className="text-palette-sand" />
                        <span className="text-palette-light font-bold">{dom.selector}</span>
                      </div>
                      <span className="text-[10px] text-palette-stone">
                        {dom.occurrences} {dom.occurrences === 1 ? 'hook' : 'hooks'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-palette-taupe/10 text-[10px]">
                      <span className="text-palette-stone">Inferred AST Type:</span>
                      <span className="text-sky-300 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded">
                        {dom.inferredType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AST Blueprint Summary Tab */}
            {activeTab === 'blueprint' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-obsidian-900/60 border border-palette-taupe/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-palette-stone text-[11px]">Strictness Level</span>
                    <span className="text-palette-light uppercase font-bold text-[11px] px-2 py-0.5 rounded bg-palette-sand/20 border border-palette-sand/40">
                      {blueprint.strictnessLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-palette-stone text-[11px]">JSX Runtime</span>
                    <span className="text-palette-sand text-[11px]">{blueprint.jsxRuntime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-palette-stone text-[11px]">AST Optimization Passes</span>
                    <span className="text-emerald-400 font-bold text-[11px]">{blueprint.astPasses} passes completed</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-palette-taupe/15">
                    <span className="text-palette-stone text-[11px]">Synthesized Compiler Config</span>
                    <span className="text-palette-light text-[10px] bg-obsidian-950 px-2 py-0.5 rounded truncate max-w-[150px]">
                      tsconfig.json
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>Meta Muse-Spark-1.3 model verified 0 `any` leaks.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
