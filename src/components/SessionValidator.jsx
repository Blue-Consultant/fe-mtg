'use client'

import { useSessionValidator } from '@/hooks/useSessionValidator'
import { useSessionActivity } from '@/hooks/useSessionActivity'
import { usePageTracking } from '@/hooks/usePageTracking'
import { usePlacementExamPending } from '@/hooks/usePlacementExamPending'

/**
 * Componente que valida la sesión del usuario de forma proactiva
 * Debe colocarse dentro del árbol de providers (NextAuth, Redux, etc.)
 */
const SessionValidator = () => {
  useSessionValidator()
  useSessionActivity() // Mantener la sesión activa con touch periódico
  usePageTracking() // Rastrear las rutas visitadas
  usePlacementExamPending() // Verificar y redirigir si hay examen pendiente
  return null
}

export default SessionValidator

