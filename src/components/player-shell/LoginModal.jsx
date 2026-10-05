'use client'

import { useEffect, useState } from 'react'

import BrandModal from '@/components/brand-modal/BrandModal'
import {
  accountExistsByDocument,
  accountExistsByEmail,
  loginAndStartSession,
  registerAndStartSession
} from '@/views/explorar/booking-chat/booking-account'

import styles from './login-modal.module.css'

const emptyAccount = {
  name: '',
  email: '',
  password: '',
  confirm: '',
  dni: '',
  phone: ''
}

function SecretField({ label, value, autoComplete, disabled, onChange }) {
  const [visible, setVisible] = useState(false)

  return (
    <label className={styles.field}>
      <span>{label}</span>
      <span className={styles.secret}>
        <input type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} disabled={disabled} onChange={onChange} />
        <button type='button' aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'} onClick={() => setVisible(current => !current)}>
          <i className={visible ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden />
        </button>
      </span>
    </label>
  )
}

export default function LoginModal({ open, title, onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [account, setAccount] = useState(emptyAccount)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) return
    setMode('login')
    setError('')
    setBusy(false)
  }, [open])

  const patch = (key, value) => setAccount(current => ({ ...current, [key]: value }))

  const submitLogin = async event => {
    event.preventDefault()
    if (busy) return

    const nextEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail) || password.length < 8) {
      setError('Revisa el correo y la contraseña.')

      return
    }

    setBusy(true)
    setError('')

    try {
      const session = await loginAndStartSession(nextEmail, password)

      if (!session.ok) {
        setError('Correo o contraseña incorrectos.')

        return
      }

      onSuccess()
    } finally {
      setBusy(false)
    }
  }

  const submitRegister = async event => {
    event.preventDefault()
    if (busy) return

    const profile = {
      name: account.name.trim(),
      email: account.email.trim().toLowerCase(),
      password: account.password,
      dni: account.dni.replace(/\D/g, ''),
      phone: account.phone.replace(/\D/g, '')
    }

    if (profile.name.length < 3) {
      setError('Escribe tu nombre.')

      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setError('Ese correo no es válido.')

      return
    }

    if (profile.password.length < 8) {
      setError('Mínimo 8 caracteres.')

      return
    }

    if (profile.password !== account.confirm) {
      setError('Las contraseñas no coinciden.')

      return
    }

    if (!/^\d{8}$/.test(profile.dni)) {
      setError('El DNI tiene 8 números.')

      return
    }

    if (!/^9\d{8}$/.test(profile.phone)) {
      setError('Escribe los 9 dígitos del celular.')

      return
    }

    setBusy(true)
    setError('')

    try {
      if (await accountExistsByEmail(profile.email)) {
        setError('Ese correo ya tiene cuenta.')

        return
      }

      if (await accountExistsByDocument(profile.dni)) {
        setError('Ese DNI ya está registrado.')

        return
      }

      const session = await registerAndStartSession(profile)

      if (!session.ok) {
        setError(session.message || 'No pudimos crear la cuenta.')

        return
      }

      onSuccess()
    } finally {
      setBusy(false)
    }
  }

  const switchMode = next => {
    setError('')
    setMode(next)
  }

  return (
    <BrandModal open={open} onClose={onClose} kicker='Cuenta' title={mode === 'login' ? title : 'Crea tu cuenta'} maxWidth='sm'>
      {mode === 'login' ? (
        <form className={styles.form} onSubmit={submitLogin}>
          <p className={styles.lead}>Usa el correo y la contraseña de tu cuenta.</p>
          <label className={styles.field}>
            <span>Correo</span>
            <input type='email' autoComplete='email' value={email} disabled={busy} onChange={event => setEmail(event.target.value)} />
          </label>
          <SecretField
            label='Contraseña'
            autoComplete='current-password'
            value={password}
            disabled={busy}
            onChange={event => setPassword(event.target.value)}
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.submit} type='submit' disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <button className={styles.switch} type='button' onClick={() => switchMode('register')}>
            Crear cuenta
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={submitRegister}>
          <p className={styles.lead}>Así luego entras y ves tus reservas.</p>
          <label className={styles.field}>
            <span>Nombre</span>
            <input autoComplete='name' value={account.name} disabled={busy} onChange={event => patch('name', event.target.value)} />
          </label>
          <label className={styles.field}>
            <span>Correo</span>
            <input
              type='email'
              autoComplete='email'
              value={account.email}
              disabled={busy}
              onChange={event => patch('email', event.target.value)}
            />
          </label>
          <div className={styles.row}>
            <SecretField
              label='Contraseña'
              autoComplete='new-password'
              value={account.password}
              disabled={busy}
              onChange={event => patch('password', event.target.value)}
            />
            <SecretField
              label='Confirmar'
              autoComplete='new-password'
              value={account.confirm}
              disabled={busy}
              onChange={event => patch('confirm', event.target.value)}
            />
          </div>
          <label className={styles.field}>
            <span>DNI</span>
            <input
              inputMode='numeric'
              autoComplete='off'
              placeholder='8 números'
              value={account.dni}
              disabled={busy}
              onChange={event => patch('dni', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Celular</span>
            <span className={styles.phone}>
              <span className={styles.prefix}>+51</span>
              <input
                inputMode='tel'
                autoComplete='tel'
                placeholder='987 654 321'
                value={account.phone}
                disabled={busy}
                onChange={event => patch('phone', event.target.value)}
              />
            </span>
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.submit} type='submit' disabled={busy}>
            {busy ? 'Creando…' : 'Crear cuenta'}
          </button>
          <button className={styles.switch} type='button' onClick={() => switchMode('login')}>
            Ya tengo cuenta
          </button>
        </form>
      )}
    </BrandModal>
  )
}
