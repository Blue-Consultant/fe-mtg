'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

// Hook Imports
import { usePathname } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'

import { signOut, useSession } from 'next-auth/react'

import { peekLogoutRehydrateBlock, clearLogoutRehydrateBlock } from '@/components/player-shell/logoutPlayer'
import { setUser } from '@/redux-store/slices/login'

import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

import { isBranchAdminNav, isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isGuestPromptPath, isPublicMenuShellPath } from '@/utils/publicRoutes'

const LayoutWrapper = props => {
  const { systemMode, verticalLayout, horizontalLayout } = props
  const pathname = usePathname()

  const { settings } = useSettings()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()
  const [panelNav, setPanelNav] = useState(false)

  useLayoutInit(systemMode)

  const userExist = useSelector(state => state.loginReducer.user)

  const allowWithoutUser = isPublicMenuShellPath(pathname) || isGuestPromptPath(pathname)
  const logoutPending = peekLogoutRehydrateBlock()
  const signedIn = Boolean(userExist) || (status === 'authenticated' && !logoutPending)

  // Owner, propietario y empleado: mismo shell MTG. Jugador: shell de explorar.
  useLayoutEffect(() => {
    const roles = readBusinessRolesFromStorage()

    setPanelNav(isPanelOperatorNav(roles) && !isBranchAdminNav(roles))
  }, [pathname, userExist?.id])

  useEffect(() => {
    // Tras "Cerrar sesión" del player: no rehidratar user hasta que NextAuth quede unauthenticated.
    if (peekLogoutRehydrateBlock()) {
      if (status === 'loading') return

      if (status === 'authenticated') {
        signOut({ redirect: false })

        return
      }

      clearLogoutRehydrateBlock()

      return
    }

    if (status !== 'authenticated' || !session?.user?.id || userExist?.id) return

    dispatch(
      setUser({
        user: {
          id: session.user.id,
          first_name: session.user.name || '',
          email: session.user.email || ''
        }
      })
    )
  }, [dispatch, session, status, userExist])

  if (status !== 'loading' && !signedIn && !allowWithoutUser) {
    signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/es/login', redirect: true })

    return null
  }

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {panelNav ? verticalLayout : horizontalLayout}
    </div>
  )
}

export default LayoutWrapper
