import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Interviews from './pages/Interviews';
import Tasks from './pages/Tasks';
import JobDetails from './pages/JobDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="board" element={<Board />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="jobs/:id" element={<JobDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
