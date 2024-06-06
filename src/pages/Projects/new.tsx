/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, FormControl, FormHelperText, FormLabel, Switch } from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import colors from '../../colors';
import CustomSelect from '../../components/common/CustomSelect';
import GenericInput from '../../components/common/GenericInput';
import GenericTextArea from '../../components/common/GenericTextArea';
import Loader from '../../components/common/Loader';
import { EmployeeContext } from '../../hooks/employeeContext';
import useHttp from '../../hooks/useHttp';
import useProjectForm, { Fields } from '../../hooks/useProjectForm';
import { CompanyEntity } from '../../types/company';
import { ProjectAreas, ProjectCategory, ProjectPeriodicity } from '../../types/project';
import { MAX_DATE, MIN_DATE, RequestMethods } from '../../utils/constants';

const NewProject = () => {
  const location = useLocation();
  const { employee } = useContext(EmployeeContext);

  const form = useProjectForm();
  const projectCategories = Object.values(ProjectCategory) as string[];
  const projectPeriodicity = Object.values(ProjectPeriodicity) as string[];
  const projectAreas = Object.values(ProjectAreas) as string[];
  const req = useHttp<CompanyEntity[]>('/company/unarchived', RequestMethods.GET);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(employee?.role === 'Admin');
  }, [employee]);

  useEffect(() => {
    req.sendRequest();
    if (location.state && location.state.clientId)
      form.handleChange('idCompany', location.state.clientId);
  }, []);

  useEffect(() => {
    if (!admin) {
      form.handleChange('area', employee?.role ?? null);
    }
  }, [admin, employee]);

  return (
    <Card className='bg-white flex-1 font-montserrat overflow-y-scroll' sx={{ padding: '20px' }}>
      {req.loading ? (
        <Loader />
      ) : (
        <form className='flex flex-col gap-4' onSubmit={form.handleSubmit}>
          <FormControl>
            <GenericInput
              name={'name' as Fields}
              errorString={form.errors.name}
              handleChange={form.handleChange}
              required
              label='Project Name'
              value={form.formState.name}
              max={70}
            />
          </FormControl>
          <section className='flex lg:flex-row gap-4 flex-col'>
            <FormControl className='flex-1' error={!!form.errors.idCompany}>
              <FormLabel>
                Client <span className='text-red-600'>*</span>
              </FormLabel>
              <CustomSelect
                values={req.data?.map(company => company.id) ?? []}
                options={req.data?.map(company => company.name) ?? []}
                name='idCompany'
                handleChange={form.handleChange}
                value={form.formState.idCompany}
              />
              {form.errors.idCompany ? (
                <FormHelperText>{form.errors.idCompany}</FormHelperText>
              ) : null}
            </FormControl>
            <FormControl className='flex-1' error={!!form.errors.category}>
              <FormLabel>
                Category <span className='text-red-600'>*</span>
              </FormLabel>
              <CustomSelect
                options={projectCategories}
                value={form.formState.category}
                name='category'
                handleChange={form.handleChange}
              />
              {form.errors.category ? (
                <FormHelperText>{form.errors.category}</FormHelperText>
              ) : null}
            </FormControl>
            <GenericInput
              sx={{ flex: 1 }}
              name={'matter' as Fields}
              errorString={form.errors.matter}
              handleChange={form.handleChange}
              label='Matter'
              value={form.formState.matter}
              max={70}
            />
          </section>
          <GenericTextArea
            minRows={5}
            maxRows={5}
            name='description'
            errorString={form.errors.description}
            handleChange={form.handleChange}
            label='Description'
            value={form.formState.description}
            max={255}
          />
          <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <FormControl error={!!form.errors.startDate}>
              <FormLabel>
                Start Date <span className='text-red-600'>*</span>
              </FormLabel>
              <DatePicker
                value={dayjs(form.formState.startDate).utc()}
                onChange={newVal => {
                  form.handleChange('startDate', newVal);
                }}
                slotProps={{ textField: { error: !!form.errors.startDate } }}
                minDate={MIN_DATE}
                maxDate={MAX_DATE}
              />
              {form.errors.startDate ? (
                <FormHelperText>{form.errors.startDate}</FormHelperText>
              ) : null}
            </FormControl>
            <FormControl error={!!form.errors.endDate}>
              <FormLabel>End Date</FormLabel>
              <DatePicker
                value={form.formState.endDate ? dayjs(form.formState.endDate).utc() : null}
                onChange={e => form.handleChange('endDate', e)}
                slotProps={{ textField: { error: !!form.errors.endDate } }}
                maxDate={MAX_DATE}
              />
              {form.errors.endDate ? <FormHelperText>{form.errors.endDate}</FormHelperText> : null}
            </FormControl>
            <FormControl>
              <FormLabel>Chargeable</FormLabel>
              <Switch
                sx={{ mr: 'auto' }}
                checked={form.formState.isChargeable}
                onChange={e => {
                  form.handleChange('isChargeable', e.target.checked);
                }}
                size='lg'
              />
            </FormControl>
          </section>
          <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <FormControl error={!!form.errors.area}>
              <FormLabel>
                Area <span className='text-red-600'>*</span>
              </FormLabel>
              <CustomSelect
                name='area'
                value={String(form.formState.area)}
                handleChange={form.handleChange}
                options={projectAreas}
                defaultValue={employee?.role}
                disabled={!admin}
              ></CustomSelect>
              {form.errors.area ? <FormHelperText>{form.errors.area}</FormHelperText> : null}
            </FormControl>
            <FormControl error={!!form.errors.periodicity}>
              <FormLabel>Periodic</FormLabel>
              <CustomSelect
                name='periodicity'
                value={form.formState.periodicity}
                handleChange={form.handleChange}
                options={projectPeriodicity}
                defaultValue={ProjectPeriodicity.WHEN_NEEDED}
              ></CustomSelect>
              {form.errors.periodicity ? (
                <FormHelperText>{form.errors.periodicity}</FormHelperText>
              ) : null}
            </FormControl>
          </section>
          <section className='flex mt-10 gap-4 justify-end'>
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
            >
              <Link to={'..'} replace>
                Cancel
              </Link>
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
              Add Project
            </Button>
          </section>
        </form>
      )}
    </Card>
  );
};

export default NewProject;
