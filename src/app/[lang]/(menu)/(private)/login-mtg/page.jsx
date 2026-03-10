// Next.js Imports
import { getDictionary } from '@/utils/getDictionary'

// View Import
import LoginMtgView from '@/views/login-mtg'

export const metadata = {
  title: 'Iniciar Sesión - SportReserva',
  description: 'Ingresa a tu cuenta para reservar canchas deportivas'
}

const LoginMtgPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <LoginMtgView dictionary={dictionary} lang={params.lang} />
}

export default LoginMtgPage
