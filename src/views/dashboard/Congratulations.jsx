// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const Congratulations = ({ dictionary }) => {
  return (
    <Card className='relative overflow-visible sm:mt-6 md:mt-0'>
      <CardContent className='!pbe-0 sm:!pbe-5'>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <Typography variant='h4' className='mbe-9'>
              {dictionary?.['modules']?.['home']?.congratulations || '¡Felicitaciones!'}
              🎉
            </Typography>
            <Typography>{dictionary?.['modules']?.['home']?.description_congratulations || 'Has completado con éxito'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} className='flex justify-center sm:absolute sm:inline-end-11 sm:bottom-0'>
            <img
              alt='Congratulations John'
              src='/images/illustrations/characters-with-objects/3.png'
              className='bs-auto max-is-full max-bs-[189px]'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Congratulations
