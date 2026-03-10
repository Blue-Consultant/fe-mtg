// MUI Imports
import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Grid'

const SkeletonCard = ({ rowsNum }) => {
  return Array.from(new Array(rowsNum)).map((_, index) => (
    <Grid item xs={12} sm={6} md={3} key={index}>
      <div className='border rounded bs-full'>
        {/* Image Skeleton */}
        <div className='pli-2 pbs-2'>
          <Skeleton
            variant='rectangular'
            width='100%'
            height={200}
          />
        </div>

        {/* Content Skeleton */}
        <div className='flex flex-col gap-4 p-5'>
          {/* Chip and Calendar Icon */}
          <div className='flex items-center justify-between'>
            <Skeleton width='35%' height={24} />
            <Skeleton variant='circular' width={40} height={40} />
          </div>

          {/* Title and Description */}
          <div className='flex flex-col gap-1'>
            <Skeleton width='80%' height={28} />
            <Skeleton width='100%' height={20} />
            <Skeleton width='90%' height={20} />
          </div>

          {/* Buttons */}
          <div className='flex flex-wrap gap-4'>
            <Skeleton
              variant='rectangular'
              width='48%'
              height={36}
              sx={{ flexGrow: 1 }}
            />
            <Skeleton
              variant='rectangular'
              width='48%'
              height={36}
              sx={{ flexGrow: 1 }}
            />
          </div>
        </div>
      </div>
    </Grid>
  ))
}

export default SkeletonCard
