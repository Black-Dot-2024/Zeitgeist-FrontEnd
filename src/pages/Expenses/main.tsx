import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [filterOption, setFilterOption] = useState('Employee');
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
          expense.employeeFirstName!.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.employeeLastName!.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }, [searchTerm]);

  return (
    <main className='min-h-full flex flex-col gap-2 overflow-hidden'>
      <section className='flex flex-wrap justify-between flex-row md:items-center md-2 gap-2'>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder='Search by employee'
          options={['Employee']}
          setSelectedOption={setFilterOption}
          maxLength={70}
        />
        <div className='flex flex-wrap flex-row items-center gap-2'>
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
