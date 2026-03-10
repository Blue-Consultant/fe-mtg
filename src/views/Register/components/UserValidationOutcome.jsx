import Link from 'next/link'

import { Button, CircularProgress, Grid, Typography } from '@mui/material'

import { OUTCOME_UI } from '../constants/outcomeUI'

export default function UserValidationOutcome({ outcome, locale, loading, handleOutcomeAction, memoizedDictionary }) {
  const t = memoizedDictionary
  const UI = OUTCOME_UI(t)
  const ui = UI[outcome] || { message: 'Resultado no reconocido', actions: [] }

  return (
    <Grid container spacing={5}>
      <Grid item xs={12} className='flex justify-center text-center'>
        <Typography>{ui.message}</Typography>
      </Grid>

      {ui.actions.map((a, i) => (
        <Grid item xs={12} key={i}>
          {a.href ? (
            <Button
              fullWidth
              variant={a.variant || 'contained'}
              color={a.color || 'primary'}
              component={Link}
              href={`/${locale}${a.href}`}
              disabled={!!loading}
            >
              {loading && <CircularProgress size={20} color='inherit' />}
              {a.label}
            </Button>
          ) : (
            <Button
              fullWidth
              variant={a.variant || 'contained'}
              color={a.color || 'primary'}
              onClick={a.intent ? () => handleOutcomeAction?.(a.intent) : undefined}
              type='button'
              disabled={!!loading}
            >
              {loading && <CircularProgress size={20} color='inherit' />}
              {a.label}
            </Button>
          )}
        </Grid>
      ))}
      <Grid item xs={12} className='flex justify-center text-center'>
        <div className='flex justify-between items-center'>
          <Button
            variant='contained'
            color='primary'
            onClick={() => handleOutcomeAction({ type: 'VALIDATE_USER', role: null })}
          >
            {t.common.return}
          </Button>
        </div>
      </Grid>
    </Grid>
  )
}
