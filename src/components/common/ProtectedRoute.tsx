import React, { ReactNode, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { EmployeeContext } from '../../hooks/employeeContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('idToken');
  const { employee } = useContext(EmployeeContext);

  if (!isAuthenticated || !employee || (employee && employee.role === 'No role')) {
    return <Navigate to='/' replace />;
  }

  if (isAuthenticated && location.pathname === '/') return <Navigate to='/home' replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
