'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'

/**
 * HeroSection - Panel visual derecho para register
 * Muestra imagen de fondo, badge, headline, rating y testimonio
 */
const HeroSection = ({
  backgroundImage = '/images/misc/padel-court.jpg',
  badge = 'Comunidad #1 de Deportes',
  title = 'Encuentra, reserva y juega en las mejores canchas de tu ciudad.',
  testimonial
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden'
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(16, 34, 22, 0.9), rgba(16, 34, 22, 0.4), transparent)'
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 8,
          height: '100%',
          width: '100%'
        }}
      >
        <Box sx={{ maxWidth: 420 }}>
          {/* Badge */}
          <Chip
            icon={<i className='ri-verified-badge-line' style={{ fontSize: '0.875rem', marginLeft: 8 }} />}
            label={badge}
            sx={{
              mb: 3,
              bgcolor: 'rgba(19, 236, 91, 0.1)',
              color: 'primary.main',
              border: '1px solid rgba(19, 236, 91, 0.3)',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
              fontSize: '0.75rem',
              '& .MuiChip-icon': {
                color: 'primary.main'
              }
            }}
          />

          {/* Headline */}
          <Typography
            variant='h3'
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              letterSpacing: '-0.01em',
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 4 }}>
            <Rating value={5} readOnly sx={{ color: 'primary.main' }} />
          </Box>

          {/* Testimonial Card */}
          {testimonial && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                p: 2,
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Avatar
                src={testimonial.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              />
              <Box>
                <Typography variant='body2' sx={{ color: 'white', fontWeight: 500 }}>
                  &quot;{testimonial.quote}&quot;
                </Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {testimonial.author}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default memo(HeroSection)
