'use client'

import Skeleton from '@mui/material/Skeleton'

const UserTableSkeleton = ({ rowsNum = 4, colNum = 8 }) => {
  return (
    <>
      {[...Array(rowsNum)].map((_, rowIndex) => (
        <tr key={rowIndex}>
          {[...Array(colNum)].map((_, colIndex) => (
            <td key={colIndex}>
              <div className='flex items-center gap-3'>
                {colIndex === 0 && (
                  <Skeleton variant='circular' width={34} height={34} />
                )}
                <Skeleton
                  variant='text'
                  width={colIndex === 0 ? 150 : colIndex === 1 ? 200 : 100}
                  height={20}
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default UserTableSkeleton

