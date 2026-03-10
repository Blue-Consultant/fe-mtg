'use client'

// React Imports
import { memo, useMemo } from 'react'

// Component Imports
import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'

import { SplitScreenLayout } from '@/components/auth'
import HeroPanel from './components/HeroPanel'
import LoginForm from './components/LoginForm'

// MUI Imports

/**
 * LoginMtgView - Vista principal de Login MTG
 * Implementa diseño split-screen con hero panel y formulario
 */
const LoginMtgView = ({ dictionary = {}, lang }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])

  // Hero panel content
  const heroContent = (
    <HeroPanel
      backgroundImage='https://lh3.googleusercontent.com/aida-public/AB6AXuA6WiZai4QWxXno3laB_zme9KAZdQp_YdkmGhGfx5KSxQ6nap2SmnU1BRpubhrc7tobFqGQJBFlQrwCN1w6M46LrtAaft2hyyuwLKRktJdb2HZgg-wTT5MDRWhj0-irBDZs-nZWpLkaId9TPYWPqkkYPyaDAS8OwX8FGqdb39tZJHXTqkuGs5mAoBmJS4AZkXuYxo9TnIdffLlHXl7ajYi_SBWxqm9cYQtFcFD_0qHEf8Yhdb7INDrp94HywWbZ-uUx2Dxr7C0WS5Jw'
      icon='ri-football-line'
      title={memoizedDictionary?.loginMtg?.heroTitle || 'Reserva tu cancha ideal en segundos'}
      subtitle={
        memoizedDictionary?.loginMtg?.heroSubtitle ||
        'Únete a la comunidad más grande de deportistas y encuentra el espacio perfecto para tu próximo partido.'
      }
      stats={{
        count: '+2,000 Usuarios',
        label: 'Reservando hoy',
        avatars: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDafEYcucUg3qgPqC8Q1rJQp8rylzEYtUZrp4XXKJ0nvqenGjeg7O5HQXFXj8ecKk8PDWhIXxX6n_G-oDw_3rw9DETz_Y4dbmodyZJ8S8dhRDPsfhIOo8ZxXbOax6lmb5am7c16wzMmehc5hXh3si-Ybl_qxzCP9kQGfYPrRJ0VnJDooQycZzLSZOe7lz7d9hQtpOYY_XIL8N36HZ7EZ3TihhwBOEz_B4zWRK1R6ZbGSiEgirjnUXMy0FoWvuPPpwM3_Xa9Bj-YDqJi',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCIOeIAPle6NqwKjpFApKZyKfFuGEIAICLvZyJpectke17dij4UTZA5_1TV43GIcIdvvgMK0zyrMJzDJlJBo6hYxImTPlW1Fej4X6KpyqcIfa183QhznxolnxtJptDRlAwmfiUs4UWmDR0vZ7BRfR3buGIvvqd7RbTyzj00H-uLYJ3FiPnn4uJ7a6DyzYEaO8-oKsKuwTBA5qIwhTPPVwrDH-ZbKl5uqwYamxDBo9CgoBjO6KmLbnVoo2eK9cfSUOU-cn8XzDy5edmu',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA6omnSU7orA8Ol-pU0HYG7IPN5W47rAKqLwgzzgW1MjHPRp64kZwgu8T-VKomW33CC2nPimQ78DfDO6BWAzlVxjmCR4RwHE_q_0Wb5lkPbchCx2U8iTCvgiyjKcoZWuk9xIf73XBqjXnA5065waOnuuVDPdKYxPXHg-K_Mx3LRZhTl20QddZwmioM4zKgCIWDeBATnBT2dMcH7lyYYiPR1EfkJY0kFfNzk_UuXkvxNnARti2xDKLx3owqJASr-N3jJY9zn3ojsaT_j'
        ]
      }}
    />
  )

  // Form content with mobile header
  const formContent = (
    <>
      {/* Mobile Header Logo */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: { xs: 'flex', lg: 'none' },
          alignItems: 'center',
          gap: 1
        }}
      >
        <i className='ri-football-line' style={{ fontSize: '1.75rem', color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='h6' fontWeight={700}>
          SportReserva
        </Typography>
      </Box>

      <LoginForm dictionary={memoizedDictionary} />
    </>
  )

  return <SplitScreenLayout heroContent={heroContent} formContent={formContent} heroPosition='left' />
}

export default memo(LoginMtgView)
