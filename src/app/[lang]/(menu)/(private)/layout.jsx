import AuthGuard from '@/hocs/AuthGuard'
import ModuleAccessGuard from '@/components/guards/ModuleAccessGuard'

const Layout = ({ children, params }) => {
  return (
    <AuthGuard locale={params.lang}>
      <ModuleAccessGuard locale={params.lang}>{children}</ModuleAccessGuard>
    </AuthGuard>
  )
}

export default Layout
