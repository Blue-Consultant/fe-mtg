// Third-party Imports
import classnames from 'classnames'

// Context Imports
import { HorizontalNavProvider } from '@menu/contexts/horizontalNavContext'

// Component Imports
import LayoutContent from './components/horizontal/LayoutContent'

// Util Imports
import { horizontalLayoutClasses } from './utils/layoutClasses'

// Styled Component Imports
import StyledContentWrapper from './styles/horizontal/StyledContentWrapper'

const HorizontalLayout = props => {
  // Props
  const { header, footer, children } = props

  return (
    <div className={classnames(horizontalLayoutClasses.root, 'flex min-h-[100dvh] flex-auto flex-col')}>
      <HorizontalNavProvider>
        <StyledContentWrapper
          className={classnames(horizontalLayoutClasses.contentWrapper, 'flex min-h-0 flex-1 flex-col is-full')}
        >
          {header || null}
          <LayoutContent>{children}</LayoutContent>
          {footer || null}
        </StyledContentWrapper>
      </HorizontalNavProvider>
    </div>
  )
}

export default HorizontalLayout
