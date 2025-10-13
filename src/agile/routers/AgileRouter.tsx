import { Routes, Route } from 'react-router-dom';
import ProjectListPage from '../pages/ProjectListPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import KanbanBoardPage from '../pages/KanbanBoardPage';

const AgileRouter = () => {
  return (
    <Routes>
      <Route path="/projects" element={<ProjectListPage />} />
      <Route path="/project/:projectId" element={<ProjectDetailPage />} />
      <Route path="/board/:boardId" element={<KanbanBoardPage />} />
    </Routes>
  );
};

export default AgileRouter;
