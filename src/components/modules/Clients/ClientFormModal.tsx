import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
} from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import colors from '../../../colors';
import useClientForm, { Fields, initialFormState } from '../../../hooks/useClientForm';
import { CompanyEntity } from '../../../types/company';
import { MAX_DATE } from '../../../utils/constants';
import GenericInput from '../../common/GenericInput';

type ClientFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  data?: CompanyEntity;
  id?: string;
  updateFunction:
    | Dispatch<SetStateAction<CompanyEntity[]>>
    | Dispatch<SetStateAction<CompanyEntity | null>>;
};

function phoneNumberMask(value: string) {
  const cleaned = value.replace(/\D/g, '');
  const area = cleaned.substring(0, 3);
  const middle = cleaned.substring(3, 6);
  const last = cleaned.substring(6, 10);

  if (cleaned.length > 6) {
    return `${area}-${middle}-${last}`;
  } else if (cleaned.length > 3) {
    return `${area}-${middle}`;
  } else {
    return `${area}`;
  }
}

function ClientFormModal({ open, setOpen, data, id, updateFunction }: ClientFormModalProps) {
  const form = useClientForm();
  const [defaultData, setDefaultData] = useState(initialFormState);

  useEffect(() => {
    if (data) {
      setDefaultData({
        name: data.name,
        email: data.email ?? '',
        phoneNumber: phoneNumberMask(data.phoneNumber ?? ''),
        rfc: data.rfc ?? '',
        constitutionDate: data.constitutionDate ? dayjs(data.constitutionDate) : null,
        taxResidence: data.taxResidence ?? '',
      });
    }
  }, [data]);

  useEffect(() => {
    form.setState(defaultData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultData]);

  return (
    <Modal
      open={open}
      onClose={() => {
        form.setState(defaultData);
        setOpen(false);
      }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ModalDialog size='lg'>
        <ModalClose />
        <form
          className='flex flex-wrap overflow-y-scroll lg:overflow-y-hidden sm:grid grid-cols-2 gap-4'
          onSubmit={async e => {
            try {
              const res = await form.handleSubmit(e, data ? true : false, id);
              if (data) (updateFunction as Dispatch<SetStateAction<CompanyEntity | null>>)(res);
              else
                (updateFunction as Dispatch<SetStateAction<CompanyEntity[]>>)(prev =>
                  [...prev, res].sort((a, b) => a.name.localeCompare(b.name))
                );
              form.setState(defaultData);
              setOpen(false);
            } catch (err) {}
          }}
        >
          <GenericInput
            name={'name' as Fields}
            errorString={form.errors.name}
            handleChange={form.handleChange}
            label={'Name'}
            value={form.formState.name}
            required
            max={70}
            sx={{ width: '100%' }}
          />
          <GenericInput
            name={'email' as Fields}
            errorString={form.errors.email}
            value={form.formState.email}
            handleChange={form.handleChange}
            label={'Email'}
            max={70}
            sx={{ width: '100%' }}
          />
          <GenericInput
            name={'phoneNumber' as Fields}
            errorString={form.errors.phoneNumber}
            value={form.formState.phoneNumber}
            handleChange={(name, value) => form.handleChange(name, phoneNumberMask(value))}
            label={'Phone Number'}
            max={12}
            sx={{ width: '100%' }}
          />
          <GenericInput
            name={'rfc' as Fields}
            errorString={form.errors.rfc}
            value={form.formState.rfc}
            handleChange={form.handleChange}
            label={'RFC'}
            max={13}
            sx={{ width: '100%' }}
          />
          <FormControl error={!!form.errors.constitutionDate} sx={{ width: '100%' }}>
            <FormLabel>Constitution Date</FormLabel>
            <DatePicker
              value={form.formState.constitutionDate}
              onChange={newDate => form.handleChange('constitutionDate', newDate)}
              slotProps={{ textField: { error: !!form.errors.constitutionDate, size: 'small' } }}
              minDate={dayjs('1900-01-01').startOf('day')}
              maxDate={MAX_DATE}
            />
            {form.errors.constitutionDate ? (
              <FormHelperText>{form.errors.constitutionDate}</FormHelperText>
            ) : null}
          </FormControl>
          <GenericInput
            name={'taxResidence' as Fields}
            errorString={form.errors.taxResidence}
            value={form.formState.taxResidence}
            handleChange={form.handleChange}
            label={'Tax Residence'}
            max={150}
            sx={{ width: '100%' }}
          />
          <section className='flex justify-between w-full gap-2 col-span-full mt-3'>
            <Button
              variant='outlined'
              sx={{
                borderColor: colors.darkerGold,
                color: colors.darkGold,
                '&:hover': {
                  borderColor: colors.darkerGold,
                  background: colors.darkGold,
                  color: 'white',
                },
              }}
              onClick={() => {
                form.setState(defaultData);
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              sx={{
                background: colors.darkGold,
                '&:hover': {
                  backgroundColor: colors.darkerGold,
                },
              }}
              disabled={form.isPosting}
            >
              {data ? 'Update Client' : 'Add Client'}
            </Button>
          </section>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default ClientFormModal;
