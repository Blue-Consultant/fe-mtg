// Next.js Imports
import { getDictionary } from '@/utils/getDictionary'

// View Import
import PaymentSuccessView from '@/views/payment-success'

export const metadata = {
  title: 'Pago Exitoso - SportReserva',
  description: 'Tu reserva ha sido confirmada exitosamente'
}

const PaymentSuccessPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <PaymentSuccessView dictionary={dictionary} lang={params.lang} />
}

export default PaymentSuccessPage
