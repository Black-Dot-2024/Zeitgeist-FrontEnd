import dayjs from 'dayjs';
import colors from '../../../colors';
import { ExpenseReportStatus } from '../../../types/expense';
import { SupportedRoles } from '../../../utils/constants';
import ColorChip from '../../common/ColorChip';
import StatusChip from './StatusChip';

type CardExpenseProps = {
  title: string;
  date: Date;
  status: ExpenseReportStatus;
  totalAmount: number;
  employeeRole: SupportedRoles;
  employeeFirstName?: string;
  employeeLastName?: string;
};

/**
 * Expense Card component
 *
 * @component
 * @param props - Component props
 * @param props.title - The title of the expense report
 * @param props.date - The date of the expense report
 * @param props.status - The status of the expense report
 * @param props.totalAmount - The total amount of the expense report
 * @param props.employeeFirstName - The first name of the employee
 * @param props.employeeFirstName - The last name of the employee
 *
 * @returns Expense Card component
 */
const ExpenseCard = ({
  title,
  date,
  status,
  totalAmount,
  employeeRole,
  employeeFirstName,
  employeeLastName,
}: CardExpenseProps): JSX.Element => {
  return (
    <section className='bg-[#EFEFEF] hover:bg-[#DEDEDE] rounded-lg p-4'>
      <section className='flex flex-nowrap gap-3'>
        <div className='border-2 h-8 border-[#9C844C]' />
        <h5 className='text-[#424242] font-montserrat truncate'>{title}</h5>
      </section>
      <h5 className='text-sm text-gold truncate'>{dayjs.utc(date).format('DD/MM/YYYY')}</h5>
      <section className='mt-3 flex flex-wrap gap-3 overflow-hidden'>
        <ColorChip label={`$${totalAmount}`} color={`${colors.extra}`}></ColorChip>
        <StatusChip status={status} />
        {(employeeRole.toUpperCase() === SupportedRoles.ACCOUNTING.toUpperCase() ||
          employeeRole.toUpperCase() === SupportedRoles.ADMIN.toUpperCase()) && (
          <ColorChip
            label={`${employeeFirstName!.split(' ')[0]} ${employeeLastName!.split(' ')[0]}`}
            color={`${colors.lighterGray}`}
          ></ColorChip>
        )}
      </section>
    </section>
  );
};

export default ExpenseCard;
