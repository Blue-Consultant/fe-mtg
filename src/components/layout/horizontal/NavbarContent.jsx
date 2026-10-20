'use client'

import classnames from 'classnames'

import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = ({ dictionary }) => {
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(
        horizontalLayoutClasses.navbarContent,
        'flex items-center justify-between gap-4 is-full w-full max-w-full min-w-0'
      )}
    >
      <div className='flex items-center gap-4 flex-shrink-0'>
        <NavToggle />
        {!isBreakpointReached && <Logo text={true} />}
      </div>
      <div className='flex items-center gap-2 flex-shrink-0'>
        <ModeDropdown />
        <UserDropdown dictionary={dictionary} />
      </div>
    </div>
  )
}

export default NavbarContent
