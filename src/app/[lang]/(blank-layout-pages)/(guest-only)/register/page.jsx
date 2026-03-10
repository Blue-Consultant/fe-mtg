// Component Imports
// import Register from '@/views/Register/Register'
import RegisterMtgView from '@/views/register-mtg'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Utils Imports
import { getDictionary } from "@/utils/getDictionary"

export const metadata = {
  title: 'Register',
  description: 'Register to your account'
}

const RegisterPage = async ({ params: { lang } }) => {
  // Vars
  const mode = await getServerMode()
  const dictionary = await getDictionary(lang)
  return <RegisterMtgView mode={mode} dictionary={dictionary} />
}

export default RegisterPage
