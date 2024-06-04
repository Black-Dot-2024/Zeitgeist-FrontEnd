import { Search } from '@mui/icons-material';
import CachedIcon from '@mui/icons-material/Cached';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Button, Input, Typography } from '@mui/joy';
import Box from '@mui/joy/Box';
import Option from '@mui/joy/Option';
import Select, { selectClasses } from '@mui/joy/Select';
import Divider from '@mui/material/Divider';
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import { SyntheticEvent, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import calendar from '../../assets/icons/calendar.svg';
import colors from '../../colors';
import ColorChip from '../../components/common/ColorChip';
import ComponentPlaceholder from '../../components/common/ComponentPlaceholder';
import GoBack from '../../components/common/GoBack';
import Loader from '../../components/common/Loader';
import StatusChip from '../../components/common/StatusChip';
import { SnackbarContext } from '../../hooks/snackbarContext';
import useHttp from '../../hooks/useHttp';
import { axiosInstance } from '../../lib/axios/axios';
import { Report } from '../../types/project-report';
import { APIPath, BASE_API_URL, RequestMethods } from '../../utils/constants';
import { truncateText } from '../../utils/methods';
import ProjectReportPDF from './report-pdf';
import { capitalize } from './reportMethods';

const ProjectReport: React.FC = () => {
  const { id } = useParams();
  const date = useRef<string>('');

  const navigate = useNavigate();

  const [report, setReport] = useState<Report>();
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(Number(new Date().getFullYear()));
  const { setState } = useContext(SnackbarContext);
  const [validYear, setValidYear] = useState<boolean>(false);
  const [usingFilter, setUsingFilter] = useState<boolean>(false);

  const reqReport = useHttp<Report>(`${APIPath.PROJECT_REPORT}/${id}`, RequestMethods.GET);

  const keyMap = new Map<string, string>([
    ['done', 'Done'],
    ['inprogress', 'In process'],
    ['underrevision', 'Under revision'],
    ['delayed', 'Delayed'],
    ['postponed', 'Postponed'],
    ['notstarted', 'Not started'],
    ['cancelled', 'Cancelled'],
  ]);

  const hasErrors = () => {
    return validYear;
  };

  const handleYearChange = (value: string) => {
    if (
      !/^\d*\.?\d*$/.test(value) ||
      value.length !== 4 ||
      Number(value) < 2018 ||
      Number(value) > new Date().getFullYear()
    ) {
      setState({ open: true, message: 'Please enter a valid year.', type: 'danger' });
      setValidYear(true);
      return;
    }
    setValidYear(false);
    setState({ open: false, message: '' });
    setYear(Number(value));
  };

  const handleMonthChange = (event: SyntheticEvent | null, value: number | null) => {
    if (value !== null) {
      setMonth(value);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = () => {
    setUsingFilter(true);
    date.current = dayjs.utc(new Date(year, month - 1)).format('YYYY/MM/DD');
    const doFetch = async (): Promise<void> => {
      const data = await axiosInstance.get(
        `${BASE_API_URL}${APIPath.PROJECT_REPORT}/${id}?date=${date.current}`
      );
      setReport(data.data);
    };
    void doFetch();
  };

  const handleClear = () => {
    setMonth(1);
    setValidYear(false);
    setYear(Number(new Date().getFullYear()));
    setState({ open: false, message: '' });
    reqReport.sendRequest();
    setUsingFilter(false);
  };

  useEffect(() => {
    if (!reqReport.data) {
      reqReport.sendRequest();
    } else {
      setReport(reqReport.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqReport.data]);

  useEffect(() => {}, [handleSearch]);

  useEffect(() => {
    const handleStorageChange = event => {
      if (event.key === 'projectStatus') {
        // Reload or fetch new data
        window.location.reload(); // or fetch new data logic here
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (reqReport.loading) {
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
        <Typography variant='plain' level='h1' mb={4}>
          Loading report
        </Typography>

        <Loader />
      </Box>
    );
  }

  const totalTasks = report?.statistics?.total || 1;

  if (reqReport.error) {
    if (reqReport.error.message.includes('403')) {
      navigate('/projects');
    } else {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ComponentPlaceholder text='Error loading the report.' />
        </Box>
      );
    }
  }

  return (
    <main className='flex flex-col gap-2 overflow-hidden'>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <GoBack />
      </Box>

      {report ? (
        <section className='bg-white rounded-xl p-3 md:p-6 mb-5 overflow-y-scroll'>
          <section className='grid grid-cols-2 md:flex flex-wrap justify-end gap-3 mb-5'>
            <Select
              defaultValue={new Date().getUTCMonth()}
              placeholder='Month'
              indicator={<KeyboardArrowDown />}
              sx={{
                bgcolor: 'transparent',
                [`& .${selectClasses.indicator}`]: {
                  transition: '0.2s',
                  [`&.${selectClasses.expanded}`]: {
                    transform: 'rotate(-180deg)',
                  },
                },
              }}
              onChange={handleMonthChange}
            >
              <Option value={1}>January</Option>
              <Option value={2}>February</Option>
              <Option value={3}>March</Option>
              <Option value={4}>April</Option>
              <Option value={5}>May</Option>
              <Option value={6}>June</Option>
              <Option value={7}>July</Option>
              <Option value={8}>August</Option>
              <Option value={9}>September</Option>
              <Option value={10}>October</Option>
              <Option value={11}>November</Option>
              <Option value={12}>December</Option>
            </Select>
            <Input
              type='number'
              placeholder='Year'
              defaultValue={year}
              onChange={e => handleYearChange(e.target.value)}
              className='md:max-w-[110px]'
            />
            <Button
              className='col-span-full'
              sx={{
                backgroundColor: colors.lightWhite,
                ':hover': {
                  backgroundColor: colors.orangeChip,
                },
                ':disabled': {
                  backgroundColor: colors.lighterGray,
                },
              }}
              onClick={handleSearch}
              disabled={hasErrors()}
              startDecorator={
                <Search style={{ width: 24, color: validYear ? colors.null : colors.gold }} />
              }
            >
              <Typography sx={{ color: validYear ? colors.null : colors.gold }}>Search</Typography>
            </Button>
            <Button
              sx={{
                backgroundColor: colors.lighterWhite,
                ':hover': {
                  backgroundColor: colors.orangeChip,
                },
              }}
              onClick={handleClear}
              startDecorator={<CachedIcon style={{ width: 24, color: colors.gold }} />}
            >
              <Typography sx={{ color: colors.gold, paddingTop: '3px' }}>Reset</Typography>
            </Button>
            <PDFDownloadLink
              document={
                <ProjectReportPDF
                  data={report}
                  usingFilters={usingFilter}
                  month={month}
                  year={year}
                />
              }
              fileName={`report_${report.project.name}.pdf`}
            >
              <Button
                className='w-full'
                sx={{
                  backgroundColor: colors.lighterWhite,
                  ':hover': {
                    backgroundColor: colors.orangeChip,
                  },
                }}
                startDecorator={<PictureAsPdfIcon style={{ width: 24, color: colors.gold }} />}
              >
                <Typography sx={{ color: colors.gold, paddingTop: '3px' }}>Download</Typography>
              </Button>
            </PDFDownloadLink>
          </section>
          <section className='grid lg:grid-cols-2 mb-8 gap-y-8'>
            <div className='mr-5 xl:mr-10'>
              <section className='mb-4 leading-tight text-2xl font-semibold'>
                <p className='break-all whitespace-break-spaces'>{report.project.name}</p>
              </section>
              <section className='mb-4 xl:mb-8 break-all whitespace-break-spaces'>
                {' '}
                <p>{report.project.description}</p>{' '}
              </section>
              <section className='flex flex-wrap gap-4 flex-col md:flex-row xl:grid xl:grid-cols-3 mb-2 lg:mb-4'>
                <div>
                  <p className='text-sm'>Status</p>
                  <StatusChip status={report.project.status} />
                </div>
                <div>
                  <p className='text-sm'>Total Hours</p>
                  <ColorChip
                    label={`${report.project.totalHours}`}
                    color={`${colors.extra}`}
                  ></ColorChip>
                </div>
                <div>
                  <p className='text-sm'>Company</p>
                  <ColorChip
                    label={`${truncateText(report.project.companyName, 30)}`}
                    color={`${colors.null}`}
                  ></ColorChip>
                </div>
              </section>
              <section className='flex flex-wrap gap-4 flex-col md:flex-row xl:grid xl:grid-cols-3 overflow-hidden mb-2 lg:mb-4'>
                {report.project.area && (
                  <div>
                    <p className='text-sm'>Area</p>
                    <ColorChip
                      label={capitalize(report.project.area)}
                      color={`${colors.extra}`}
                    ></ColorChip>
                  </div>
                )}
                <div>
                  <p className='text-sm'>Chargeable</p>
                  <ColorChip
                    label={report.project.isChargeable ? 'Yes' : 'No'}
                    color={`${colors.null}`}
                  ></ColorChip>
                </div>
                {report.project.category && (
                  <div>
                    <p className='text-sm'>Category</p>
                    <ColorChip label={report.project.category} color={`${colors.null}`}></ColorChip>
                  </div>
                )}
              </section>
              <section className='flex flex-wrap gap-2 xl:justify-between mb-4'>
                {report.project.matter && (
                  <div className='max-w-full'>
                    <p className='text-sm'>Matter</p>
                    <ColorChip
                      label={truncateText(report.project.matter, 30)}
                      color={`${colors.null}`}
                    ></ColorChip>
                  </div>
                )}
              </section>
              <section className='flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='min-w-[100px]'>
                  <div className='flex gap-1'>
                    <img src={calendar} alt='calendar' className='w-5' />
                    <p style={{ fontSize: '1em' }}>&nbsp;Start Date</p>
                  </div>
                  <p>{dayjs.utc(report.project.startDate).format('DD-MM-YYYY')}</p>
                </div>

                {report.project.endDate && (
                  <div className='min-w-[100px]'>
                    <div className='flex gap-1'>
                      <img src={calendar} alt='calendar' className='w-5' />
                      <p style={{ fontSize: '1rem' }}>&nbsp;End Date</p>
                    </div>
                    <p>{dayjs.utc(report.project.endDate).format('DD-MM-YYYY')}</p>
                  </div>
                )}
              </section>
            </div>
            <div
              className='flex flex-col xl:justify-between gap-4 rounded-xl py-6'
              style={{ backgroundColor: colors.lightWhite }}
            >
              {report.statistics &&
                Object.entries(report.statistics)
                  .filter(([key]) => key !== 'total')
                  .map(([item, value], index) => {
                    return (
                      <div
                        className='flex flex-col xl:grid xl:grid-cols-6 xl:items-center mx-6'
                        key={index}
                      >
                        <div className='xl:cols-span-1'>
                          <p>{keyMap.get(item)}</p>
                        </div>
                        <div className='xl:col-span-4'>
                          <Box
                            bgcolor={'#D5C7AD'}
                            sx={{
                              borderRadius: '10px',
                              width: '100%',
                              height: '15px',
                            }}
                          >
                            <Box
                              width={`${((value * 100) / totalTasks).toString()}%`}
                              bgcolor={colors.gold}
                              sx={{
                                borderRadius: '10px',
                                height: '15px',
                              }}
                            />
                          </Box>
                        </div>
                        <p className='xl:colspan-1 justify-self-end'>
                          {Math.round((value * 100) / totalTasks)}%
                        </p>
                      </div>
                    );
                  })}
            </div>
          </section>
          <Divider sx={{ marginBottom: '30px' }} />
          <section className='flex flex-col gap-3'>
            {report.tasks?.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ComponentPlaceholder
                  text={
                    usingFilter
                      ? "No tasks with status 'Done' were found for this date"
                      : 'No tasks associated to this project were found.'
                  }
                />
              </Box>
            )}
            {report.tasks?.map(item => {
              return (
                <section key={item.id}>
                  <Box>
                    <div className='mb-4'>
                      <h3 className='text-2xl font-semibold break-all whitespace-break-spaces'>
                        {item.title}
                      </h3>
                    </div>

                    <div className='mb-4'>
                      <p className='break-all whitespace-break-spaces'>{item.description}</p>
                    </div>

                    <div className='flex flex-wrap gap-4 mb-10'>
                      <div>
                        <p className='text-sm'>Status</p>
                        <StatusChip status={item.status} />
                      </div>

                      {item.workedHours && (
                        <div className='min-w-[92px]'>
                          <p className='text-sm'>Worked Hours</p>
                          <ColorChip
                            label={`${item.workedHours} ${item.workedHours === 1 ? 'hr.' : 'hrs.'}`}
                            color={`${colors.extra}`}
                          ></ColorChip>
                        </div>
                      )}

                      {item.employeeFirstName && item.employeeLastName && (
                        <Box>
                          <p className='text-sm'>Responsible</p>
                          <ColorChip
                            label={`${item.employeeFirstName} ${item.employeeLastName}`}
                            color={`${colors.null}`}
                          ></ColorChip>
                        </Box>
                      )}

                      {item.waitingFor && (
                        <Box>
                          <p className='text-sm'>Waiting For</p>
                          <ColorChip label={item.waitingFor} color={`${colors.null}`}></ColorChip>
                        </Box>
                      )}
                    </div>

                    <div className='flex md:grid md:grid-cols-2 mb-4'>
                      <div className='flex gap-10'>
                        <div className='min-w-[100px]'>
                          <div className='flex gap-1'>
                            <img src={calendar} alt='calendar' className='w-5' />
                            <p style={{ fontSize: '1em' }}>&nbsp;Start Date</p>
                          </div>
                          <p>{dayjs.utc(item.startDate).format('DD-MM-YYYY')}</p>
                        </div>

                        {item.endDate && (
                          <div className='min-w-[100px]'>
                            <div className='flex gap-1'>
                              <img src={calendar} alt='calendar' className='w-5' />
                              <p style={{ fontSize: '1em' }}>&nbsp;Due Date</p>
                            </div>
                            <p>{dayjs.utc(item.endDate).format('DD-MM-YYYY')}</p>
                          </div>
                        )}
                      </div>
                      <div></div>
                    </div>
                  </Box>
                  <Divider />
                </section>
              );
            })}
          </section>
        </section>
      ) : (
        <ComponentPlaceholder text='No data available' />
      )}
    </main>
  );
};

export default ProjectReport;
