'use client'

// React Imports
import { memo, useMemo } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import { signOut } from 'next-auth/react'

// Redux Imports
import { useSelector } from 'react-redux'
import { persistor } from '@/redux-store'

// Component Imports
import ProfileHeader from './components/ProfileHeader'
import SettingsSection from './components/SettingsSection'
import ProfileFooter from './components/ProfileFooter'
import BottomTabBar from './components/BottomTabBar'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * ProfileView - Vista principal del perfil de usuario
 */
const ProfileView = ({ dictionary = {}, lang }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])
  const t = memoizedDictionary?.profile || {}

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // Get user from Redux
  const user = useSelector(state => state.login?.user)

  // Activity section items
  const activityItems = [
    {
      id: 'reservations',
      icon: 'ri-calendar-check-line',
      label: t.myReservations || 'Mis Reservas',
      href: getLocalizedUrl('/booking', locale),
      isPrimary: true
    },
    {
      id: 'favorites',
      icon: 'ri-heart-line',
      label: t.favorites || 'Favoritos',
      href: '#',
      isPrimary: true
    }
  ]

  // Settings section items
  const settingsItems = [
    {
      id: 'notifications',
      icon: 'ri-notification-3-line',
      label: t.notifications || 'Notificaciones',
      badge: t.active || 'Activo',
      href: getLocalizedUrl('/notifications', locale)
    },
    {
      id: 'payment',
      icon: 'ri-bank-card-line',
      label: t.paymentMethods || 'Métodos de Pago',
      sublabel: 'Visa •••• 4242',
      href: '#'
    },
    {
      id: 'privacy',
      icon: 'ri-shield-check-line',
      label: t.privacySecurity || 'Privacidad y Seguridad',
      href: '#'
    },
    {
      id: 'support',
      icon: 'ri-question-line',
      label: t.support || 'Soporte y Ayuda',
      href: '#'
    }
  ]

  // Handlers
  const handleEditProfile = () => {
    router.push(getLocalizedUrl('/account-settings', locale))
  }

  const handleChangePhoto = () => {
    // TODO: Implement photo change functionality
    console.log('Change photo clicked')
  }

  const handleLogout = async () => {
    try {
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })
      
      // Clear redux persist
      await persistor.purge()
      
      // Clear localStorage
      localStorage.clear()
      
      // Sign out
      await signOut({ redirect: false })
      
      // Redirect to login
      router.replace(getLocalizedUrl('/login-mtg', locale))
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleBottomNavigation = (tabId) => {
    switch (tabId) {
      case 'home':
        router.push(getLocalizedUrl('/home', locale))
        break
      case 'search':
        router.push(getLocalizedUrl('/courts', locale))
        break
      default:
        break
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: { xs: 10, md: 0 } // Space for bottom tab bar on mobile
      }}
    >
      {/* Navigation Header */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(var(--mui-palette-background-paperChannel) / 0.8)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: 3,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="ri-football-line" style={{ fontSize: '1.25rem', color: '#102216' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} letterSpacing="-0.02em">
              SportReserve
            </Typography>
          </Box>

          {/* Desktop Nav */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 4
            }}
          >
            <Typography
              component="a"
              href="#"
              variant="body2"
              fontWeight={600}
              sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t.navCourts || 'Canchas'}
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              fontWeight={600}
              sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t.navReservations || 'Mis Reservas'}
            </Typography>
            <Typography
              component="a"
              href="#"
              variant="body2"
              fontWeight={600}
              sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {t.navCommunity || 'Comunidad'}
            </Typography>
          </Box>

          {/* Right Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'action.hover'
              }}
            >
              <i className="ri-notification-3-line" style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <Avatar
              src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzOkIly7jy3BaWxrWSo_0dPW6YGKz7JZYf55538Pp27SS3LJLPbMf10utKzCyd-iFL1-fFNKgMoCO8IoGnQqYvirTYxECaYksrTxzJ8Q4uNf0_a46T97FyTu1lvcp58VomH1-FVa5SCSSE5BJFeiz1ojkSrG05eClhc8aD7NtwTz7lHkvizicSmV8L0mWSw8subdRPgQFuAnfv5qSmCSbKsFMSe-v-A4wDYI1-lUOf5djWyaGVQot7DkwVUHMQCwsUKd13tDgTlDUn'}
              sx={{
                width: 40,
                height: 40,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          maxWidth: 640,
          mx: 'auto',
          px: 2,
          py: 6
        }}
      >
        {/* Profile Header */}
        <ProfileHeader
          avatarSrc={user?.avatar}
          name={user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Juan Perez'}
          email={user?.email || 'juan.perez@email.com'}
          onEditProfile={handleEditProfile}
          onChangePhoto={handleChangePhoto}
          dictionary={memoizedDictionary}
        />

        {/* Activity Section */}
        <SettingsSection
          title={t.activityTitle || 'Mi Actividad'}
          items={activityItems}
          dictionary={memoizedDictionary}
        />

        {/* Settings Section */}
        <SettingsSection
          title={t.settingsTitle || 'Configuración'}
          items={settingsItems}
          dictionary={memoizedDictionary}
        />

        {/* Footer */}
        <ProfileFooter
          onLogout={handleLogout}
          appVersion="v2.4.0"
          dictionary={memoizedDictionary}
        />
      </Box>

      {/* Bottom Tab Bar (Mobile) */}
      <BottomTabBar
        activeTab="profile"
        onNavigate={handleBottomNavigation}
      />
    </Box>
  )
}

export default memo(ProfileView)
