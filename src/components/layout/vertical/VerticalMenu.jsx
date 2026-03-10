import { useParams, usePathname } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import { Box, Skeleton } from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Menu, MenuItem, SubMenu, MenuSection } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { getUserModules } from '@/views/roles-modules-submodules/api'
import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const pathname = usePathname()
  const { lang: locale } = params
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Función para obtener módulos del usuario (consolida todos sus roles)
  const fetchPermissions = useCallback(async (user_id) => {
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

  // Efecto para cargar permisos inicialmente
  useEffect(() => {
    if (!userDataReducer?.id) return

    // Usar el userId directamente del reducer o localStorage
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
  const isSubmenuActive = useCallback((submodules) => {
    if (!submodules || !pathname) return false
    return submodules.some(sub => {
      const subLink = sub.link.startsWith('/') ? sub.link : `/${sub.link}`
      const fullLink = `/${locale}${subLink}`
      if (pathname === fullLink) return true
      if (pathname.startsWith(fullLink + '/')) return true

      return false
    })
  }, [pathname, locale])

  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >

        {/* Menu módules - dinámico según permisos */}
        <MenuSection label='Menu módules'>
          {loading ? (
            // Skeleton mientras carga
            <Box sx={{ px: 2 }}>
              {[1, 2, 3, 4].map((item) => (
                <Box key={item} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Skeleton variant="circular" width={20} height={20} animation="wave" />
                    <Skeleton variant="text" width={120} height={24} animation="wave" />
                  </Box>
                  <Box sx={{ ml: 4 }}>
                    <Skeleton variant="text" width={100} height={20} sx={{ mb: 0.5 }} animation="wave" />
                    <Skeleton variant="text" width={90} height={20} animation="wave" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : permissions.length > 0 ? (
            permissions.map((module, moduleIndex) => {
              const isActive = isSubmenuActive(module.submodules)
              const isFirstModule = moduleIndex === 0
              const moduleClassName = isFirstModule ? '' : ''
              return (
                <SubMenu
                  key={module.id}
                  id={`module-${module.id}`}
                  label={locale === 'es' ? module.name : module.translate || module.name}
                  icon={module.icon ? <i className={module.icon} /> : <i className='ri-folder-line' />}
                  defaultOpen={isActive}
                  className={moduleClassName}
                >
                  {module.submodules
                    ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((submodule, submoduleIndex) => {
                      const subLink = submodule.link.startsWith('/') ? submodule.link : `/${submodule.link}`
                      const isFirstSubmodule = isFirstModule && submoduleIndex === 0
                      const submoduleClassName = isFirstSubmodule ? '' : ''
                      return (
                        <MenuItem
                          key={submodule.id}
                          href={`/${locale}${subLink}`}
                          exactMatch={true}
                          className={submoduleClassName}
                        >
                          {locale === 'es' ? submodule.name : submodule.translate || submodule.name}
                        </MenuItem>
                      )
                    })}
                </SubMenu>
              )
            })
          ) : (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <i className='ri-lock-line' style={{ fontSize: 32, opacity: 0.3 }} />
              <Box sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                No hay módulos disponibles
              </Box>
            </Box>
          )}
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
