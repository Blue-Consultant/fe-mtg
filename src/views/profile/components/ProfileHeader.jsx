'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

/**
 * ProfileHeader - Cabecera del perfil con avatar y nombre
 */
const ProfileHeader = ({
  avatarSrc,
  name = 'Juan Perez',
  email = 'juan.perez@email.com',
  onEditProfile,
  onChangePhoto,
  dictionary = {}
}) => {
  const t = dictionary?.profile || {}

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 6
      }}
    >
      {/* Avatar with Edit Button */}
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Avatar
          src={
            avatarSrc ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAbuoFWPsEz4GnzQtSqy-H0CVB9oOVWuaqdP1cKSv9poh0AAGhcFfzPtN7C8bbrRR83MiqSlVuCxl_oAGcNztPNyIqwg2JAudiqReSCDBR2cx9y1tR3VHOn4yHGMn8al1rkqxvymr7pZGJUfAorFGWf5lI6esyiBr_SKmIWqdf9EmwCdJC-W8f-PPRCKoejnwAiYIGfjOmsFfbPEPMdDBIndRkk5nZoqa_NA1cvJqf3YD2H5PfzU635rZhvDvhxx3jcJkCQS3Jidbx0'
          }
          sx={{
            width: 128,
            height: 128,
            border: '4px solid',
            borderColor: 'background.paper',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}
        />

        {/* Camera Button */}
        <IconButton
          onClick={onChangePhoto}
          aria-label={t.changePhoto || 'Cambiar foto'}
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: '#102216',
            boxShadow: '0 4px 12px rgba(19, 236, 91, 0.3)',
            border: '2px solid',
            borderColor: 'background.paper',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s'
          }}
        >
          <i className='ri-camera-line' style={{ fontSize: '1.25rem' }} />
        </IconButton>
      </Box>

      {/* Name & Email */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='h4' fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
          {name}
        </Typography>
        <Typography variant='body1' color='text.secondary' fontWeight={500}>
          {email}
        </Typography>
      </Box>

      {/* Edit Profile Button */}
      <Button
        variant='outlined'
        onClick={onEditProfile}
        startIcon={<i className='ri-edit-line' />}
        sx={{
          mt: 3,
          px: 3,
          py: 1,
          borderRadius: 6,
          fontWeight: 700,
          textTransform: 'none'
        }}
      >
        {t.editProfile || 'Editar Perfil'}
      </Button>
    </Box>
  )
}

export default memo(ProfileHeader)
