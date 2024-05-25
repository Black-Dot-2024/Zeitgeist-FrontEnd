import Button from '@mui/joy/Button';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import googleImage from '../../assets/images/google-logo.webp';
import loginImage from '../../assets/images/login-image.png';
import { auth, provider } from '../../config/firebase.config';
import { EmployeeContext } from '../../hooks/employeeContext';
import { SnackbarContext } from '../../hooks/snackbarContext';
import { axiosInstance } from '../../lib/axios/axios';
import { EmployeeReponse } from '../../types/employee';
import { BASE_API_URL, RoutesPath } from '../../utils/constants';
import { handleGetDeviceToken } from './device-token';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { setEmployee } = useContext(EmployeeContext);
  const { setState } = useContext(SnackbarContext);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const token = await result.user.getIdToken(true);
          const refreshToken = result.user.refreshToken;
          localStorage.setItem('idToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          const response = await sendRequest();
          if (!response) {
            setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
            return;
          }
          await updateUserContext(response);
        }
      } catch (error) {
        setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
      }
    };

    checkRedirectResult();
  }, []);

  const sendRequest = async () => {
    try {
      const response = await axiosInstance.post(`${BASE_API_URL}/employee/signup`);

      return response.data as EmployeeReponse;
    } catch (error) {
      setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      setState({ open: true, message: 'Oops! we are having some troubles', type: 'danger' });
    }
  };

  const updateUserContext = async (data: EmployeeReponse) => {
    if (data) {
      if (data.data.role !== 'No role') {
        setEmployee(data.data);
        localStorage.setItem('employee', JSON.stringify(data.data));
        navigate(RoutesPath.HOME);
        handleGetDeviceToken(data.data.employee.email);
      } else {
        setState({
          open: true,
          message: 'User not authorized',
          type: 'danger',
        });
      }
    }
  };

  return (
    <div className='bg-cover bg-center h-screen' style={{ backgroundImage: `url(${loginImage})` }}>
      <div className='flex justify-end pr-16 pt-10'>
        <Button
          onClick={handleGoogleSignIn}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            borderRadius: '999px',
            ':hover': {
              backgroundColor: '#f0f0f0',
            },
            paddingX: '40px',
            paddingY: '16px',
            justifyContent: 'start',
            fontWeight: 'normal',
            fontSize: '16px',
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
