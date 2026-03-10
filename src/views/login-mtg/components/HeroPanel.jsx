'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'

/**
 * HeroPanel - Panel visual izquierdo para login/register
 * Muestra imagen de fondo, headline y testimonios
 */
const HeroPanel = ({ 
  backgroundImage = '/images/misc/soccer-field.jpg',
  icon = 'ri-football-line',
  title = 'Reserva tu cancha ideal en segundos',
  subtitle = 'Únete a la comunidad más grande de deportistas y encuentra el espacio perfecto para tu próximo partido.',
  testimonial,
  stats
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          opacity: 0.6,
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
          maxWidth: 480,
          px: 6,
          textAlign: 'center'
        }}
      >
        {/* Icon */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className={icon} style={{ fontSize: '2rem', color: '#102216' }} />
          </Box>
        </Box>

        {/* Headline */}
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 900,
            mb: 2,
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 300,
            lineHeight: 1.6
          }}
        >
          {subtitle}
        </Typography>

        {/* Stats / Testimonial Card */}
        {(testimonial || stats) && (
          <Box
            sx={{
              mt: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              p: 2,
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {stats && (
              <>
                <AvatarGroup max={3}>
                  {stats.avatars?.map((avatar, index) => (
                    <Avatar 
                      key={index} 
                      src={avatar} 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        border: '2px solid #102216 !important'
                      }} 
                    />
                  ))}
                </AvatarGroup>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                    {stats.count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {stats.label}
                  </Typography>
                </Box>
              </>
            )}

            {testimonial && (
              <>
                <Avatar 
                  src={testimonial.avatar} 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }} 
                />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    "{testimonial.quote}"
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {testimonial.author}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default memo(HeroPanel)
