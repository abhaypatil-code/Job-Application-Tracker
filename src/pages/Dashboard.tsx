import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { Briefcase, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="glass-panel p-6 rounded-2xl card-hover flex items-center justify-between">
    <div>
      <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { jobs } = useJobs();

  const stats = {
    total: jobs.length,
    interviews: jobs.filter((j) => j.status === 'Interview').length,
    offers: jobs.filter((j) => j.status === 'Offer').length,
    rejected: jobs.filter((j) => j.status === 'Rejected').length,
  };

  const upcomingRounds = jobs
    .flatMap((job) =>
      job.rounds
        .filter(
          (round) =>
            !round.completed && isAfter(parseISO(round.date), new Date())
        )
        .map((round) => ({ ...round, company: job.company, jobId: job.id }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const quotes = [
    'Don’t quit.',
    'One offer is all it takes.',
    'Keep going — success is closer than you think.',
    'Every rejection is a redirection.',
    'Your dream job is waiting for you.',
  ];

  const [randomQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-text-secondary text-lg italic">"{randomQuote}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applied"
          value={stats.total}
          icon={Briefcase}
          color="bg-blue-500"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Offers"
          value={stats.offers}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Upcoming Interviews
        </h2>

        {upcomingRounds.length > 0 ? (
          <div className="space-y-4">
            {upcomingRounds.map((round) => (
              <Link
                key={round.id}
                to={`/jobs/${round.jobId}`}
                className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xs text-text-muted font-medium uppercase">
                      {format(parseISO(round.date), 'MMM')}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {format(parseISO(round.date), 'dd')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-primary transition-colors">
                      {round.company}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {round.type} • {format(parseISO(round.date), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {format(parseISO(round.date), 'EEEE')}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-xl text-center">
            <p className="text-text-secondary">
              No upcoming interviews scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
