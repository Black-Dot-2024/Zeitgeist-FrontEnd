import { Box } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import colors from '../../colors';
import AddButton from '../../components/common/AddButton';
import ComponentPlaceholder from '../../components/common/ComponentPlaceholder';
import Loader from '../../components/common/Loader';
import SearchBar from '../../components/common/SearchBar';
import ExpenseCard from '../../components/modules/Expenses/ExpenseCard';
import { EmployeeContext } from '../../hooks/employeeContext';
import useHttp from '../../hooks/useHttp';
import { ExpenseReport } from '../../types/expense';
import { APIPath, RequestMethods, RoutesPath, SupportedRoles } from '../../utils/constants';

const ExpensesMain = () => {
  const req = useHttp<ExpenseReport[]>(`${APIPath.EXPENSES}/`, RequestMethods.GET);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseReport[]>([]);
  const [expenses, setExpenses] = useState<ExpenseReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { employee } = useContext(EmployeeContext);

  useEffect(() => {
    if (!req.data) {
      req.sendRequest();
    } else {
      setExpenses(req.data);
      setFilteredExpenses(req.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req.data]);

  useEffect(() => {
    setFilteredExpenses(
      expenses.filter(expense => {
        return (
          expense.employeeFirstName!.split(' ')[0] +
          ' ' +
          expense.employeeLastName!.split(' ')[0]
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  if (req.loading) {
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
    <main className='min-h-full flex flex-col overflow-hidden'>
      <section className='flex flex-wrap justify-between flex-row md:items-center md-2'>
        {employee?.role.toUpperCase() === SupportedRoles.ACCOUNTING.toUpperCase() ||
        employee?.role.toUpperCase() === SupportedRoles.ADMIN.toUpperCase() ? (
          <div className='search-bar-container mb-2'>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder='Employee'
              maxLength={70}
            />
          </div>
        ) : (
          <div></div>
        )}
        <div className='flex flex-wrap flex-row items-center gap-2 my-4'>
          <Link to={`${RoutesPath.EXPENSES}/new`}>
            <AddButton onClick={() => {}}></AddButton>
          </Link>
        </div>
      </section>
      {filteredExpenses.length === 0 ? (
        <ComponentPlaceholder text='No expense reports were found' />
      ) : (
        <section className='overflow-y-auto bg-cardBg rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-0 shadow-lg p-4 gap-5'>
          {req.loading ? (
            <Loader />
          ) : (
            filteredExpenses.map(expense => (
              <Link to={`${RoutesPath.EXPENSES}/details/${expense.id}`} key={expense.id}>
                <ExpenseCard
                  title={expense.title}
                  date={expense.startDate}
                  status={expense.status!}
                  totalAmount={expense.totalAmount || 0}
                  employeeRole={
                    employee ? (employee?.role as SupportedRoles) : SupportedRoles.WITHOUT_ROLE
                  }
                  employeeFirstName={expense.employeeFirstName}
                  employeeLastName={expense.employeeLastName}
                />
              </Link>
            ))
          )}
        </section>
      )}
    </main>
  );
};

export default ExpensesMain;
