import { signOut } from 'next-auth/react'

import axios from '@/utils/axios'
import { persistor } from '@/redux-store'
import { logout } from '@/redux-store/slices/login'

const LOGOUT_NOTICE = 'player-logout-notice'
const LOGOUT_BLOCK_REHYDRATE = 'player-logout-block'

export function consumeLogoutNotice() {
  if (sessionStorage.getItem(LOGOUT_NOTICE) !== '1') return false
  sessionStorage.removeItem(LOGOUT_NOTICE)

  return true
}

/** True mientras dura el ciclo post-logout (antes de que NextAuth deje de estar en loading). */
export function peekLogoutRehydrateBlock() {
  if (typeof window === 'undefined') return false

  return sessionStorage.getItem(LOGOUT_BLOCK_REHYDRATE) === '1'
}

export function clearLogoutRehydrateBlock() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(LOGOUT_BLOCK_REHYDRATE)
}

export async function logoutPlayer(dispatch, href) {
  sessionStorage.setItem(LOGOUT_NOTICE, '1')
  sessionStorage.setItem(LOGOUT_BLOCK_REHYDRATE, '1')

  try {
    // Invalida access/refresh tokens en cookies httpOnly del API
    await axios.post('/user/logout', null, { _skipRetry: true })
  } catch (error) {
    console.warn('Error al cerrar sesión en el servidor:', error)
  }

  dispatch(logout())
  localStorage.removeItem('userPermissions')
  localStorage.removeItem('userRoles')
  localStorage.removeItem('persist:login')
  localStorage.removeItem('persist:root')

  try {
    await persistor.purge()
  } catch (error) {
    console.warn('Error al purgar persistencia:', error)
  }

  await signOut({ redirect: false })
  window.location.assign(href)
}
