import clsx from 'clsx';
import type { RejectionStage } from '../types';

interface RejectionProgressBarProps {
    stage?: RejectionStage;
    compact?: boolean;
}

const STAGES: RejectionStage[] = [
    'Shortlisting',
    'Online Assessment',
    'Technical Interview',
    'HR Interview',
];

const RejectionProgressBar = ({ stage, compact = false }: RejectionProgressBarProps) => {
    const stageIndex = stage ? STAGES.indexOf(stage) : -1;

    return (
        <div className={clsx('flex items-center gap-1', compact ? 'gap-1' : 'gap-2')}>
            {STAGES.map((s, index) => {
                const isCompleted = index <= stageIndex;
                const isCurrent = index === stageIndex;

                return (
                    <div key={s} className="flex items-center">
                        {/* Dot */}
                        <div
                            className={clsx(
                                'rounded-full transition-all',
                                compact ? 'w-2 h-2' : 'w-3 h-3',
                                isCompleted
                                    ? isCurrent
                                        ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                                        : 'bg-emerald-400'
                                    : 'bg-white/20'
                            )}
                            title={s}
                        />
                        {/* Connector line */}
                        {index < STAGES.length - 1 && (
                            <div
                                className={clsx(
                                    'h-0.5 transition-colors',
                                    compact ? 'w-2' : 'w-4',
                                    index < stageIndex ? 'bg-emerald-400' : 'bg-white/10'
                                )}
                            />
                        )}
                    </div>
                );
            })}
            {!compact && stage && (
                <span className="ml-2 text-xs text-emerald-400 font-medium">
                    Rejected at {stage}
                </span>
            )}
        </div>
    );
};

export default RejectionProgressBar;
