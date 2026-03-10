'use client'

// React Imports
import { memo, useMemo, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

// Component Imports
import NavigationHeader from './components/NavigationHeader'
import RegisterForm from './components/RegisterForm'
import HeroSection from './components/HeroSection'

/**
 * RegisterMtgView - Vista principal de Register MTG
 * Implementa header + diseño split-screen con formulario y hero section
 */
const RegisterMtgView = ({ dictionary = {}, lang }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const handleRegistrationSuccess = (userData) => {
    setRegistrationComplete(true)
    // Additional logic like redirect or show verification message
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Navigation Header */}
      <NavigationHeader dictionary={memoizedDictionary} />

      {/* Main Content - Split Screen */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' }
        }}
      >
        {/* Left Side: Form */}
        <Box
          sx={{
            width: { xs: '100%', lg: '50%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 3, sm: 5, lg: 8 },
            bgcolor: 'background.paper',
            zIndex: 10
          }}
        >
          <RegisterForm 
            dictionary={memoizedDictionary} 
            onSuccess={handleRegistrationSuccess}
          />
        </Box>

        {/* Right Side: Hero */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            width: '50%',
            position: 'relative',
            bgcolor: 'var(--mui-palette-background-dark, #102216)',
            overflow: 'hidden'
          }}
        >
          <HeroSection
            backgroundImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCOrctLMk_JdvX26rfRxi5KE4n-r0FxbSeXNIc6nFwSS-9scPzAb-R-mfsrvUJTyHliv9P9mEXhVQYOq0iO1ZQUTmX2rVcoJDdb9tjVPnym0ZQwf4lkWP-j1sNprfc6fVXesKu6k3E2UXC4EAPj2SGQtxZDbDDIbZryTLV-kchm_HATlsRaXjk-sfqhT99y40c_3hwpBnIx5e6Yix5vGOTDU4UKLiDqXHYaUphnAajumPvzowBJ9WxKa-ccVLQcmwldU55y5oqhdFjO"
            badge={memoizedDictionary?.registerMtg?.heroBadge || 'Comunidad #1 de Deportes'}
            title={memoizedDictionary?.registerMtg?.heroTitle || 'Encuentra, reserva y juega en las mejores canchas de tu ciudad.'}
            testimonial={{
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmb8_irHYgvT2MGErCaWT_pCyytm8EtP3hR0sXEiLW_0D0SOsOESwojYbcJGDSXeGSpM48NuFJVNDVum4f9gU4covfjXdjXpovziDvdrjOLNdVTKw_wMwItQy7MYkEZWQw14iVC_S6ElrxiGjFKpyb37hl1sjBbtH-OBjKYlhK7sm8uHf2LXdd50H3ScFa2RVJbTr21c48FEDgqwxB37HFZpY6tc0I3Wcelx6pWO5O2sjfZssV-w0tTNl1_ldBwTotr_-cMeAQr29x',
              quote: memoizedDictionary?.registerMtg?.testimonialQuote || 'La app más rápida para armar partidos.',
              author: memoizedDictionary?.registerMtg?.testimonialAuthor || 'Sofia M. - Padel Player'
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default memo(RegisterMtgView)
