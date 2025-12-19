import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, PlusCircle, Clock, CheckSquare, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ onAddClick }: { onAddClick: () => void }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: KanbanSquare, label: 'Applications', path: '/board' },
    { icon: Clock, label: 'Interviews', path: '/interviews' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: BookOpen, label: 'Learnings', path: '/learnings' },
  ];

  return (
    <aside className="w-64 bg-surface/50 backdrop-blur-xl border-r border-white/[0.06] h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow-sm">
          <KanbanSquare className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Job<span className="text-primary">Suite</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-medium shadow-glow-sm border border-primary/20'
                  : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Add Job Button */}
      <div className="p-4">
        <button
          onClick={onAddClick}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-medium shadow-glow hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add New Job</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

