/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, FormControl, FormHelperText, FormLabel, Switch } from '@mui/joy';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import colors from '../../colors';
import CustomSelect from '../../components/common/CustomSelect';
import GenericInput from '../../components/common/GenericInput';
import GenericTextArea from '../../components/common/GenericTextArea';
import Loader from '../../components/common/Loader';
import { EmployeeContext } from '../../hooks/employeeContext';
import useHttp from '../../hooks/useHttp';
import useProjectForm, { Fields } from '../../hooks/useProjectForm';
import { CompanyEntity } from '../../types/company';
import {
  ProjectAreas,
  ProjectCategory,
  ProjectEntity,
  ProjectPeriodicity,
} from '../../types/project';
import { MAX_DATE, MIN_DATE, RequestMethods } from '../../utils/constants';

const NewProject = () => {
  const { employee } = useContext(EmployeeContext);
  const { id } = useParams();

  const form = useProjectForm();
  const projectCategories = Object.values(ProjectCategory) as string[];
  const projectPeriodicity = Object.values(ProjectPeriodicity) as string[];
  const projectAreas = Object.values(ProjectAreas) as string[];
  const req = useHttp<CompanyEntity[]>('/company/unarchived', RequestMethods.GET);
  const [admin, setAdmin] = useState(false);

  const projectReq = useHttp<ProjectEntity>(`/project/details/${id}`, RequestMethods.GET);

  useEffect(() => {
    setAdmin(employee?.role === 'Admin');
  }, [employee]);

  useEffect(() => {
    req.sendRequest();
    projectReq.sendRequest();
  }, []);

  useEffect(() => {
    if (projectReq.data) {
      form.setState({
        name: projectReq.data.name,
        idCompany: projectReq.data.idCompany,
        category: projectReq.data.category,
        matter: projectReq.data.matter ?? '',
        description: projectReq.data.description,
        startDate: dayjs(projectReq.data.startDate),
        endDate: projectReq.data.endDate ? dayjs(projectReq.data.endDate) : null,
        periodicity: projectReq.data.periodicity,
        isChargeable: projectReq.data.isChargeable,
        area: projectReq.data.area,
        status: projectReq.data.status,
      });
    }
  }, [projectReq.data]);

  return (
    <Card className='bg-white flex-1 font-montserrat overflow-y-scroll' sx={{ padding: '30px' }}>
      {req.loading ? (
        <Loader />
      ) : (
        <form className='flex flex-col gap-4' onSubmit={e => form.handleUpdate(e, id!)}>
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
                disabled
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
                name='category'
                handleChange={form.handleChange}
                value={form.formState.category}
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
          <FormControl>
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
          </FormControl>
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
                handleChange={form.handleChange}
                options={projectAreas}
                value={String(form.formState.area)}
                disabled={!admin}
              ></CustomSelect>
              {form.errors.area ? <FormHelperText>{form.errors.area}</FormHelperText> : null}
            </FormControl>
            <FormControl error={!!form.errors.periodicity}>
              <FormLabel>Periodic</FormLabel>
              <CustomSelect
                name='periodicity'
                handleChange={form.handleChange}
                options={projectPeriodicity}
                value={form.formState.periodicity}
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
              <Link to={`/projects/details/${id}`} replace>
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
              Update Project
            </Button>
          </section>
        </form>
      )}
    </Card>
  );
};

export default NewProject;
