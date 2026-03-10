'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()}, In progress `}</span>
        <span>{` by `}</span>
        <Link href='https://mui.com/store/contributors/themeselection' target='_blank' className='text-primary'>
          MTG
        </Link>
      </p>

      <div className='flex items-center gap-4'>
        <Link href='/' target='_blank' className=''>
          <b>🚀 Release 1.0.0</b>
        </Link>
      </div>
    </div>
  )
}

export default FooterContent
