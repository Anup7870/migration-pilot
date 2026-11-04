import React from 'react';
import { 
  GitPullRequest, 
  Binary, 
  Cpu, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { PipelineStep } from '../types';

interface PipelineStepperProps {
  steps: PipelineStep[];
  activeStepId: number | null;
  onSelectStep?: (stepId: number) => void;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  steps,
  activeStepId,
  onSelectStep
}) => {
  const getStepIcon = (id: number, status: string) => {
    switch (id) {
      case 1:
        return <GitPullRequest size={16} />;
      case 2:
        return <Binary size={16} />;
      case 3:
        return <Cpu size={16} />;
      case 4:
        return status === 'completed' ? <CheckCircle2 size={16} /> : <CheckCircle2 size={16} />;
      case 5:
        return <Wrench size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusDisplay = (step: PipelineStep) => {
    const hasRealDuration = Boolean(
      step.duration && 
      !/^0(\.0+)?s?$/i.test(step.duration.trim()) && 
      step.duration.trim() !== '0'
    );

    switch (step.status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
            <CheckCircle2 size={12} />
            <span>Passed{hasRealDuration ? ` (${step.duration})` : ''}</span>
          </div>
        );
      case 'healed':
        return (
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-purple-300 bg-purple-500/20 px-1 py-0.2 rounded border border-purple-500/30 text-[10px]">Healed</span>
            {hasRealDuration && (
              <span className="text-[10px] text-palette-stone">({step.duration})</span>
            )}
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-palette-sand font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-palette-sand animate-ping" />
            <span className="animate-pulse">Active</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-medium">
            <AlertCircle size={12} />
            <span>Failed</span>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="text-[11px] font-mono text-palette-stone/60">
            Pending
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Top Stepper Track */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isHealed = step.status === 'healed';
          const isFailed = step.status === 'failed';
          const isPending = step.status === 'pending';
          const isSelected = activeStepId === step.id;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep?.(step.id)}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 cursor-pointer overflow-hidden group ${
                isSelected
                  ? 'border-palette-sand bg-obsidian-900 shadow-lg ring-1 ring-palette-sand/40'
                  : isFailed
                  ? 'border-rose-500/50 bg-rose-950/20 ring-1 ring-rose-500/40 shadow-lg'
                  : isHealed
                  ? 'border-emerald-500/30 bg-obsidian-900/60 hover:border-emerald-500/50 ring-1 ring-purple-500/30'
                  : isActive
                  ? 'border-palette-light/60 bg-obsidian-900/90 shadow-md ring-1 ring-palette-light/20 glow-active'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-obsidian-900/60 hover:border-emerald-500/50'
                  : 'border-palette-taupe/15 bg-obsidian-950/60 hover:border-palette-stone/40'
              }`}
            >
              {/* Subtle top indicator bar */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                  isFailed
                    ? 'bg-rose-500'
                    : isHealed
                    ? 'bg-gradient-to-r from-purple-400 via-emerald-400 to-emerald-400'
                    : isCompleted 
                    ? 'bg-emerald-400' 
                    : isActive 
                    ? 'bg-gradient-to-r from-palette-sand via-palette-light to-palette-sand animate-pulse' 
                    : 'bg-palette-stone/10'
                }`}
              />

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Step Number Circle */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                      isFailed
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : (isCompleted || isHealed)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isActive
                        ? 'bg-palette-light text-obsidian-950 shadow-md font-extrabold animate-bounce'
                        : 'bg-obsidian-900 text-palette-stone border border-palette-taupe/20'
                    }`}
                  >
                    {isFailed ? <AlertCircle size={14} /> : (isCompleted || isHealed) ? <CheckCircle2 size={14} /> : step.id}
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-palette-stone block">
                      Stage 0{step.id}
                    </span>
                    <h2 className="text-xs font-semibold text-palette-light leading-snug line-clamp-1 font-mono">
                      {step.title}
                    </h2>
                  </div>
                </div>

                {/* Status Pill */}
                <div>{getStatusDisplay(step)}</div>
              </div>

              {/* Engine Subtitle */}
              <p className="text-[11px] text-palette-stone mb-2.5 line-clamp-1">
                {step.subtitle}
              </p>

              {/* Progress Bar & Engine Badge */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-palette-taupe/10 text-[10px] font-mono">
                <span className="text-palette-sand/80 truncate">
                  {step.engine}
                </span>

                {isActive && (
                  <span className="shrink-0 text-palette-sand font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-palette-sand animate-ping" />
                    Running
                  </span>
                )}
              </div>

              {/* Active Pulsing Indicator Ring */}
              {isActive && (
                <div className="absolute inset-0 border border-palette-light/20 rounded-xl pointer-events-none animate-pulse-subtle" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
