'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import Navigation from './Navigation'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = ({ dictionary }) => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center gap-4 is-full')}>
      <div className='flex items-center gap-4 flex-shrink-0'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && <Logo text={true} />}
      </div>
      {!isBreakpointReached && (
        <div className='flex-1 flex items-center justify-center min-w-0 relative px-3'>
          <Navigation dictionary={dictionary} inline={true} />
        </div>
      )}
      <div className='flex items-center gap-2 flex-shrink-0'>
        <ModeDropdown />
        <UserDropdown dictionary={dictionary} />
      </div>
    </div>
  )
}

export default NavbarContent
