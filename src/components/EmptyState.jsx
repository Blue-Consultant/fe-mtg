'use client'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import styles from './EmptyState.module.css'

/**
 * Componente general para estados vacíos (sin resultados, sin datos, etc.).
 * @param {string} title - Título principal (ej: "Sin resultados")
 * @param {string} description - Descripción o mensaje (ej: "No hay canchas con los filtros seleccionados.")
 * @param {React.ReactNode} icon - Icono o ilustración (opcional). Por defecto: icono de búsqueda
 * @param {React.ReactNode} action - Botón o enlace de acción (opcional)
 * @param {string} actionLabel - Texto del botón si action no se pasa (opcional)
 * @param {function} onActionClick - Callback al hacer clic en el botón por defecto (opcional)
 * @param {string} className - Clase CSS adicional para el contenedor
 */
export default function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron elementos.',
  icon,
  action,
  actionLabel,
  onActionClick,
  className = '',
}) {
  return (
    <Box className={`${styles.root} ${className}`}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          {icon ?? (
            <i className="ri-search-line" aria-hidden />
          )}
        </div>
        <Typography variant="h6" component="h2" className={styles.title}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className={styles.description}>
          {description}
        </Typography>
        {(action || (actionLabel && onActionClick)) && (
          <div className={styles.actionWrap}>
            {action ?? (
              <Button variant="contained" onClick={onActionClick}>
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Box>
  )
}
