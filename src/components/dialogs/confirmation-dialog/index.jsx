'use client'

// React Imports
import { Fragment, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

const ConfirmationDialog = ({ open, setOpen, type, onConfirmation, moduleName, isLoading = false }) => {
  // States
  const [secondDialog, setSecondDialog] = useState(false)
  const [userInput, setUserInput] = useState(false)

  // Vars
  const Wrapper = type === 'suspend-account' ? 'div' : Fragment

  const handleSecondDialogClose = () => {
    setSecondDialog(false)
    setOpen(false)
  }

  const handleConfirmation = value => {
    onConfirmation(value)
    // Solo cerrar si es cancelación (false) o si no hay loading
    if (!value || !isLoading) {
      setOpen(false)
    }
    // Si es confirmación (true) y hay loading, el componente padre manejará el cierre
  }

  return (
    <>
      <Dialog
        fullWidth
        maxWidth='xs'
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby='confirmation-dialog-title'
        aria-describedby='confirmation-dialog-description'
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-8 sm:pbe-6 sm:pli-8'>
          <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
          <Wrapper
            {...(type === 'suspend-account' && {
              className: 'flex flex-col items-center gap-2'
            })}
          >
            <Typography variant='h6'>
              {type === 'delete-account' && 'Are you sure you want to deactivate your account?'}
              {type === 'subscribe' && 'Are you sure to confirm your subscription?'}
              {type === 'unsubscribe' && 'Are you sure to cancel your subscription?'}
              {type === 'suspend-account' && 'Are you sure?'}
              {type === 'delete-order' && 'Are you sure?'}
              {type === 'delete-customer' && 'Are you sure?'}
              {type === 'delete' && `Are you sure you want to delete this ${moduleName}?`}
              {type === 'reset-sublevel' && `¿Estás seguro de que deseas reiniciar todo el progreso de este ${moduleName}?`}
              {type === 'enroll' && `¿Estás seguro de inscribirte a esta ${moduleName}?`}
            </Typography>
            {type === 'suspend-account' && (
              <Typography color='text.primary'>You won&#39;t be able to revert user!</Typography>
            )}
            {type === 'delete-order' && (
              <Typography color='text.primary'>You won&#39;t be able to revert order!</Typography>
            )}
            {type === 'delete-customer' && (
              <Typography color='text.primary'>You won&#39;t be able to revert customer!</Typography>
            )}
            {type === 'reset-sublevel' && (
              <Typography color='text.primary'>Esta acción reiniciará todas las actividades, simuladores y evaluaciones del subnivel. No se podrá deshacer.</Typography>
            )}
          </Wrapper>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-8 sm:pli-8'>
          <Button
            variant='contained'
            onClick={() => handleConfirmation(true)}
            autoFocus
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color='inherit' /> : null}
          >
            {isLoading
              ? 'Procesando...'
              : type === 'suspend-account'
                ? 'Yes, Suspend User!'
                : type === 'delete-order'
                  ? 'Yes, Delete Order!'
                  : type === 'delete-customer'
                    ? 'Yes, Delete Customer!'
                    : type === 'enroll'
                      ? 'Sí, inscribirme'
                      : type === 'reset-sublevel'
                        ? 'Sí, reiniciar'
                        : 'Yes'}
          </Button>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              handleConfirmation(false)
            }}
            disabled={isLoading}
          >
            {type === 'enroll' ? 'Cancelar' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Account Dialog */}
      <Dialog
        open={secondDialog}
        onClose={handleSecondDialogClose}
        disableEnforceFocus={false}
        keepMounted
        aria-labelledby='result-dialog-title'
      >
        <DialogContent className='flex items-center flex-col text-center sm:pbs-8 sm:pbe-6 sm:pli-16'>
          <i
            className={classnames('text-[88px] mbe-6', {
              'ri-checkbox-circle-line': userInput,
              'text-success': userInput,
              'ri-close-circle-line': !userInput,
              'text-error': !userInput
            })}
          />
          <Typography variant='h6' className='mbe-2'>
            {userInput
              ? `${type === 'subscribe' ? 'Subscribed' : 'delete-account' ? 'Deactivated' : type === 'unsubscribe' ? 'Unsubscribed' : type === 'delete-order' || 'delete-customer' ? 'Deleted' : 'Suspended!'}`
              : 'Cancelled'}
          </Typography>
          <Typography color='text.primary'>
            {userInput ? (
              <>
                {type === 'delete-account' && 'Your account has been deactivated successfully.'}
                {type === 'unsubscribe' && 'Your subscription cancelled successfully.'}
                {type === 'subscribe' && 'You are successfully subscribed.'}
                {type === 'suspend-account' && 'User has been suspended.'}
                {type === 'delete-order' && 'Your order deleted successfully.'}
                {type === 'delete-customer' && 'Your customer removed successfully.'}
              </>
            ) : (
              <>
                {type === 'delete-account' && 'Account Deactivation Cancelled!'}
                {type === 'unsubscribe' && 'Unsubscription Cancelled!!'}
                {type === 'suspend-account' && 'Cancelled Suspension :)'}
                {type === 'delete-order' && 'Order Deletion Cancelled'}
                {type === 'delete-customer' && 'Customer Deletion Cancelled'}
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-8 sm:pli-8'>
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmationDialog
