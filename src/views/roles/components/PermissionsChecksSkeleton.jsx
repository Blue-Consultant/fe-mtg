'use client'
import { Skeleton, Box } from '@mui/material'

const PermissionsChecksSkeleton = ({ count = 4 }) => {
  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <Skeleton variant='text' width={150} height={28} />
        <Skeleton variant='rectangular' width={140} height={24} sx={{ borderRadius: 1 }} />
      </div>

      {/* Lista de permisos */}
      <div className='flex flex-col gap-2'>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            variant='rectangular'
            height={50}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </div>
    </Box>
  )
}

export default PermissionsChecksSkeleton

