import { Card } from '@mui/joy';
import { useState } from 'react';
import SearchBar from '../../components/common/SearchBar';
import EmployeeTable from '../../components/modules/Employees/EmployeeeTable';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('Name');

  return (
    <section className='flex-1 overflow-scroll'>
      <div className='mb-4'>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          options={['Name', 'Email']}
          placeholder='Search employees'
          setSelectedOption={setFilterOption}
        />
      </div>
      <Card className='flex-1'>
        <EmployeeTable searchTerm={searchTerm} filterOption={filterOption} />
      </Card>
    </section>
  );
};

export default Employees;
