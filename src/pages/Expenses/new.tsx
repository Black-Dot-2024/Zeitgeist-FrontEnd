import { Button, Card, Chip, FormControl, FormLabel, Input } from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import colors from '../../colors';
import ExpenseContainerInput from '../../components/modules/Expenses/ExpenseContainerInput';
import ExpenserError from '../../components/modules/Expenses/ExpenserError';
import ModalConfirmation from '../../components/modules/Expenses/ModalConfirmation';
import { ExpenseContext } from '../../hooks/expenseContext';
import { formatCurrency } from '../../utils/methods';

const ExpenseNew = () => {
  const { state, dispatch } = useContext(ExpenseContext);

  const [errors, setErrors] = useState({
    title: '',
    startDate: '',
    totalAmount: '',
    expenses: state.reimbursementRequest.expenses.map(() => ({
      expenseTitle: '',
      totalAmount: '',
      supplier: '',
      date: '',
      urlFile: '',
    })),
  });

  const MIN_DATE = dayjs('2000-01-01T00:00:00.000Z');
  const MAX_DATE = dayjs(Date.now());

  const totalAmount = useMemo(
    () => state.reimbursementRequest.expenses.reduce((total, item) => total + item.totalAmount, 0),
    [state.reimbursementRequest.expenses]
  );

  useEffect(() => {
    dispatch({ type: 'restart-request' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Validates the form input and updates the error state accordingly.
   *
   * @returns {boolean} - Returns true if the form is valid, otherwise false.
   */
  const formValidation = (): boolean => {
    let isValid = true;
    const newErrors = {
      title: '',
      startDate: '',
      totalAmount: '',
      expenses: state.reimbursementRequest.expenses.map(() => ({
        expenseTitle: '',
        totalAmount: '',
        supplier: '',
        date: '',
        urlFile: '',
      })),
    };

    if (state.reimbursementRequest.title.trim() === '') {
      newErrors.title = 'Title cannot be empty';
      isValid = false;
    }

    if (!state.reimbursementRequest.startDate) {
      newErrors.startDate = 'Date is required';
      isValid = false;
    } else {
      const startDate = dayjs(state.reimbursementRequest.startDate);
      if (!startDate.isValid()) {
        newErrors.startDate = 'Invalid date format';
        isValid = false;
      } else {
        if (startDate < MIN_DATE) {
          newErrors.startDate = 'The report cannot have a date before the year 2000';
          isValid = false;
        }
        if (startDate > MAX_DATE) {
          newErrors.startDate = 'The report cannot have a date after today';
          isValid = false;
        }
      }
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      newErrors.totalAmount = 'The total cannot be 0 or lower';
      isValid = false;
    }

    state.reimbursementRequest.expenses.forEach((expense, index) => {
      if (!expense.title || expense.title.trim() === '') {
        newErrors.expenses[index].expenseTitle = 'Expense title cannot be empty';
        isValid = false;
      }

      if (!expense.totalAmount || expense.totalAmount <= 0) {
        newErrors.expenses[index].totalAmount = 'Total amount cannot be 0 or lower';
        isValid = false;
      }

      if (!expense.date) {
        newErrors.expenses[index].date = 'Date is required';
        isValid = false;
      } else {
        const expenseDate = dayjs(expense.date);
        if (!expenseDate.isValid()) {
          newErrors.expenses[index].date = 'Invalid date format';
          isValid = false;
        } else {
          if (expenseDate < MIN_DATE) {
            newErrors.expenses[index].date = 'The expense cannot have a date before the year 2000';
            isValid = false;
          }
          if (expenseDate > MAX_DATE) {
            newErrors.expenses[index].date = 'The expense cannot have a date after today';
            isValid = false;
          }
        }
      }

      const regex =
        /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
      if (expense.urlFile && !regex.exec(expense.urlFile)) {
        newErrors.expenses[index].urlFile = 'Invalid URL';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles form submission.
   *
   * @param {FormEvent} e - The form event.
   */
  const handleForm = (e: FormEvent) => {
    e.preventDefault();
    if (formValidation()) {
      dispatch({ type: 'toggle-modal' });
    }
  };

  return (
    <>
      {state.modalOpen && <ModalConfirmation />}
      <Card className='bg-white font-montserrat' sx={{ padding: '20px' }}>
        <form onSubmit={handleForm}>
          <section className='flex flex-col md:flex-row gap-4 items-start'>
            <section className='flex flex-grow flex-col w-full md:w-3l/4'>
              <FormLabel>
                Reason for expense <span className='text-red-600'>*</span>
              </FormLabel>
              <Input
                slotProps={{ input: { maxLength: 70 } }}
                sx={{ paddingY: '14px' }}
                error={!!errors.title}
                placeholder='Write the name of the expense'
                value={state.reimbursementRequest.title}
                onChange={e => {
                  dispatch({ type: 'update-reason', payload: e.target.value });
                  errors.title = '';
                  setErrors(errors);
                }}
              />
              {errors.title && <ExpenserError>{errors.title}</ExpenserError>}
            </section>
            <section className='flex flex-grow flex-col w-full w-2/5'>
              <FormLabel>
                Date <span className='text-red-600'>*</span>
              </FormLabel>
              <DatePicker
                value={
                  state.reimbursementRequest.startDate
                    ? dayjs(state.reimbursementRequest.startDate).utc()
                    : null
                }
                onChange={date => {
                  dispatch({ type: 'update-date', payload: date || dayjs().startOf('day') });
                  errors.startDate = '';
                  setErrors(errors);
                }}
                slotProps={{ textField: { error: !!errors.startDate } }}
              />
              {errors.startDate && <ExpenserError>{errors.startDate}</ExpenserError>}
            </section>
          </section>
          <FormControl>
            <label className='text-gray font-semibold text-base my-6'>Expenses:</label>
          </FormControl>
          {state.reimbursementRequest.expenses.map((expense, idx) => (
            <ExpenseContainerInput
              key={idx}
              index={idx}
              expense={expense}
              errors={errors.expenses[idx]}
              setErrors={setErrors}
            />
          ))}
          <section className='flex gap-3 justify-end my-8'>
            <p className='text-gray  font-semibold text-base'>Total</p>
            <Chip sx={{ backgroundColor: colors.lightGold }}>
              {isNaN(totalAmount) ? formatCurrency(0) : formatCurrency(totalAmount)}
            </Chip>
          </section>
          <section className='flex gap-4 justify-end'>
            <Button
              variant='outlined'
              sx={{
                borderColor: colors.darkerGold,
                color: colors.darkGold,
                '&:hover': {
                  borderColor: colors.darkerGold,
                  background: colors.darkGold,
                  color: 'white',
                },
              }}
            >
              <Link to={'..'} replace onClick={() => dispatch({ type: 'restart-request' })}>
                Cancel
              </Link>
            </Button>
            <Button
              type='submit'
              sx={{
                background: colors.darkGold,
                '&:hover': {
                  backgroundColor: colors.darkerGold,
                },
              }}
            >
              Send Request
            </Button>
          </section>
        </form>
      </Card>
    </>
  );
};

export default ExpenseNew;
