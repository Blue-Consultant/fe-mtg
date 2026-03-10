// MUI Imports
import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

const SkeletonTable = ({ rowsNum, colNum }) => {
  return Array.from(new Array(rowsNum)).map((_, index) => (
    <TableRow key={index}>
      {Array.from(new Array(colNum)).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant='text' width='100%' height={20} />
        </TableCell>
      ))}
    </TableRow>
  ))
}

export default SkeletonTable
