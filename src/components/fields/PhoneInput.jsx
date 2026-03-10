'use client'

// Third-party Imports
import { MuiTelInput } from 'mui-tel-input'

/**
 * PhoneInput - Componente de teléfono internacional usando mui-tel-input
 * Incluye selector de país con banderas y prefijos para 240+ países
 */
const PhoneInput = ({
  value,
  onChange,
  error,
  helperText,
  label = 'Teléfono',
  placeholder,
  setValue,
  name = 'phone_number',
  defaultCountry = 'PE',
  ...rest
}) => {
  // Manejar el cambio de valor
  const handleChange = (newValue, info) => {
    // Limpiar el valor (remover espacios para almacenar formato limpio)
    const cleanValue = newValue.replace(/\s/g, '')

    // Si tenemos setValue de react-hook-form, usarlo
    if (setValue) {
      setValue(name, cleanValue, { shouldValidate: false })
    }

    // Llamar onChange si existe (para compatibilidad con Controller)
    if (onChange) {
      // Simular evento para compatibilidad con react-hook-form Controller
      if (typeof onChange === 'function') {
        onChange(cleanValue)
      }
    }
  }

  return (
    <MuiTelInput
      value={value || ''}
      onChange={handleChange}
      defaultCountry={defaultCountry}
      preferredCountries={['PE', 'VE', 'CO', 'MX', 'AR', 'CL', 'EC', 'US', 'ES']}
      fullWidth
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      forceCallingCode
      focusOnSelectCountry
      langOfCountryName='es'
      {...rest}
    />
  )
}

export default PhoneInput

