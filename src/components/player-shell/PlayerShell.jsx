'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'

import { notificationInfoMessage } from '@/components/ToastNotification'
import { isBranchAdminNav, isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isPlayerShellPath } from '@/utils/publicRoutes'
import { stripLocaleFromPath } from '@/utils/routePaths'
import styles from '@/views/explorar/player-board.module.css'

import LoginModal from './LoginModal'
import { consumeLogoutNotice, logoutPlayer } from './logoutPlayer'
import { orderBranchAdminNav, useBranchAdminNav } from './useBranchAdminNav'
import { usePlayerMenu } from './usePlayerMenu'
import { usePlayerNotices } from './usePlayerNotices'
import { useVenueAlerts } from './useVenueAlerts'
import { VenueAlertButton, VenueAlertPanel } from './VenueAlerts'

const NAV = [
  { id: 'inicio', href: '/explorar', icon: 'ri-home-5-line', label: 'Inicio' },
  { id: 'reservar', href: '/explorar/reservar', icon: 'ri-calendar-check-line', label: 'Reservar' },
  { id: 'reservas', href: '/mis-reservas', icon: 'ri-file-list-3-line', label: 'Mis reservas', private: true },
  { id: 'perfil', href: '/profile', icon: 'ri-user-3-line', label: 'Perfil', private: true }
]

const activeHref = (pathname, items) => {
  const path = stripLocaleFromPath(pathname)
  const probe = path.startsWith('/courts') ? '/branches' : path
  const ranked = [...items].sort((a, b) => b.href.length - a.href.length)
  const match = ranked.find(item => probe === item.href || probe.startsWith(`${item.href}/`))

  return match?.href || ''
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
  const [branchAdmin, setBranchAdmin] = useState(false)
  const adminLinks = useBranchAdminNav(branchAdmin)
  const alerts = useVenueAlerts(branchAdmin)
  const locale = lang || 'es'
  const loggedIn = status === 'authenticated' || Boolean(user?.id)

  usePlayerNotices(loggedIn && !branchAdmin)
  const navItems = branchAdmin
    ? orderBranchAdminNav([
        { href: '/administrar', icon: 'ri-calendar-schedule-line', label: 'Horario' },
        { href: '/explorar', icon: 'ri-basketball-line', label: 'Canchas' },
        ...adminLinks,
        { href: '/profile', icon: 'ri-user-3-line', label: 'Perfil' }
      ])
    : NAV
  const currentHref = activeHref(pathname, navItems)

  const prompt =
    currentHref === '/profile'
      ? 'perfil'
      : currentHref === '/mis-reservas'
        ? 'reservas'
        : pathname.includes('/mis-favoritos')
          ? 'favoritos'
          : null

  const guestGate = !loggedIn && status !== 'loading' && Boolean(prompt)

  useLayoutEffect(() => {
    const roles = readBusinessRolesFromStorage()

    setStaff(isPanelOperatorNav(roles))
    setBranchAdmin(isBranchAdminNav(roles))
  }, [pathname, user?.id])

  useEffect(() => {
    if (!consumeLogoutNotice()) return
    notificationInfoMessage('Cerraste tu sesión. Vuelve pronto.')
  }, [])

  useEffect(() => {
    if (!guestGate) return
    setLoginFor(prompt)
  }, [guestGate, prompt])

  if (!branchAdmin && (staff || !isPlayerShellPath(pathname))) return children

  const hrefFor = item => `/${locale}${item.href}`

  const closeLogin = () => {
    if (guestGate) router.push(`/${locale}/explorar`)
    setLoginFor(null)
  }

  const finishLogin = () => {
    const next =
      loginFor === 'perfil'
        ? `/${locale}/profile`
        : loginFor === 'favoritos'
          ? `/${locale}/mis-favoritos`
          : `/${locale}/mis-reservas`

    window.location.assign(next)
  }

  return (
    <div className={`${styles.shell} ts-content-full-bleed-root player-board-shell`}>
      <header className={styles.topbar}>
        <button
          type='button'
          className={styles.menuButton}
          aria-label='Abrir menú'
          aria-expanded={menuOpen}
          onClick={openMenu}
        >
          <i className='ri-menu-line' aria-hidden />
        </button>
        <span className={styles.topbarBrand}>MTG</span>
        {branchAdmin ? <VenueAlertButton alerts={alerts} className={styles.topAlert} /> : null}
      </header>
      {menuOpen ? (
        <button type='button' className={styles.backdrop} aria-label='Cerrar menú' onClick={closeMenu} />
      ) : null}
      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        aria-hidden={isMobile && !menuOpen ? true : undefined}
        inert={isMobile && !menuOpen ? '' : undefined}
      >
        <button type='button' className={styles.drawerClose} aria-label='Cerrar menú' onClick={closeMenu}>
          <i className='ri-close-line' aria-hidden />
        </button>
        <div className={styles.brandRow}>
          <Link href={`/${locale}/explorar`} className={styles.brand} onClick={closeMenu}>
            <span className={styles.brandMark} aria-hidden>
              <i className='ri-football-fill' />
            </span>
            MTG
          </Link>
          {branchAdmin ? <VenueAlertButton alerts={alerts} className={styles.alertButton} /> : null}
        </div>
        <nav className={styles.nav} aria-label={branchAdmin ? 'Administración' : 'Jugador'}>
          {navItems.map(item =>
            item.private && !loggedIn && status !== 'loading' ? (
              <button
                key={item.href}
                type='button'
                className={`${styles.navItem} ${styles.navButton} ${currentHref === item.href ? styles.navActive : ''}`}
                onClick={() => {
                  closeMenu()
                  setLoginFor(item.href === '/profile' ? 'perfil' : 'reservas')
                }}
              >
                <i className={item.icon} aria-hidden />
                {item.label}
              </button>
            ) : (
              <Link
                key={item.href}
                href={hrefFor(item)}
                className={`${styles.navItem} ${currentHref === item.href ? styles.navActive : ''}`}
                aria-current={currentHref === item.href ? 'page' : undefined}
                onClick={closeMenu}
              >
                <i className={item.icon} aria-hidden />
                {item.label}
                {item.href === '/owner-reservations' && alerts.unread > 0 ? (
                  <span className={styles.navBadge}>{alerts.unread}</span>
                ) : null}
              </Link>
            )
          )}
        </nav>
        <div className={styles.sidebarFoot}>
          {branchAdmin ? null : (
            <p className={styles.tagline}>
              Juega, comparte,
              <br />
              disfruta el deporte
            </p>
          )}
          {loggedIn ? (
            <button
              type='button'
              className={styles.logout}
              onClick={() => logoutPlayer(dispatch, `/${locale}/explorar`)}
            >
              <i className='ri-logout-box-r-line' aria-hidden />
              Cerrar sesión
            </button>
          ) : null}
        </div>
      </aside>
      {branchAdmin ? <VenueAlertPanel alerts={alerts} locale={locale} onOpenReservation={closeMenu} /> : null}
      <div className={styles.main}>{children}</div>
      <LoginModal
        open={Boolean(loginFor)}
        title={
          loginFor === 'perfil'
            ? 'Entra para ver tu perfil'
            : loginFor === 'favoritos'
              ? 'Entra para ver tus favoritos'
              : 'Entra para ver tus reservas'
        }
        onClose={closeLogin}
        onSuccess={finishLogin}
      />
    </div>
  )
}
