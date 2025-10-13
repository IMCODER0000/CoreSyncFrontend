import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi';
import type { Project } from '../../api/types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add, Folder } from '@mui/icons-material';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjectList(1, 50);
      console.log('API 응답:', response);
      // projectList를 Project 타입으로 변환
      const projectList = (response.projectList || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        writer: {
          id: item.writer?.id || item.writerId,
          nickname: item.writer?.nickname || item.writerNickname || '알 수 없음'
        },
        createDate: item.createDate,
        updateDate: item.updateDate
      }));
      setProjects(projectList);
    } catch (error) {
      console.error('프로젝트 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      setCreating(true);
      const response = await projectApi.createProject({ title: newProjectTitle });
      console.log('프로젝트 생성 응답:', response);
      setOpenDialog(false);
      setNewProjectTitle('');
      loadProjects();
    } catch (error: any) {
      console.error('프로젝트 생성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      alert(`프로젝트 생성에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/agile/project/${projectId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          프로젝트 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
          }}
        >
          새 프로젝트
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
          gap={2}
        >
          <Folder sx={{ fontSize: 80, color: '#9ca3af' }} />
          <Typography variant="h6" color="text.secondary">
            프로젝트가 없습니다
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            첫 프로젝트 만들기
          </Button>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          {projects.map((project) => (
            <Box key={project.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleProjectClick(project.id)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Folder sx={{ fontSize: 40, color: '#6366f1' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {project.title}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={project.writer?.nickname || '알 수 없음'}
                      size="small"
                      sx={{ bgcolor: '#e0e7ff', color: '#4f46e5' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(project.createDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* 프로젝트 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 프로젝트 만들기</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="프로젝트 이름"
            fullWidth
            variant="outlined"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateProject();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={creating || !newProjectTitle.trim()}
          >
            {creating ? <CircularProgress size={24} /> : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectListPage;
