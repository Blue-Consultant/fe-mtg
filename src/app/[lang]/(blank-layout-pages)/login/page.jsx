// Acceso panel: propietarios / owner / personal del local.
// Jugadores entran desde Explorar (modal). Esta ruta no usa GuestOnlyRoute.

import LoginMtgView from '@/views/login-mtg'
import { getDictionary } from '@/utils/getDictionary'
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Acceso administración | MTG',
  description: 'Ingresa al panel de propietarios y operadores de Marca Tu Gol'
}

const LoginPage = async ({ params }) => {
  await getServerMode()
  const dictionary = await getDictionary(params?.lang)

  return <LoginMtgView dictionary={dictionary} lang={params?.lang} />
}

export default LoginPage
