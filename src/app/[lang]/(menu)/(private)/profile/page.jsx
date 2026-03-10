// Next.js Imports
import { getDictionary } from '@/utils/getDictionary'

// View Import
import ProfileView from '@/views/profile'

export const metadata = {
  title: 'Mi Perfil - SportReserva',
  description: 'Gestiona tu perfil y configuración de cuenta'
}

const ProfilePage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <ProfileView dictionary={dictionary} lang={params.lang} />
}

export default ProfilePage
