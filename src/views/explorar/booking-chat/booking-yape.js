import axios from '@/utils/axios'

export function yapeErrorMessage(error) {
  const message = error?.response?.data?.message

  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message) && message[0]) return String(message[0])

  return 'No pude guardar la captura. Inténtalo otra vez.'
}

const slotBody = draft => ({
  courtId: String(draft.courtId),
  fecha: draft.fecha,
  hora_inicio: draft.start,
  hora_fin: draft.end,
  total: Number(draft.total)
})

export async function holdYapeSlot(draft) {
  const { data } = await axios.post('payments/yape/hold', slotBody(draft))

  return data
}

export function releaseYapeHold(reservaId) {
  if (!reservaId) return Promise.resolve(null)

  return axios.post(`payments/yape/hold/${reservaId}/release`).catch(() => null)
}

export async function submitYapeCapture(file, draft, reservaId) {
  const form = new FormData()

  form.append('captura', file)
  form.append('courtId', String(draft.courtId))
  form.append('fecha', draft.fecha)
  form.append('hora_inicio', draft.start)
  form.append('hora_fin', draft.end)
  form.append('total', String(draft.total))
  form.append('reservaId', String(reservaId))

  const { data } = await axios.post('payments/yape', form, {
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) delete headers['Content-Type']

        return body
      }
    ]
  })

  return data
}
