// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'

const SnackbarAlert = ({ dataAlertSnackbar, setDataAlertSnackbar, reloadMain, dictionary }) => {
  const { vertical, horizontal } = dataAlertSnackbar

  const handleClose = () => {
    setDataAlertSnackbar(item => ({
      ...item,
      open: false
    }))
  }

  return (
    <>
      <Snackbar
        open={dataAlertSnackbar.open}
        onClose={handleClose}
        autoHideDuration={6000}
        message='MTG SAY:'
        key={vertical + horizontal}
        anchorOrigin={{ vertical, horizontal }}
      >
        <Alert variant='filled' onClose={handleClose} className='is-full shadow-xs' severity={dataAlertSnackbar.type}>
          {dataAlertSnackbar.msg}
        </Alert>
      </Snackbar>
    </>
  )
}

export default SnackbarAlert
