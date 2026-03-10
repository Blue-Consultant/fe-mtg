import { Breadcrumbs, Typography, Link } from '@mui/material'

const BookingBreadcrumbs = ({ dictionary }) => {
  const steps = [
    { label: dictionary?.booking?.breadcrumbs?.selection || 'Selección', href: '/booking/selection' },
    { label: dictionary?.booking?.breadcrumbs?.details || 'Detalles', href: '/booking/details' },
    { label: dictionary?.booking?.breadcrumbs?.confirmation || 'Confirmación', active: true }
  ]

  return (
    <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 3 }}>
      {steps.map((step, index) =>
        step.active ? (
          <Typography key={index} color='primary' fontWeight={600}>
            {step.label}
          </Typography>
        ) : (
          <Link key={index} href={step.href} underline='hover' color='text.secondary'>
            {step.label}
          </Link>
        )
      )}
    </Breadcrumbs>
  )
}

export default BookingBreadcrumbs
