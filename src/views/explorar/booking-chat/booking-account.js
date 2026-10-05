import { signIn } from 'next-auth/react'

import { store } from '@/redux-store'
import { setUser } from '@/redux-store/slices/login'
import { LoginUser } from '@/views/Login/ApiLogin'
import { singUpAddUser, verifyUserByEmailOrDni } from '@/views/Register/ApiRegister'

const lookupUser = async query => {
  const response = await verifyUserByEmailOrDni({ ...query, status: true })
  const body = response?.data ?? response

  return body?.userData || null
}

export async function accountExistsByEmail(email) {
  const user = await lookupUser({ email })

  return Boolean(user?.id || user?.email)
}

export async function accountExistsByDocument(dni) {
  const user = await lookupUser({ dni })

  return Boolean(user?.id || user?.dni)
}

const openSession = async user => {
  if (typeof window !== 'undefined') {
    if (user.permissions) window.localStorage.setItem('userPermissions', JSON.stringify(user.permissions))
    if (user.roles) window.localStorage.setItem('userRoles', JSON.stringify(user.roles))
  }

  const session = await signIn('credentials', {
    id: String(user.id),
    name: user.first_name || user.name || '',
    email: user.email,
    image: null,
    redirect: false
  })

  const opened = Boolean(session?.ok && !session.error)

  if (opened) store.dispatch(setUser({ user }))

  return opened
}

export async function loginAndStartSession(email, password) {
  const result = await LoginUser({ email, password })

  if (!result?.user) {
    return { ok: false, reason: 'credentials' }
  }

  const ok = await openSession({ ...result.user, permissions: result.permissions, roles: result.roles })

  if (!ok) {
    return { ok: false, reason: 'session' }
  }

  return {
    ok: true,
    name: result.user.first_name || ''
  }
}

export async function registerAndStartSession(profile) {
  const [firstName, ...rest] = profile.name.trim().split(/\s+/)

  const response = await singUpAddUser({
    first_name: firstName,
    last_name: rest.join(' '),
    email: profile.email,
    password: profile.password,
    phone_number: `+51${profile.phone}`,
    dni: profile.dni,
    user_type: 'client'
  })

  if (!response || response.status >= 400 || !response.data) {
    return { ok: false, message: response?.message || 'No pudimos crear la cuenta.' }
  }

  return loginAndStartSession(profile.email, profile.password)
}
