/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Typography } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import colors from '../../colors';
import Loader from '../../components/common/Loader';
import UpdateTaskForm from '../../components/modules/Task/UpdateTask/UpdateTaskForm';
import { EmployeeBodyType, EmployeeContext } from '../../hooks/employeeContext';
import useHttp from '../../hooks/useHttp';
import { EmployeeEntity } from '../../types/employee';
import { ProjectEntity } from '../../types/project';
import { Response } from '../../types/response';
import { TaskDetail } from '../../types/task';
import { APIPath, RequestMethods } from '../../utils/constants';

const EditTaskPage: React.FC = () => {
  const { employee } = useContext(EmployeeContext);
  const { id } = useParams();

  const { data: cachedEmployees, sendRequest: sendEmployeeRequest } = useHttp<
    Response<EmployeeEntity>
  >(`/employee`, RequestMethods.GET);

  const [employees, setEmployees] = useState<EmployeeEntity[]>([]);

  useEffect(() => {
    sendEmployeeRequest();
  }, []);

  useEffect(() => {
    if (employee?.employee) {
      setEmployees(filterEmployees(cachedEmployees?.data || [], employee));
    }
  }, [employee, cachedEmployees]);

  const { data: cachedTask, sendRequest: sendGetTaskRequest } = useHttp<TaskDetail>(
    `${APIPath.TASK_DETAIL}/${id}`,
    RequestMethods.GET
  );

  const projectReq = useHttp<ProjectEntity>(
    `/project/details/${cachedTask?.idProject}`,
    RequestMethods.GET
  );

  useEffect(() => {
    if (!cachedTask) {
      sendGetTaskRequest();
    }
  }, [cachedTask]);

  useEffect(() => {
    if (cachedTask) {
      projectReq.sendRequest();
    }
  }, [cachedTask]);

  if (!projectReq.data) {
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
          Loading task
        </Typography>
        <Loader />
      </Box>
    );
  }

  return (
    <UpdateTaskForm
      data={cachedTask || ({} as TaskDetail)}
      employees={employees || []}
      projectName={projectReq.data.name}
    />
  );
};

/**
 * Filters the employees based on the current user's role and department.
 *
 * Admin users can see all employees, while other users can only see
 * employees in their department.
 *
 * @param employees: EmployeeEntity[] - The list of employees to filter
 * @param currentUser: EmployeeBodyType - The current user's details
 *
 * @returns EmployeeEntity[] - The filtered list of employees based
 *          on the current user and in alphabetical order
 */
const filterEmployees = (
  employees: EmployeeEntity[],
  currentUser: EmployeeBodyType
): EmployeeEntity[] => {
  const isAdmin = currentUser.role === 'Admin';
  const hasDepartment = currentUser.department === 'Without Department';
  const adminRole = import.meta.env.VITE_ADMIN_ROLE;

  if (hasDepartment) {
    return [];
  }

  const filteredEmployees = isAdmin
    ? employees
    : employees.filter(
        emp => emp.idRole === adminRole || emp.idDepartment === currentUser.employee.idDepartment
      );

  return filteredEmployees.sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
};

export default EditTaskPage;
