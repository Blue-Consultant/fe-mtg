'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

import { io } from 'socket.io-client'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useDispatch, useSelector } from 'react-redux'
import { persistor } from '@/redux-store'
import { logout } from '@/redux-store/slices/login'
import { useSettings } from '@core/hooks/useSettings'
import { signOut } from 'next-auth/react'
import { getLocalizedUrl } from '@/utils/i18n'
import axios from '@/utils/axios'
// import { findLatestActiveByUser, endSession } from '@/views/analytics/api'

const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT

const getAvatarSrcValidator = (img) => {
  const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png']
  if (img?.includes('APP_MTG')) {
    return `${NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT}/${img}`
  } else if (allowedAvatars.includes(img)) {
    return `/images/avatars/${img}`
  } else if (img) {
    return img
  } else {
    return '/images/avatars/1.png'
  }
}

const UserDropdown = ({ dictionary }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const [isLoading, setIsLoading] = useState(false)

  let userData = useSelector(state => state.loginReducer.user)

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      setIsLoading(true)
      // Cerrar sesión de analytics antes del logout
      if (userData?.id) {
        try {
          // const latestSession = await findLatestActiveByUser(userData.id)
          // if (latestSession?.session_uuid) {
          //   await endSession(latestSession.session_uuid, false)
          //   console.log('[Analytics] Sesión cerrada correctamente')
          // }
        } catch (sessionError) {
          // No bloquear el logout si falla cerrar la sesión de analytics
          console.warn('[Analytics] Error al cerrar sesión de analytics:', sessionError)
          setIsLoading(false)
        }
      }

      await axios.post('/user/logout')

      dispatch(logout())

      await persistor.purge()

      await signOut({
        callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/es/login',
        redirect: true
      })
    } catch (error) {
      console.error('Error durante logout:', error)

      dispatch(logout())
      await persistor.purge()

      router.push(getLocalizedUrl('/login', locale))
    }
  }

  useEffect(() => {
    if (!userData?.id) return

    // Inicializar socket con userId para unirse a la sala correcta
    const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 20000,
      query: {
        userId: userData.id
      }
    })

    socket.on('ActionsRequest', data => {
      console.log({ data });

      // Si es un string 'logout' (compatibilidad con código anterior)
      if (data === 'logout') {
        handleUserLogout()
      }
      // Si es un objeto con action y userId
      else if (data?.action === 'logout') {
        // Si no hay userId o coincide con el usuario actual, cerrar sesión
        if (!data.userId || data.userId === userData?.id) {
          handleUserLogout()
        }
      }
    })

    return () => {
      socket.off('ActionsRequest')
      socket.disconnect()
    }
  }, [userData?.id])

  if (!userData) {
    return (
      <div className='flex items-center gap-2'>
        <Button
          component={Link}
          variant='outlined'
          size='small'
          href={getLocalizedUrl('/login', locale)}
          sx={{ textTransform: 'none' }}
        >
          {dictionary?.navigation?.login ?? 'Iniciar sesión'}
        </Button>
        <Button
          component={Link}
          variant='contained'
          size='small'
          href={getLocalizedUrl('/register', locale)}
          sx={{ textTransform: 'none' }}
        >
          {dictionary?.navigation?.register ?? 'Registrarse'}
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button className={`flex items-center gap-2`} tabIndex={-1} onClick={handleDropdownOpen} ref={anchorRef}>
        <Avatar alt='Avatar' src={getAvatarSrcValidator(userData?.avatar)} />
        <div className='hidden md:flex items-start flex-col'>
          <Typography className='font-medium' color='text.primary'>
            {userData?.first_name}
          </Typography>
          <Typography variant='caption'>{userData?.email}</Typography>
        </div>
      </Button>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex md:hidden items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt='Avatar' src={getAvatarSrcValidator(userData?.avatar)} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userData?.first_name}
                      </Typography>
                      <Typography variant='caption'>{userData?.email}</Typography>
                    </div>
                  </div>
                  <Divider className='flex md:hidden mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/user-profile')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>{dictionary?.['userdropdown']?.profile || 'Perfil'}</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>{dictionary?.['userdropdown']?.settings || 'Configuración'}</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>{dictionary?.['userdropdown']?.faq || 'FAQ'}</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                      disabled={isLoading}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {isLoading ? 'Cerrando sesión...' : dictionary?.['common']?.logout || 'Cerrar sesión'}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
