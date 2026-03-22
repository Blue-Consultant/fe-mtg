import axios from '@/utils/axios'

/**
 * Polling post-checkout. `paymentId` = `external_reference` de Mercado Pago (= payments.id).
 */
export async function getPaymentCheckoutStatus(paymentId) {
  const { data } = await axios.get('payments/checkout-status', {
    params: { paymentId },
    _skipRetry: true
  })
  return data
}
