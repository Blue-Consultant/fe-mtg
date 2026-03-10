'use client'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

import { useSelector } from 'react-redux'
import { signOut } from 'next-auth/react'

const LayoutWrapper = props => {
  const { systemMode, verticalLayout, horizontalLayout } = props

  const { settings } = useSettings()

  useLayoutInit(systemMode)

  const userExist = useSelector(state => state.loginReducer.user)

  if (!userExist) {
    signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/es/login', redirect: true })
    return null
  }

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {horizontalLayout}
    </div>
  )
}

export default LayoutWrapper
