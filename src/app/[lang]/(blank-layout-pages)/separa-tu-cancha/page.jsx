import { redirect } from 'next/navigation'

/** Ruta histórica: redirige a la landing actual. */
export default function SeparaTuCanchaRedirect({ params }) {
  redirect(`/${params.lang}/marca-tu-gol`)
}
