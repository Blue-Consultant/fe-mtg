'use client'

import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { WhatsApp } from '@mui/icons-material'

export default function AlertDialogUnsubscription ({ open, handle, msg, type }) {
  return (
    <>
      {/* onClose={() => handle(false)} */}

      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{`Mensaje de ${
          type == 'warning' ? ' advertencia' : 'penalización'
        } `}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>{msg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          {type == 'warning' && (
            <Button variant='contained' onClick={() => handle(false)} autoFocus>
              Aceptar
            </Button>
          )}

          {type == 'penality' && (
            <Button
              color='success'
              size='small'
              variant='contained'
              href='https://wa.me/51987402662'
              onClick={() => handle(false)}
              target='_blank'
            >
              <WhatsApp fontSize='small' /> <p style={{ marginLeft: '2px' }}> Support </p>
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
