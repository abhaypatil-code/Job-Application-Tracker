import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';
import type { InterviewRound, Todo, JobStatus, RejectionStage } from '../../shared/types';
import AttachmentList from '../components/AttachmentList';
import RejectionProgressBar from '../components/RejectionProgressBar';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    jobs,
    updateJob,
    deleteJob,
    addRound,
    updateRound,
    deleteRound,
    addAttachment,
    deleteAttachment,
  } = useJobs();
  const job = jobs.find((j) => j.id === id);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'rounds' | 'reflections' | 'attachments'
  >('overview');

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Job not found</h2>
        <button
          onClick={() => navigate('/board')}
          className="text-primary mt-4 hover:underline"
        >
          Back to Board
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteJob(job.id);
      navigate('/board');
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateJob(job.id, { status: e.target.value as JobStatus });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {job.position}
            </h1>
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="font-medium text-lg text-primary">
                {job.company}
              </span>
              <span>•</span>
              <span className="text-sm">
                Applied {format(parseISO(job.dateApplied), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={job.status}
            onChange={handleStatusChange}
            className="bg-surface border border-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="Wishlist">Wishlist</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {['overview', 'rounds', 'reflections', 'attachments'].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(
                tab as 'overview' | 'rounds' | 'reflections' | 'attachments'
              )
            }
            className={clsx(
              'px-6 py-3 text-sm font-medium capitalize transition-colors relative whitespace-nowrap',
              activeTab === tab
                ? 'text-primary'
                : 'text-text-secondary hover:text-white'
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Description
                </h3>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {job.description || 'No description added.'}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Details
                </h3>
                {job.location && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <MapPin className="w-5 h-5 text-text-muted" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-3 text-text-secondary">
                    <span className="font-semibold text-success w-5 text-center">
                      ₹
                    </span>
                    <span>{job.salary}</span>
                  </div>
                )}
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary hover:underline"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Job Post</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rounds' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                Interview Rounds
              </h3>
              <button
                onClick={() =>
                  addRound(job.id, {
                    type: 'Screening',
                    date: new Date().toISOString(),
                    notes: '',
                    todos: [],
                    completed: false,
                  })
                }
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4" />
                Add Round
              </button>
            </div>

            <div className="space-y-4">
              {job.rounds.length === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  No interview rounds scheduled yet.
                </p>
              ) : (
                job.rounds.map((round, index) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    index={index}
                    onUpdate={(updates) =>
                      updateRound(job.id, round.id, updates)
                    }
                    onDelete={() => deleteRound(job.id, round.id)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reflections' && (
          <div className="space-y-6">
            {/* Rejection Stage Progress */}
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Rejection Stage
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                How far did you progress before being rejected?
              </p>
              <select
                value={job.rejectionStage || ''}
                onChange={(e) =>
                  updateJob(job.id, {
                    rejectionStage: (e.target.value || undefined) as RejectionStage | undefined,
                  })
                }
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none mb-4"
              >
                <option value="">Select stage...</option>
                <option value="Shortlisting">Shortlisting</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
              </select>
              {job.rejectionStage && (
                <div className="pt-4 border-t border-white/10">
                  <RejectionProgressBar stage={job.rejectionStage} />
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Rejection Reason
              </h3>
              <textarea
                value={job.rejectionReason || ''}
                onChange={(e) =>
                  updateJob(job.id, { rejectionReason: e.target.value })
                }
                placeholder="Why was the application rejected?"
                className="w-full h-32 bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-white">Learnings</h3>
              <textarea
                value={job.learnings || ''}
                onChange={(e) =>
                  updateJob(job.id, { learnings: e.target.value })
                }
                placeholder="What did you learn from this process?"
                className="w-full h-32 bg-surface/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <AttachmentList
            jobId={job.id}
            attachments={job.attachments || []}
            onAdd={(attachment) => addAttachment(job.id, attachment)}
            onDelete={(attachmentId) => deleteAttachment(job.id, attachmentId)}
          />
        )}
      </div>
    </div>
  );
};

const RoundCard = ({
  round,
  index,
  onUpdate,
  onDelete,
}: {
  round: InterviewRound;
  index: number;
  onUpdate: (u: Partial<InterviewRound>) => void;
  onDelete: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddTodo = () => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: '',
      completed: false,
    };
    onUpdate({ todos: [...round.todos, newTodo] });
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    onUpdate({
      todos: round.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const deleteTodo = (id: string) => {
    onUpdate({
      todos: round.todos.filter((t) => t.id !== id),
    });
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
      <div
        className="p-4 flex items-center justify-between bg-white/5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-white">{round.type}</h4>
            <p className="text-xs text-text-secondary">
              {format(parseISO(round.date), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight
            className={clsx(
              'w-5 h-5 text-text-muted transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Type
              </label>
              <select
                value={round.type}
                onChange={(e) =>
                  onUpdate({ type: e.target.value as InterviewRound['type'] })
                }
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              >
                <option>Screening</option>
                <option>Technical</option>
                <option>System Design</option>
                <option>Behavioral</option>
                <option>HR</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={format(parseISO(round.date), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  onUpdate({ date: new Date(e.target.value).toISOString() })
                }
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary uppercase">
              Notes
            </label>
            <textarea
              value={round.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Interview notes, questions asked, feedback..."
              className="w-full h-24 bg-surface border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none resize-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Preparation Tasks
              </label>
              <button
                onClick={handleAddTodo}
                className="text-xs text-primary hover:underline"
              >
                + Add Task
              </button>
            </div>
            <div className="space-y-2">
              {round.todos.map((todo) => (
                <div key={todo.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() =>
                      updateTodo(todo.id, { completed: !todo.completed })
                    }
                    className={clsx(
                      'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                      todo.completed
                        ? 'bg-primary border-primary'
                        : 'border-white/20 hover:border-primary'
                    )}
                  >
                    {todo.completed && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={todo.text}
                    onChange={(e) =>
                      updateTodo(todo.id, { text: e.target.value })
                    }
                    placeholder="Task description..."
                    className={clsx(
                      'flex-1 bg-transparent border-none outline-none text-sm',
                      todo.completed
                        ? 'text-text-muted line-through'
                        : 'text-white'
                    )}
                  />
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
