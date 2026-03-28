import { createSlice } from '@reduxjs/toolkit'

/** Etiquetas alineadas con `calendarsColor` en CalendarWrapper */
const ALL_CALENDAR_LABELS = ['Personal', 'Business', 'Family', 'Holiday', 'ETC']

const genId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/**
 * Normaliza eventos de FullCalendar o del formulario a un objeto guardable en el store.
 */
const normalizeStoredEvent = raw => {
  if (raw == null) return null
  const id = raw.id != null ? String(raw.id) : genId()
  const start = raw.start
  const end = raw.end != null ? raw.end : start

  return {
    id,
    title: raw.title ?? '',
    start,
    end,
    allDay: !!raw.allDay,
    url: raw.url ?? '',
    display: raw.display ?? 'block',
    extendedProps: {
      calendar: raw.extendedProps?.calendar ?? 'Business',
      guests: raw.extendedProps?.guests ?? [],
      description: raw.extendedProps?.description ?? ''
    }
  }
}

const applyCalendarFilter = (allEvents, selectedCalendars) => {
  if (!selectedCalendars.length) return []

  return allEvents.filter(ev => {
    const cal = ev.extendedProps?.calendar ?? ''

    return selectedCalendars.includes(cal)
  })
}

const initialState = {
  /** Eventos filtrados que recibe FullCalendar */
  events: [],

  /** Fuente de verdad (sin filtrar por checkbox) */
  allEvents: [],
  selectedEvent: null,
  selectedCalendars: [...ALL_CALENDAR_LABELS]
}

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    addEvent: (state, action) => {
      const ev = normalizeStoredEvent({ ...action.payload, id: action.payload.id ?? genId() })

      state.allEvents.push(ev)
      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    },
    deleteEvent: (state, action) => {
      const id = String(action.payload)

      state.allEvents = state.allEvents.filter(e => String(e.id) !== id)
      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    },
    updateEvent: (state, action) => {
      const normalized = normalizeStoredEvent(action.payload)
      const idx = state.allEvents.findIndex(e => String(e.id) === String(normalized.id))

      if (idx >= 0) {
        state.allEvents[idx] = { ...state.allEvents[idx], ...normalized }
      } else {
        state.allEvents.push(normalized)
      }

      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    },
    selectedEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    filterEvents: state => {
      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    },
    filterCalendarLabel: (state, action) => {
      const key = action.payload
      const i = state.selectedCalendars.indexOf(key)

      if (i > -1) {
        state.selectedCalendars.splice(i, 1)
      } else {
        state.selectedCalendars.push(key)
      }

      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    },
    filterAllCalendarLabels: (state, action) => {
      const checked = action.payload

      state.selectedCalendars = checked ? [...ALL_CALENDAR_LABELS] : []
      state.events = applyCalendarFilter(state.allEvents, state.selectedCalendars)
    }
  }
})

export const {
  addEvent,
  deleteEvent,
  updateEvent,
  selectedEvent,
  filterEvents,
  filterCalendarLabel,
  filterAllCalendarLabels
} = calendarSlice.actions

export default calendarSlice.reducer
