import { Option, Select } from '@mui/joy';
import { FormState } from '../../../hooks/useNewProject';
import { CompanyEntity } from '../../../types/company';
import { truncateText } from '../../../utils/methods';

interface ClientDropdownProps {
  values: CompanyEntity[];
  handleChange: (field: keyof FormState, value: string | Date | boolean | null) => void;
  name: keyof FormState;
  defaultValue?: string;
}

const ClientDropdown = ({ defaultValue, handleChange, values, name }: ClientDropdownProps) => {
  return (
    <Select value={defaultValue} onChange={(_, newVal) => handleChange(name, String(newVal))}>
      {values.map(value => {
        return (
          <Option key={value.id} value={value.id}>
            {truncateText(value.name, 40)}
          </Option>
        );
      })}
    </Select>
  );
};

export default ClientDropdown;
