import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import AddJobModal from './AddJobModal';
import Notifications from './Notifications';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary pl-64">
      <Notifications />
      <Sidebar onAddClick={() => setIsModalOpen(true)} />
      <main className="p-8 w-full mx-auto">
        <Outlet context={{ openModal: () => setIsModalOpen(true) }} />
      </main>
      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Layout;
