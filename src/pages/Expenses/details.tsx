import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Button, FormControl, Sheet, Typography } from '@mui/joy';
import Divider from '@mui/material/Divider';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { isAxiosError } from 'axios';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import trash_can from '../../assets/icons/trash_can.svg';
import colors, { statusChipColorCombination } from '../../colors';
import ColorChip from '../../components/common/ColorChip';
import CreateConfirmationModal from '../../components/common/CreateConfirmationModal';
import DeleteModal from '../../components/common/DeleteModal';
import GenericDropdown from '../../components/common/GenericDropdown';
import GenericInput from '../../components/common/GenericInput';
import GoBack from '../../components/common/GoBack';
import Loader from '../../components/common/Loader';
import { ExpensesTable } from '../../components/modules/Expenses/ExpensesTable';
import StatusChip from '../../components/modules/Expenses/StatusChip';
import { EmployeeContext } from '../../hooks/employeeContext';
import { SnackbarContext } from '../../hooks/snackbarContext';
import useDeleteReport from '../../hooks/useDeleteReport';
import useExpenseForm, { Fields } from '../../hooks/useExpenseForm';
import useHttp from '../../hooks/useHttp';
import { ExpenseReport, ExpenseReportStatus } from '../../types/expense';
import { APIPath, RequestMethods, RoutesPath, SupportedRoles } from '../../utils/constants';
import Report from './report';

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
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const [expenseStatus, setExpenseStatus] = useState<ExpenseReportStatus>(
    ExpenseReportStatus.PENDING
  );

  const [urlVoucher, setUrlVoucher] = useState<string | null | undefined>(null);
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

  const { deleteReport } = useDeleteReport();

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
      if (data && newStatus) data.status = newStatus.status ?? expenseStatus;
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

  const navigate = useNavigate();

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

  /**
   * @description Method to handle the report deletion
   * @param id
   */

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      setSnackbar({
        open: true,
        message: 'Report deleted successfully',
        type: 'success',
      });
      navigate(RoutesPath.EXPENSES);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete report',
        type: 'danger',
      });
    }
  };

  return (
    <main className='min-h-0 flex flex-col gap-2'>
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
        <section className='bg-white flex-1 flex flex-col rounded-xl py-3 px-6 mb-4 shadow-lg'>
          <CreateConfirmationModal
            open={openModal}
            setOpen={setOpenModal}
            url={form.formState.urlVoucher}
            handleOnClick={() => {
              setOpenModal(false);
              form.handleUpdate(id!, true, setOpenModal);
            }}
          />

          <section className='flex justify-end flex-wrap-reverse md:flex-nowrap md:justify-between gap-4 py-6 items-start'>
            <h1 className='text-gray text-lg lg:text-[2rem] break-all whitespace-break-spaces'>
              {data.title}
            </h1>
            <div className='flex gap-2 md:gap-5 shrink-0'>
              <PDFDownloadLink document={<Report data={data} />} fileName='Report'>
                <Button
                  sx={{
                    backgroundColor: colors.lightWhite,
                    ':hover': {
                      backgroundColor: colors.orangeChip,
                    },
                    height: '5px',
                  }}
                  startDecorator={<PictureAsPdfIcon sx={{ width: 24, color: colors.gold }} />}
                >
                  <Typography sx={{ color: colors.gold, fontSize: '14px' }}>Download</Typography>
                </Button>
              </PDFDownloadLink>
              <Button
                onClick={() => {
                  setOpenDeleteModal(true);
                }}
                sx={{
                  backgroundColor: colors.lightWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                  height: '5px',
                }}
                startDecorator={<img src={trash_can} alt='Delete' style={{ width: 24 }} />}
              >
                <Typography sx={{ color: colors.gold, fontSize: '14px' }}>Delete</Typography>{' '}
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
          <section className='flex-1 mb-4'>
            <Sheet sx={{ overflow: 'auto', height: '100%' }}>
              <ExpensesTable expenses={data.expenses || []}></ExpensesTable>
            </Sheet>
          </section>
          <section className='flex flex-wrap flex-col-reverse sm:flex-row justify-between mt-6 gap-5'>
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
      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title='Delete Expense Report'
        description='Every expense record associated with this report will be deleted'
        id={data?.id ?? ''}
        handleDelete={handleDeleteReport}
      />
    </main>
  );
};

export default ExpenseDetails;
