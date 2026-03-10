'use client'

// React Imports
import { forwardRef } from 'react'

// MUI Imports
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import { Controller } from 'react-hook-form'

// Component Imports
import PhoneInput from '@/components/fields/PhoneInput'
import CountrySelect from '@/components/fields/CountrySelect'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Hook Import
import { useBranchForm, getAvatarSrcValidator } from '../hooks/useBranchForm'

/*_____________________________________
│   * PICKERS COMPONENT                │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const PickersComponent = forwardRef(({ ...props }, ref) => {
  return (
    <TextField inputRef={ref} fullWidth {...props} label={props.label || ''} className='is-full' error={props.error} />
  )
})

/*_____________________________________
│   * INIT BRANCH FORM COMPONENT       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const BranchForm = ({ controller }) => {
  const { showform, dataProp, usuario, branchShortList, addOrUpdateBranch, handleSetDefautProps, memoizedDictionary } =
    controller

  // Hook del formulario
  const {
    control,
    handleSubmit,
    setValue,
    register,
    errors,
    reset,
    fileInput,
    isDisabled,
    imgSrc,
    isSubmitting,
    isEditMode,
    isHeadquarters,
    handleFileInputChange,
    handleFileInputReset,
    onSubmit,
    resetForm
  } = useBranchForm({
    dataProp,
    usuario,
    addOrUpdateBranch,
    handleSetDefautProps,
    branchShortList
  })

  if (!showform) return null

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Logo Upload Section */}
            <Grid item xs={12} sm={6}>
              <div className='flex max-sm:flex-col items-center gap-6'>
                <div className='size-[120px] rounded bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center'>
                  <img
                    src={getAvatarSrcValidator(imgSrc)}
                    alt='Branch logo'
                    className='max-w-full max-h-full object-contain p-2'
                  />
                </div>
                <div className='flex flex-grow flex-col gap-4'>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                      Upload New Logo
                      <input
                        hidden
                        type='file'
                        accept='image/png, image/jpeg'
                        onChange={handleFileInputChange}
                        id='account-settings-upload-image'
                      />
                    </Button>
                    <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
                      Reset
                    </Button>
                  </div>
                  <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
                </div>
              </div>
            </Grid>

            {/* Trade Name */}
            <Grid item xs={12} sm={6} className='flex items-end'>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Trade name'
                    placeholder='Mtg'
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Company Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='company_name'
                control={control}
                rules={{ required: 'Company name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Company name'
                    placeholder='Legal name you registered the company'
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email (example: email@domain.com)'
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Email'
                    placeholder='Example@gmail.com'
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='phone_number'
                control={control}
                rules={{
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?\d{6,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number ? errors.phone_number.message : ''}
                    setValue={setValue}
                    name='phone_number'
                  />
                )}
              />
            </Grid>

            {/* Domain */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='domain'
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label='Domain' placeholder='https://name.example.com' />
                )}
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='country'
                control={control}
                render={({ field }) => (
                  <CountrySelect
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    label='Country'
                    setValue={setValue}
                    name='country'
                  />
                )}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='city'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='City' placeholder='New York' />}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='address'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label='Address' placeholder='Address' />}
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='postal_code'
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth type='number' label='Zip Code' placeholder='123456' />
                )}
              />
            </Grid>

            {/* Is Headquarters */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='is_headquarters'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label='Headquarters'
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        color='primary'
                        disabled={isDisabled}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Parent Branch (only if headquarters) */}
            {isHeadquarters && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Main branch</InputLabel>
                  <Controller
                    name='parent_venue_id'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label='Main branch'>
                        {Array.isArray(branchShortList) && branchShortList.length > 0 ? (
                          branchShortList.map(branchUser => (
                            <MenuItem key={branchUser.Branches.id} value={branchUser.Branches.id}>
                              {branchUser.Branches.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem key={'no_id'} value={''} disabled>
                            {'No data available'}
                          </MenuItem>
                        )}
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Advanced Configuration Section */}
            <Grid item xs={12}>
              <Typography variant='body2' className='font-medium'>
                ⚙ Advance configuration
              </Typography>
            </Grid>

            {/* Max Class Per Week */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='venue_settings.periodic_event_restrictions'
                control={control}
                rules={{
                  required: 'field is required',
                  min: { value: 1, message: 'Value must be greater than 0' }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    label='Max class per week'
                    placeholder='3 by default'
                    {...register('venue_settings.periodic_event_restrictions', { valueAsNumber: true })}
                    onChange={e => {
                      let value = e.target.value

                      if (parseInt(value) === 0) {
                        e.preventDefault()
                      } else {
                        field.onChange(e)
                      }
                    }}
                    inputProps={{ min: 1, pattern: '[1-9]*' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Chip label='Classes' color='primary' size='small' />
                        </InputAdornment>
                      )
                    }}
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Public Holidays */}
            <Grid item xs={12} sm={6}>
              <div className='mbe-6'>
                <Controller
                  name='venue_settings.public_holidays'
                  control={control}
                  render={({ field }) => (
                    <AppReactDatepicker
                      id='event-start-date'
                      selectsMultiple
                      dateFormat='dd-MM-yyyy'
                      selectedDates={field.value || []}
                      onChange={dates => {
                        setValue('venue_settings.public_holidays', dates)
                      }}
                      customInput={
                        <PickersComponent label='Select public days' registername='venue_settings.public_holidays' />
                      }
                      shouldCloseOnSelect={false}
                      disabledKeyboardNavigation
                    />
                  )}
                />
              </div>
            </Grid>

            {/* Notification Time Before Class */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='venue_settings.notification_time_before_class'
                control={control}
                rules={{ required: 'time notification is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    label='Notification time before class'
                    placeholder='30 min default'
                    {...register('venue_settings.notification_time_before_class', { valueAsNumber: true })}
                    inputProps={{ min: 0, pattern: '[0-9]*' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Chip label='Minutes' color='primary' size='small' />
                        </InputAdornment>
                      )
                    }}
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Notification Time After Class */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='venue_settings.notification_time_after_class'
                control={control}
                rules={{ required: 'time notification is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    label='Notification time after class'
                    placeholder='15 min after class'
                    {...register('venue_settings.notification_time_after_class', { valueAsNumber: true })}
                    inputProps={{ min: 0, pattern: '[0-9]*' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Chip label='Minutes' color='primary' size='small' />
                        </InputAdornment>
                      )
                    }}
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            {/* Penalty Reset Timer */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='venue_settings.reset_warnings'
                control={control}
                rules={{ required: 'time notification is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    label='Penalty reset timer'
                    placeholder='30 days default'
                    {...register('venue_settings.reset_warnings', { valueAsNumber: true })}
                    inputProps={{ min: 0, pattern: '[0-9]*' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Chip label='Days' color='primary' size='small' />
                        </InputAdornment>
                      )
                    }}
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} className='flex gap-4 pt-10 flex-wrap'>
              <Button variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={resetForm}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default BranchForm
