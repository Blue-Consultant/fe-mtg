// Next.js Imports
import { getDictionary } from '@/utils/getDictionary'

// View Import
import RecoveryPasswordView from '@/views/recovery-password'

export const metadata = {
  title: 'Recuperar Contraseña - SportReserva',
  description: 'Restablece tu contraseña para acceder a tu cuenta'
}

const RecoveryPasswordPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <RecoveryPasswordView dictionary={dictionary} lang={params.lang} />
}

export default RecoveryPasswordPage
