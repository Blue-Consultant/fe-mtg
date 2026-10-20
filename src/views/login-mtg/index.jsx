'use client'

import { memo } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getLocalizedUrl } from '@/utils/i18n'
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

import LoginForm from './components/LoginForm'
import styles from './login-admin.module.css'

const LoginMtgView = ({ dictionary = {} }) => {
  const { lang } = useParams()
  const locale = lang || 'es'

  return (
    <div
      className={`${commonLayoutClasses.contentFullBleedRoot} ${commonLayoutClasses.contentHeightFixed} ${styles.page}`}
    >
      <aside className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href={getLocalizedUrl('/explorar', locale)} className={styles.brand}>
            <span className={styles.brandMark}>
              <i className='ri-football-fill' />
            </span>
            MTG
          </Link>

          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Acceso administración</p>
            <h2 className={styles.heroTitle}>Tu local, en un solo panel</h2>
            <p className={styles.heroLead}>
              Confirma Yapes, abre horarios y lleva el control de tus canchas con la misma experiencia visual de MTG.
            </p>
            <div className={styles.heroFacts}>
              <div className={styles.fact}>
                <i className='ri-calendar-check-line' aria-hidden />
                Reservas y validación de pagos
              </div>
              <div className={styles.fact}>
                <i className='ri-stadium-line' aria-hidden />
                Canchas, precios y bloqueos
              </div>
              <div className={styles.fact}>
                <i className='ri-team-line' aria-hidden />
                Equipo del local con roles claros
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className={styles.panel}>
        <LoginForm dictionary={dictionary} />
      </main>
    </div>
  )
}

export default memo(LoginMtgView)
