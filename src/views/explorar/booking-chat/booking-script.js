const MAX_HOURS = 3
const MAX_CAPTURE_BYTES = 5 * 1024 * 1024

const MAX_LOGIN_ATTEMPTS = 3

export const initialBookingState = () => ({
  step: 'review',
  loginAttempts: 0,
  profile: {
    name: '',
    email: '',
    password: '',
    dni: '',
    phone: ''
  },
  captureFile: null
})

export function formatMoney(amount) {
  const value = Number(amount) || 0

  return Number.isInteger(value) ? `S/ ${value}` : `S/ ${value.toFixed(2)}`
}

const hoursLabel = count => (count === 1 ? '1 hora' : `${count} horas`)

const receipt = draft => ({
  role: 'assistant',
  kind: 'receipt',
  receipt: {
    rows: [
      { label: 'Cancha', value: draft.courtName },
      { label: 'Sede', value: draft.venueName },
      { label: 'Fecha', value: draft.dateLabel },
      { label: 'Horario', value: `${draft.start} – ${draft.end}` },
      { label: 'Duración', value: hoursLabel(draft.hours) }
    ],
    total: formatMoney(draft.total)
  }
})

const readyMessages = (draft, name) => {
  const hello = name ? `Muy bien, ${name}. ` : 'Muy bien. '

  return [{ role: 'assistant', text: `${hello}Sigamos con tu reserva.` }, ...paymentAsk(draft)]
}

const paymentAsk = draft => [
  {
    role: 'assistant',
    text: `Son ${formatMoney(draft.total)}. Sube la captura de tu Yape.`
  }
]

export function openingMessages(draft) {
  return [
    { role: 'assistant', text: 'Listo. Estas son las horas que marcaste.' },
    receipt(draft),
    { role: 'assistant', text: '¿Seguimos con esta reserva?' }
  ]
}

export function composerFor(booking) {
  const step = booking.step

  if (step === 'review') {
    return {
      type: 'choices',
      choices: [
        { id: 'agree', label: 'Sí, de acuerdo', primary: true },
        { id: 'change', label: 'Quiero cambiar el horario' }
      ]
    }
  }

  if (step === 'account') {
    return {
      type: 'choices',
      choices: [
        { id: 'login', label: 'Ya tengo cuenta', primary: true },
        { id: 'register', label: 'Crear cuenta' }
      ]
    }
  }

  if (step === 'login-email' || step === 'reg-email') {
    return {
      type: 'text',
      placeholder: 'Tu correo',
      inputMode: 'email',
      autoComplete: 'email',
      alternatives: step === 'login-email' ? loginEscapes() : undefined
    }
  }

  if (step === 'login-password' || step === 'reg-password' || step === 'reg-password-confirm') {
    return {
      type: 'text',
      placeholder: step === 'reg-password-confirm' ? 'Confírmala' : 'Contraseña',
      secret: true,
      autoComplete: step === 'login-password' ? 'current-password' : 'new-password',
      alternatives: step === 'login-password' ? loginEscapes({ email: true }) : undefined
    }
  }

  if (step === 'login-retry') {
    return {
      type: 'choices',
      choices: [
        { id: 'retry', label: 'Intentar otra vez', primary: true },
        { id: 'other-email', label: 'Cambiar el correo' },
        { id: 'switch-register', label: 'Crear una cuenta' },
        { id: 'back', label: 'Volver a la reserva' }
      ]
    }
  }

  if (step === 'login-locked') {
    return {
      type: 'choices',
      choices: [
        { id: 'switch-register', label: 'Crear una cuenta', primary: true },
        { id: 'other-email', label: 'Probar con otro correo' },
        { id: 'back', label: 'Volver a la reserva' }
      ]
    }
  }

  if (step === 'reg-name') {
    return { type: 'text', placeholder: 'Tu nombre', autoComplete: 'name' }
  }

  if (step === 'reg-doc') {
    return { type: 'text', placeholder: '8 números del DNI', inputMode: 'numeric', autoComplete: 'off' }
  }

  if (step === 'reg-phone') {
    return { type: 'text', placeholder: '987 654 321', prefix: '+51', inputMode: 'tel', autoComplete: 'tel' }
  }

  if (step === 'payment') {
    return { type: 'file', accept: 'image/*', submitLabel: 'Subir captura de Yape' }
  }

  return null
}

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const withProfile = (state, patch, step = state.step) => ({
  ...state,
  step,
  profile: { ...state.profile, ...patch }
})

const withoutPassword = profile => ({ ...profile, password: '' })

const loginEscapes = ({ email = false } = {}) => [
  ...(email ? [{ id: 'other-email', label: 'Cambiar el correo' }] : []),
  { id: 'switch-register', label: 'Mejor creo una cuenta' },
  { id: 'back', label: 'Volver a la reserva' }
]

const startRegister = state => ({
  state: { ...state, step: 'reg-name', loginAttempts: 0, profile: withoutPassword(state.profile) },
  messages: [{ role: 'assistant', text: '¿Con qué nombre?' }]
})

const otherEmail = state => ({
  state: {
    ...state,
    step: 'login-email',
    loginAttempts: 0,
    profile: { ...withoutPassword(state.profile), email: '' }
  },
  messages: [{ role: 'assistant', text: '¿Cuál es el otro correo?' }]
})

const retryPassword = state => ({
  state: { ...state, step: 'login-password', profile: withoutPassword(state.profile) },
  messages: [{ role: 'assistant', text: `Contraseña de ${state.profile.email}.` }]
})

const backToReview = (state, draft) => ({
  state: { ...state, step: 'review', loginAttempts: 0, profile: withoutPassword(state.profile) },
  messages: [
    { role: 'assistant', text: 'Tu horario sigue marcado.' },
    receipt(draft),
    { role: 'assistant', text: '¿Seguimos con esta reserva?' }
  ]
})

const leaveLogin = (state, draft, input) => {
  if (input.id === 'switch-register') return startRegister(state)
  if (input.id === 'back') return backToReview(state, draft)
  if (input.id === 'other-email') return otherEmail(state)
  if (input.id === 'retry' && state.step !== 'login-locked') return retryPassword(state)

  return null
}

export function loginFailure(state) {
  const attempts = (state.loginAttempts || 0) + 1
  const next = { ...state, loginAttempts: attempts, profile: withoutPassword(state.profile) }

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return {
      state: { ...next, step: 'login-locked' },
      messages: [
        {
          role: 'assistant',
          text: `Tres intentos con ${state.profile.email}. Paramos ese correo.`
        }
      ]
    }
  }

  const left = MAX_LOGIN_ATTEMPTS - attempts
  const leftText = left === 1 ? 'Te queda 1 intento con este correo.' : `Te quedan ${left} intentos con este correo.`

  return {
    state: { ...next, step: 'login-retry' },
    messages: [{ role: 'assistant', text: `No coinciden. ${leftText}` }]
  }
}

export function sessionFailure(state) {
  return {
    state: { ...state, step: 'login-retry', profile: withoutPassword(state.profile) },
    messages: [{ role: 'assistant', text: 'No pudimos abrir la sesión.' }]
  }
}

export function applyBookingTurn(state, draft, input, { authenticated, playerName }) {
  if (state.step === 'review') {
    if (input.id === 'change') {
      return {
        state,
        close: true,
        messages: [{ role: 'assistant', text: 'Ajusta las horas en el calendario.' }]
      }
    }

    if (input.id !== 'agree' || draft.hours < 1 || draft.hours > MAX_HOURS) {
      return { state, messages: [{ role: 'assistant', text: 'Elige de 1 a 3 horas seguidas.' }] }
    }

    if (authenticated) {
      return {
        state: { ...state, step: 'payment' },
        messages: playerName
          ? [{ role: 'assistant', text: `Listo, ${playerName}.` }, ...paymentAsk(draft)]
          : paymentAsk(draft)
      }
    }

    return {
      state: { ...state, step: 'account' },
      messages: [{ role: 'assistant', text: 'Necesitas una cuenta para ver tus reservas. ¿Entras o la creamos?' }]
    }
  }

  if (state.step === 'account') {
    if (input.id === 'login') {
      return {
        state: { ...state, step: 'login-email' },
        messages: [{ role: 'assistant', text: '¿Cuál es tu correo?' }]
      }
    }

    if (input.id === 'register') {
      return {
        state: { ...state, step: 'reg-name' },
        messages: [{ role: 'assistant', text: '¿Con qué nombre creamos la cuenta?' }]
      }
    }
  }

  const value = String(input.value || '').trim()
  const digits = value.replace(/\D/g, '')

  if (state.step === 'login-email' || state.step === 'login-password' || state.step === 'login-retry' || state.step === 'login-locked') {
    const left = leaveLogin(state, draft, input)

    if (left) return left

    if (state.step === 'login-retry' || state.step === 'login-locked') {
      return { state, messages: [{ role: 'assistant', text: 'Elige una de las opciones para seguir.' }] }
    }
  }

  if (state.step === 'login-email') {
    if (!isEmail(value)) {
      return { state, messages: [{ role: 'assistant', text: 'Ese correo no es válido.' }] }
    }

    return {
      state: withProfile(state, { email: value.toLowerCase() }, 'login-password'),
      messages: [{ role: 'assistant', text: 'Tu contraseña.' }]
    }
  }

  if (state.step === 'login-password') {
    if (value.length < 8) {
      return { state, messages: [{ role: 'assistant', text: 'Mínimo 8 caracteres.' }] }
    }

    return {
      state: withProfile(state, { password: value }),
      messages: [],
      effect: 'login'
    }
  }

  if (state.step === 'reg-name') {
    if (value.length < 3) {
      return { state, messages: [{ role: 'assistant', text: 'Escribe tu nombre.' }] }
    }

    return {
      state: withProfile(state, { name: value }, 'reg-email'),
      messages: [{ role: 'assistant', text: '¿Cuál es tu correo?' }]
    }
  }

  if (state.step === 'reg-email') {
    if (!isEmail(value)) {
      return { state, messages: [{ role: 'assistant', text: 'Ese correo no es válido.' }] }
    }

    return {
      state: withProfile(state, { email: value.toLowerCase() }),
      messages: [],
      effect: 'check-email'
    }
  }

  if (state.step === 'reg-password') {
    if (value.length < 8) {
      return { state, messages: [{ role: 'assistant', text: 'Mínimo 8 caracteres.' }] }
    }

    return {
      state: withProfile(state, { password: value }, 'reg-password-confirm'),
      messages: [{ role: 'assistant', text: 'Confírmala.' }]
    }
  }

  if (state.step === 'reg-password-confirm') {
    if (value !== state.profile.password) {
      return { state, messages: [{ role: 'assistant', text: 'No coinciden. Escríbela otra vez.' }] }
    }

    return {
      state: { ...state, step: 'reg-doc' },
      messages: [{ role: 'assistant', text: 'Los 8 números de tu DNI.' }]
    }
  }

  if (state.step === 'reg-doc') {
    if (!/^\d{8}$/.test(digits)) {
      return { state, messages: [{ role: 'assistant', text: 'El DNI tiene 8 números.' }] }
    }

    return {
      state: withProfile(state, { dni: digits }),
      messages: [],
      effect: 'check-document'
    }
  }

  if (state.step === 'reg-phone') {
    if (!/^9\d{8}$/.test(digits)) {
      return {
        state,
        messages: [{ role: 'assistant', text: 'Solo los 9 dígitos. El +51 ya está puesto.' }]
      }
    }

    return {
      state: withProfile(state, { phone: digits }),
      messages: [],
      effect: 'register'
    }
  }

  if (state.step === 'payment') {
    const file = input.file

    if (!file || !String(file.type || '').startsWith('image/')) {
      return { state, messages: [{ role: 'assistant', text: 'Tiene que ser una imagen de la captura de Yape.' }] }
    }

    if (file.size > MAX_CAPTURE_BYTES) {
      return { state, messages: [{ role: 'assistant', text: 'La imagen pesa más de 5 MB.' }] }
    }

    return {
      state: { ...state, step: 'done', captureFile: file, profile: { ...state.profile, password: '' } },
      messages: [
        { role: 'assistant', text: `Recibí la captura. Son ${formatMoney(draft.total)}.` },
        { role: 'assistant', text: 'Estate atento: en unos minutos el encargado valida tu Yape y te confirma.' }
      ]
    }
  }

  return { state, messages: [], playerName }
}

export function signedInState(state, draft, name) {
  return {
    state: {
      ...state,
      step: 'payment',
      profile: { ...state.profile, password: '', name: name || state.profile.name }
    },
    messages: readyMessages(draft, name || state.profile.name)
  }
}
