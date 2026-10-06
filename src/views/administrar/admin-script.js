import {
  WEEKDAYS,
  SHORT_DAYS,
  blockExtendsOutside,
  closeInstants,
  formatDays,
  formatMoney,
  formatRanges,
  priceOutcome,
  publishSchedules,
  rangesTouchingBlocks,
  toReplacePayload
} from './schedule-model'

const DAY_CHOICES = WEEKDAYS.map(id => ({ id, label: SHORT_DAYS[id] }))

export const initialAdminState = () => ({
  step: 'intent',
  scope: 'once',
  days: [],
  price: '',
  reason: ''
})

const repeatChoices = [
  { id: 'once', label: 'Solo este día', primary: true },
  { id: 'days', label: 'Otros días de la semana' },
  { id: 'all', label: 'Todos los días' }
]

export function openingMessages() {
  return [
    {
      role: 'assistant',
      text: 'Las horas en verde son las que elegiste. Puedes ponerles un precio para que el jugador las reserve, o dejarlas no disponibles para que nadie las tome.'
    }
  ]
}

export function composerFor(state) {
  if (state.step === 'intent') {
    return {
      type: 'choices',
      choices: [
        { id: 'publish', label: 'Ponerles precio', primary: true },
        { id: 'close', label: 'Dejarlas no disponibles' },
        ...(state.canOpen ? [{ id: 'open', label: 'Volver a dejarlas disponibles' }] : [])
      ]
    }
  }

  if (state.step === 'repeat' || state.step === 'close-repeat') return { type: 'choices', choices: repeatChoices }

  if (state.step === 'days' || state.step === 'close-days') {
    return { type: 'days', days: DAY_CHOICES, selected: state.days }
  }

  if (state.step === 'price') {
    return { type: 'text', placeholder: 'Precio por hora, ej. 80', inputMode: 'decimal' }
  }

  if (state.step === 'reason') {
    return {
      type: 'text',
      placeholder: 'Motivo, si quieres',
      alternatives: [{ id: 'no-reason', label: 'Seguir sin motivo' }]
    }
  }

  if (state.step === 'confirm') {
    return {
      type: 'choices',
      choices: [
        { id: 'yes', label: 'Sí, confirmar', primary: true },
        { id: 'back', label: 'Volver a empezar' }
      ]
    }
  }

  return null
}

const scopeDays = (scope, days, weekday) => {
  if (scope === 'all') return [...WEEKDAYS]
  if (scope === 'days') return days

  return [weekday]
}

const scopeLabel = (scope, days) => {
  if (scope === 'once') return 'solo este día'
  if (scope === 'all') return 'todos los días'

  return formatDays(days)
}

export function applyAdminTurn(state, draft, input) {
  if (state.step === 'intent' && input.id === 'publish') {
    return {
      state: { ...state, step: 'repeat' },
      messages: [
        {
          role: 'assistant',
          text: '¿Este precio vale solo este día, o también otros días?'
        }
      ]
    }
  }

  if (state.step === 'intent' && input.id === 'close') {
    return {
      state: { ...state, step: 'close-repeat' },
      messages: [
        {
          role: 'assistant',
          text: '¿Nadie puede reservarlas solo este día, o también otros días? Si eliges otros días, quedan así las próximas 8 semanas.'
        }
      ]
    }
  }

  if (state.step === 'intent' && input.id === 'open') {
    const blocks = rangesTouchingBlocks(draft.blocks, draft.date, draft.ranges)
    const wider = blocks.some(block => blockExtendsOutside(block, draft.date, draft.ranges))

    return {
      state: { ...state, step: 'confirm', intent: 'open' },
      messages: [
        {
          role: 'assistant',
          text: wider
            ? 'Esas horas están bloqueadas junto con otras. Si las abro, se abren todas. ¿Sigo?'
            : '¿Las dejo disponibles otra vez para que el jugador pueda reservarlas?'
        }
      ]
    }
  }

  if ((state.step === 'repeat' || state.step === 'close-repeat') && input.id) {
    const closing = state.step === 'close-repeat'
    const scope = input.id

    if (scope === 'days') {
      return {
        state: { ...state, scope, days: [draft.weekday], step: closing ? 'close-days' : 'days' },
        messages: [{ role: 'assistant', text: 'Elige los días de la semana y toca Listo.' }]
      }
    }

    return {
      state: { ...state, scope, days: scopeDays(scope, [], draft.weekday), step: closing ? 'reason' : 'price' },
      messages: [
        {
          role: 'assistant',
          text: closing
            ? 'Si quieres, escribe por qué no se pueden reservar. Si no, sigue sin motivo.'
            : '¿Cuánto cobras por cada hora? Por ejemplo, 80.'
        }
      ]
    }
  }

  if ((state.step === 'days' || state.step === 'close-days') && input.id === 'days') {
    const closing = state.step === 'close-days'

    return {
      state: { ...state, days: input.days, step: closing ? 'reason' : 'price' },
      messages: [
        {
          role: 'assistant',
          text: closing
            ? 'Si quieres, escribe por qué no se pueden reservar. Si no, sigue sin motivo.'
            : '¿Cuánto cobras por cada hora? Por ejemplo, 80.'
        }
      ]
    }
  }

  if (state.step === 'price') {
    const price = Number(String(input.value || '').replace(',', '.'))

    if (!Number.isFinite(price) || price <= 0) {
      return { state, messages: [{ role: 'assistant', text: 'Escribe el precio en soles. Por ejemplo, 80.' }] }
    }

    const action = {
      days: scopeDays(state.scope, state.days, draft.weekday),
      ranges: draft.ranges,
      price,
      scope: state.scope === 'once' ? 'once' : 'weekly',
      date: draft.date
    }
    const outcome = priceOutcome(draft.schedules, action)
    const when = scopeLabel(state.scope, action.days)
    const summary = `${formatRanges(draft.ranges)}, ${when}, ${formatMoney(price)} la hora.`

    if (outcome.kind === 'same') {
      return {
        state: { ...state, step: 'done', price: String(price) },
        messages: [{ role: 'assistant', text: `Esas horas ya están a ${formatMoney(price)}.` }]
      }
    }

    const replace =
      outcome.kind === 'replace'
        ? ` Antes costaban ${outcome.prices.map(formatMoney).join(', ')}. Ahora quedan en ${formatMoney(price)}.`
        : ''
    const closed = rangesTouchingBlocks(draft.blocks, draft.date, draft.ranges).length
      ? ' Algunas siguen no disponibles: ábrelas si quieres que se reserven.'
      : ''

    return {
      state: { ...state, step: 'confirm', intent: 'publish', price: String(price), days: action.days },
      messages: [
        {
          role: 'assistant',
          text: `${summary} El jugador podrá reservarlas.${replace}${closed} ¿Lo guardo?`
        }
      ]
    }
  }

  if (state.step === 'reason' || (state.step === 'reason' && input.id === 'no-reason')) {
    const reason = input.id === 'no-reason' ? '' : String(input.value || '').trim()
    const days = scopeDays(state.scope, state.days, draft.weekday)

    return {
      state: { ...state, step: 'confirm', intent: 'close', reason, days },
      messages: [
        {
          role: 'assistant',
          text: `${formatRanges(draft.ranges)}, ${scopeLabel(state.scope, days)}, quedan no disponibles. Nadie podrá reservarlas. ¿Lo guardo?`
        }
      ]
    }
  }

  if (state.step === 'confirm' && input.id === 'back') {
    return {
      state: { ...initialAdminState(), canOpen: state.canOpen },
      messages: [{ role: 'assistant', text: 'De acuerdo. ¿Qué quieres hacer con estas horas?' }]
    }
  }

  if (state.step === 'confirm' && input.id === 'yes') {
    if (state.intent === 'publish') {
      const next = publishSchedules(draft.schedules, {
        days: state.days,
        ranges: draft.ranges,
        price: Number(state.price),
        scope: state.scope === 'once' ? 'once' : 'weekly',
        date: draft.date
      })

      return {
        state: { ...state, step: 'done' },
        messages: [],
        effect: 'save-price',
        payload: toReplacePayload(next)
      }
    }

    if (state.intent === 'close') {
      return {
        state: { ...state, step: 'done' },
        messages: [],
        effect: 'save-close',
        payload: closeInstants(draft.date, draft.ranges, state.scope, state.days).map(item => ({
          fecha_inicio: item.fecha_inicio,
          fecha_fin: item.fecha_fin,
          motivo: state.reason || null,
          estado: true
        }))
      }
    }

    return {
      state: { ...state, step: 'done' },
      messages: [],
      effect: 'save-open',
      payload: rangesTouchingBlocks(draft.blocks, draft.date, draft.ranges).map(block => block.id)
    }
  }

  return { state, messages: [] }
}
