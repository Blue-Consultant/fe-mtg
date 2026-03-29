// Next Imports
import { cookies } from 'next/headers'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

/**
 * La sesión “real” vive en cookies httpOnly del API (accessToken / refreshToken).
 * NextAuth solo refleja datos de UI; su JWT puede caducar antes que el refresh del backend,
 * dejando Redux/header con usuario pero getServerSession vacío → falso “no logueado”.
 * Rutas públicas del shell: `utils/publicRoutes.js`.
 */
function hasBackendAuthCookie(cookieStore) {
  return Boolean(cookieStore.get('accessToken')?.value || cookieStore.get('refreshToken')?.value)
}

export default async function AuthGuard({ children, locale }) {
  const cookieStore = await cookies()
  const session = await getServerSession(authOptions)

  if (session || hasBackendAuthCookie(cookieStore)) {
    return <>{children}</>
  }

  return <AuthRedirect lang={locale} />
}
