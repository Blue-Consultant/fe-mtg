import { useState } from 'react'

export const useBookingConfirmation = dictionary => {
  const [paymentMethod, setPaymentMethod] = useState('credit')

  // Mock booking data - in real implementation, this would come from API/Redux/router params
  const mockBookingData = {
    court: {
      id: 1,
      name: 'Cancha de Fútbol Premium',
      imageUrl: '/images/cards/court-sample.jpg',
      location: 'Lima, Perú - Miraflores',
      rating: 4.5,
      reviewCount: 128,
      surfaceType: 'Grass sintético'
    },
    booking: {
      date: '2026-01-25',
      timeSlot: '18:00 - 19:00',
      duration: '1 hora',
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com'
    },
    payment: {
      hourlyRate: 80.0,
      serviceFee: 8.0,
      total: 88.0,
      currency: 'S/'
    }
  }

  const handlePaymentMethodChange = event => {
    setPaymentMethod(event.target.value)
  }

  const handleConfirmBooking = () => {
    // In real implementation, this would trigger payment processing
    console.log('Confirm booking with payment method:', paymentMethod)

    // TODO: Implement actual payment processing
  }

  return {
    paymentMethod,
    handlePaymentMethodChange,
    handleConfirmBooking,
    bookingData: mockBookingData
  }
}
