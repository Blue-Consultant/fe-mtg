'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Component Imports
import BookingWidget from './BookingWidget'

const Hero = memo(({ title, subtitle, imageSrc, onSearch, courtTypesList, searchLoading }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--header-height, 80px))',
        height: 'calc(100vh - var(--header-height, 80px))',
        maxHeight: 'calc(100vh - var(--header-height, 80px))',
        width: '100%',
        borderRadius: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 2,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Hero Text Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          textAlign: 'center',
          maxWidth: 800,
          zIndex: 10,
          animation: 'fadeInUp 0.8s ease-out'
        }}
      >
        <Typography
          component='h1'
          sx={{
            color: 'white',
            fontSize: { xs: '2rem', md: '3.5rem' },
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '-0.033em'
          }}
        >
          {title}
        </Typography>
        <Typography
          component='h2'
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: { xs: '1rem', md: '1.125rem' },
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Booking Widget */}
      <BookingWidget onSearch={onSearch} courtTypesList={courtTypesList || []} loading={searchLoading} />
    </Box>
  )
})

Hero.displayName = 'Hero'

export default Hero
