import { redirect } from 'next/navigation'

/** Ruta legacy: el login de administración vive en /login. */
const LoginMtgLegacyPage = ({ params }) => {
  redirect(`/${params?.lang || 'es'}/login`)
}

export default LoginMtgLegacyPage
