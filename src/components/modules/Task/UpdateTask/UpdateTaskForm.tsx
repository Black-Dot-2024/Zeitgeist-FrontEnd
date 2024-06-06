/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Card, Chip, FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { default as colors, statusChipColorCombination } from '../../../../colors';
import useTaskForm, { Fields } from '../../../../hooks/useTaskForm';
import { EmployeeEntity } from '../../../../types/employee';
import { TaskDetail } from '../../../../types/task';
import { TaskStatus } from '../../../../types/task-status';
import { MAX_DATE, MIN_DATE } from '../../../../utils/constants';
import CancelButton from '../../../common/CancelButton';
import GenericDropdown from '../../../common/GenericDropdown';
import GenericInput from '../../../common/GenericInput';
import GenericTextArea from '../../../common/GenericTextArea';
import ModifyButton from '../../../common/ModifyButton';

const statusColorMap: Record<TaskStatus, { bg: string; font: string }> = {
  [TaskStatus.NOT_STARTED]: statusChipColorCombination.notStarted,
  [TaskStatus.IN_PROGRESS]: statusChipColorCombination.inProgress,
  [TaskStatus.UNDER_REVISION]: statusChipColorCombination.underRevision,
  [TaskStatus.DELAYED]: statusChipColorCombination.delayed,
  [TaskStatus.POSTPONED]: statusChipColorCombination.postponed,
  [TaskStatus.DONE]: statusChipColorCombination.done,
  [TaskStatus.CANCELLED]: statusChipColorCombination.cancelled,
};

interface UpdateTaskFormProps {
  employees: EmployeeEntity[];
  data: TaskDetail;
  projectName: string;
}

/**
 * Update Task form component
 *
 * @component
 * @param {UpdateTaskFormProps} props - Component props
 *
 * @returns {JSX.Element} Update Task form component
 */
const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({
  employees,
  data,
  projectName,
}: UpdateTaskFormProps): JSX.Element => {
  const form = useTaskForm();

  useEffect(() => {
    form.setState({
      title: data.title,
      description: data.description,
      startDate: dayjs(data.startDate),
      endDate: data.endDate ? dayjs(data.endDate) : null,
      status: data.status,
      workedHours: data.workedHours ?? 0,
      idEmployee: data.employeeId,
    });
  }, [data]);

  return (
    <Card className='overflow-y-scroll'>
      <form className='flex flex-col gap-4'>
        <FormControl error={!!form.errors.title}>
          <GenericInput
            value={form.formState.title}
            handleChange={form.handleChange}
            name={'title' as Fields}
            label='Title'
            required
            errorString={form.errors.title}
            placeholder='Enter title...'
            max={70}
          />
        </FormControl>
        <GenericTextArea
          name={'description' as Fields}
          errorString={form.errors.description}
          handleChange={form.handleChange}
          label={'Description'}
          value={form.formState.description}
          placeholder='Enter description...'
          required
          max={255}
        />
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <FormControl error={!!form.errors.startDate}>
            <FormLabel>
              Start Date <span className='text-red-600'>*</span>
            </FormLabel>
            <DatePicker
              value={form.formState.startDate?.utc()}
              onChange={newDate => {
                form.handleChange('startDate', newDate);
              }}
              slotProps={{ textField: { error: !!form.errors.startDate } }}
              minDate={MIN_DATE}
              maxDate={MAX_DATE}
            />
            {form.errors.startDate ? (
              <FormHelperText> {form.errors.startDate}</FormHelperText>
            ) : null}
          </FormControl>
          <FormControl error={!!form.errors.endDate}>
            <FormLabel>End Date</FormLabel>
            <DatePicker
              value={form.formState.endDate?.utc()}
              onChange={newDate => form.handleChange('endDate', newDate)}
              slotProps={{ textField: { error: !!form.errors.endDate } }}
              maxDate={MAX_DATE}
            />
            {form.errors.endDate ? <FormHelperText>{form.errors.endDate}</FormHelperText> : null}
          </FormControl>
          <FormControl>
            <FormLabel>
              Status <span className='text-red-600'>*</span>
            </FormLabel>
            <GenericDropdown
              value={form.formState.status}
              options={Object.values(TaskStatus)}
              onChange={status => form.handleChange('status', status)}
              placeholder='Select status'
              colorMap={statusColorMap}
            />
          </FormControl>
        </section>
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <FormControl>
            <FormLabel>Assign Employee</FormLabel>
            <GenericDropdown
              placeholder='Select employee'
              value={form.formState.idEmployee}
              options={employees.map(employee => `${employee.firstName} ${employee.lastName}`)}
              values={employees.map(employee => employee.id)}
              onChange={newVal => form.handleChange('idEmployee', newVal)}
              clearable
            />
          </FormControl>
          <FormControl error={!!form.errors.workedHours}>
            <FormLabel>Worked Hours</FormLabel>
            <Input
              type='number'
              value={form.formState.workedHours}
              onChange={e => {
                if (e.nativeEvent.data == 'e') return;
                if (e.nativeEvent.data == '-') return;
                if (parseFloat(e.target.value) < 0 || parseFloat(e.target.value) > 1000) return;
                if (isNaN(parseFloat(e.target.value))) e.target.value = '0';
                e.target.value = String(Number(e.target.value));
                form.handleChange('workedHours', e.target.value);
              }}
            />
            {form.errors ? <FormHelperText>{form.errors.workedHours}</FormHelperText> : null}
          </FormControl>
          <FormControl>
            <FormLabel>Project Name</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                className='min-w-[150px] pr-6'
                variant='soft'
                sx={{
                  bgcolor: colors.lighterGray,
                  color: colors.gray,
                  fontSize: '1rem',
                  flexGrow: 1,
                  padding: '0.3rem 1rem',
                }}
              >
                {projectName}
              </Chip>
            </Box>
          </FormControl>
        </section>
        <section className='flex lg:mt-10 gap-4 justify-end'>
          <Link to={`/projects/details/${data.idProject}`} replace>
            <CancelButton onClick={() => {}} />
          </Link>
          <ModifyButton disabled={form.isPosting} onClick={() => form.handleUpdate(data.id)} />
        </section>
      </form>
    </Card>
  );
};

export default UpdateTaskForm;
