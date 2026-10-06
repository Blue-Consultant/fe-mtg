import axios from '@/utils/axios'

export function yapeErrorMessage(error) {
  const message = error?.response?.data?.message

  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message) && message[0]) return String(message[0])

  return 'No pude guardar la captura. Inténtalo otra vez.'
}

export async function submitYapeCapture(file, draft) {
  const form = new FormData()

  form.append('captura', file)
  form.append('courtId', String(draft.courtId))
  form.append('fecha', draft.fecha)
  form.append('hora_inicio', draft.start)
  form.append('hora_fin', draft.end)
  form.append('total', String(draft.total))

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
