'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

// Third-party Imports
import styled from '@emotion/styled'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { isBlankLayoutPath } from '@/utils/crossLayoutNav'
import { getLocalizedUrl } from '@/utils/i18n'

const LogoText = styled.span`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 2rem; // default 1.25rem
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  transition: ${({ transitionDuration }) =>
    `margin-inline-start ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`};

  ${({ isHovered, isCollapsed, isBreakpointReached }) =>
    !isBreakpointReached && isCollapsed && !isHovered
      ? 'opacity: 0; margin-inline-start: 0;'
      : 'opacity: 1; margin-inline-start: 10px;'}
`

const Logo = ({ color, text, disableLink = false }) => {
  // Refs
  const logoTextRef = useRef(null)

  // Hooks
  const { lang: locale } = useParams()
  const pathname = usePathname()
  const { isHovered, transitionDuration, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  useEffect(() => {
    if (layout !== 'collapsed') {
      return
    }

    if (logoTextRef && logoTextRef.current) {
      if (!isBreakpointReached && layout === 'collapsed' && !isHovered) {
        logoTextRef.current?.classList.add('hidden')
      } else {
        logoTextRef.current.classList.remove('hidden')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, layout, isBreakpointReached])

  const inner = (
    <>
      {/* <MaterioLogo className='text-[22px] text-primary' /> */}
      <LogoText
        color={color}
        ref={logoTextRef}
        isHovered={isHovered}
        isCollapsed={layout === 'collapsed'}
        transitionDuration={transitionDuration}
        isBreakpointReached={isBreakpointReached}
      >
        {text ? 'MTG' : ''}
      </LogoText>
    </>
  )

  const className = 'flex items-center min-bs-[24px] no-underline'

  if (disableLink || !locale) {
    return <div className={className}>{inner}</div>
  }

  const homeHref = getLocalizedUrl(themeConfig.homePageUrl, locale)

  if (isBlankLayoutPath(pathname)) {
    return (
      <a href={homeHref} className={className}>
        {inner}
      </a>
    )
  }

  return (
    <Link prefetch href={homeHref} className={className}>
      {inner}
    </Link>
  )
}

export default Logo
