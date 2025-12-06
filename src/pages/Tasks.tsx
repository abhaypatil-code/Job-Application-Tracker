import { useJobs } from '../hooks/useJobs';
import { CheckSquare, Square, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { Todo } from '../types';

const Tasks = () => {
    const { jobs, updateRound } = useJobs();

    // Aggregate all todos
    const allTasks = jobs.flatMap((job) =>
        job.rounds.flatMap((round) =>
            round.todos.map((todo) => ({
                ...todo,
                roundId: round.id,
                jobId: job.id,
                company: job.company,
                position: job.position,
                roundType: round.type,
            }))
        )
    );

    const pendingTasks = allTasks.filter((t) => !t.completed);
    const completedTasks = allTasks.filter((t) => t.completed);

    const handleToggle = (
        jobId: string,
        roundId: string,
        todoId: string,
        currentStatus: boolean
    ) => {
        const job = jobs.find((j) => j.id === jobId);
        if (!job) return;

        const round = job.rounds.find((r) => r.id === roundId);
        if (!round) return;

        const updatedTodos = round.todos.map((t) =>
            t.id === todoId ? { ...t, completed: !currentStatus } : t
        );

        updateRound(jobId, roundId, { todos: updatedTodos });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
                <p className="text-text-secondary">
                    Manage your preparation tasks and to-dos across all applications.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-8">
                    {/* Pending Tasks */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Square className="w-5 h-5 text-primary" />
                            To Do ({pendingTasks.length})
                        </h2>
                        {pendingTasks.length > 0 ? (
                            <div className="space-y-2">
                                {pendingTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={() =>
                                            handleToggle(
                                                task.jobId,
                                                task.roundId,
                                                task.id,
                                                task.completed
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel p-8 rounded-xl text-center border-dashed border-2 border-white/10">
                                <p className="text-text-secondary">All caught up! No pending tasks.</p>
                            </div>
                        )}
                    </section>

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2 opacity-80">
                                <CheckSquare className="w-5 h-5 text-success" />
                                Completed ({completedTasks.length})
                            </h2>
                            <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                {completedTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={() =>
                                            handleToggle(
                                                task.jobId,
                                                task.roundId,
                                                task.id,
                                                task.completed
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-xl space-y-4">
                        <h3 className="font-semibold text-white">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Total Tasks</span>
                                <span className="font-bold text-white">{allTasks.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Pending</span>
                                <span className="font-bold text-primary">{pendingTasks.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Completion Rate</span>
                                <span className="font-bold text-success">
                                    {allTasks.length > 0
                                        ? Math.round((completedTasks.length / allTasks.length) * 100)
                                        : 0}
                                    %
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskItem = ({
    task,
    onToggle,
}: {
    task: Todo & {
        company: string;
        position: string;
        roundType: string;
        jobId: string;
    };
    onToggle: () => void;
}) => {
    return (
        <div className="glass-panel p-4 rounded-xl flex items-start gap-4 group hover:bg-white/5 transition-colors">
            <button
                onClick={onToggle}
                className={clsx(
                    'mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all',
                    task.completed
                        ? 'bg-success border-success text-white'
                        : 'border-white/20 hover:border-primary text-transparent'
                )}
            >
                <CheckCircle className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 min-w-0">
                <p
                    className={clsx(
                        'text-white mb-1 transition-all',
                        task.completed && 'text-text-muted line-through'
                    )}
                >
                    {task.text || 'Untitled Task'}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-medium text-primary">{task.company}</span>
                    <span>•</span>
                    <span>{task.roundType}</span>
                    <span>•</span>
                    <Link
                        to={`/jobs/${task.jobId}`}
                        className="hover:text-white hover:underline flex items-center gap-1"
                    >
                        View Job <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
