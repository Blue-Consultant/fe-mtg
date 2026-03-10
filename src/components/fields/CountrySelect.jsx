'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Third-party Imports
import ReactCountryFlag from 'react-country-flag'

// Styles
import styles from './styles.module.css'

// Lista de 12 países
const countries = [
  { code: 'PE', name: 'Perú' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' }
]

/**
 * CountrySelect - Selector de países con banderas
 * Compatible con react-hook-form Controller
 */
const CountrySelect = ({
  value,
  onChange,
  error,
  helperText,
  label = 'País',
  setValue,
  name = 'country',
  defaultCountry = 'PE'
}) => {
  // Encontrar el país inicial basado en el value o defaultCountry
  const getInitialCountry = () => {
    if (value) {
      const found = countries.find(
        c => c.name.toLowerCase() === value.toLowerCase() || c.code.toLowerCase() === value.toLowerCase()
      )

      if (found) return found
    }

    return countries.find(c => c.code === defaultCountry) || countries[0]
  }

  const [selectedCountry, setSelectedCountry] = useState(getInitialCountry)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // Sincronizar cuando cambia el value externo
  useEffect(() => {
    if (value) {
      const found = countries.find(
        c => c.name.toLowerCase() === value.toLowerCase() || c.code.toLowerCase() === value.toLowerCase()
      )

      if (found && found.code !== selectedCountry.code) {
        setSelectedCountry(found)
      }
    }
  }, [value])

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCountrySelect = country => {
    setSelectedCountry(country)

    // Actualizar el valor usando setValue de react-hook-form
    if (setValue) {
      setValue(name, country.name, { shouldValidate: false })
    }

    // Llamar onChange si existe
    if (onChange) {
      if (typeof onChange === 'function') {
        onChange(country.name)
      }
    }

    handleClose()
  }

  return (
    <>
      <TextField
        value={selectedCountry.name}
        onClick={handleClick}
        fullWidth
        label={label}
        error={error}
        helperText={helperText}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position='start'>
              <IconButton onClick={handleClick} edge='start' disableRipple className={styles.countryButton}>
                <Box className={styles.countrySelector}>
                  <ReactCountryFlag countryCode={selectedCountry.code} svg className={styles.countryFlag} />
                  <i className={`ri-arrow-down-s-line ${styles.countryArrow}`} />
                </Box>
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            cursor: 'pointer',
            '& input': {
              cursor: 'pointer'
            }
          }
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            className: styles.countryMenu
          }
        }}
      >
        {countries.map(country => (
          <MenuItem
            key={country.code}
            onClick={() => handleCountrySelect(country)}
            selected={selectedCountry.code === country.code}
          >
            <Box className={styles.countryMenuItem}>
              <ReactCountryFlag countryCode={country.code} svg className={styles.countryFlagMenu} />
              <Typography variant='body1'>{country.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default CountrySelect
