// React Imports
import { useEffect, useState, useCallback, useRef } from 'react'

import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme, styled } from '@mui/material/styles'
import { Box, Skeleton, IconButton } from '@mui/material'

// Redux Imports
import { useSelector } from 'react-redux'

// Component Imports
import HorizontalNav, { Menu, MenuItem, SubMenu } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// API Imports
import { getUserModules } from '@/views/roles-modules-submodules/api'

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  minHeight: '100%',
  overflow: 'visible'
}))

const MenuWrapper = styled(Box)({
  flex: 1,
  overflowX: 'auto',
  overflowY: 'hidden',
  position: 'relative',
  width: '100%',
  scrollbarWidth: 'none',
  scrollbarColor: 'transparent transparent',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  '& ul': {
    maxWidth: 'none !important',
    width: 'max-content !important',
    paddingLeft: '0 !important',
    paddingRight: '0 !important'
  }
})

const NavButton = styled(IconButton)({
  position: 'absolute',
  zIndex: 10000,
  width: '32px',
  height: '32px',
  padding: 0,
  borderRadius: '50%',
  backgroundColor: 'var(--mui-palette-primary-main) !important',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  top: '50%',
  transform: 'translateY(-50%)',
  transition: 'all 0.2s ease',
  pointerEvents: 'auto !important',
  display: 'flex !important',
  visibility: 'visible !important',
  opacity: '1 !important',
  '& i': {
    fontSize: '16px',
    color: '#fff'
  },
  '&:hover': {
    backgroundColor: 'var(--mui-palette-primary-dark) !important',
    boxShadow: '0 4px 12px rgba(19, 178, 54, 0.35)',
    '& i': {
      color: '#fff'
    }
  },
  '&.nav-left': {
    left: '-12px'
  },
  '&.nav-right': {
    right: '-12px'
  }
})

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

// Menú para usuarios no logueados (solo navegación; Iniciar sesión/Registrarse van en la derecha)
const GUEST_MENU_ITEMS = [
  { labelKey: 'home', href: '/separa-tu-cancha', icon: 'ri-home-smile-line' },
  { labelKey: 'explorar', href: '/explorar', icon: 'ri-search-line' }
]

const HorizontalMenu = ({ dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()
  const params = useParams()
  const pathname = usePathname()
  const { lang: locale } = params
  const userDataReducer = useSelector(state => state.loginReducer.user)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const isGuest = !userDataReducer?.id
  const menuRef = useRef(null)
  const menuUlRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions

  // Función para obtener módulos del usuario (consolida todos sus roles)
  const fetchPermissions = useCallback(async user_id => {
    if (!user_id) return

    setLoading(true)

    try {
      const response = await getUserModules(user_id)

      setPermissions(response?.modules || [])
    } catch (error) {
      console.error('Error al obtener módulos del usuario:', error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Efecto para cargar permisos cuando el usuario está logueado; invitados no cargan módulos
  useEffect(() => {
    if (!userDataReducer?.id) {
      setLoading(false)

      return
    }

    let userId = userDataReducer.id

    try {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)

        userId = parsedUser.id || parsedUser.user_id || userDataReducer.id
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
    }

    if (userId) {
      fetchPermissions(userId)
    }
  }, [userDataReducer?.id, fetchPermissions])

  // Función para verificar si un submódulo está activo
  const isSubmenuActive = useCallback(
    submodules => {
      if (!submodules || !pathname) return false

      return submodules.some(sub => {
        const subLink = sub.link.startsWith('/') ? sub.link : `/${sub.link}`
        const fullLink = `/${locale}${subLink}`

        if (pathname === fullLink) return true
        if (pathname.startsWith(fullLink + '/')) return true

        return false
      })
    },
    [pathname, locale]
  )

  // Función para verificar el estado del scroll
  const checkScroll = useCallback(() => {
    // El scroll está en el MenuWrapper (menuRef.current), no en el ul
    const scrollContainer = menuRef.current

    if (!scrollContainer) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
    const hasScroll = scrollWidth > clientWidth
    const maxScroll = scrollWidth - clientWidth

    // Botón izquierdo: visible si hay scroll y no está al inicio
    setCanScrollLeft(hasScroll && scrollLeft > 5)

    // Botón derecho: visible si hay scroll y no está al final
    setCanScrollRight(hasScroll && scrollLeft < maxScroll - 5)
  }, [])

  // Efecto para configurar los listeners del scroll
  useEffect(() => {
    let cleanup = null

    const setupScroll = () => {
      // El scroll está en el MenuWrapper (menuRef.current)
      const scrollContainer = menuRef.current

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', checkScroll)
        window.addEventListener('resize', checkScroll)
        const observer = new MutationObserver(checkScroll)

        observer.observe(scrollContainer, { childList: true, subtree: true })

        checkScroll()

        cleanup = () => {
          scrollContainer.removeEventListener('scroll', checkScroll)
          window.removeEventListener('resize', checkScroll)
          observer.disconnect()
        }
      }
    }

    // Delay para asegurar que el DOM esté renderizado
    const timer = setTimeout(setupScroll, 200)

    return () => {
      clearTimeout(timer)
      if (cleanup) cleanup()
    }
  }, [permissions, loading, checkScroll])

  // Función para navegar (slider) - desplaza el menú horizontal
  const scrollMenu = direction => {
    // El scroll debe hacerse en el MenuWrapper (menuRef.current), no en el ul
    const scrollContainer = menuRef.current

    if (!scrollContainer) {
      console.error('❌ No se encontró el contenedor del menú (MenuWrapper)')

      return
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer

    console.log('📊 Estado del scroll:', {
      scrollLeft,
      scrollWidth,
      clientWidth,
      direction,
      canScroll: scrollWidth > clientWidth
    })

    // Si no hay scroll disponible, no hacer nada
    if (scrollWidth <= clientWidth) {
      console.warn('⚠️ No hay contenido para desplazar')

      return
    }

    // Calcular cuánto desplazar (desplazar aproximadamente 3-4 items)
    const scrollAmount = 300 // Píxeles fijos para desplazar

    if (direction === 'right') {
      const maxScroll = scrollWidth - clientWidth
      const newScrollLeft = Math.min(scrollLeft + scrollAmount, maxScroll)

      console.log('➡️ Desplazando a la derecha:', { scrollLeft, newScrollLeft, maxScroll })

      scrollContainer.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    } else {
      const newScrollLeft = Math.max(scrollLeft - scrollAmount, 0)

      console.log('⬅️ Desplazando a la izquierda:', { scrollLeft, newScrollLeft })

      scrollContainer.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }

    // Actualizar el estado después del scroll
    setTimeout(() => {
      checkScroll()
      console.log('✅ Scroll completado')
    }, 400)
  }

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-default)'
      }}
    >
      <SliderContainer>
        {canScrollLeft && (
          <NavButton className='nav-left' onClick={() => scrollMenu('left')} size='small' title='Anterior'>
            <i className='ri-arrow-left-s-line' />
          </NavButton>
        )}
        <MenuWrapper ref={menuRef}>
          <Menu
            rootStyles={menuRootStyles(theme)}
            renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
            renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
            menuItemStyles={menuItemStyles(theme, 'ri-circle-line')}
            popoutMenuOffset={{
              mainAxis: ({ level }) => (level && level > 0 ? 4 : 16),
              alignmentAxis: 0
            }}
            verticalMenuProps={{
              menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
              renderExpandIcon: ({ open }) => (
                <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
              ),
              renderExpandedMenuItemIcon: { icon: <i className='ri-circle-line' /> },
              menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
            }}
          >
            {isGuest ? (
              GUEST_MENU_ITEMS.map(item => (
                <MenuItem key={item.href} href={`/${locale}${item.href}`} icon={<i className={item.icon} />}>
                  {dictionary?.navigation?.[item.labelKey] ?? (item.labelKey === 'home' ? 'Inicio' : 'Explorar')}
                </MenuItem>
              ))
            ) : (
              <>
                <MenuItem href={`/${locale}/home`} icon={<i className='ri-home-smile-line' />}>
                  {dictionary?.['navigation']?.home || 'Inicio'}
                </MenuItem>
                {loading ? (
                  <>
                    {/* Skeleton mientras carga */}
                    <Box sx={{ px: 2, display: 'flex', gap: 2 }}>
                      {[1, 2, 3].map(item => (
                        <Skeleton key={item} variant='text' width={100} height={24} animation='wave' />
                      ))}
                    </Box>
                  </>
                ) : permissions.length > 0 ? (
                  permissions.map(module => {
                    const isActive = isSubmenuActive(module.submodules)

                    return (
                      <SubMenu
                        key={module.id}
                        id={`module-${module.id}`}
                        label={locale === 'es' ? module.name : module.translate || module.name}
                        icon={module.icon ? <i className={module.icon} /> : <i className='ri-folder-line' />}
                      >
                        {module.submodules
                          ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map(submodule => {
                            const subLink = submodule.link.startsWith('/') ? submodule.link : `/${submodule.link}`

                            return (
                              <MenuItem key={submodule.id} href={`/${locale}${subLink}`} exactMatch={true}>
                                {locale === 'es' ? submodule.name : submodule.translate || submodule.name}
                              </MenuItem>
                            )
                          })}
                      </SubMenu>
                    )
                  })
                ) : null}
              </>
            )}
          </Menu>
        </MenuWrapper>
        {canScrollRight && (
          <NavButton className='nav-right' onClick={() => scrollMenu('right')} size='small' title='Siguiente'>
            <i className='ri-arrow-right-s-line' />
          </NavButton>
        )}
      </SliderContainer>
    </HorizontalNav>
  )
}

export default HorizontalMenu
