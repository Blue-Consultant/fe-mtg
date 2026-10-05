'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useSelector } from 'react-redux'

import styles from './profile.module.css'

const displayName = user => {
  const full = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()

  return full || user?.name || 'Tu cuenta'
}

const initials = name =>
  name
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'MT'

const ProfileView = () => {
  const { lang } = useParams()
  const locale = lang || 'es'
  const user = useSelector(state => state.loginReducer.user)
  const name = displayName(user)

  if (!user?.id) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Mi perfil</h1>
        <p className={styles.lead}>Entra para ver tus datos.</p>
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Mi perfil</h1>
      <p className={styles.lead}>Estos son los datos de tu cuenta.</p>
      <article className={styles.card}>
        <div className={styles.avatar} aria-hidden>
          {initials(name)}
        </div>
        <div>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.email}>{user.email || 'Sin correo'}</p>
        </div>
      </article>
      <div className={styles.facts}>
        <p className={styles.fact}>
          <span>Celular</span>
          <strong>{user.phone_number || 'Sin registrar'}</strong>
        </p>
        <p className={styles.fact}>
          <span>DNI</span>
          <strong>{user.dni || 'Sin registrar'}</strong>
        </p>
      </div>
      <div className={styles.links}>
        <Link className={styles.link} href={`/${locale}/mis-reservas`}>
          <i className='ri-file-list-3-line' aria-hidden />
          Mis reservas
        </Link>
        <Link className={styles.link} href={`/${locale}/mis-favoritos`}>
          <i className='ri-heart-line' aria-hidden />
          Favoritos
        </Link>
      </div>
    </section>
  )
}

export default ProfileView
