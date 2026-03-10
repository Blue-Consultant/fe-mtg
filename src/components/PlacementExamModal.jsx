'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, Alert } from '@mui/material'

import { usePlacementExamPending } from '@/hooks/usePlacementExamPending'

/**
 * Modal que se muestra cuando el estudiante tiene un examen de ubicación pendiente
 * No se puede cerrar - el estudiante DEBE tomar el examen
 */
const PlacementExamModal = () => {
  const { pendingExam, loading, showExamModal, startExam, hasPendingExam } = usePlacementExamPending()

  // No mostrar si está cargando o no hay examen pendiente
  if (loading || !hasPendingExam || !showExamModal) {
    return null
  }

  const formatDate = dateString => {
    if (!dateString) return 'No programado'

    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog
      open={showExamModal}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown
      onClose={(event, reason) => {
        /* Prevenir cierre por backdrop click */
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
        Examen de Ubicación Pendiente
      </DialogTitle>

      <DialogContent>
        <Typography variant='body1' sx={{ textAlign: 'justify', lineHeight: 1.8, mb: 2 }}>
          Tienes un examen de ubicación asignado que debes completar antes de continuar. El examen tiene un límite de{' '}
          <strong>{pendingExam?.time_limit_minutes || 15} minutos</strong>.
        </Typography>

        {pendingExam?.evaluation_title && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Evaluación: <strong>{pendingExam.evaluation_title}</strong>
          </Alert>
        )}

        {pendingExam?.program_title && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Programa:
            </Typography>
            <Typography variant='body1'>
              {pendingExam.program_title}
              {pendingExam.entity_name && ` - ${pendingExam.entity_name}`}
            </Typography>
          </Box>
        )}

        {pendingExam?.scheduled_exam_at && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Fecha Programada:
            </Typography>
            <Typography variant='body1'>{formatDate(pendingExam.scheduled_exam_at)}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip label={`${pendingExam?.time_limit_minutes || 15} minutos`} color='warning' variant='outlined' />
          <Chip label='Examen de ubicación' color='primary' variant='outlined' />
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant='contained' onClick={startExam} size='large'>
          Iniciar Examen
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PlacementExamModal
