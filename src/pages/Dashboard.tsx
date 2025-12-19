import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { Briefcase, Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
}) => (
  <div className="glass-panel p-6 rounded-2xl card-hover flex items-center justify-between overflow-hidden relative group">
    {/* Background Glow */}
    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${gradient}`} />

    <div className="relative z-10">
      <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
      <h3 className="text-4xl font-bold text-white">{value}</h3>
    </div>
    <div
      className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}
    >
      <Icon className="w-7 h-7 text-white" />
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
    "Don't quit.",
    "One offer is all it takes.",
    "Keep applying.",
    "Stay consistent.",
    "Trust the process.",
    "Show up daily.",
    "Learn from every interview.",
    "Rejection means next.",
    "Keep moving forward.",
    "Your time is coming.",
    "Stay hungry.",
    "Outwork the competition.",
    "Every no gets you closer to yes.",
    "Apply one more.",
    "Stay focused.",
    "Keep pushing.",
    "You've got this.",
    "Next one could be the one.",
    "Be relentless.",
    "Winners don't quit.",
  ];

  const [randomQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <p className="text-text-secondary text-lg italic pl-11">"{randomQuote}"</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applied"
          value={stats.total}
          icon={Briefcase}
          gradient="from-blue-500 to-cyan-400"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={Calendar}
          gradient="from-violet-500 to-purple-400"
        />
        <StatCard
          title="Offers"
          value={stats.offers}
          icon={CheckCircle}
          gradient="from-emerald-500 to-teal-400"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          gradient="from-rose-500 to-pink-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews Widget */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Interviews
            </h2>
            <Link
              to="/interviews"
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

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

        {/* Tasks Widget */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Pending Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-sm text-text-secondary hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-text-secondary">Pending Tasks</span>
              <span className="text-2xl font-bold text-white">{jobs.flatMap(j => j.rounds.flatMap(r => r.todos)).filter(t => !t.completed).length}</span>
            </div>

            {jobs.flatMap(j => j.rounds.flatMap(r => r.todos)).filter(t => !t.completed).slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-text-secondary truncate flex-1">{task.text || "Untitled Task"}</span>
              </div>
            ))}

            {jobs.flatMap(j => j.rounds.flatMap(r => r.todos)).filter(t => !t.completed).length === 0 && (
              <p className="text-center text-text-secondary py-4">No pending tasks.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
