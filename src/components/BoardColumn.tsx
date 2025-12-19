import { useDroppable } from '@dnd-kit/core';
import JobCard from './JobCard';
import type { JobApplication, JobStatus } from '../../shared/types';
import clsx from 'clsx';

interface BoardColumnProps {
  id: JobStatus;
  title: string;
  jobs: JobApplication[];
  color: string;
}

const BoardColumn = ({ id, title, jobs, color }: BoardColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <div className={clsx('w-3 h-3 rounded-full', color)} />
        <h2 className="font-semibold text-white">{title}</h2>
        <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          'flex-1 rounded-xl p-2 space-y-3 transition-colors overflow-y-auto custom-scrollbar',
          isOver
            ? 'bg-white/5 border border-primary/20'
            : 'bg-transparent border border-transparent'
        )}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default BoardColumn;
