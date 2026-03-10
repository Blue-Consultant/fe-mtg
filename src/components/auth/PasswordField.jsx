'use client'

// React Imports
import { useState, memo, forwardRef } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

/**
 * PasswordField - Campo de contraseña con toggle de visibilidad
 * Compatible con react-hook-form Controller
 *
 * @param {string} label - Etiqueta del campo
 * @param {string} placeholder - Placeholder del input
 * @param {string} error - Mensaje de error
 * @param {object} ...props - Props adicionales para TextField
 */
const PasswordField = forwardRef(({ label, placeholder = '••••••••', error, helperText, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  const handleToggleVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <TextField
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      fullWidth
      error={!!error}
      helperText={helperText || error}
      autoComplete='current-password'
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <IconButton
              onClick={handleToggleVisibility}
              edge='end'
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'text.primary'
                }
              }}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </IconButton>
          </InputAdornment>
        )
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          height: 56,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 2
          }
        }
      }}
      {...props}
    />
  )
})

PasswordField.displayName = 'PasswordField'

export default memo(PasswordField)
