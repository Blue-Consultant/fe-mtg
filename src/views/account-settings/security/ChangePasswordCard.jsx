'use client'

// React Imports
import { useState } from 'react'

// Redux Imports
import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { changePassword } from './ApiSecurity'

const ChangePasswordCard = () => {

  // States Redux
  const userdata = useSelector(state => state.loginReducer.user)

  // States
  const [isCurrentPasswordShown, setIsCurrentPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })
  const [isColored, setIsColored] = useState({
    errorLength: 'text-gray-500',
    errorCase: 'text-gray-500',
    errorNumberOrSymbol: 'text-gray-500',
    errorconfirm: 'text-gray-500',
    errorSamePass: 'text-gray-500',
  })

  const validatePassword = password => {
    const errors = {}

    if (currentPassword === '') {
      errors.empty = 'Current password must not be empty'
    }

    if (password.length < 8) {
      errors.length = 'Password must be at least 8 characters long'
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      errors.case = 'Password must contain at least one uppercase and one lowercase letter'
    }

    if (!/[0-9]/.test(password) && !/[!@#$%^&*]/.test(password)) {
      errors.numberOrSymbol = 'Password must contain at least one number or symbol'
    }

    if (password === currentPassword) {
      errors.samePass = 'New password must be diferent from current password'
    }

    return errors
  }

  const handleNewPasswordChange = value => {
    setNewPassword(value)

    const newErrors = validatePassword(value)

    // Limpiar los errores si la contraseña es válida
    const updatedErrors = { ...errors }

    if (newErrors.length) {
      updatedErrors.length = newErrors.length
      
    } else {
      delete updatedErrors.length
      setIsColored( prevData => ({
        ...prevData,
        errorLength: 'text-green-500'
      }))
    }

    if (newErrors.case) {
      updatedErrors.case = newErrors.case
    } else {
      delete updatedErrors.case
      setIsColored( prevData => ({
        ...prevData,
        errorCase: 'text-green-500'
      }))
    }

    if (newErrors.numberOrSymbol) {
      updatedErrors.numberOrSymbol = newErrors.numberOrSymbol
    } else {
      delete updatedErrors.numberOrSymbol
      setIsColored( prevData => ({
        ...prevData,
        errorNumberOrSymbol: 'text-green-500'
      }))
    }

    if (confirmPassword && confirmPassword !== value) {
      updatedErrors.confirm = 'Passwords do not match'
    } else {
      delete updatedErrors.confirm
      setIsColored( prevData => ({
        ...prevData,
        errorconfirm: 'text-green-500'
      }))
    }
   
    if (newErrors.samePass) {
      updatedErrors.samePass = newErrors.samePass
    } else {
      delete updatedErrors.samePass
      setIsColored( prevData => ({
        ...prevData,
        errorSamePass: 'text-green-500'
      }))
    }

    setErrors(updatedErrors)
  }

  const handleBlur = field => {
    setTouched({ ...touched, [field]: true })
  }

  const handleConfirmPasswordChange = value => {
    setConfirmPassword(value)

    const updatedErrors = { ...errors }

    if (value !== newPassword) {
      updatedErrors.confirm = 'Passwords do not match'
    } else {
      delete updatedErrors.confirm
    }

    setErrors(updatedErrors)
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()

    try {
      const newErrors = validatePassword(newPassword)

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      if (newPassword !== confirmPassword) {
        setErrors({ ...newErrors, confirm: 'Passwords do not match' })
        return
      }
     
      await changePassword(userdata.email, currentPassword, newPassword)

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsColored({
        errorLength: 'text-gray-500',
        errorCase: 'text-gray-500',
        errorNumberOrSymbol: 'text-gray-500',
        errorconfirm: 'text-gray-500',
        errorSamePass: 'text-gray-500',
      })
    } catch (error) {
      console.error('Error updating password', error)
    }
  }

  return (
    <Card>
      <CardHeader title='Cambiar Contraseña' />
      <CardContent>
        <form onSubmit={handleSaveChanges}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Contraseña Actual'
                type={isCurrentPasswordShown ? 'text' : 'password'}
                value={currentPassword}
                onBlur={() => handleBlur('currentPassword')}
                onChange={e =>{ 
                  setCurrentPassword(e.target.value)
                  setErrors( prevErrors => ({
                      ...prevErrors,
                      empty: e.target.value  === '' ? errors.empty = 'Password must not be empty' : errors.empty = ''
                  }))
                }}
                required
                error={touched.currentPassword && Boolean(errors.empty)}
                helperText={touched.currentPassword && errors.empty}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsCurrentPasswordShown(!isCurrentPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isCurrentPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nueva Contraseña'
                type={isNewPasswordShown ? 'text' : 'password'}
                value={newPassword}
                onBlur={() => handleBlur('newPassword')}
                onChange={e => handleNewPasswordChange(e.target.value)}
                error={touched.newPassword && Boolean(errors.length || errors.case || errors.numberOrSymbol || errors.samePass)}
                helperText={touched.newPassword && (errors.length || errors.case || errors.numberOrSymbol || errors.samePass)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsNewPasswordShown(!isNewPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Confirmar Nueva Contraseña'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                value={confirmPassword}
                onBlur={() => handleBlur('confirmPassword')}
                onChange={e => handleConfirmPasswordChange(e.target.value)}
                error={touched.confirmPassword && Boolean(errors.confirm)}
                helperText={touched.confirmPassword && errors.confirm}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} className='flex flex-col gap-4'>
              <Typography variant='h6' color='text.secondary'>
                Requisitos de Contraseña:
              </Typography>
              <div className='flex flex-col gap-4'>
                <div className={`flex items-center gap-2.5 ${errors.length ? '' : isColored.errorLength}`}>
                  <i className={`ri-checkbox-blank-circle-fill text-[8px] ${errors.length ? '' : isColored.errorLength}`} />
                  Mínimo 8 caracteres - Cuanto más, mejor
                </div>
                <div className={`flex items-center gap-2.5 ${errors.case ? '' : isColored.errorCase}`}>
                  <i className={`ri-checkbox-blank-circle-fill text-[8px] ${errors.case ? '' : isColored.errorCase}` } />
                  Al menos una letra minúscula y una mayúscula
                </div>
                <div className={`flex items-center gap-2.5 ${errors.numberOrSymbol ? '' : isColored.errorNumberOrSymbol}`}>
                  <i className={`ri-checkbox-blank-circle-fill text-[8px] ${errors.numberOrSymbol ? '' : isColored.errorNumberOrSymbol}`} />
                  Al menos un número, símbolo o espacio en blanco
                </div>
                <div className={`flex items-center gap-2.5 ${newPassword === '' || errors.samePass ? '' : isColored.errorSamePass}`}>
                  <i className={`ri-checkbox-blank-circle-fill text-[8px] ${newPassword === '' || errors.samePass ? '' : isColored.errorSamePass}`} />
                  La nueva contraseña debe ser diferente a la actual
                </div>
              </div>
            </Grid>
            <Grid item xs={12} className='flex gap-4'>
              <Button variant='contained' type='submit'
              disabled={(Object.keys(errors).some(key => errors[key]) || !newPassword || !confirmPassword || !currentPassword)}
              >Guardar Cambios</Button>
              <Button
                variant='outlined'
                type='reset'
                color='secondary'
                onClick={() => {
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setErrors({})
                  setTouched({
                    currentPassword: false,
                    newPassword: false,
                    confirmPassword: false
                  })
                  setIsColored({
                    errorLength: 'text-gray-500',
                    errorCase: 'text-gray-500',
                    errorNumberOrSymbol: 'text-gray-500',
                    errorconfirm: 'text-gray-500',
                    errorSamePass: 'text-gray-500',
                  })
                }}
              >
                Resetear
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
