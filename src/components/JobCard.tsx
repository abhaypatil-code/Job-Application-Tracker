import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import type { JobApplication } from '../types';
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation/drag
    // We need to prevent the drag start if we click delete.
    // Actually, pointer-events on the button should handle it, but let's be safe.
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
      className="glass-panel p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors truncate flex-1 mr-2">
          {job.position}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/jobs/${job.id}`}
            className="text-xs text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
          >
            View
          </Link>
        </div>
      </div>

      <p className="text-sm text-text-secondary font-medium mb-3">
        {job.company}
      </p>

      <div className="space-y-2">
        {job.location && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <MapPin className="w-3 h-3" />
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
          <Calendar className="w-3 h-3" />
          <span>Applied {format(parseISO(job.dateApplied), 'MMM d')}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
