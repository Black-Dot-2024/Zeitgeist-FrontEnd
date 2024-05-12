import { Typography } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import NewTaskForm from '../../components/modules/Task/NewTask/NewTaskForm';
import { EmployeeBodyType, EmployeeContext } from '../../hooks/employeeContext';
import useHttp from '../../hooks/useHttp';
import { EmployeeEntity } from '../../types/employee';
import { ProjectEntity } from '../../types/project';
import { Response } from '../../types/response';
import { BareboneTask } from '../../types/task';
import { RequestMethods } from '../../utils/constants';

/**
 * Renders the new task form for the user to create a new task.
 *
 * @component
 *
 * @returns JSX.Element - New task form component
 */
const NewTaskPage = () => {
  const [employees, setEmployees] = useState<EmployeeEntity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();
  const { employee } = useContext(EmployeeContext);

  console.log('employee', employee);

  const {
    data: cachedEmployees,
    sendRequest: sendEmployeeRequest,
    loading: employeeLoading,
  } = useHttp<Response<EmployeeEntity>>(`/employee/getEmployees`, RequestMethods.GET);

  const {
    sendRequest: requestProject,
    data: projectData,
    loading: projectLoading,
  } = useHttp<ProjectEntity>(`/project/details/${projectId}`, RequestMethods.GET);

  useEffect(() => {
    sendEmployeeRequest();
    requestProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (employee?.employee) {
      setEmployees(filterEmployees(cachedEmployees?.data || [], employee));
    }
  }, [employee, cachedEmployees]);

  useEffect(() => {
    if (!employeeLoading && !projectLoading) {
      setIsLoaded(true);
    }
  }, [employeeLoading, projectLoading]);

  const projectName = projectData?.name;
  const { sendRequest } = useHttp<BareboneTask>('/tasks/create', RequestMethods.POST);

  const handleOnSubmit = async (payload: BareboneTask) => {
    await sendRequest({}, { ...payload });
  };

  if (!isLoaded) {
    <>
      <Typography component='h1'>Loading</Typography>
      <Loader />;
    </>;
  }

  return (
    <NewTaskForm
      onSubmit={handleOnSubmit}
      employees={employees || []}
      projectId={projectId ? projectId : ''}
      projectName={projectName ? projectName : ''}
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

  if (!isAdmin && !hasDepartment) {
    return [];
  }

  const filteredEmployees = isAdmin
    ? employees
    : employees.filter(
        emp =>
          emp.idDepartment === currentUser.employee.idDepartment && currentUser.role !== 'Admin'
      );

  return filteredEmployees.sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );
};

export default NewTaskPage;
