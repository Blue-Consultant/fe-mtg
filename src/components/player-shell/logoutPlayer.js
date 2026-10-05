import { signOut } from 'next-auth/react'

import { persistor } from '@/redux-store'
import { logout } from '@/redux-store/slices/login'

const LOGOUT_NOTICE = 'player-logout-notice'

export function consumeLogoutNotice() {
  if (sessionStorage.getItem(LOGOUT_NOTICE) !== '1') return false
  sessionStorage.removeItem(LOGOUT_NOTICE)

  return true
}

export async function logoutPlayer(dispatch, href) {
  dispatch(logout())
  localStorage.removeItem('userPermissions')
  localStorage.removeItem('userRoles')
  sessionStorage.setItem(LOGOUT_NOTICE, '1')
  await persistor.purge()
  await signOut({ redirect: false })
  window.location.assign(href)
}
