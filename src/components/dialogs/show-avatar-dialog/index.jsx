'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Grid from '@mui/material/Grid'

const showAvatarListDialog = ({open, setOpen, avatarList, handleSetInputAvatar}) => {

  const handleClose = () => setOpen(false)

  return (
    <>
      <Dialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
        <DialogTitle id='customized-dialog-title' className='p-4'>
          <Typography variant='h6' component='span'>
            Avatars
          </Typography>
          <IconButton
            aria-label='close'
            onClick={handleClose}
            className='absolute top-2.5 right-2.5 text-[var(--mui-palette-grey-500)]'
          >
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className='p-4'>

          <Grid container spacing={2}>
  
            {avatarList && avatarList.length > 0 ? (
              avatarList.map( (avatar, index) => (
                <Grid item xs={3} sm={3} md={3} key={index} className='p-4' display='flex' justifyContent="center" alignItems="center">
                  <img key={index} src={avatar ? `/images/avatars/${avatar}` : '/images/avatars/1.png'} alt={avatar} height={100} width={100} className='rounded' style={{ cursor: 'pointer' }} onClick={() => handleSetInputAvatar(avatar)}></img>
                </Grid>
              ))
            ): null}
    
          </Grid>

        </DialogContent>
      </Dialog>
    </>
  )
}

export default showAvatarListDialog