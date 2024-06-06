import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import EmployeeTable from '../../components/modules/Employees/EmployeeeTable';
import { EmployeeContext } from '../../hooks/employeeContext';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('Name');
  const { employee } = useContext(EmployeeContext);

  if (employee?.role !== 'Admin') {
    return <Navigate to='/home' replace />;
  }

  return (
    <main className='min-h-full flex flex-col gap-2 overflow-hidden'>
      <section className='flex flex-wrap justify-between flex-row md:items-center md-2 gap-2'>
        <div className='search-bar-container mb-4'>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            options={['Name', 'Email']}
            placeholder='Search employees'
            setSelectedOption={setFilterOption}
          />
        </div>
      </section>
      <section className='overflow-y-auto bg-cardBg rounded-xl min-h-0 shadow-lg p-4 gap-5 mb-2'>
        <EmployeeTable searchTerm={searchTerm} filterOption={filterOption} />
      </section>
    </main>
  );
};

export default Employees;
