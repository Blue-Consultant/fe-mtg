'use client'

// React Imports
import { useState, useEffect, use } from 'react'

import { useForm, Controller } from 'react-hook-form'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { userStoredData } from '@/redux-store/slices/login'

// MUI Imports
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

// Third-party Imports
import ReactCountryFlag from 'react-country-flag'

// Component Imports
import ShowAvatarListDialog from '@components/dialogs/show-avatar-dialog'
import PhoneInput from '@/components/fields/PhoneInput'
import CountrySelect from '@/components/fields/CountrySelect'

import axios from '@/utils/axios'
import { displayAvatar, updateUser } from './ApiAccount'
// const { NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT } = process.env
const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT

const languageData = ['English', 'Español', 'Portuguese', 'Quechua']

const AccountDetails = () => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
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
    }
  })

  const userData = useSelector(state => state.loginReducer.user)

  // States
  const [fileInput, setFileInput] = useState('')
  const [imgSrc, setImgSrc] = useState(userData.avatar)
  const [avatarList, setAvatarList] = useState([])
  const [open, setOpen] = useState(false)

  const dispatch = useDispatch()


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post('user/findOne', {
          email: userData.email
        })

        if (response.status !== 200 && response.status !== 201) {
          throw new Error('Error fetching user data')
        }

        const user = await response.data

        setValue('first_name', user.first_name || '')
        setValue('last_name', user.last_name || '')
        setValue('email', user.email || '')
        setValue('birth_date', user.birth_date || '')
        setValue('occupation', user.occupation || '')
        setValue('phone_number', user.phone_number || '')
        setValue('address', user.address || '')
        setValue('state', user.state || '')
        setValue('zip_code', user.zip_code || '')
        setValue('country', user.country || '')
        const newLenguage = Array.isArray(user.language) && typeof user.language[0] === 'string' ? user.language[0].split(',').map((e) => e.trim()) : user.language || []
        setValue('language', newLenguage);
        setValue('gender', user.gender || '')
        setValue('avatar', user.avatar || '')

        dispatch(userStoredData(user))
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (userData.email) {
      fetchUserData()
    }
  }, [])

  const handleDelete = value => {
    const currentLanguages = getValues('language')
    const updatedLanguages = currentLanguages.filter(item => item !== value)

    setValue('language', updatedLanguages)
  }

  const handleFileInputChange = async (file) => {
    const { files } = file.target
    if (files && files.length !== 0) {
      const reader = new FileReader()
      const selectedFile = files[0];

      reader.onload = () => {
        setImgSrc(reader.result)
      }

      reader.readAsDataURL(files[0])
      setFileInput(selectedFile)
      setValue('avatar', files[0].name)
    }
  }

  const handleFileInputReset = () => {
    setFileInput(userData.avatar)
    setImgSrc(userData.avatar)
  }

  const handleSetInputAvatar = (avatar) => {
    setImgSrc(avatar)
    setValue('avatar', avatar)
  }

  const onSubmit = async formData => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id", userData.id);
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (fileInput) {
        formDataToSend.append('subirArchivo', fileInput);
      }

      const data = await updateUser(formDataToSend)

      if (data) {
        dispatch(userStoredData(data))
      }
    } catch (error) {
      console.error('Error updating user', error)
    }
  }

  const handleChangeAvatar = async() => {
    const avatarData = await displayAvatar()
    setAvatarList(avatarData)
    setOpen(true)
  }

  function getAvatarSrcValidator(img) {
    const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png'];

    if (!img) {
      return '/images/avatars/1.png';
    }

    // Normalizar el valor: quitar espacios y convertir a string
    const normalizedImg = String(img).trim();

    if (normalizedImg.includes('APP_MTG')) {
      return `${NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT}${normalizedImg}`;
    } else if (allowedAvatars.includes(normalizedImg)) {
      return `/images/avatars/${normalizedImg}`;
    } else {
      // Si no coincide, intentar extraer solo el nombre del archivo
      const fileName = normalizedImg.split('/').pop() || normalizedImg;
      if (allowedAvatars.includes(fileName)) {
        return `/images/avatars/${fileName}`;
      }
      // Si es una URL completa o ruta válida, devolverla tal cual
      if (normalizedImg.startsWith('http') || normalizedImg.startsWith('/')) {
        return normalizedImg;
      }
      // Por defecto, devolver el avatar 1
      return '/images/avatars/1.png';
    }
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={getAvatarSrcValidator(imgSrc)} alt='Profile' style={{ cursor: 'pointer' }} onClick={handleChangeAvatar}/>
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                Cargar Foto
                <input
                  hidden
                  type='file'
                  // value={fileInput}
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='first_name'
                control={control}
                rules={{ required: 'First name is required' }}
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
                name='email'
                control={control}
                rules={{ required: 'Campo requerido' }}
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
                name='occupation'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value}
                    fullWidth
                    label='ocupación / profesión'
                    placeholder='ocupación / profesión'
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
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} fullWidth label='Dirección' placeholder='Dirección' />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='state'
                control={control}
                render={({ field }) => (
                  <TextField {...field} value={field.value ?? ''} fullWidth label='Estado' placeholder='Lima' />
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
                                <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='birth_date'
                control={control}
                rules={{
                  required: 'Campo requerido',
                  validate: value => {
                    const selectedDate = new Date(value);
                    const today = new Date();

                    // Ajusta la hora para evitar errores de zona horaria
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate > today) {

                      return 'La fecha de nacimiento no puede ser en el futuro';
                    }

                    return true;
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
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>
                Guardar Cambios
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => reset()}>
                Resetear
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <ShowAvatarListDialog open={open} setOpen={setOpen} avatarList={avatarList} handleSetInputAvatar={handleSetInputAvatar}/>
    </Card>
  )
}

export default AccountDetails
