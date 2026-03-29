'use client'

// Next Imports
import { usePathname } from 'next/navigation'

// Component Imports
import Navigation from './Navigation'
import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

const Header = ({ dictionary, forceFullWidthNavbar = false }) => {
  // Hooks
  const pathname = usePathname()
  const { isBreakpointReached } = useHorizontalNav()

  // Misma anchura que la landing: rutas públicas de canchas (no el shell compacto del backoffice).
  const segments = pathname.split('/')

  const fullWidthCourtsShell = segments.includes('marca-tu-gol') || segments.includes('explorar')

  return (
    <>
      <LayoutHeader forceFullWidthNavbar={forceFullWidthNavbar || fullWidthCourtsShell}>
        <Navbar>
          <NavbarContent dictionary={dictionary} />
        </Navbar>
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={dictionary} />}
    </>
  )
}

export default Header
