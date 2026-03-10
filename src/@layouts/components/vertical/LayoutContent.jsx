'use client'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import useMediaQuery from '@mui/material/useMediaQuery'

import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

// MUI Imports

const LayoutContent = ({ children }) => {
  // Hooks
  const { settings } = useSettings()
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  return (
    <StyledMain
      isContentCompact={contentCompact}
      isMobile={isMobile}
      className={classnames(verticalLayoutClasses.content, 'flex-auto', {
        [`${verticalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [verticalLayoutClasses.contentWide]: contentWide
      })}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent
