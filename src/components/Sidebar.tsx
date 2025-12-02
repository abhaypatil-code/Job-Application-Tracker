import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ onAddClick }: { onAddClick: () => void }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: KanbanSquare, label: 'Board', path: '/board' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <KanbanSquare className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          JobTracker
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onAddClick}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-primary/20"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add New Job</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
