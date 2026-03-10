'use client'

// React Imports
import { useState } from 'react'

// React-redux Imports
import { useRouter, useParams } from 'next/navigation'

import { useSelector } from 'react-redux'

// Next Imports
import { signOut } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'

import { deactivateAccount } from './ApiAccount'

const AccountDelete = () => {
  const router = useRouter()

  const user = useSelector(state => state.loginReducer.user)

  // States
  const [open, setOpen] = useState(false)

  // Hooks
  const { lang: locale } = useParams()

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })

  // Vars
  const checkboxValue = watch('checkbox')

  const onSubmit = async () => {
    setOpen(true)
  }

  const handleConfirmation = async isConfirmed => {
    if (isConfirmed) {
      try {
        await deactivateAccount(user.email, !isConfirmed)
        await signOut({ callbackUrl: `/${locale}/login` })
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Eliminar Cuenta' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl error={Boolean(errors.checkbox)} className='is-full mbe-6'>
            <Controller
              name='checkbox'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox {...field} />} label='Confirmo la desactivación de mi cuenta' />
              )}
            />
            {errors.checkbox && <FormHelperText error>Por favor confirma que desea eliminar su cuenta</FormHelperText>}
          </FormControl>
          <Button variant='contained' color='error' type='submit' disabled={!checkboxValue}>
            Deactivate Account
          </Button>
          <ConfirmationDialog open={open} setOpen={setOpen} type='delete-account' onConfirmation={handleConfirmation} />
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
