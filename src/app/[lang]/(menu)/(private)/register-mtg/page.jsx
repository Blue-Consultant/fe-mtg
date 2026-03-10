// Next.js Imports
import { getDictionary } from '@/utils/getDictionary'

// View Import
import RegisterMtgView from '@/views/register-mtg'

export const metadata = {
  title: 'Crear Cuenta - SportReserva',
  description: 'Únete a la comunidad más grande de deportistas y reserva canchas'
}

const RegisterMtgPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <RegisterMtgView dictionary={dictionary} lang={params.lang} />
}

export default RegisterMtgPage
