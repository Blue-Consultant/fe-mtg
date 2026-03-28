'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'

import CourtCardHorizontal from '@/views/explorar/components/CourtCardHorizontal'
import themeConfig from '@configs/themeConfig'
import { listMyCourtFavorites } from '@/views/court-favorites/api'
import { getLocalizedUrl } from '@/utils/i18n'

const MisFavoritosIndex = ({ dictionary }) => {
  const { lang } = useParams()
  const t = dictionary?.modules?.clientArea?.favorites ?? {}
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listMyCourtFavorites()

      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.message || t.loadError || 'No se pudieron cargar los favoritos.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [t.loadError])

  useEffect(() => {
    load()
  }, [load])

  const exploreHref = getLocalizedUrl('/explorar', lang)

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: themeConfig.compactContentWidth,
        mx: 'auto',
        py: 4,
        px: { xs: 2, sm: 3 },
        boxSizing: 'border-box'
      }}
    >
      <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
        {t.title || 'Mis canchas favoritas'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t.subtitle || 'Accede rápido a las canchas que guardaste desde el detalle.'}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && !error && rows.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color='text.secondary' sx={{ mb: 2 }}>
            {t.empty || 'Aún no tienes favoritos. Explora canchas y pulsa el corazón en el detalle.'}
          </Typography>
          <Button component={Link} href={exploreHref} variant='contained'>
            {t.explore || 'Explorar canchas'}
          </Button>
        </Box>
      )}

      {!loading && rows.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' }
          }}
        >
          {rows
            .filter(r => r.court && r.court.id)
            .map(r => (
              <CourtCardHorizontal key={r.cancha_id} court={r.court} lang={lang} />
            ))}
        </Box>
      )}
    </Box>
  )
}

export default MisFavoritosIndex
