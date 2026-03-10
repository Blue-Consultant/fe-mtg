// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledMain = styled.main`
  padding: ${({ isMobile }) => (isMobile ? themeConfig.layoutPaddingMobile : themeConfig.layoutPadding)}px;
  overflow-x: hidden;
  ${({ isContentCompact }) =>
    isContentCompact &&
    `
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  `}

  /* Página full-bleed (ej. separa-tu-cancha): sin padding ni max-width; sin scroll vertical */
  &:has(> .${commonLayoutClasses.contentFullBleedRoot}) {
    padding: 0;
    margin-inline: 0;
    max-inline-size: none;
    overflow-y: hidden;
    max-height: 100vh;
  }

  &:has(.${commonLayoutClasses.contentHeightFixed}) {
    display: flex;
    overflow: hidden;
  }
`

export default StyledMain
