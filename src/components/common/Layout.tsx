import { ReactNode, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { EmployeeContext } from '../../hooks/employeeContext';
import { RoutesPath } from '../../utils/constants';
import Header from './Header';
import SideBar from './SideBar';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { employee } = useContext(EmployeeContext);

  const pathToText = () => {
    if (
      location.pathname.startsWith(`${RoutesPath.TASKS}/`) &&
      location.pathname.endsWith('/create')
    )
      return 'New Task';
    if (location.pathname === `${RoutesPath.PROJECTS}/new`) return 'New Project';
    if (location.pathname === RoutesPath.CLIENTS) return 'Clients';
    if (location.pathname === RoutesPath.PROJECTS) return 'Projects';
    if (location.pathname === RoutesPath.TASKS) return 'Tasks';
    if (location.pathname === RoutesPath.EMPLOYEES) return 'Employees';
    if (location.pathname.startsWith(`${RoutesPath.TASKS}/edit/`)) return 'Modify Task';
    if (location.pathname.startsWith(`${RoutesPath.TASKS}/`)) return 'Task Details';
    if (location.pathname.startsWith(`${RoutesPath.CLIENTS}/details/`)) return 'Client Details';
    if (location.pathname.startsWith(`${RoutesPath.PROJECTS}/details/`)) return 'Project Details';
    if (location.pathname.startsWith(`${RoutesPath.PROJECTS}/edit/`)) return 'Modify Project';
    if (location.pathname.startsWith(`${RoutesPath.PROJECTS}/report/`)) return 'Project Report';
    if (location.pathname.startsWith(`${RoutesPath.EXPENSES}/details/`)) return 'Expense Details';
    if (location.pathname === `${RoutesPath.EXPENSES}/new`) return 'Reimbursement request';
    if (location.pathname.startsWith(`${RoutesPath.EXPENSES}`)) return 'Expenses';

    return `Welcome Back, ${employee?.employee.firstName}!`;
  };

  return (
    <main className='flex w-screen h-screen overflow-auto'>
      <SideBar />
      <div className='flex flex-col w-full lg:h-screen lg:overflow-auto flex-1 pt-8 md:pt-0 px-5 md:px-10 pb-5 md:pb-1 min-h-0'>
        <Header pageTitle={pathToText()} />
        <section className='flex flex-col flex-1 mt-2 pb-2 lg:overflow-y-auto min-h-0 overflow-y-scroll'>
          {children}
        </section>
      </div>
    </main>
  );
};

export default Layout;
