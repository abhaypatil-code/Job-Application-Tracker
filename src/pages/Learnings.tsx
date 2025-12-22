import { useJobs } from '../hooks/useJobs';
import { BookOpen, Building2, Briefcase, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import RejectionProgressBar from '../components/RejectionProgressBar';

const Learnings = () => {
    const { jobs } = useJobs();

    // Get all jobs that have learnings
    const jobsWithLearnings = jobs.filter(
        (job) => job.learnings?.trim()
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-white">Learnings</h1>
                </div>
                <p className="text-text-secondary pl-11">
                    Insights and takeaways from your applications.
                </p>
            </div>

            {jobsWithLearnings.length > 0 ? (
                <div className="grid gap-6">
                    {jobsWithLearnings.map((job) => (
                        <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="glass-panel p-6 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 group"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary flex items-center justify-center">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                                            {job.company}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{job.position}</span>
                                        </div>
                                    </div>
                                </div>

                                {job.rejectionStage && (
                                    <RejectionProgressBar stage={job.rejectionStage} compact />
                                )}
                            </div>

                            {/* Key Learnings */}
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    Key Learnings
                                </div>
                                <p className="text-text-secondary text-sm whitespace-pre-wrap leading-relaxed">
                                    {job.learnings}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="glass-panel p-12 rounded-xl text-center border-dashed border-2 border-white/[0.08]">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No Learnings Yet
                    </h3>
                    <p className="text-text-secondary max-w-md mx-auto">
                        When you add learnings to your applications, they'll
                        appear here as notes for future reference.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Learnings;
