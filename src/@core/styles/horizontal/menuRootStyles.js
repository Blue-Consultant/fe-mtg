const menuRootStyles = theme => {
  return {
    '& > ul': {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      minWidth: 'max-content'
    },
    '& > ul > li': {
      flexShrink: 0,
      whiteSpace: 'nowrap'
    },
    '& > ul > li:not(:last-of-type)': {
      marginInlineEnd: theme.spacing(2)
    }
  }
}

export default menuRootStyles
