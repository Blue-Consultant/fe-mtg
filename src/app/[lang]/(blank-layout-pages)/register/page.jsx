// Registro fuera de (guest-only): misma razón que /login — GuestOnlyRoute redirigía al home si había sesión NextAuth.

// Component Imports
import RegisterMtgView from '@/views/register-mtg'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Utils Imports
import { getDictionary } from '@/utils/getDictionary'

export const metadata = {
  title: 'Register',
  description: 'Register to your account'
}

const RegisterPage = async ({ params: { lang } }) => {
  const mode = await getServerMode()
  const dictionary = await getDictionary(lang)

  return <RegisterMtgView mode={mode} dictionary={dictionary} />
}

export default RegisterPage
