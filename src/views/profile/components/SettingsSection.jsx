'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

// Component Imports
import { ProfileSettingItem } from '@/components/auth'

/**
 * SettingsSection - Sección agrupada de configuraciones
 */
const SettingsSection = ({ 
  title,
  items = [],
  dictionary = {}
}) => {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      {/* Section Title */}
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          px: 2,
          mb: 2,
          color: 'text.secondary',
          fontWeight: 700,
          letterSpacing: 2
        }}
      >
        {title}
      </Typography>

      {/* Items Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {items.map((item, index) => (
          <ProfileSettingItem
            key={item.id || index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            onClick={item.onClick}
            badge={item.badge}
            sublabel={item.sublabel}
            isPrimary={item.isPrimary}
            showChevron={item.showChevron !== false}
            isLast={index === items.length - 1}
          />
        ))}
      </Paper>
    </Box>
  )
}

export default memo(SettingsSection)
