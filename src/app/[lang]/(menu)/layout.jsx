// Shell compartido para todas las rutas bajo (menu): evita desmontar header/layout al pasar
// entre (public) —p. ej. /explorar— y (private) —p. ej. /mis-reservas—.
import { Suspense } from 'react'

import { MenuShellLoading } from '@/components/layout/SegmentSwitchLoading'

import MenuLayoutContent from './MenuLayoutContent'

const Layout = ({ children, params }) => {
  return (
    <Suspense fallback={<MenuShellLoading />}>
      <MenuLayoutContent params={params}>{children}</MenuLayoutContent>
    </Suspense>
  )
}

export default Layout
