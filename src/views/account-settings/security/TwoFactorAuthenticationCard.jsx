// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Type Imports
import Link from '@components/Link'

// Component Imports
import TwoFactorAuth from '@components/dialogs/two-factor-auth'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const TwoFactorAuthenticationCard = () => {
  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Habilitar autenticación de dos factores',
    disabled: true // Coloque este disabled probicional para que deshabilite el boton para soportefuturo
  }

  return (
    <>
      <Card>
        <CardHeader title='Verificación de dos pasos  -- ( Disponible pronto )' />
        <CardContent className='flex flex-col items-start gap-6'>
          <div className='flex flex-col gap-4'>
            <Typography>La autenticación de dos factores no está habilitada todavía.</Typography>
            <Typography>
              La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta al requerir más que
              solo una contraseña para iniciar sesión.
              <Link className='text-primary'>Aprender más.</Link>
            </Typography>
          </div>
          <OpenDialogOnElementClick element={Button} elementProps={buttonProps} dialog={TwoFactorAuth} />
        </CardContent>
      </Card>
    </>
  )
}

export default TwoFactorAuthenticationCard
