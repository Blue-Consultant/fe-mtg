// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import Link from '@components/Link'


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


const Teams = ({ data }) => {
  return (
    <Grid container spacing={6}>
      {data &&
        data.map((item, index) => {
          return (
            <Grid item key={index} xs={12} md={6} lg={4}>
              <Card>
                <CardContent className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <CustomAvatar size={38} src={getAvatarSrcValidator(item.avatar)} />
                      <Typography variant='h5'>{item.title}</Typography>
                    </div>
                    <div className='flex items-center gap-1'>
                      <IconButton>
                        <i className='ri-star-line text-textDisabled' />
                      </IconButton>
                      <OptionMenu
                        iconButtonProps={{
                          size: 'medium',
                          className: 'text-textDisabled'
                        }}
                        options={[
                          'Rename Team',
                          'View Details',
                          'Add to Favorite',
                          { divider: true },
                          { text: 'Delete Team', menuItemProps: { className: 'text-error' } }
                        ]}
                      />
                    </div>
                  </div>
                  <Typography>{item.description}</Typography>
                  <div className='flex items-center justify-between flex-wrap'>
                    <AvatarGroup
                      total={item.extraMembers ? item.extraMembers + 3 : 3}
                      sx={{ '& .MuiAvatar-root': { width: '2rem', height: '2rem', fontSize: '1rem' } }}
                      className='items-center pull-up'
                    >
                      {item.avatarGroup.map((person, index) => {
                        return (
                          <Tooltip key={index} title={person.name}>
                            <Avatar src={getAvatarSrcValidator(person.avatar)} alt={person.name} />
                          </Tooltip>
                        )
                      })}
                    </AvatarGroup>
                    <div className='flex items-center gap-2'>
                      {item.chips.map((chip, index) => (
                        <Link key={index}>
                          <Chip variant='tonal' size='small' label={chip.title} color={chip.color} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
    </Grid>
  )
}

export default Teams
