import { Suspense } from 'react'

import AuthGuard from '@/hocs/AuthGuard'
import ModuleAccessGuard from '@/components/guards/ModuleAccessGuard'
import { MenuShellLoading } from '@/components/layout/SegmentSwitchLoading'

const Layout = ({ children, params }) => {
  return (
    <Suspense fallback={<MenuShellLoading />}>
      <AuthGuard locale={params.lang}>
        <ModuleAccessGuard locale={params.lang}>{children}</ModuleAccessGuard>
      </AuthGuard>
    </Suspense>
  )
}

export default Layout
