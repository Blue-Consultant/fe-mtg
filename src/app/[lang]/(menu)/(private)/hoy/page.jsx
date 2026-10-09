import { redirect } from 'next/navigation'

const HoyRedirectPage = ({ params }) => {
  redirect(`/${params.lang || 'es'}/owner-reservations`)
}

export default HoyRedirectPage