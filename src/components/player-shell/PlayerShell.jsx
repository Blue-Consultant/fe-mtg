'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'

import { notificationInfoMessage } from '@/components/ToastNotification'
import { isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isPlayerShellPath } from '@/utils/publicRoutes'
import { stripLocaleFromPath } from '@/utils/routePaths'
import styles from '@/views/explorar/player-board.module.css'

import LoginModal from './LoginModal'
import { consumeLogoutNotice, logoutPlayer } from './logoutPlayer'
import { usePlayerMenu } from './usePlayerMenu'

const NAV = [
  { id: 'inicio', href: '/explorar', icon: 'ri-home-5-line', label: 'Inicio' },
  { id: 'reservar', href: '/explorar/reservar', icon: 'ri-calendar-check-line', label: 'Reservar' },
  { id: 'reservas', href: '/mis-reservas', icon: 'ri-file-list-3-line', label: 'Mis reservas', private: true },
  { id: 'perfil', href: '/profile', icon: 'ri-user-3-line', label: 'Perfil', private: true }
]

const activeId = pathname => {
  const path = stripLocaleFromPath(pathname)

  if (path.startsWith('/mis-reservas')) return 'reservas'
  if (path.startsWith('/profile')) return 'perfil'
  if (path === '/explorar') return 'inicio'
  if (path.startsWith('/explorar/reservar')) return 'reservar'

  return ''
}

export default function PlayerShell({ children }) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const { lang } = useParams()
  const [loginFor, setLoginFor] = useState(null)
  const { menuOpen, isMobile, openMenu, closeMenu } = usePlayerMenu(pathname)
  const { status } = useSession()
  const dispatch = useDispatch()
  const user = useSelector(state => state.loginReducer.user)
  const [staff, setStaff] = useState(false)
  const locale = lang || 'es'
  const current = activeId(pathname)
  const loggedIn = status === 'authenticated' || Boolean(user?.id)
  const prompt = current === 'perfil' ? 'perfil' : current === 'reservas' ? 'reservas' : pathname.includes('/mis-favoritos') ? 'favoritos' : null
  const guestGate = !loggedIn && status !== 'loading' && Boolean(prompt)

  useEffect(() => {
    setStaff(isPanelOperatorNav(readBusinessRolesFromStorage()))
  }, [pathname])

  useEffect(() => {
    if (!consumeLogoutNotice()) return
    notificationInfoMessage('Cerraste tu sesión. Vuelve pronto.')
  }, [])

  useEffect(() => {
    if (!guestGate) return
    setLoginFor(prompt)
  }, [guestGate, prompt])

  if (staff || !isPlayerShellPath(pathname)) return children

  const hrefFor = item => `/${locale}${item.href}`

  const closeLogin = () => {
    if (guestGate) router.push(`/${locale}/explorar`)
    setLoginFor(null)
  }

  const finishLogin = () => {
    const next =
      loginFor === 'perfil' ? `/${locale}/profile` : loginFor === 'favoritos' ? `/${locale}/mis-favoritos` : `/${locale}/mis-reservas`

    window.location.assign(next)
  }

  return (
    <div className={`${styles.shell} ts-content-full-bleed-root player-board-shell`}>
      <header className={styles.topbar}>
        <button type='button' className={styles.menuButton} aria-label='Abrir menú' aria-expanded={menuOpen} onClick={openMenu}>
          <i className='ri-menu-line' aria-hidden />
        </button>
        <span className={styles.topbarBrand}>MTG</span>
      </header>
      {menuOpen ? <button type='button' className={styles.backdrop} aria-label='Cerrar menú' onClick={closeMenu} /> : null}
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`} aria-hidden={isMobile && !menuOpen} inert={isMobile && !menuOpen}>
        <button type='button' className={styles.drawerClose} aria-label='Cerrar menú' onClick={closeMenu}>
          <i className='ri-close-line' aria-hidden />
        </button>
        <Link href={`/${locale}/explorar`} className={styles.brand} onClick={closeMenu}>
          <span className={styles.brandMark} aria-hidden>
            <i className='ri-football-fill' />
          </span>
          MTG
        </Link>
        <nav className={styles.nav} aria-label='Jugador'>
          {NAV.map(item =>
            item.private && !loggedIn && status !== 'loading' ? (
              <button
                key={item.id}
                type='button'
                className={`${styles.navItem} ${styles.navButton} ${current === item.id ? styles.navActive : ''}`}
                onClick={() => {
                  closeMenu()
                  setLoginFor(item.id === 'perfil' ? 'perfil' : 'reservas')
                }}
              >
                <i className={item.icon} aria-hidden />
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                href={hrefFor(item)}
                className={`${styles.navItem} ${current === item.id ? styles.navActive : ''}`}
                aria-current={current === item.id ? 'page' : undefined}
                onClick={closeMenu}
              >
                <i className={item.icon} aria-hidden />
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className={styles.sidebarFoot}>
          <p className={styles.tagline}>
            Juega, comparte,
            <br />
            disfruta el deporte
          </p>
          {loggedIn ? (
            <button type='button' className={styles.logout} onClick={() => logoutPlayer(dispatch, `/${locale}/explorar`)}>
              <i className='ri-logout-box-r-line' aria-hidden />
              Cerrar sesión
            </button>
          ) : null}
        </div>
      </aside>
      <div className={styles.main}>{children}</div>
      <LoginModal
        open={Boolean(loginFor)}
        title={
          loginFor === 'perfil' ? 'Entra para ver tu perfil' : loginFor === 'favoritos' ? 'Entra para ver tus favoritos' : 'Entra para ver tus reservas'
        }
        onClose={closeLogin}
        onSuccess={finishLogin}
      />
    </div>
  )
}
