'use client'

// React Imports
import { useState, useEffect } from 'react'

import { io } from 'socket.io-client'

// Redux Imports
import { useSelector } from 'react-redux'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import GrainIcon from '@mui/icons-material/Grain'

// import AsistentAI from '@/views/virtual_asistent/AsistentAI'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NavToggle from './NavToggle'
import { listNotificationsIdUser } from '@/views/notifications/ApiNotifications'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { Box } from '@mui/material'

const NavbarContent = ({ dictionary }) => {
  const usuario = useSelector(state => state.loginReducer.user)
  const [notifications, setNotifications] = useState([])

  const getNotifications = async () => {
    try {
      if (usuario && usuario.id) {
        const response = await listNotificationsIdUser(usuario.id)
        await setNotifications(response)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    if (!usuario?.id) return

    // Inicializar socket con userId para unirse a la sala correcta
    const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 20000,
      query: {
        userId: usuario.id
      }
    })

    getNotifications()

    socket.on('notificationCreated', data => {
      console.log('Nueva notificación recibida:', data)
      getNotifications()
    })

    return () => {
      socket.off('notificationCreated')
      socket.disconnect()
    }
  }, [usuario?.id])

  const handleClick = event => {
    event.preventDefault()
    console.info('You clicked a breadcrumb.')
  }

  return (
    <div
      className={classnames(
        verticalLayoutClasses.navbarContent,
        'flex items-center justify-between gap-1 is-full overflow-hidden'
      )}
    >
      {/* IZQUIERDA */}
      <div role="presentation" onClick={handleClick} className="flex items-center">
        {/* Breadcrumbs – SOLO desktop */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            href="/"
          >
            <GrainIcon fontSize="inherit" />
            <span className="ml-1">MÓDULOS</span>
          </Link>
        </Breadcrumbs>

        {/* Toggle menú */}
        <div className="flex items-center ml-2">
          <NavToggle />
        </div>
      </div>

      {/* DERECHA – DESKTOP */}
      <div className="hidden sm:flex items-center gap-2">

        <Box>
          <LanguageDropdown />
        </Box>

        <Box>
          <ModeDropdown />
        </Box>

        <NotificationsDropdown notifications={notifications} />
        <UserDropdown dictionary={dictionary} />
      </div>

      {/* DERECHA – MOBILE */}
      <div className="flex sm:hidden items-center gap-2">
        <Box>
          <ModeDropdown />
        </Box>
        <UserDropdown dictionary={dictionary} />
      </div>
    </div>
  )
}

export default NavbarContent
