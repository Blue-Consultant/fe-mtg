'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid
} from '@mui/material'

const ShowAvatarListDialog = ({ open, setOpen, avatarList, handleSetInputAvatar }) => {

  const handleAvatarClick = (avatar) => {
    handleSetInputAvatar(avatar)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle className='flex justify-between items-center'>
        <span>Seleccionar Avatar</span>
        <IconButton onClick={() => setOpen(false)}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {avatarList.map((avatar, index) => (
            <Grid item xs={3} key={index} className='mt-2'>
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleAvatarClick(avatar)}
                onMouseEnter={(e) => {
                  e.target.style.border = '2px solid #7367F0'
                  e.target.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.border = '2px solid transparent'
                  e.target.style.transform = 'scale(1)'
                }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ShowAvatarListDialog

