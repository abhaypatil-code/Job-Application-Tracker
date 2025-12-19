import { useJobs } from '../hooks/useJobs';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { Calendar, Clock, ArrowRight, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { RejectionStage, JobStatus } from '../../shared/types';
import RejectionProgressBar from '../components/RejectionProgressBar';

const Interviews = () => {
    const { jobs } = useJobs();

    const allRounds = jobs
        .flatMap((job) =>
            job.rounds.map((round) => ({
                ...round,
                company: job.company,
                position: job.position,
                jobId: job.id,
                jobStatus: job.status,
                rejectionStage: job.rejectionStage,
            }))
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcomingRounds = allRounds.filter((r) =>
        isAfter(parseISO(r.date), new Date())
    );
    const pastRounds = allRounds
        .filter((r) => isBefore(parseISO(r.date), new Date()))
        .reverse();

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Interviews</h1>
                <p className="text-text-secondary">
                    Track and prepare for your upcoming and past interviews.
                </p>
            </div>

            {/* Upcoming Interviews */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Upcoming
                </h2>
                {upcomingRounds.length > 0 ? (
                    <div className="grid gap-4">
                        {upcomingRounds.map((round) => (
                            <InterviewCard key={round.id} round={round} isUpcoming />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-8 rounded-xl text-center border-dashed border-2 border-white/10">
                        <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary">No upcoming interviews scheduled.</p>
                    </div>
                )}
            </section>

            {/* Past Interviews */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-text-secondary" />
                    Past History
                </h2>
                <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    {pastRounds.map((round) => (
                        <InterviewCard key={round.id} round={round} />
                    ))}
                </div>
            </section>
        </div>
    );
};

interface InterviewRoundWithJob {
    id: string;
    type: string;
    date: string;
    company: string;
    position: string;
    jobId: string;
    jobStatus: JobStatus;
    rejectionStage?: RejectionStage;
}

const InterviewCard = ({
    round,
    isUpcoming,
}: {
    round: InterviewRoundWithJob;
    isUpcoming?: boolean;
}) => {
    const isRejected = round.jobStatus === 'Rejected';

    return (
        <Link
            to={`/jobs/${round.jobId}`}
            className={clsx(
                'glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center gap-5 group hover:bg-white/5 transition-all border',
                isRejected
                    ? 'border-red-500/20 hover:border-red-500/40'
                    : isUpcoming
                        ? 'border-white/5 hover:border-primary/50'
                        : 'border-white/5'
            )}
        >
            {/* Date Badge */}
            <div className="flex-shrink-0">
                <div
                    className={clsx(
                        'w-16 h-16 rounded-xl flex flex-col items-center justify-center border',
                        isRejected
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : isUpcoming
                                ? 'bg-primary/10 border-primary/20 text-primary'
                                : 'bg-surface border-white/5 text-text-secondary'
                    )}
                >
                    <span className="text-xs font-bold uppercase">
                        {format(parseISO(round.date), 'MMM')}
                    </span>
                    <span className="text-2xl font-bold">
                        {format(parseISO(round.date), 'dd')}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={clsx(
                        'font-bold text-lg truncate',
                        isRejected ? 'text-red-400' : 'text-white'
                    )}>
                        {round.company}
                    </h3>
                    {isRejected && (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Rejected
                        </span>
                    )}
                    <span className="text-text-secondary">•</span>
                    <span className="text-text-secondary truncate">{round.position}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                        <span
                            className={clsx(
                                'w-2 h-2 rounded-full',
                                isRejected
                                    ? 'bg-red-400'
                                    : isUpcoming
                                        ? 'bg-primary'
                                        : 'bg-text-muted'
                            )}
                        />
                        {round.type}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {format(parseISO(round.date), 'h:mm a')}
                    </span>
                </div>

                {/* Rejection Progress Bar for rejected jobs */}
                {isRejected && round.rejectionStage && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <RejectionProgressBar stage={round.rejectionStage} compact />
                    </div>
                )}
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 text-text-secondary group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    );
};

export default Interviews;

