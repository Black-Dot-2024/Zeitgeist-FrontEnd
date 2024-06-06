import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormLabel, Input } from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ChangeEvent, useContext } from 'react';
import colors from '../../../colors';
import { ExpenseContext } from '../../../hooks/expenseContext';
import { ExpenseDraft } from '../../../types/expense';
import ExpenserError from './ExpenserError';

type ExpenseContainerInputProps = {
  index: number;
  expense: ExpenseDraft;
  errors: {
    expenseTitle: string;
    totalAmount: string;
    supplier: string;
    date: string;
    urlFile: string;
  };
  setErrors: (errors: object) => object;
};

const ExpenseContainerInput = ({
  index,
  expense,
  errors,
  setErrors,
}: ExpenseContainerInputProps) => {
  const { state, dispatch } = useContext(ExpenseContext);

  /**
   * Handles input change for expense fields.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    dispatch({
      type: 'update-expense',
      payload: { index, field: name, value: name === 'totalAmount' ? parseFloat(value) : value },
    });
  };

  /**
   * Handles date change for expense date field.
   *
   * @param {dayjs.Dayjs | null} date - The new date value.
   */
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    dispatch({ type: 'update-expense', payload: { index, field: 'date', value: date } });
  };

  /**
   * Handles the removal of an expense.
   */
  const handleRemoveExpense = () => {
    dispatch({ type: 'remove-expense', payload: index });
  };

  /**
   * Handles the addition of a new expense.
   */
  const handleAddExpense = () => {
    dispatch({ type: 'add-expense' });
    setErrors(prevErrors => ({
      ...prevErrors,
      expenses: [
        ...prevErrors.expenses,
        {
          expenseTitle: '',
          totalAmount: '',
          supplier: '',
          date: '',
          urlFile: '',
        },
      ],
    }));
  };

  return (
    <>
      <div
        className={`flex flex-wrap items-start gap-3 ${index === 0 ? 'mt-0' : 'mt-10'} justify-end`}
      >
        <p className='font-semibold text-base'>{`${index + 1}.`}</p>
        <main className='flex flex-col flex-1'>
          <section className='flex flex-col md:flex-row flex-1 gap-4'>
            <div className='w-full md:w-[80%]'>
              <FormLabel>
                Expense <span className='text-red-600'>*</span>
              </FormLabel>
              <Input
                slotProps={{ input: { maxLength: 70 } }}
                error={!!errors.expenseTitle}
                sx={{ paddingY: '14px' }}
                type='text'
                placeholder='Expense Description'
                name='title'
                value={expense.title}
                onChange={handleInputChange}
              />
              {errors.expenseTitle! && <ExpenserError>{errors.expenseTitle}</ExpenserError>}
            </div>
            <div className='w-full md:w-[20%]'>
              <FormLabel>
                Amount <span className='text-red-600'>*</span>
              </FormLabel>
              <Input
                error={!!errors.totalAmount}
                sx={{ paddingY: '14px' }}
                type='number'
                placeholder='$000.00 *'
                name='totalAmount'
                value={expense.totalAmount}
                onChange={e => {
                  if (e.nativeEvent.data == 'e') return;
                  if (e.nativeEvent.data == '-') return;
                  if (parseFloat(e.target.value) < 0 || parseFloat(e.target.value) > 1e6) return;
                  if (isNaN(parseFloat(e.target.value))) e.target.value = String(0);
                  e.target.value = String(Number(e.target.value))
                  handleInputChange(e);
                }}
              />
              {errors.totalAmount && <ExpenserError>{errors.totalAmount}</ExpenserError>}
            </div>
          </section>
          <section className='flex flex-col md:flex-row flex-1 gap-4 items-start mt-4'>
            <div className='w-full'>
              <FormLabel>Supplier</FormLabel>
              <Input
                slotProps={{ input: { maxLength: 70 } }}
                sx={{ paddingY: '14px' }}
                type='text'
                placeholder='Supplier'
                name='supplier'
                value={expense.supplier || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className='w-full'>
              <FormLabel>
                Date <span className='text-red-600'>*</span>
              </FormLabel>
              <DatePicker
                sx={{ width: '100%' }}
                value={dayjs(expense.date).utc()}
                onChange={handleDateChange}
                slotProps={{ textField: { error: !!errors.date } }}
              />
              {errors.date && <ExpenserError>{errors.date}</ExpenserError>}
            </div>

            <section className='flex flex-col flex-1 items-start w-full'>
              <div className='flex items-center gap-2'>
                <LinkIcon sx={{ color: colors.gold }} />
                <FormLabel>Link to voucher</FormLabel>
              </div>
              <div className='flex flex-row items-center w-full gap-3'>
                <Input
                  slotProps={{ input: { maxLength: 512 } }}
                  sx={{
                    width: '100%',
                    paddingY: '14px',
                    borderColor: colors.gold,
                    '& input::placeholder': {
                      color: colors.darkGold,
                    },
                  }}
                  type='text'
                  placeholder='URL'
                  name='urlFile'
                  value={expense.urlFile || ''}
                  onChange={handleInputChange}
                />
              </div>
              {errors.urlFile && <ExpenserError>{errors.urlFile}</ExpenserError>}
            </section>
          </section>
        </main>
        <article>
          {index !== 0 && (
            <div className='bg-gold rounded-md h-8 w-8 flex items-center justify-center cursor-pointer'>
              <RemoveIcon className='text-white px-1 my-auto' onClick={handleRemoveExpense} />
            </div>
          )}
        </article>
      </div>
      {state.reimbursementRequest.expenses.length < 30 &&
        index === state.reimbursementRequest.expenses.length - 1 && (
          <div className='bg-gold rounded-md h-8 w-8 flex items-center justify-center mx-auto mt-6 cursor-pointer'>
            <AddIcon className='text-white px-1' onClick={handleAddExpense} />
          </div>
        )}
    </>
  );
};

export default ExpenseContainerInput;
