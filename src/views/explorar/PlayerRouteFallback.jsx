'use client'

import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

export default function PlayerRouteFallback() {
  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Skeleton variant='text' width={280} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(item => (
          <Skeleton key={item} variant='rectangular' width={280} height={280} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Box>
  )
}
