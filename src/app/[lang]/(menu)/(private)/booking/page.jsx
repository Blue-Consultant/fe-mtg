import { redirect } from 'next/navigation'

/**
 * La confirmación con mock (Juan Pérez, etc.) ya no se usa.
 * El flujo real pasa por Mercado Pago desde el detalle de cancha.
 * "Mis reservas" del menú debe listar las reservas del usuario → /mis-reservas.
 */
export default function BookingPage({ params }) {
  redirect(`/${params.lang}/mis-reservas`)
}
