'use client'

import { memo, useRef, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { signIn } from 'next-auth/react'
import { useDispatch } from 'react-redux'

import axios from '@/utils/axios'
import { getLocalizedUrl } from '@/utils/i18n'
import { isBranchAdminNav, isPanelOperatorNav } from '@/utils/moduleRoutes'
import { setUser } from '@/redux-store/slices/login'
import { LoginUser } from '@/views/Login/ApiLogin'

import styles from '../login-admin.module.css'

function resolveAdminHome(roles, locale) {
  if (isBranchAdminNav(roles)) return getLocalizedUrl('/administrar', locale)

  return getLocalizedUrl('/branches?tab=canchas', locale)
}

const LoginForm = ({ dictionary = {} }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const submitting = useRef(false)

  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const t = dictionary?.loginMtg || {}

  const onSubmit = async event => {
    event.preventDefault()
    if (submitting.current) return

    const nextEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) || password.length < 1) {
      setErrorMessage(t.errorInvalidCredentials || 'Revisa el correo y la contraseña.')

      return
    }

    submitting.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      const result = await LoginUser({ email: nextEmail, password })
      const msg = result?.msg
      const user = result?.user
      const permissions = result?.permissions
      const roles = result?.roles || []

      if (!user) {
        setErrorMessage(msg || t.errorInvalidCredentials || 'Credenciales inválidas')

        return
      }

      if (user.status === false) {
        setErrorMessage(msg || t.errorAccountInactive || 'Tu cuenta no está activa')

        return
      }

      if (!isPanelOperatorNav(roles)) {
        try {
          await axios.post('/user/logout', null, { _skipRetry: true })
        } catch {
          // ignore
        }

        setErrorMessage(
          'Este acceso es para propietarios y personal del local. Si eres jugador, entra desde Explorar para reservar.'
        )

        return
      }

      if (permissions) localStorage.setItem('userPermissions', JSON.stringify(permissions))
      if (roles) localStorage.setItem('userRoles', JSON.stringify(roles))

      const res = await signIn('credentials', {
        id: user.id,
        name: user.first_name,
        email: user.email,
        image: null,
        redirect: false
      })

      if (!res?.ok || res.error) {
        setErrorMessage(res?.error || t.errorUnknown || 'Error desconocido')

        return
      }

      dispatch(setUser({ user }))

      const isInternalRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
      const targetPath = isInternalRedirect ? redirectTo : resolveAdminHome(roles, locale)

      window.location.href = targetPath
    } catch (error) {
      console.error('Login admin error:', error)
      setErrorMessage(t.errorServer || 'Error del servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  return (
    <div className={styles.card}>
      <Link href={getLocalizedUrl('/explorar', locale)} className={styles.mobileBrand}>
        <span className={styles.brandMark} aria-hidden>
          <i className='ri-football-fill' />
        </span>
        MTG
      </Link>

      <span className={styles.badge}>
        <i className='ri-shield-user-line' aria-hidden />
        Panel propietarios
      </span>

      <h1 className={styles.title}>{t.title || 'Administra tu sede'}</h1>
      <p className={styles.subtitle}>
        {t.subtitle || 'Ingresa con tu cuenta de propietario u operador para gestionar canchas, horarios y reservas.'}
      </p>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label className={styles.field}>
          <span>{t.emailLabel || 'Correo electrónico'}</span>
          <input
            type='email'
            autoComplete='email'
            placeholder={t.emailPlaceholder || 'tu@local.com'}
            value={email}
            onChange={event => setEmail(event.target.value)}
            disabled={loading}
          />
        </label>

        <label className={styles.field}>
          <span>{t.passwordLabel || 'Contraseña'}</span>
          <span className={styles.secret}>
            <input
              type={visible ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='••••••••'
              value={password}
              onChange={event => setPassword(event.target.value)}
              disabled={loading}
            />
            <button
              type='button'
              aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
              onClick={() => setVisible(current => !current)}
            >
              <i className={visible ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden />
            </button>
          </span>
        </label>

        <button
          type='button'
          className={styles.forgot}
          onClick={() => router.push(getLocalizedUrl('/recovery-password', locale))}
        >
          {t.forgotPassword || '¿Olvidaste tu contraseña?'}
        </button>

        <button type='submit' className={styles.submit} disabled={loading}>
          {loading ? 'Entrando…' : t.submit || 'Entrar al panel'}
          {!loading ? <i className='ri-arrow-right-line' aria-hidden /> : null}
        </button>
      </form>

      <p className={styles.foot}>
        ¿Eres jugador? <Link href={getLocalizedUrl('/explorar', locale)}>Reserva desde Explorar</Link>
      </p>
    </div>
  )
}

export default memo(LoginForm)
