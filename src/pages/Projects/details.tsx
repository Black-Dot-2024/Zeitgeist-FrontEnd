/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArchiveRounded,
  AssessmentOutlined,
  DeleteOutline,
  EditOutlined,
  EventNoteRounded,
  UnarchiveRounded,
} from '@mui/icons-material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Box, Button, Card, Chip, Option, Select, Typography } from '@mui/joy';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import colors, { statusChipColorCombination } from '../../colors';
import AddButton from '../../components/common/AddButton';
import ComponentPlaceholder from '../../components/common/ComponentPlaceholder';
import DeleteModal from '../../components/common/DeleteModal';
import GenericDropdown from '../../components/common/GenericDropdown';
import GoBack from '../../components/common/GoBack';
import Loader from '../../components/common/Loader';
import ModalEditConfirmation from '../../components/common/ModalEditConfirmation';
import ChipWithLabel from '../../components/modules/Projects/ChipWithLabel';
import SendNotificationModal from '../../components/modules/Projects/SendNotificationModal';
import { TaskListTable } from '../../components/modules/Task/TaskListTable';
import { SnackbarContext } from '../../hooks/snackbarContext';
import useDeleteProject from '../../hooks/useDeleteProject';
import useDeleteTask from '../../hooks/useDeleteTask';
import useHttp from '../../hooks/useHttp';
import { axiosInstance } from '../../lib/axios/axios';
import { CompanyEntity } from '../../types/company';
import { ProjectAreas, ProjectEntity, ProjectStatus } from '../../types/project';
import { Response } from '../../types/response';
import { TaskDetail } from '../../types/task';
import { APIPath, BASE_API_URL, RequestMethods, RoutesPath } from '../../utils/constants';
import { truncateText } from '../../utils/methods';

const statusColorMap: Record<ProjectStatus, { bg: string; font: string; bgHover: string }> = {
  [ProjectStatus.NONE]: statusChipColorCombination.default,
  [ProjectStatus.ACCEPTED]: statusChipColorCombination.accepted,
  [ProjectStatus.NOT_STARTED]: statusChipColorCombination.notStarted,
  [ProjectStatus.IN_PROGRESS]: statusChipColorCombination.inProgress,
  [ProjectStatus.UNDER_REVISION]: statusChipColorCombination.underRevision,
  [ProjectStatus.IN_QUOTATION]: statusChipColorCombination.inQuotation,
  [ProjectStatus.DELAYED]: statusChipColorCombination.delayed,
  [ProjectStatus.POSTPONED]: statusChipColorCombination.postponed,
  [ProjectStatus.DONE]: statusChipColorCombination.done,
  [ProjectStatus.CANCELLED]: statusChipColorCombination.cancelled,
};

const chipStyle = {
  bgcolor: colors.orangeChip,
  fontSize: '1rem',
  minWidth: '100px',
  padding: '0 10px',
  height: '30px',
};

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setState } = useContext(SnackbarContext);
  const [initialTasks, setInitialTasks] = useState<TaskDetail[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>(ProjectStatus.NOT_STARTED);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { deleteProject, error: deleteError } = useDeleteProject();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const { data, loading, sendRequest, error } = useHttp<ProjectEntity>(
    `${APIPath.PROJECT_DETAILS}/${id}`,
    RequestMethods.GET
  );

  /**
   * @description This useEffect is used to check if the error is an axios error and if the error
   * message contains 'Invalid uuid' or 'unexpected error'
   * */
  useEffect(() => {
    if (isAxiosError(error)) {
      const message = error.response?.data.message;
      if (message.includes('Invalid uuid') || message.includes('unexpected error')) {
        setNotFound(true);
      }
    }
  }, [error]);

  /**
   * @description this hook is used to get the company details and task of the project
   */
  const {
    data: company,
    loading: loadingCompany,
    sendRequest: getCompany,
    error: errorCompany,
  } = useHttp<{ data: CompanyEntity }>(
    `${APIPath.COMPANIES}/${data?.idCompany}`,
    RequestMethods.GET
  );

  const {
    data: tasks,
    error: errorTasks,
    loading: loadingTasks,
    sendRequest: getTasks,
  } = useHttp<Response<TaskDetail>>(`/tasks/project/${id}`, RequestMethods.GET);

  useEffect(() => {
    if (isAxiosError(error)) {
      const message = error.response?.data.message;
      if (message.includes('Invalid uuid') || message.includes('unexpected error')) {
        setNotFound(true);
      }
    }
  }, [error]);

  useEffect(() => {
    if (!tasks) getTasks();
    if (tasks && tasks.data) {
      setInitialTasks(tasks.data);

      const calculatedHours = tasks.data.reduce(
        (totalHours, task) => totalHours + (task.workedHours || 0),
        0
      );
      setTotalHours(calculatedHours);
    }
  }, [tasks]);

  tasks?.data.sort((a, b) => {
    if (a.status === 'Done' && b.status !== 'Done') return 1;
    if (a.status !== 'Done' && b.status === 'Done') return -1;
    if (a.status === b.status) return a.status === 'Done' ? 1 : -1;
    if (!a.endDate || !b.endDate) return 0;

    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);

    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
    if (!data) {
      sendRequest();
    }
    if (data && !company) {
      getCompany();
      setProjectStatus(data.status);
    }
    if (company) {
      setCompanyName(company.data.name);
    }
  }, [data, company, projectStatus]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      setUpdating(true);
      await axiosInstance.put(`${BASE_API_URL}/project/details/${id}`, {
        status: newStatus,
      });
      setProjectStatus(newStatus);
      setState({ open: true, message: 'Status updated successfully.', type: 'success' });
      localStorage.setItem('projectStatus', newStatus);
    } catch {
      setState({ open: true, message: 'Error updating status.', type: 'danger' });
    } finally {
      setUpdating(false);
    }
  };

  const deleteTask = useDeleteTask();
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.deleteTask(taskId);
      setState({ open: true, message: 'Task deleted successfully.', type: 'success' });
      setTimeout(() => {
        setState({ open: false, message: '' });
      }, 2000);
    } catch (error) {
      setState({ open: true, message: `Error deleting task: ${error}`, type: 'danger' });
    } finally {
      getTasks();
    }
  };

  useEffect(() => {
    if (deleteError) {
      setState({ open: true, message: deleteError.message, type: 'danger' });
    }
  }, [deleteError, setState]);

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setState({ open: true, message: 'Project deleted successfully', type: 'success' });
      navigate('/projects');
    } catch {
      setState({ open: true, message: 'Failed to delete project', type: 'danger' });
    }
  };

  if (loading && loadingCompany) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: colors.gray[500],
        }}
      >
        <Typography variant='plain' level='h1' mb={4}>
          Loading project details
        </Typography>

        <Loader />
      </Box>
    );
  }

  if (error) {
    if (error.message.includes('403')) {
      navigate('/projects');
    } else {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ComponentPlaceholder text='Error loading the project.' />
        </Box>
      );
    }
  }

  if (error && errorCompany) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ComponentPlaceholder text='Error loading the project.' />
      </Box>
    );
  }

  async function changePayed(projectId: string, payed: boolean) {
    if (data) {
      try {
        setUpdating(true);
        const res = await axiosInstance.put(`${BASE_API_URL}/project/edit/${projectId}`, {
          payed,
          id: projectId,
        });
        data.payed = res.data.data.payed;
        setState({ open: true, message: 'Payed status updated successfully.', type: 'success' });
      } catch {
        setState({ open: true, message: 'Error updating payed status.', type: 'danger' });
      } finally {
        setUpdating(false);
      }
    }
  }

  if (notFound) {
    return <Navigate to='/404' replace />;
  }

  const chipData = [
    { label: 'Total Hours', content: totalHours },
    { label: 'Client', content: truncateText(companyName, 20) },
    { label: 'Matter', content: data?.matter || '-' },
    { label: 'Category', content: data?.category },
    { label: 'Area', content: data?.area },
    { label: 'Periodicity', content: data?.periodicity },
    { label: 'Chargeable', content: data?.isChargeable ? 'Yes' : 'No' },
    { label: 'isArchived', content: data?.isArchived ? 'Yes' : 'No' },
  ];

  return (
    <>
      {open && (
        <ModalEditConfirmation
          project={data!}
          open={open}
          setOpen={setOpen}
          refetch={sendRequest}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <GoBack />
      </Box>

      <Card
        className='bg-white overflow-y-auto overflow-hidden'
        sx={{ Maxwidth: '300px', padding: '20px', border: 'none' }}
      >
        <section className='font-montserrat'>
          <section className='flex flex-wrap flex-col-reverse lg:flex-row justify-between gap-y-2 items-center'>
            <h3 className='text-2xl lg:text-3xl font-medium whitespace-break-spaces break-all'>
              {data?.name}
            </h3>
            <div className='flex flex-wrap gap-3 mb-6 justify-end items-center'>
              <Button
                component={Link}
                to={`${RoutesPath.PROJECTS}/edit/${id}`}
                state={{ fromDetail: true }}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                  height: '5px',
                  flexGrow: '1',
                  maxWidth: '120px',
                }}
                startDecorator={<EditOutlined sx={{ width: 24, color: colors.gold }} />}
              >
                <Typography sx={{ color: colors.gold }}>Edit</Typography>
              </Button>

              <Button
                component={Link}
                to={`/projects/report/${id}`}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                  height: '5px',
                  flexGrow: '1',
                  maxWidth: '120px',
                }}
                startDecorator={<AssessmentOutlined sx={{ width: 24, color: colors.gold }} />}
              >
                <Typography sx={{ color: colors.gold }}>Report</Typography>
              </Button>

              {data?.isArchived ? (
                <Button
                  onClick={() => setOpen(true)}
                  sx={{
                    backgroundColor: colors.lightWhite,
                    ':hover': {
                      backgroundColor: colors.orangeChip,
                    },
                    height: '5px',
                    flexGrow: '1',
                    maxWidth: '120px',
                  }}
                  startDecorator={<UnarchiveRounded sx={{ width: 24, color: colors.gold }} />}
                >
                  {' '}
                  <Typography sx={{ color: colors.gold }}>Unarchive</Typography>
                </Button>
              ) : (
                <Button
                  onClick={() => setOpen(true)}
                  sx={{
                    backgroundColor: colors.lightWhite,
                    ':hover': {
                      backgroundColor: colors.orangeChip,
                    },
                    height: '5px',
                    flexGrow: '1',
                    maxWidth: '120px',
                  }}
                  startDecorator={<ArchiveRounded sx={{ width: 24, color: colors.gold }} />}
                >
                  {' '}
                  <Typography sx={{ color: colors.gold }}>Archive</Typography>
                </Button>
              )}
              <Button
                onClick={() => {
                  setOpenDeleteModal(true);
                }}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': { backgroundColor: colors.orangeChip },
                  height: '5px',
                }}
                startDecorator={<DeleteOutline sx={{ width: 24, color: colors.gold }} />}
              >
                <Typography sx={{ color: colors.gold }}>Delete</Typography>
              </Button>
            </div>
          </section>
          <DeleteModal
            open={openDeleteModal}
            setOpen={setOpenDeleteModal}
            title='Delete project'
            description='Every task and hours associated with this project will be eliminated.'
            id={id ?? ''}
            handleDelete={handleDeleteProject}
            alertColor='danger'
          />

          <p className='mt-4 whitespace-break-spaces break-all'>{data?.description}</p>

          {data && (
            <div className='flex flex-wrap gap-5 pt-5 text-[10px]' style={{ color: colors.gray }}>
              <div>
                <p>Status</p>
                {data && data.status !== undefined && (
                  <GenericDropdown
                    disabled={updating}
                    options={Object.values(ProjectStatus)}
                    colorMap={statusColorMap}
                    onChange={function (newValue: string | null): void {
                      handleStatusChange(newValue as ProjectStatus);
                    }}
                    value={projectStatus}
                  ></GenericDropdown>
                )}
              </div>

              {chipData.map((chip, i) => {
                return <ChipWithLabel key={i} {...chip} />;
              })}

              {data?.isChargeable && (
                <div>
                  <p>Payed</p>
                  <Chip
                    component={Select}
                    sx={chipStyle}
                    value={data?.payed ?? false}
                    onChange={(_, newVal) => {
                      changePayed(id ?? '', Boolean(newVal));
                    }}
                    disabled={updating}
                  >
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                  </Chip>
                </div>
              )}
            </div>
          )}

          <Box
            sx={{
              mt: 5,
              mb: 3,
              mr: 1,
              gap: 18,
            }}
          >
            <section className='flex flex-col gap-4 sm:gap-10 sm:flex-row justify-start'>
              <div className='flex items-center'>
                <EventNoteRounded />
                <p className='ml-3'>
                  Start Date:{' '}
                  {data?.startDate
                    ? dayjs.utc(data.startDate).format('DD/MM/YYYY')
                    : 'No start date'}
                </p>
              </div>

              <div className='flex items-center'>
                <EventNoteRounded />
                <p className='ml-3'>
                  End Date:{' '}
                  {data?.endDate ? dayjs.utc(data.endDate).format('DD/MM/YYYY') : 'No end date'}
                </p>
              </div>
            </section>
          </Box>
        </section>
      </Card>

      {isNotificationModalOpen && (
        <SendNotificationModal
          open={isNotificationModalOpen}
          setOpen={() => setIsNotificationModalOpen(true)}
          onClose={() => setIsNotificationModalOpen(false)}
          projectId={data!.id}
        />
      )}

      <section className='flex justify-between my-4'>
        <h1 className='text-[25px] text-gold' style={{ fontFamily: 'Didot' }}>
          Project Tasks
        </h1>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {data && data.area === ProjectAreas.LEGAL_AND_ACCOUNTING && (
            <Button
              startDecorator={<NotificationsIcon />}
              variant='solid'
              size='sm'
              sx={{
                height: '30px',
                backgroundColor: colors.darkGold,
                '&:hover': {
                  backgroundColor: colors.darkerGold,
                },
                '@media (max-width:600px)': {
                  width: '100%',
                  fontSize: '0.75rem',
                },
                '@media (min-width:601px) and (max-width:960px)': {
                  width: 'auto',
                  fontSize: '0.875rem',
                },
                '@media (min-width:961px)': {
                  width: 'auto',
                  fontSize: '1rem',
                },
              }}
              onClick={() => setIsNotificationModalOpen(true)}
            >
              Send notification
            </Button>
          )}
          <Link to={id ? `${RoutesPath.TASKS}/${id}/create` : RoutesPath.TASKS}>
            <AddButton onClick={() => { }} />
          </Link>
        </Box>
      </section>
      <Card className='bg-white overflow-auto'>
        <TaskListTable
          errorTasks={errorTasks}
          loadingTasks={loadingTasks}
          initialTasks={initialTasks}
          onDelete={handleDeleteTask}
        />
      </Card>
    </>
  );
};

export default ProjectDetails;
