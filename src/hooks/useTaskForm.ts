import { AxiosError } from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useContext, useReducer, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios/axios';
import { TaskStatus } from '../types/task-status';
import { BASE_API_URL, MAX_DATE, MIN_DATE } from '../utils/constants';
import { SnackbarContext } from './snackbarContext';

export type FormState = {
  title: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  status: TaskStatus;
  idEmployee: string | null;
  workedHours: number;
};

export type Fields = keyof FormState;

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  title: '',
  description: '',
  startDate: dayjs().startOf('day'),
  endDate: null,
  status: TaskStatus.NOT_STARTED,
  idEmployee: null,
  workedHours: 0,
};

type FormAction =
  | { type: 'CHANGE'; field: keyof FormState; value: string | Dayjs | TaskStatus | number | null }
  | { type: 'RESET'; state: FormState };

const formReducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'RESET':
      return action.state;
    default:
      return state;
  }
};

function validate(formState: FormState) {
  const errors: FormErrors = {};

  if (!formState.title.trim()) {
    errors.title = 'Title is required';
  }

  if (formState.title.length > 70) {
    errors.title = 'Title must be less than 70 characters';
  }

  if (formState.description.trim() === '') {
    errors.description = 'Description is required';
  }

  if (formState.description.length > 255) {
    errors.description = 'Description must be less than 256 characters';
  }

  if (formState.workedHours < 0) {
    errors.workedHours = 'Worked hours must be greater than or equal to 0';
  }

  if (formState.workedHours > 1000) {
    errors.workedHours = 'Worked hours must be lower than or equal to 1000';
  }

  if (!formState.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (
    formState.startDate &&
    (isNaN(formState.startDate.day()) ||
      isNaN(formState.startDate.month()) ||
      isNaN(formState.startDate.year()))
  ) {
    errors.startDate = 'Invalid date';
  }

  if (
    formState.startDate &&
    !formState.startDate.isSame(MIN_DATE) &&
    formState.startDate.isBefore(MIN_DATE)
  )
    errors.startDate = 'Start date must be after 01/01/2018';

  if (!formState.status) {
    errors.status = 'Status is required';
  }

  if (formState.endDate) {
    if (formState.startDate && formState.startDate.isAfter(formState.endDate)) {
      errors.startDate = 'Start date must be before end date';
    }

    if (
      isNaN(formState.endDate.day()) ||
      isNaN(formState.endDate.month()) ||
      isNaN(formState.endDate.year())
    ) {
      errors.endDate = 'Invalid date';
    }

    if (formState.endDate.isAfter(MAX_DATE))
      errors.endDate = `End date must be before ${MAX_DATE.format('DD/MM/YYYY')}`;
  }

  return errors;
}

export default function useTaskForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setState: setSnackbar } = useContext(SnackbarContext);

  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [res, setRes] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<Error | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handleChange = (
    field: keyof FormState,
    value: string | Dayjs | TaskStatus | number | null
  ) => {
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    dispatch({ type: 'CHANGE', field, value });
  };

  const setState = (state: FormState = initialFormState) => {
    dispatch({ type: 'RESET', state });
  };

  const handleSubmit = async (idProject: string) => {
    const errors = validate(formState);
    setErrors(errors);
    if (Object.keys(errors).length) return;

    setIsPosting(true);
    try {
      const payload = { ...formState };
      for (const key in payload) {
        if (typeof payload[key as Fields] === 'string') {
          (payload[key as Fields] as string) = (payload[key as Fields] as string).trim();
        }
      }

      const res = await axiosInstance.post(`${BASE_API_URL}/tasks/create`, {
        ...formState,
        idProject,
      });
      setRes(res.data);
      setSnackbar({ open: true, message: 'Task created successfully', type: 'success' });
      navigate(`/tasks/${res.data.id}`, { state: location.state, replace: true });
    } catch (error) {
      if (error instanceof AxiosError)
        setSnackbar({ open: true, message: error.response?.data.message, type: 'danger' });
      else setSnackbar({ open: true, message: 'Error creating task', type: 'danger' });
      if (error instanceof Error) setError(error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdate = async (idTask: string) => {
    const errors = validate(formState);
    setErrors(errors);
    if (Object.keys(errors).length) return;

    setIsPosting(true);
    try {
      const payload = { ...formState };
      for (const key in payload) {
        if (typeof payload[key as Fields] === 'string') {
          (payload[key as Fields] as string) = (payload[key as Fields] as string).trim();
        }
      }
      const res = await axiosInstance.put(`${BASE_API_URL}/tasks/update/${idTask}`, {
        ...formState,
      });
      setRes(res.data);
      setSnackbar({ open: true, message: 'Task updated successfully', type: 'success' });
      navigate(-1);
    } catch (error) {
      if (error instanceof AxiosError)
        setSnackbar({ open: true, message: error.response?.data.message, type: 'danger' });
      else setSnackbar({ open: true, message: 'Error updating task', type: 'danger' });
      if (error instanceof Error) setError(error);
    } finally {
      setIsPosting(false);
    }
  };

  return {
    formState,
    handleChange,
    setState,
    error,
    errors,
    res,
    handleSubmit,
    handleUpdate,
    isPosting,
  };
}
