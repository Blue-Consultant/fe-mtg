// Login y register viven fuera de (guest-only): con sesión NextAuth, GuestOnlyRoute redirige a home (marca-tu-gol).
// Estas rutas deben ser siempre accesibles (registro, cambiar cuenta, sesión residual).

// Component Imports
import LoginMtgView from '@/views/login-mtg'
import { getDictionary } from '@/utils/getDictionary'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async ({ params }) => {
  const mode = await getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <LoginMtgView dictionary={dictionary} lang={params?.lang} mode={mode} />
}

export default LoginPage
