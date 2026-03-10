'use client'

import { useState, useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import ReactCountryFlag from 'react-country-flag'

import ShowAvatarListDialog from '@components/dialogs/show-avatar-dialog'
import PhoneInput from '@/components/fields/PhoneInput'
import CountrySelect from '@/components/fields/CountrySelect'
import axios from '@/utils/axios'

const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT
const languageData = ['English', 'Español', 'Portuguese', 'Quechua']

function getAvatarSrcValidator(img) {
  const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png']

  if (img?.includes('APP_MTG')) {
    return `${NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT}/${img}`
  } else if (allowedAvatars.includes(img)) {
    return `/images/avatars/${img}`
  } else if (img) {
    return img
  } else {
    return '/images/avatars/1.png'
  }
}

const generatePassword = () => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}

const Userform = ({ controller, handleCreateStaffUser, branchList, rolesData, getRolesByBranch }) => {
  const { setShowform, dataProp } = controller

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      dni: '',
      password: '',
      birth_date: '',
      occupation: '',
      phone_number: '',
      address: '',
      state: '',
      zip_code: '',
      country: '',
      language: [],
      gender: '',
      avatar: '',
      branch_id: '',
      rol_id: '',
      license_id: ''
    }
  })

  const [fileInput, setFileInput] = useState('')
  const [imgSrc, setImgSrc] = useState('/images/avatars/1.png')
  const [avatarList, setAvatarList] = useState([])
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableLicenses, setAvailableLicenses] = useState([])
  const [loadingLicenses, setLoadingLicenses] = useState(false)
  const [existingLicense, setExistingLicense] = useState(null) // Licencia existente del usuario en edición

  const selectedBranch = watch('branch_id')
  const selectedRolId = watch('rol_id')

  // Detectar si el rol seleccionado requiere licencia
  const selectedRole = rolesData?.find(r => r.id === selectedRolId)
  const requiresLicense = selectedRole?.is_holder || selectedRole?.is_student
  const licenseType = selectedRole?.is_holder ? 'holder' : selectedRole?.is_student ? 'student' : null

  // Verificar si el usuario tiene licencia existente (no se puede cambiar rol ni licencia)
  const hasExistingLicense = dataProp?.action === 'edit' && existingLicense
  const isHolderWithExistingLicense = hasExistingLicense && selectedRole?.is_holder
  const isStudentWithExistingLicense = hasExistingLicense && selectedRole?.is_student

  useEffect(() => {
    if (selectedBranch) {
      getRolesByBranch(selectedBranch)
    }
  }, [selectedBranch, getRolesByBranch])

  // Cargar licencias disponibles cuando el rol requiere licencia
  useEffect(() => {
    const loadAvailableLicenses = async () => {
      if (!selectedBranch || !requiresLicense || !licenseType) {
        setAvailableLicenses([])

        return
      }

      setLoadingLicenses(true)

      try {
        const { data } = await axios.get(`licenses/available/${selectedBranch}/${licenseType}`)

        setAvailableLicenses(data || [])
      } catch (error) {
        console.error('Error loading licenses:', error)
        setAvailableLicenses([])
      } finally {
        setLoadingLicenses(false)
      }
    }

    loadAvailableLicenses()

    // Solo resetear license_id si NO estamos en modo edición o si el rol cambió
    if (dataProp?.action !== 'edit') {
      setValue('license_id', '')
    }
  }, [selectedBranch, requiresLicense, licenseType, dataProp?.action])

  useEffect(() => {
    if (dataProp?.action === 'edit' && dataProp?.data) {
      const user = dataProp.data.Users

      setValue('first_name', user.first_name || '')
      setValue('last_name', user.last_name || '')
      setValue('email', user.email || '')
      setValue('dni', user.dni || '')
      setValue('birth_date', user.birth_date || '')
      setValue('occupation', user.occupation || '')
      setValue('phone_number', user.phone_number || '')
      setValue('address', user.address || '')
      setValue('state', user.state || '')
      setValue('zip_code', user.zip_code || '')
      setValue('country', user.country || '')

      const newLanguage =
        Array.isArray(user.language) && typeof user.language[0] === 'string'
          ? user.language[0].split(',').map(e => e.trim())
          : user.language || []

      setValue('language', newLanguage)
      setValue('gender', user.gender || '')
      setValue('avatar', user.avatar || '')
      setValue('branch_id', dataProp.data.Branches?.id || '')
      setValue('rol_id', dataProp.data.Roles?.id || '')

      // Cargar licencia si existe
      const licenseData = dataProp.data.Licenses_branches_users?.[0]

      if (licenseData?.Licenses) {
        setValue('license_id', licenseData.id || '')
        setExistingLicense(licenseData)
      } else {
        setExistingLicense(null)
      }

      setImgSrc(getAvatarSrcValidator(user.avatar))
    }
  }, [dataProp])

  const handleDelete = value => {
    const currentLanguages = getValues('language')
    const updatedLanguages = currentLanguages.filter(item => item !== value)

    setValue('language', updatedLanguages)
  }

  const handleFileInputChange = async file => {
    const { files } = file.target

    if (files && files.length !== 0) {
      const reader = new FileReader()
      const selectedFile = files[0]

      reader.onload = () => {
        setImgSrc(reader.result)
      }

      reader.readAsDataURL(files[0])
      setFileInput(selectedFile)
      setValue('avatar', files[0].name)
    }
  }

  const handleFileInputReset = () => {
    setFileInput('')
    setImgSrc('/images/avatars/1.png')
    setValue('avatar', '')
  }

  const handleSetInputAvatar = avatar => {
    setImgSrc(avatar)
    setValue('avatar', avatar)
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()

    setValue('password', newPassword)
  }

  const onSubmit = async formData => {
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      const excludeKeys = ['branch_id', 'rol_id', 'license_id']

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'language' && Array.isArray(value)) {
          formDataToSend.append(key, value.join(','))
        } else if (!excludeKeys.includes(key)) {
          formDataToSend.append(key, value || '')
        }
      })

      formDataToSend.append('branch_id', formData.branch_id)
      formDataToSend.append('rol_id', formData.rol_id)

      // Agregar license_id si existe y el rol requiere licencia
      if (requiresLicense && formData.license_id) {
        formDataToSend.append('license_id', formData.license_id)
        formDataToSend.append('license_type', licenseType)
      }

      if (fileInput) {
        formDataToSend.append('subirArchivo', fileInput)
      }

      if (dataProp?.action === 'edit') {
        formDataToSend.append('id', dataProp.data.Users.id)
      }

      const result = await handleCreateStaffUser(formDataToSend)

      if (result?.success) {
        reset()
        setExistingLicense(null)
        setShowform(false)
      }
    } catch (error) {
      console.error('Error saving user', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeAvatar = async () => {
    const avatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png']

    setAvatarList(avatars.map(av => `/images/avatars/${av}`))
    setOpenAvatarDialog(true)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <div className='flex items-center gap-3 pb-4'>
          <IconButton
            onClick={() => {
              reset()
              setExistingLicense(null)
              setShowform(false)
            }}
            color='secondary'
            size='small'
          >
            <i className='ri-arrow-left-line text-2xl' />
          </IconButton>
          <Typography variant='h4'>{dataProp?.action === 'edit' ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</Typography>
        </div>

        <Card>
          <CardContent className='mbe-5'>
            <div className='flex max-sm:flex-col items-center gap-6'>
              <img
                height={100}
                width={100}
                className='rounded'
                src={imgSrc}
                alt='Profile'
                style={{ cursor: 'pointer' }}
                onClick={handleChangeAvatar}
              />
              <div className='flex flex-grow flex-col gap-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <Button component='label' size='small' variant='contained' htmlFor='user-upload-image'>
                    Cargar Foto
                    <input
                      hidden
                      type='file'
                      accept='image/png, image/jpeg'
                      onChange={handleFileInputChange}
                      id='user-upload-image'
                    />
                  </Button>
                  <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
                    Resetear
                  </Button>
                </div>
                <Typography>Formatos permitidos JPG, GIF or PNG. tamaño max 800K</Typography>
              </div>
            </div>
          </CardContent>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Divider />
                  <Typography variant='h6' className='mbs-4'>
                    Información Personal
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='first_name'
                    control={control}
                    rules={{ required: 'Campo requerido' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Nombres'
                        placeholder='John'
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='last_name'
                    control={control}
                    rules={{ required: 'Campo requerido' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Apellidos'
                        placeholder='Doe'
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='dni'
                    control={control}
                    rules={{ required: 'Campo requerido' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='DNI / Documento'
                        placeholder='12345678'
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='birth_date'
                    control={control}
                    rules={{
                      required: 'Campo requerido',
                      validate: value => {
                        const selectedDate = new Date(value)
                        const today = new Date()

                        today.setHours(0, 0, 0, 0)

                        if (selectedDate > today) {
                          return 'La fecha de nacimiento no puede ser en el futuro'
                        }

                        return true
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Fecha de Nacimiento'
                        type='date'
                        InputLabelProps={{
                          shrink: true
                        }}
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='occupation'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Ocupación / Profesión'
                        placeholder='Desarrollador'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='phone_number'
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        label='Teléfono'
                        setValue={setValue}
                        name='phone_number'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Género</InputLabel>
                    <Controller
                      name='gender'
                      control={control}
                      render={({ field }) => (
                        <Select {...field} value={field.value ?? ''} label='Género'>
                          <MenuItem value='male'>Masculino</MenuItem>
                          <MenuItem value='female'>Femenino</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='country'
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        label='País'
                        setValue={setValue}
                        name='country'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='address'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Dirección'
                        placeholder='Dirección'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='state'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Estado / Provincia'
                        placeholder='Lima'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='zip_code'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        type='number'
                        label='Código Postal'
                        placeholder='123456'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Idioma</InputLabel>
                    <Controller
                      name='language'
                      control={control}
                      defaultValue={[]}
                      render={({ field }) => (
                        <Select
                          multiple
                          label='Idioma'
                          value={field.value || []}
                          onChange={event => field.onChange(event.target.value)}
                          renderValue={selected => (
                            <div className='flex flex-wrap gap-2'>
                              {selected.map(value => (
                                <Chip
                                  key={value}
                                  clickable
                                  deleteIcon={
                                    <i
                                      className='ri-close-circle-fill'
                                      onMouseDown={event => event.stopPropagation()}
                                    />
                                  }
                                  size='small'
                                  label={value}
                                  onDelete={() => handleDelete(value)}
                                />
                              ))}
                            </div>
                          )}
                        >
                          {languageData.map(name => (
                            <MenuItem key={name} value={name}>
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='h6' className='mbe-4'>
                    Asignación
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sucursal *</InputLabel>
                    <Controller
                      name='branch_id'
                      control={control}
                      rules={{ required: 'Campo requerido' }}
                      render={({ field, fieldState: { error } }) => (
                        <Select {...field} value={field.value ?? ''} label='Sucursal *' error={!!error}>
                          {branchList &&
                            branchList.map(branch => (
                              <MenuItem key={branch.Branches?.id || branch.id} value={branch.Branches?.id || branch.id}>
                                {branch.Branches?.name || branch.name}
                              </MenuItem>
                            ))}
                        </Select>
                      )}
                    />
                    {errors.branch_id && (
                      <Typography variant='caption' color='error'>
                        {errors.branch_id.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Controller
                      name='rol_id'
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          value={field.value ?? ''}
                          label='Rol'
                          disabled={!selectedBranch || hasExistingLicense}
                        >
                          <MenuItem value=''>* Sin rol</MenuItem>
                          {rolesData &&
                            rolesData.map(role => (
                              <MenuItem key={role.id} value={role.id}>
                                {role.name}
                              </MenuItem>
                            ))}
                        </Select>
                      )}
                    />
                    {hasExistingLicense && (
                      <Typography variant='caption' color='text.secondary' className='mt-1'>
                        No se puede cambiar el rol porque tiene licencia asignada
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Selector de Licencia - Solo si el rol requiere licencia */}
                {requiresLicense && (
                  <Grid item xs={12}>
                    {/* Mostrar licencia existente (solo lectura) - para holder o student */}
                    {isHolderWithExistingLicense || isStudentWithExistingLicense ? (
                      <Alert
                        severity='info'
                        icon={
                          <i className={isHolderWithExistingLicense ? 'ri-shield-check-line' : 'ri-user-follow-line'} />
                        }
                      >
                        <Typography variant='subtitle2' className='font-medium'>
                          Licencia asignada: {existingLicense?.Licenses?.license_code}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Programa: {existingLicense?.Licenses?.Programs_entities_branches?.Programs?.title || 'N/A'}
                        </Typography>
                        <div className='flex items-center gap-1 mt-1'>
                          <i className='ri-information-line text-md' />
                          <Typography variant='caption' color='text.secondary'>
                            {isHolderWithExistingLicense
                              ? 'Esta licencia no se puede cambiar porque tiene estudiantes vinculados.'
                              : 'Esta licencia no se puede cambiar porque está asociada a un titular.'}
                          </Typography>
                        </div>
                      </Alert>
                    ) : loadingLicenses ? (
                      <div className='flex items-center gap-2 p-3'>
                        <CircularProgress size={20} />
                        <Typography variant='body2'>Cargando licencias...</Typography>
                      </div>
                    ) : availableLicenses.length > 0 || (dataProp?.action === 'edit' && existingLicense) ? (
                      <FormControl fullWidth>
                        <InputLabel>Licencia *</InputLabel>
                        <Controller
                          name='license_id'
                          control={control}
                          rules={{ required: requiresLicense ? 'Debe seleccionar una licencia' : false }}
                          render={({ field, fieldState: { error } }) => (
                            <Select {...field} value={field.value ?? ''} label='Licencia *' error={!!error}>
                              {/* Mostrar licencia actual si existe */}
                              {dataProp?.action === 'edit' && existingLicense && (
                                <MenuItem value={existingLicense.id}>
                                  {existingLicense.Licenses?.license_code} -{' '}
                                  {existingLicense.Licenses?.Programs_entities_branches?.Programs?.title ||
                                    'Sin programa'}
                                  <span style={{ marginLeft: 8, color: '#4caf50', fontSize: '0.85em' }}>(actual)</span>
                                </MenuItem>
                              )}
                              {availableLicenses.map(license => {
                                const lic = licenseType === 'student' ? license.Licenses : license
                                const program = lic?.Programs_entities_branches?.Programs?.title || 'Sin programa'
                                const dependentsCount = license.other_Licenses?.length || 0

                                return (
                                  <MenuItem key={lic.id} value={licenseType === 'student' ? license.id : lic.id}>
                                    {lic.license_code} - {program}
                                    {licenseType === 'holder' && dependentsCount > 0 && (
                                      <span style={{ marginLeft: 8, color: '#666', fontSize: '0.85em' }}>
                                        ({dependentsCount} estudiantes)
                                      </span>
                                    )}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          )}
                        />
                        {errors.license_id && (
                          <Typography variant='caption' color='error'>
                            {errors.license_id.message}
                          </Typography>
                        )}
                      </FormControl>
                    ) : (
                      <Alert severity='warning'>
                        No hay licencias disponibles para {licenseType === 'holder' ? 'titulares' : 'estudiantes'}. Debe
                        crear licencias primero en el módulo de Licencias.
                      </Alert>
                    )}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                  <Typography variant='h6' className='mbs-4'>
                    Datos de Acceso
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='email'
                    control={control}
                    rules={{
                      required: 'Campo requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Correo Electrónico'
                        placeholder='john.doe@gmail.com'
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: dataProp?.action !== 'edit' ? 'Campo requerido' : false }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ''}
                        fullWidth
                        label='Contraseña'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        error={!!error}
                        helperText={error ? error.message : ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={() => setShowPassword(!showPassword)}>
                                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                              </IconButton>
                              <IconButton edge='end' onClick={handleGeneratePassword} title='Generar contraseña'>
                                <i className='ri-key-2-line' />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                  <Button
                    variant='contained'
                    type='submit'
                    disabled={isSubmitting}
                    sx={{
                      minWidth: 120,
                      '&.Mui-disabled': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        opacity: 0.85
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    ) : dataProp?.action === 'edit' ? (
                      'Actualizar'
                    ) : (
                      'Guardar'
                    )}
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    disabled={isSubmitting}
                    onClick={() => {
                      reset()
                      setExistingLicense(null)
                      setShowform(false)
                    }}
                  >
                    Cancelar
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <ShowAvatarListDialog
        open={openAvatarDialog}
        setOpen={setOpenAvatarDialog}
        avatarList={avatarList}
        handleSetInputAvatar={handleSetInputAvatar}
      />
    </Grid>
  )
}

export default Userform
