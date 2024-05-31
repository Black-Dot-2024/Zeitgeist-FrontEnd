import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Button, FormControl, Sheet, Typography } from '@mui/joy';
import Divider from '@mui/material/Divider';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import trash_can from '../../assets/icons/trash_can.svg';
import colors, { statusChipColorCombination } from '../../colors';
import ColorChip from '../../components/common/ColorChip';
import CreateConfirmationModal from '../../components/common/CreateConfirmationModal';
import GenericDropdown from '../../components/common/GenericDropdown';
import GenericInput from '../../components/common/GenericInput';
import GoBack from '../../components/common/GoBack';
import Loader from '../../components/common/Loader';
import { ExpensesTable } from '../../components/modules/Expenses/ExpensesTable';
import StatusChip from '../../components/modules/Expenses/StatusChip';
import { EmployeeContext } from '../../hooks/employeeContext';
import { SnackbarContext } from '../../hooks/snackbarContext';
import useExpenseForm, { Fields } from '../../hooks/useExpenseForm';
import useHttp from '../../hooks/useHttp';
import { ExpenseReport, ExpenseReportStatus } from '../../types/expense';
import { APIPath, RequestMethods, SupportedRoles } from '../../utils/constants';

function capitalize(data: string): string {
  return data.charAt(0).toUpperCase() + data.substring(1).toLowerCase();
}

const statusColorMap: Record<ExpenseReportStatus, { bg: string; font: string; bgHover: string }> = {
  [ExpenseReportStatus.ACCEPTED]: statusChipColorCombination.accepted,
  [ExpenseReportStatus.PAYED]: statusChipColorCombination.done,
  [ExpenseReportStatus.PENDING]: statusChipColorCombination.inProgress,
  [ExpenseReportStatus.REJECTED]: statusChipColorCombination.cancelled,
};

const ExpenseDetails = () => {
  const { id } = useParams();

  const { setState: setSnackbar } = useContext(SnackbarContext);
  const { employee } = useContext(EmployeeContext);
  const form = useExpenseForm();

  const [employeeName, setEmployeeName] = useState<string>('');
  const [notFound, setNotFound] = useState(false);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [expenseStatus, setExpenseStatus] = useState<ExpenseReportStatus>(
    ExpenseReportStatus.PENDING
  );
  const [urlVoucher, setUrlVoucher] = useState<string | null | undefined>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expenseReportToDelete, setDelete] = useState<ExpenseReport | null>(null);
  const { data, loading, sendRequest, error } = useHttp<ExpenseReport>(
    `${APIPath.EXPENSE_REPORT}/${id}`,
    RequestMethods.GET
  );

  const {
    data: newStatus,
    loading: loadingStatus,
    error: errorStatus,
    sendRequest: updateStatus,
  } = useHttp<ExpenseReport>(`${APIPath.EXPENSE_REPORT}/status/${id}`, RequestMethods.PUT);

  const {
    data: deleteData,
    loading: deleteLoading,
    error: deleteError,
    sendRequest: deleteRequest,
  } = useHttp<ExpenseReport>(`${APIPath.EXPENSE_REPORT}/delete/${id}`, RequestMethods.DELETE);

  useEffect(() => {
    if (!data) sendRequest();
    else employeeNameParser(data.employeeFirstName, data.employeeLastName);

    if (data) {
      setExpenseStatus(data.status as ExpenseReportStatus);
      setUrlVoucher(data.urlVoucher);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (isAxiosError(error)) {
      const message = error.response?.data.message;
      if (message.includes('unexpected error')) setNotFound(true);

      if (message.includes('Unauthorized employee')) setNotAuthorized(true);
    }
  }, [error]);

  useEffect(() => {
    if (newStatus) {
      setSnackbar({ open: true, message: 'Expense status updated successfully', type: 'success' });
      setExpenseStatus(newStatus.status ?? expenseStatus);
    }
    if (errorStatus)
      setSnackbar({
        open: true,
        message: 'Error updating expense status. Please, try again',
        type: 'danger',
      });

    if (form.data?.urlVoucher) {
      setExpenseStatus(ExpenseReportStatus.PAYED);
      setUrlVoucher(form.data.urlVoucher);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newStatus, loadingStatus, errorStatus, form.data]);

  /**
   * Method to parse the employee's name and get one first name and one last name
   * @param firstName string | undefined first name of employee
   * @param lastName string | undefined last name of employee
   */
  const employeeNameParser = (
    firstName: string | undefined,
    lastName: string | undefined
  ): void => {
    if (firstName && lastName) {
      setEmployeeName(`${firstName.split(' ')[0]} ${lastName.split(' ')[0]}`);
    }
  };

  /**
   * @description Method tu handle the status change and PUT it in the backend
   * @param newStatus ExpsenseReportStatus the new status to be updated
   */
  const handleStatusChange = async (newStatus: ExpenseReportStatus) => {
    try {
      updateStatus({}, { status: newStatus }, { 'Content-Type': 'application/json' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating expense status. Please, try again',
        type: 'danger',
      });
    }
  };

  const onDelete = async (expenseId: string) => {
    await deleteRequest({}, { id: expenseId });
  };

  useEffect(() => {
    if (!deleteError) {
      setSnackbar({
        open: true,
        message: 'Expense deleted successfully',
        type: 'success',
      });
    } else if (deleteData) {
      setSnackbar({
        open: true,
        message: 'Error deleting expense. Please, try again',
        type: 'danger',
      });
    }
  }, [deleteError, deleteData, setSnackbar]);

  if (notFound || notAuthorized) {
    return <Navigate to='/404' replace />;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: colors.gray[500],
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <main className='min-h-0 flex flex-col gap-2 overflow-hidden'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <GoBack />
      </Box>

      {data ? (
        <section className='overflow-y-auto overflow-hidden bg-white rounded-xl p-6 '>
          <CreateConfirmationModal
            open={openModal}
            setOpen={setOpenModal}
            url={form.formState.urlVoucher}
            handleOnClick={() => {
              setOpenModal(false);
              form.handleUpdate(id!, true, setOpenModal);
            }}
          />

          <section className='flex justify-end flex-wrap-reverse md:flex-nowrap md:justify-between gap-x-4 items-center'>
            <h1 className='truncate text-gray text-[2rem] break-all whitespace-break-spaces'>
              {data.title}
            </h1>
            <div className='flex gap-3 shrink-0'>
              <Button
                //onClick={}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                  height: '5px',
                }}
                startDecorator={<PictureAsPdfIcon sx={{ width: 24, color: colors.gold }} />}
              >
                <Typography sx={{ color: colors.gold }}>Download</Typography>
              </Button>
              <Button
                onClick={() => setDelete(data)}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                  height: '5px',
                }}
                startDecorator={<img src={trash_can} alt='Delete' style={{ width: 24 }} />}
              >
                <Typography sx={{ color: colors.gold }}>Delete</Typography>{' '}
              </Button>
            </div>
          </section>
          <section className='flex-wrap grid my-2'>
            <p className='text-wrap break-all whitespace-break-spaces text-justify'>
              {data.description}
            </p>
          </section>
          <Divider sx={{ marginBottom: '10px' }} />
          <section className='grid grid-cols-2 lg:grid-cols-4 items-center mb-8 gap-5'>
            <Box>
              <p style={{ fontSize: '.9rem' }}>Status</p>
              {!urlVoucher &&
              (employee?.role == SupportedRoles.ADMIN ||
                employee?.role == SupportedRoles.ACCOUNTING) ? (
                <GenericDropdown
                  disabled={loadingStatus}
                  options={Object.values(ExpenseReportStatus)}
                  colorMap={statusColorMap}
                  onChange={function (newValue: string | null): void {
                    handleStatusChange(newValue as ExpenseReportStatus);
                  }}
                  value={expenseStatus}
                ></GenericDropdown>
              ) : (
                <StatusChip
                  status={expenseStatus ? capitalize(expenseStatus) : ExpenseReportStatus.PENDING}
                />
              )}
            </Box>
            <Box>
              <p style={{ fontSize: '.9rem' }}>Total</p>
              <ColorChip
                label={`\$ ${data.totalAmount ? data.totalAmount : 0}`}
                color={`${colors.lightGold}`}
              ></ColorChip>
            </Box>
            <Box>
              <p style={{ fontSize: '.9rem' }}>Name</p>
              {employeeName != '' ? (
                <ColorChip label={`${employeeName}`} color={`${colors.null}`}></ColorChip>
              ) : (
                <ColorChip label='No employee assigned' color={`${colors.null}`}></ColorChip>
              )}
            </Box>
            <Box className='flex flex-col md:flex-row md:items-center self-end gap-x-2'>
              <div className='flex items-center'>
                <div className='hidden md:flex'>
                  <EventNoteRoundedIcon />
                </div>
                <p style={{ fontSize: '.9rem' }}>Date: </p>
              </div>
              {dayjs.utc(data.startDate).format('DD/MM/YYYY')}
            </Box>
          </section>
          <section className='mb-4'>
            <Sheet sx={{ overflow: 'auto' }}>
              <ExpensesTable expenses={data.expenses || []}></ExpensesTable>
            </Sheet>
          </section>
          <section className='flex flex-wrap flex-col-reverse sm:flex-row justify-between mt-16 gap-5'>
            {expenseStatus == ExpenseReportStatus.PAYED && urlVoucher && (
              <Button
                component='a'
                href={urlVoucher ? urlVoucher : ''}
                variant='plain'
                startDecorator={<LinkIcon />}
                target='_blank'
                sx={{
                  color: colors.gold,
                  ':hover': { backgroundColor: colors.lighterGray },
                }}
              >
                Link to voucher
              </Button>
            )}
            {expenseStatus == ExpenseReportStatus.PAYED &&
            !urlVoucher &&
            (employee?.role == SupportedRoles.ADMIN ||
              employee?.role == SupportedRoles.ACCOUNTING) ? (
              <form
                className='flex flex-col sm:flex-row items-start gap-3'
                // onSubmit={e => form.handleUpdate(e, id!, userConfirmation, setOpenModal)}
              >
                <div className='sm:flex gap-2'>
                  <LinkIcon sx={{ color: colors.gold, marginTop: '12px' }} />
                  <FormControl>
                    <GenericInput
                      name={'urlVoucher' as Fields}
                      placeholder='Link to voucher'
                      errorString={form.errors.urlVoucher}
                      handleChange={form.handleChange}
                      value={form.formState.urlVoucher}
                      max={512}
                      className='mt-0'
                      sx={{
                        width: '70vw',
                        '@media (min-width: 640px)': {
                          width: '50vw',
                          maxWidth: '300px',
                        },
                        '@media (min-width: 1400px)': {
                          maxWidth: '450px',
                        },
                      }}
                    />
                  </FormControl>
                </div>
                <Button
                  onClick={() => form.handleUpdate(id!, false, setOpenModal)}
                  sx={{
                    marginTop: '6px',
                    background: colors.darkGold,
                    '&:hover': {
                      backgroundColor: colors.darkerGold,
                    },
                  }}
                >
                  Upload
                </Button>
              </form>
            ) : (
              <div></div>
            )}
            <Box className='flex flex-row gap-4 justify-end items-center'>
              <p style={{ fontSize: '.9rem' }}>Total: </p>
              <ColorChip
                label={`\$ ${data.totalAmount ? data.totalAmount : 0}`}
                color={`${colors.lightGold}`}
              ></ColorChip>
            </Box>
          </section>
        </section>
      ) : (
        <section className='overflow-y-auto overflow-hidden bg-white rounded-xl p-6 '>
          <Typography variant='plain' level='h1'>
            No data available
          </Typography>
        </section>
      )}
    </main>
  );
};

export default ExpenseDetails;
