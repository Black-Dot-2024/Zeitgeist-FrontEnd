import { Grid, Input, Sheet, Textarea } from '@mui/joy';
import { styled } from '@mui/material/styles';
import { Moment } from 'moment';
import { useState } from 'react';
import CancelButton from '../../components/common/CancelButton';
import CustomDatePicker from '../../components/common/DatePicker';
import GenericDropdown from '../../components/common/GenericDropdown';
import SendButton from '../../components/common/SendButton';
import useHttp from '../../hooks/useHttp';
import { TaskEntity } from '../../types/task';
import { TaskStatus } from '../../types/task-status';
import { WaitingFor } from '../../types/waiting-for';
import { RequestMethods } from '../../utils/constants';

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: '#E6A9A9',
  [TaskStatus.IN_PROGRESS]: '#FFE598',
  [TaskStatus.UNDER_REVISSION]: '#D7B2F0',
  [TaskStatus.DELAYED]: '#FFC774',
  [TaskStatus.POSTPONED]: '#A0C5E8',
  [TaskStatus.DONE]: '#6AA84F',
  [TaskStatus.CANCELLED]: '#FF7A7A',
};

const StyledSheet = styled(Sheet)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '0.6rem',
}));

const Header = styled('h1')(({}) => ({
  color: '#686868',
  fontWeight: 'bold',
  margin: '10px 0',
}));

const Item = styled(Sheet)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  borderRadius: 8,
}));

const NewTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [dueDate, setDueDate] = useState<Moment | null>(null);
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [waitingFor, setWaitingFor] = useState<WaitingFor | ''>('');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleStartDateChange = (date: Moment | null) => {
    setStartDate(date);
  };

  const handleDueDateChange = (date: Moment | null) => {
    setDueDate(date);
  };

  const handleStatusSelect = (value: TaskStatus) => {
    setStatus(value);
  };

  const handleWaitingForSelect = (value: WaitingFor) => {
    setWaitingFor(value);
  };

  const { sendRequest } = useHttp<TaskEntity>('/tasks/create', RequestMethods.POST);

  const handleSend = () => {
    const data = {
      title,
      description,
      startDate: startDate ? startDate.toISOString() : null,
      dueDate: dueDate ? dueDate.toISOString() : null,
      status: status.toUpperCase(),
      waitingFor,
      // TODO: Add project id when all project view is implemented
      projectId: '7b31b84b-8862-4fd2-bb6f-ef63e1c9c5c6',
    };

    console.log('Sending data: ', data);
    sendRequest({}, data, { 'Content-Type': 'application/json' });
  };

  return (
    <StyledSheet>
      <Header>Title *</Header>
      <Input
        type='text'
        placeholder='Write your text here... '
        value={title}
        onChange={handleTitleChange}
        sx={{ color: '#BDBDBD' }}
      />

      <Header>Description *</Header>
      <Textarea
        placeholder='Write your text here... '
        value={description}
        onChange={handleDescriptionChange}
        sx={{
          color: '#BDBDBD',
          width: '100%',
          height: '200px',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #E0E0E0',
          '&:focus': {
            border: '1px solid #9C844C',
          },
        }}
      />

      {/* Date and status columns */}
      <Grid container spacing={2}>
        <Grid xs={2}>
          <Item>
            <Header>Start Date *</Header>
            <CustomDatePicker value={startDate} onChange={handleStartDateChange} />
          </Item>
        </Grid>
        <Grid xs={2}>
          <Item>
            <Header>Due Date *</Header>
            <CustomDatePicker value={dueDate} onChange={handleDueDateChange} />
          </Item>
        </Grid>
        <Grid xs={2}>
          <Item>
            <Header>Status *</Header>
            <GenericDropdown
              options={Object.values(TaskStatus)}
              onSelect={handleStatusSelect}
              placeholder='Select status'
              colorMap={statusColorMap}
            />
          </Item>
        </Grid>
      </Grid>

      {/* Waiting For, Worked Hours, Project Name */}
      <Grid container spacing={2}>
        <Grid xs={2}>
          <Item>
            <Header>Waiting For ...</Header>
            <GenericDropdown
              options={Object.values(WaitingFor)}
              onSelect={handleWaitingForSelect}
              placeholder='Select waiting for ...'
            />
          </Item>
        </Grid>
        <Grid xs={2}>
          <Item>
            <Header>Worked Hours</Header>
            <Input placeholder='00' type='number' />
          </Item>
        </Grid>
        <Grid>
          <Item>
            <Header>Project Name *</Header>
            <Input type='text' placeholder='Project name' />
          </Item>
        </Grid>
      </Grid>

      {/* Cancel & send button */}
      <Grid container justifyContent='flex-end'>
        <Grid>
          <Item>
            <CancelButton />
          </Item>
        </Grid>
        <Grid>
          <Item>
            <SendButton onClick={handleSend} />
          </Item>
        </Grid>
      </Grid>
    </StyledSheet>
  );
};

export default NewTask;
