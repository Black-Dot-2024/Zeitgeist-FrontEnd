import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Chip } from '@mui/joy';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  colors,
} from '@mui/material';
import { AxiosRequestConfig } from 'axios';
import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statusChipColorCombination } from '../../../../../colors';
import { SnackbarContext } from '../../../../../hooks/snackbarContext';
import { axiosInstance } from '../../../../../lib/axios/axios';
import { Task } from '../../../../../types/task';
import { TaskStatus } from '../../../../../types/task-status';
import { APIPath, BASE_API_URL, RequestMethods } from '../../../../../utils/constants';
import DeleteModal from '../../../../common/DeleteModal';
import GenericDropdown from '../../../../common/GenericDropdown';
import TaskActionsMenu from '../../../../common/TaskActionsMenu';

const statusColorMap: Record<TaskStatus, { bg: string; font: string }> = {
  [TaskStatus.NOT_STARTED]: statusChipColorCombination.notStarted,
  [TaskStatus.IN_PROGRESS]: statusChipColorCombination.inProgress,
  [TaskStatus.UNDER_REVISION]: statusChipColorCombination.underRevision,
  [TaskStatus.DELAYED]: statusChipColorCombination.delayed,
  [TaskStatus.POSTPONED]: statusChipColorCombination.postponed,
  [TaskStatus.DONE]: statusChipColorCombination.done,
  [TaskStatus.CANCELLED]: statusChipColorCombination.cancelled,
};

interface TaskTableProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
}

const TaskTable = ({ tasks, onDelete }: TaskTableProps) => {
  const navigate = useNavigate();
  const idTaskPayload = useRef<string>('');

  const [collapsed, setCollapsed] = useState(false);
  const { setState } = useContext(SnackbarContext);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newStatus, setNewStatus] = useState<TaskStatus | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleClick = (id: string) => {
    navigate(`/tasks/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/tasks/edit/${id}`);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleDeleteButtonClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const dateToShortString = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const handleStatusChange = async (idTask: string, status: TaskStatus | null) => {
    setNewStatus(status);

    if (idTask.trim() !== '') {
      idTaskPayload.current = idTask;

      const payload = {
        status: status as TaskStatus,
      };

      try {
        await doFetch(payload);
        setState({ open: true, message: 'Task status updated successfully.', type: 'success' });
        setTimeout(() => {
          setState({ open: false, message: '' });
        }, 2000);
      } catch (error) {
        setState({ open: true, message: 'Failed to update status task.', type: 'danger' });
        console.error(error);
      }
    } else {
      console.error('Empty idTask received.');
    }
  };

  const doFetch = async (payload: { status: TaskStatus }) => {
    const options: AxiosRequestConfig = {
      method: RequestMethods.PUT,
      url: `${BASE_API_URL}${APIPath.UPDATE_TASK_STATUS}/${idTaskPayload.current}`,
      data: payload,
    };
    await axiosInstance(options);
  };

  return (
    <>
      <Card sx={{ borderRadius: '12px', margin: '5px' }}>
        <TableContainer sx={{ padding: '0.5rem' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '40%' }}>
                  <Typography variant='body1' sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Task
                  </Typography>
                </TableCell>
                <TableCell style={{ width: '20%' }}>
                  <Typography variant='body1' sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell style={{ width: '10%' }}>
                  <Typography variant='body1' sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Hours
                  </Typography>
                </TableCell>
                <TableCell style={{ width: '15%' }}>
                  <Typography variant='body1' sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Due Date
                  </Typography>
                </TableCell>
                <TableCell style={{ width: '10%' }}>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                    onClick={handleCollapseToggle}
                  >
                    {collapsed ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!collapsed &&
                tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell
                      onClick={() => handleClick(task.id)}
                      sx={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <GenericDropdown
                        options={Object.values(TaskStatus)}
                        defaultValue={task.status}
                        onChange={value => handleStatusChange(task.id, value as TaskStatus)}
                        colorMap={statusColorMap}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        sx={{
                          bgcolor: '#D6CFBE',
                          color: colors.grey[700],
                          fontSize: '0.9rem',
                        }}
                      >
                        {task.workedHours ?? 0}
                      </Chip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.9rem' }}>
                      {task.endDate ? dateToShortString(task.endDate.toString()) : 'No due date'}
                    </TableCell>
                    <TableCell>
                      <TaskActionsMenu
                        task={task}
                        onEdit={() => handleEdit(task.id)}
                        onOpenDeleteDialog={handleDeleteButtonClick}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <DeleteModal
        open={taskToDelete !== null}
        setOpen={() => setTaskToDelete(null)}
        title='Confirm Deletion'
        description='Are you sure you want to delete this task?'
        id={taskToDelete?.id || ''}
        handleDeleteEmployee={(id: string) => {
          onDelete(id);
          setTaskToDelete(null);
        }}
      />
    </>
  );
};

export default TaskTable;
