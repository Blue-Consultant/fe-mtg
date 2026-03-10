'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

/**
 * BottomTabBar - Barra de navegación inferior para móvil
 */
const BottomTabBar = ({ activeTab = 'profile', onNavigate }) => {
  const tabs = [
    { id: 'home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill' },
    { id: 'search', icon: 'ri-search-line', activeIcon: 'ri-search-fill' },
    { id: 'profile', icon: 'ri-user-line', activeIcon: 'ri-user-fill' }
  ]

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 3,
        zIndex: 1000
      }}
    >
      {tabs.map(tab => (
        <IconButton
          key={tab.id}
          onClick={() => onNavigate?.(tab.id)}
          sx={{
            color: activeTab === tab.id ? 'primary.main' : 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <i className={activeTab === tab.id ? tab.activeIcon : tab.icon} style={{ fontSize: '1.5rem' }} />
        </IconButton>
      ))}
    </Box>
  )
}

export default memo(BottomTabBar)
