import { Suspense } from 'react'

import { BlankShellLoading } from '@/components/layout/SegmentSwitchLoading'

import BlankLayoutContent from './BlankLayoutContent'

const Layout = ({ children, params }) => {
  return (
    <Suspense fallback={<BlankShellLoading />}>
      <BlankLayoutContent params={params}>{children}</BlankLayoutContent>
    </Suspense>
  )
}

export default Layout
