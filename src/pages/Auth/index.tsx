import Button from '@mui/joy/Button';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import googleImage from '../../assets/images/google-logo.webp';
import { auth, provider } from '../../config/firebase.config';
import { EmployeeContext } from '../../hooks/employeeContext';
import { SnackbarContext } from '../../hooks/snackbarContext';
import { axiosInstance } from '../../lib/axios/axios';
import { EmployeeReponse } from '../../types/employee';
import { BASE_API_URL, RoutesPath } from '../../utils/constants';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { setEmployee } = useContext(EmployeeContext);
  const { setState } = useContext(SnackbarContext);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const currentEmployee = JSON.parse(localStorage.getItem('employee') ?? null);
  if (currentEmployee) {
    return <Navigate to='/home' replace />;
  }

  const sendRequest = async () => {
    try {
      const response = await axiosInstance.post(`${BASE_API_URL}/employee/signup`);
      return response.data as EmployeeReponse;
    } catch (error) {
      setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
    }
  };

  const updateUserContext = async (data: EmployeeReponse, token: string, refreshToken: string) => {
    if (data) {
      if (data.data.role !== 'No role') {
        localStorage.setItem('idToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        setEmployee(data.data);
        localStorage.setItem('employee', JSON.stringify(data.data));
        navigate(RoutesPath.HOME);
      } else {
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        setState({
          open: true,
          message: 'User not authorized',
          type: 'danger',
        });
      }
    }
  };

  useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(auth, async user => {
      if (user) {
        setIsLoggingIn(true);
        const token = await user.getIdToken(true);
        const refreshToken = user.refreshToken;

        const response = await sendRequest();
        if (!response) {
          setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
          setIsLoggingIn(false);
          return;
        }

        await updateUserContext(response, token, refreshToken);
        setIsLoggingIn(false);
      }
    });

    return () => unregisterAuthObserver();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
      setIsLoggingIn(false);
    }
  };

  return (
    <div className='bg-cover bg-center h-screen login-bg'>
      <div className='flex justify-center sm:justify-end p-2 sm:pr-16 pt-10'>
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoggingIn}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            borderRadius: '999px',
            ':hover': {
              backgroundColor: '#f0f0f0',
            },
            paddingX: '20px',
            paddingY: '16px',
            justifyContent: 'start',
            fontWeight: 'normal',
            fontSize: '14px',
          }}
          startDecorator={<img src={googleImage} alt='Google' style={{ width: 24, height: 24 }} />}
          size='lg'
        >
          Sign in to Link Bridge with Google
        </Button>
      </div>
    </div>
  );
};

export default Auth;
