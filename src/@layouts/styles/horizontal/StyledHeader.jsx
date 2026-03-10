// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledHeader = styled.header`
  background: linear-gradient(135deg,rgb(100, 180, 118) 0%,rgb(68, 134, 84) 50%, #0a6b22 100%);
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(19, 178, 54, 0.25);
  border-block-end: none;

  [data-skin='bordered'] & {
    box-shadow: none;
    border-block-end: 1px solid rgba(255, 255, 255, 0.15);
  }

  &:not(.${horizontalLayoutClasses.headerBlur}) {
    & a,
    & button,
    & span,
    & p,
    & div {
      color: inherit;
    }
    & a:hover,
    & button:hover:not([disabled]) {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  &.${horizontalLayoutClasses.headerBlur} {
    backdrop-filter: blur(8px);
    & a,
    & button,
    & span,
    & p,
    & div {
      color: inherit;
    }
  }

  &.${horizontalLayoutClasses.headerFixed} {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--header-z-index);
  }

  &.${horizontalLayoutClasses.headerContentCompact} .${horizontalLayoutClasses.navbar} {
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  }

  .${horizontalLayoutClasses.navbar} {
    position: relative;
    min-block-size: var(--header-height);
    ${({ theme }) => `padding-block: ${theme.spacing(2.5)};`}
    padding-inline: ${themeConfig.layoutPadding}px;
    gap: 1rem;
  }

  .${horizontalLayoutClasses.navbarContent} {
    gap: 1.25rem;
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledHeader
