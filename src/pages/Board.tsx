import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useJobs } from '../hooks/useJobs';
import BoardColumn from '../components/BoardColumn';
import JobCard from '../components/JobCard';
import type { JobApplication, JobStatus } from '../types';

const COLUMNS: { id: JobStatus; title: string; color: string }[] = [
  { id: 'Wishlist', title: 'Wishlist', color: 'bg-slate-500' },
  { id: 'Applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'Interview', title: 'Interview', color: 'bg-purple-500' },
  { id: 'Offer', title: 'Offer', color: 'bg-emerald-500' },
  { id: 'Rejected', title: 'Rejected', color: 'bg-red-500' },
];

const Board = () => {
  const { jobs, moveJob } = useJobs();
  const [activeJob, setActiveJob] = useState<JobApplication | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // If dropped over a column
      const newStatus = over.id as JobStatus;
      // Or if dropped over a card, we might need to find the column of that card?
      // But our columns are droppable with the status ID.
      // If we drop over a card, dnd-kit might report the card ID as 'over'.
      // We need to ensure we only drop on columns or handle card drops.
      // For simplicity, let's assume we drop on columns.
      // Actually, if we drop on a card in a column, 'over.id' will be the card ID.
      // We should check if over.id is a status or find the status of the card.

      let status = newStatus;
      if (!COLUMNS.find((c) => c.id === status)) {
        // Dropped on a card?
        const overJob = jobs.find((j) => j.id === over.id);
        if (overJob) {
          status = overJob.status;
        } else {
          return; // Unknown drop target
        }
      }

      moveJob(active.id as string, status);
    }
    setActiveJob(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Application Board</h1>
          <p className="text-text-secondary">
            Manage and track your job applications
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full grid grid-cols-5 gap-4 min-w-[1000px] overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.id}
                id={col.id}
                title={col.title}
                jobs={jobs.filter((j) => j.status === col.id)}
                color={col.color}
              />
            ))}
          </div>

          <DragOverlay>
            {activeJob ? <JobCard job={activeJob} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Board;
