'use client'

import { Grid, Box } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'

import { useBookingConfirmation } from './hooks/useBookingConfirmation'

// Components
import BookingBreadcrumbs from './components/BookingBreadcrumbs'
import BookingHeader from './components/BookingHeader'
import CourtSummaryCard from './components/CourtSummaryCard'
import CustomerDetails from './components/CustomerDetails'
import PaymentSummaryCard from './components/PaymentSummaryCard'
import PaymentActionButton from './components/PaymentActionButton'
import SecurityBadge from './components/SecurityBadge'

const BookingIndex = ({ dictionary, lang }) => {
  const { paymentMethod, handlePaymentMethodChange, handleConfirmBooking, bookingData } =
    useBookingConfirmation(dictionary)

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='booking-confirmation-page'
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
      >
        <BookingBreadcrumbs dictionary={dictionary} />

        <BookingHeader dictionary={dictionary} />

        <Grid container spacing={3}>
          {/* Left Column - Booking Details */}
          <Grid item xs={12} lg={7}>
            <CourtSummaryCard court={bookingData.court} booking={bookingData.booking} />
            <CustomerDetails customer={bookingData.booking} dictionary={dictionary} />
          </Grid>

          {/* Right Column - Payment Summary (Sticky) */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ position: { lg: 'sticky' }, top: 88 }}>
              <PaymentSummaryCard
                payment={bookingData.payment}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                dictionary={dictionary}
              />

              <PaymentActionButton onConfirm={handleConfirmBooking} dictionary={dictionary} />

              <SecurityBadge dictionary={dictionary} />
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookingIndex
