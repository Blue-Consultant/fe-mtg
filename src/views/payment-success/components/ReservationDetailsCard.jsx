'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

/**
 * ReservationDetailsCard - Tarjeta con detalles de la reserva
 */
const ReservationDetailsCard = ({ 
  courtImage,
  courtName = 'Loza Deportiva Central',
  courtNumber = 'Cancha 1',
  location = 'Av. Principal 123',
  date = '12 Oct, 2023',
  time = '18:00 - 19:00',
  transactionId = '#TRX-88592',
  total = '$45.00',
  dictionary = {}
}) => {
  const t = dictionary?.paymentSuccess || {}

  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderRadius: 4,
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Court Image Banner */}
      <Box
        sx={{
          height: 128,
          width: '100%',
          backgroundImage: `url(${courtImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1VeM-iU5XHWEActvBNrbCoF1bA7_KthxFD1zULASYKO2y0CwjuUMmBzwBJgIjHvmg0HL4U_VNDMEs7kUCveX8KuTwSroTQGZiY-T81JpEYsFp0iEnz1PqMYCqEpakN13NxwRwMzpD_zRC-eRYZesg1J1oDxvQBgp4xcR6JvFFbwGLtGC-7weByW5ItrtH4y5u6j95dfL17mSx8tyzHtHj8F4-h4y3EuROjB6EtonckUb9vHyfl6rnt88nYScgLaLDKhjOA8F5MQjk'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }}
        />
        
        {/* Location Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'white'
          }}
        >
          <i className="ri-map-pin-line" style={{ fontSize: '1rem' }} />
          <Typography variant="body2" fontWeight={500}>
            {location}
          </Typography>
        </Box>
      </Box>

      {/* Details Content */}
      <Box sx={{ p: 3 }}>
        {/* Court Info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            borderBottom: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t.court || 'Cancha'}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600}>
              {courtName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {courtNumber}
            </Typography>
          </Box>
        </Box>

        {/* Date Info */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            borderBottom: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t.dateTime || 'Fecha y Hora'}
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600}>
              {date}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {time}
            </Typography>
          </Box>
        </Box>

        {/* Transaction ID */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            borderBottom: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t.transactionId || 'ID Transacción'}
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{ fontFamily: 'monospace', letterSpacing: 1 }}
          >
            {transactionId}
          </Typography>
        </Box>

        {/* Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 2
          }}
        >
          <Typography variant="body1" fontWeight={700}>
            {t.totalPaid || 'Total Pagado'}
          </Typography>
          <Typography 
            variant="h5" 
            fontWeight={700}
            color="primary.main"
          >
            {total}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(ReservationDetailsCard)
