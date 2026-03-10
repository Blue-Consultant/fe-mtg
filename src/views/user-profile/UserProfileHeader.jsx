// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useSelector } from 'react-redux'

// Third-party Imports
import classnames from 'classnames'

const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT


function getAvatarSrcValidator(img) {

  const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png'];
  if (img?.includes('APP_MTG')) {
    return `${NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT}/${img}`;
  } else if (allowedAvatars.includes(img)) {
    return `/images/avatars/${img}`;
  } else if (img) {
    return img;
  } else {
    return '/images/avatars/1.png';
  }
}

const UserProfileHeader = ({ data }) => {
  const user = useSelector(state => state.loginReducer.user)

  // Verificar que user existe antes de procesar la fecha
  let formattDate = 'N/A'
  if (user?.birth_date) {
    const date = new Date(user.birth_date)
    formattDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  // Si user no existe, retornar null o un componente de carga
  if (!user) {
    return null
  }

  return (
    <Card>
      <CardMedia image={data?.coverImg} className='bs-[250px]' />
      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-45px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
          <img
            height={120}
            width={120}
            src={getAvatarSrcValidator(user?.avatar)}
            className='rounded'
            alt='Profile Background'
          />
        </div>
        <div className='flex is-full flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || user?.last_name || data?.fullName}
            </Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                {data?.designationIcon && <i className={classnames(data?.designationIcon, 'text-textSecondary')} />}
                <Typography className='font-medium'>{user?.occupation ? user.occupation : 'N/A'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='ri-map-pin-2-line text-textSecondary' />
                <Typography className='font-medium'>{user?.country ? user.country : 'N/A'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='ri-calendar-line text-textSecondary' />
                <Typography className='font-medium'>{formattDate}</Typography>
              </div>
            </div>
          </div>
          {/* <Button variant='contained' className='flex gap-2'>
            <i className='ri-user-follow-line text-base'></i>
            <span>Connected</span>
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
