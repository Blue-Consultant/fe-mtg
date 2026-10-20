import { redirect } from 'next/navigation'

/** Alias referencial: /login-admin → /login (mismo panel de propietarios). */
const LoginAdminAliasPage = ({ params }) => {
  redirect(`/${params?.lang || 'es'}/login`)
}

export default LoginAdminAliasPage
