import { Document, Page, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import colors from '../../colors';
import { Report } from '../../types/project-report';
import { truncateText } from '../../utils/methods';
import { numberToMonth, statusColor } from './reportMethods';

function chunkText(text: string, len: number): string {
  let txt = '';
  for (let i = 0; i < text.length; i += len) {
    txt += text.substring(i, i + len > text.length ? text.length : i + len);
    txt += '\n';
  }
  return txt;
}

interface reportProps {
  data: Report;
  usingFilters: boolean;
  month: number;
  year: number;
}

function infoComponent(title: string, value: string, style: string = '-') {
  return (
    <View>
      <Text style={{ fontSize: 9 }}>{title}</Text>
      <View
        style={{
          textAlign: 'center',
          borderRadius: '10px',
          backgroundColor: `${statusColor(style)}`,
        }}
      >
        <Text
          style={{
            paddingLeft: '15px',
            paddingRight: '15px',
            paddingTop: '3px',
            paddingBottom: '3px',
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const ProjectReportPDF = (props: reportProps) => {
  let tasks: number = -1;
  const totalTasks: number = Number(props.data?.statistics?.total) || 1;
  const filterMonth = numberToMonth(props.month);
  const keyMap = new Map<string, string>([
    ['done', 'Done'],
    ['inprogress', 'In process'],
    ['underrevision', 'Under Revision'],
    ['delayed', 'Delayed'],
    ['postponed', 'Postponed'],
    ['notstarted', 'Not started'],
    ['cancelled', 'Cancelled'],
  ]);

  return (
    <Document>
      <Page size='A4' style={{ backgroundColor: 'white' }}>
        <View style={{ color: 'black', textAlign: 'justify', margin: 30, gap: '20px' }}>
          {props.usingFilters === true && (
            <Text style={{ textAlign: 'right', fontSize: 12, fontFamily: 'Times-Bold' }}>
              {`${filterMonth !== 'Invalid month number' ? filterMonth : ''} ${props.year}`}
            </Text>
          )}
          <Text style={{ textAlign: 'center', fontSize: 26, fontFamily: 'Times-Bold' }}>
            {chunkText(props.data.project.name, 38)}
          </Text>
          {props.data.project.description && (
            <Text style={{ fontSize: 14 }}>{chunkText(props.data.project.description, 68)}</Text>
          )}

          <View style={{ gap: '20px' }}>
            <View
              style={{
                gap: '20px',
                fontSize: 14,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {infoComponent(
                'Status',
                `${props.data.project.status}`,
                `${props.data.project.status}`
              )}
              {props.data.project.totalHours &&
                infoComponent('Total hours', `${props.data.project.totalHours}`)}
              {infoComponent('Company', `${truncateText(props.data.project.companyName, 58)}`)}
            </View>

            <View
              style={{
                gap: '20px',
                fontSize: 14,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              {props.data.project.area &&
                infoComponent('Area', `${props.data.project.area}`, 'AREA')}
              {props.data.project.matter && infoComponent('Matter', `${props.data.project.matter}`)}
              {infoComponent('Category', `${props.data.project.category}`)}
              {props.data.project.isChargeable &&
                infoComponent('Chargeable', `${props.data.project.isChargeable ? 'Yes' : 'No'}`)}
            </View>

            <View style={{ fontSize: 14, gap: '20px', display: 'flex', flexDirection: 'row' }}>
              <View>
                <Text style={{ fontSize: 10 }}>Start Date</Text>
                <Text>{dayjs.utc(props.data.project.startDate).format('DD-MM-YYYY')}</Text>
              </View>

              {props.data.project.endDate && (
                <View>
                  <Text style={{ fontSize: 10 }}>End Date</Text>
                  <Text>{dayjs.utc(props.data.project.endDate).format('DD-MM-YYYY')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ color: 'black', textAlign: 'justify', margin: 30, gap: '10px' }}>
          <Text style={{ textAlign: 'center', fontSize: 26, fontFamily: 'Times-Bold' }}>
            Tasks status
          </Text>

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 250,
              padding: 8,
              fontSize: 12,
              backgroundColor: colors.lighterGray,
              borderRadius: '10px',
            }}
          >
            {props.data.statistics &&
              Object.entries(props.data.statistics)
                .filter(([key]) => key !== 'total')
                .map(([item, value]) => {
                  return (
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}
                      key={item}
                    >
                      <Text style={{ width: '20%' }}>{keyMap.get(item)}</Text>

                      <View
                        style={{ width: '50%', backgroundColor: colors.null, borderRadius: '10px' }}
                      >
                        <View
                          style={{
                            width: `${Math.round((value * 100) / totalTasks)}%`,
                            backgroundColor: colors.gold,
                            borderRadius: '10px',
                          }}
                        >
                          <Text>&nbsp;</Text>
                        </View>
                      </View>

                      <Text>{`${Math.round((value * 100) / totalTasks)}%`}</Text>
                    </View>
                  );
                })}
          </View>
        </View>
      </Page>

      <Page size='A4' style={{ backgroundColor: 'white' }}>
        {props.data.tasks?.map(item => {
          tasks++;
          return (
            <View
              style={{
                color: 'black',
                textAlign: 'justify',
                margin: 30,
                gap: '30px',
                height: '25vh',
              }}
              key={item.title}
            >
              <View style={{ gap: '10px' }}>
                {tasks % 3 == 0 && (
                  <Text break style={{ fontSize: 20 }}>
                    {chunkText(item.title, 47)}
                  </Text>
                )}
                {tasks % 3 != 0 && (
                  <Text style={{ fontSize: 20 }}>{chunkText(item.title, 47)}</Text>
                )}
                <Text style={{ fontSize: 14 }}>{chunkText(item.description, 68)}</Text>

                <View
                  style={{
                    gap: '20px',
                    fontSize: 14,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                  }}
                >
                  {infoComponent('Status', `${item.status}`, `${item.status}`)}
                  {item.workedHours && infoComponent('Total hours', `${item.workedHours}`, 'extra')}
                  {item.employeeFirstName &&
                    item.employeeLastName &&
                    infoComponent(
                      'Responsible',
                      `${item.employeeFirstName} ${item.employeeLastName}`
                    )}
                  {item.waitingFor && infoComponent('Waiting For', `${item.waitingFor}`)}
                </View>

                <View style={{ fontSize: 14, gap: '20px', display: 'flex', flexDirection: 'row' }}>
                  <View>
                    <Text style={{ fontSize: 10 }}>Start Date</Text>
                    <Text>{dayjs.utc(item.startDate).format('DD-MM-YYYY')}</Text>
                  </View>

                  {item.endDate && (
                    <View>
                      <Text style={{ fontSize: 10 }}>End Date</Text>
                      <Text>{dayjs.utc(item.endDate).format('DD-MM-YYYY')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default ProjectReportPDF;
