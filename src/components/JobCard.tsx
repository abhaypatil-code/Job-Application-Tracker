import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Trash2, Clock, CheckSquare, ExternalLink } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { Link } from 'react-router-dom';
import type { JobApplication } from '../../shared/types';
import { useJobs } from '../hooks/useJobs';

interface JobCardProps {
  job: JobApplication;
}

const JobCard = ({ job }: JobCardProps) => {
  const { deleteJob } = useJobs();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
      data: { job },
    });

  const nextInterview = job.rounds
    .filter((r) => !r.completed && isAfter(parseISO(r.date), new Date()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const pendingTasks = job.rounds.reduce(
    (acc, round) => acc + round.todos.filter((t) => !t.completed).length,
    0
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation/drag
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(job.id);
    }
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors truncate flex-1 mr-2">
          {job.position}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/jobs/${job.id}`}
            className="p-1.5 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-all opacity-0 group-hover:opacity-100"
            onPointerDown={(e) => e.stopPropagation()}
            title="View Details"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <p className="text-sm text-text-secondary font-medium mb-3">
        {job.company}
      </p>

      <div className="space-y-2">
        {job.location && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <MapPin className="w-3.5 h-3.5" />
            <span>{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-semibold text-success">₹</span>
            <span>{job.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>Applied {format(parseISO(job.dateApplied), 'MMM d')}</span>
        </div>

        {/* Quick Stats */}
        {(nextInterview || pendingTasks > 0) && (
          <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-2">
            {nextInterview && (
              <div className="flex items-center gap-2 text-xs text-primary font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {nextInterview.type}: {format(parseISO(nextInterview.date), 'MMM d')}
                </span>
              </div>
            )}
            {pendingTasks > 0 && (
              <div className="flex items-center gap-2 text-xs text-warning font-medium">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>
                  {pendingTasks} Task{pendingTasks > 1 ? 's' : ''} Pending
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;

