const DAY_START = 0
const DAY_END = 24 * 60

const SHORT_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

export function timeToMinutes(value) {
  const [h, m] = String(value || '0:0')
    .split(':')
    .map(Number)

  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(total) {
  const h = Math.floor(total / 60) % 24
  const m = total % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function toYYYYMMDD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

export function parseYYYYMMDD(value) {
  const [y, m, d] = String(value || '')
    .split('-')
    .map(Number)

  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDaysYmd(value, days) {
  const date = parseYYYYMMDD(value)

  date.setDate(date.getDate() + days)

  return toYYYYMMDD(date)
}

export function weekdayOf(value) {
  return parseYYYYMMDD(value).getDay()
}

export function mondayOf(value) {
  const date = parseYYYYMMDD(value)
  const diff = (date.getDay() + 6) % 7

  date.setDate(date.getDate() - diff)

  return toYYYYMMDD(date)
}

export function ymdFromApi(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/)

  return match ? match[1] : null
}

function spanEnd(start, end) {
  return end <= start ? end + 24 * 60 : end
}

function atMinutes(fecha, minutes) {
  const date = parseYYYYMMDD(fecha)

  date.setMinutes(minutes)

  return date
}

export function calendarStamp(fecha, minutes) {
  const date = atMinutes(fecha, minutes)
  const pad = value => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function normalizeSchedules(rows) {
  return (rows || [])
    .map(row => {
      const start = timeToMinutes(row.hora_inicio)

      return {
        courtId: Number(row.cancha_id),
        day: Number(row.dia_semana),
        start,
        end: spanEnd(start, timeToMinutes(row.hora_fin)),
        price: Number(row.precio) || 0,
        from: ymdFromApi(row.vigencia_desde),
        to: ymdFromApi(row.vigencia_hasta)
      }
    })
    .filter(row => row.end > row.start)
}

export function normalizeBlocks(rows) {
  return (rows || [])
    .map(row => ({
      courtId: Number(row.cancha_id),
      id: row.id,
      from: new Date(row.fecha_inicio).getTime(),
      to: new Date(row.fecha_fin).getTime(),
      reason: row.motivo || ''
    }))
    .filter(row => Number.isFinite(row.from) && Number.isFinite(row.to) && row.to > row.from)
}

function coversDate(row, date) {
  if (row.from && date < row.from) return false
  if (row.to && date > row.to) return false

  return true
}

function timeOverlap(row, start, end) {
  return row.start < end && start < row.end
}

function splitTime(row, start, end) {
  const pieces = []

  if (row.start < start) pieces.push({ ...row, end: Math.min(row.end, start) })
  if (row.end > end) pieces.push({ ...row, start: Math.max(row.start, end) })

  return pieces.filter(piece => piece.end > piece.start)
}

function mergeRows(rows) {
  const sorted = [...rows].sort(
    (a, b) =>
      a.day - b.day ||
      String(a.from || '').localeCompare(String(b.from || '')) ||
      String(a.to || '').localeCompare(String(b.to || '')) ||
      a.start - b.start ||
      a.price - b.price
  )
  const out = []

  sorted.forEach(row => {
    const prev = out[out.length - 1]

    if (
      prev &&
      prev.day === row.day &&
      prev.price === row.price &&
      prev.from === row.from &&
      prev.to === row.to &&
      prev.end >= row.start
    ) {
      prev.end = Math.max(prev.end, row.end)

      return
    }

    out.push({ ...row })
  })

  return out
}

function carveOnce(row, date, start, end) {
  if (!coversDate(row, date) || !timeOverlap(row, start, end)) return [row]

  if (row.from === date && row.to === date) return splitTime(row, start, end)

  const before = addDaysYmd(date, -1)
  const after = addDaysYmd(date, 1)
  const pieces = []

  if ((!row.from || row.from <= before) && (!row.to || row.to >= row.from || !row.from)) {
    const to = !row.to || row.to > before ? before : row.to

    if (!row.from || row.from <= to) pieces.push({ ...row, to })
  }

  if (!row.to || row.to >= after) {
    const from = !row.from || row.from < after ? after : row.from

    if (!row.to || from <= row.to) pieces.push({ ...row, from })
  }

  pieces.push(...splitTime({ ...row, from: date, to: date }, start, end))

  return pieces
}

export function publishSchedules(rows, { days, ranges, start, end, price, scope, date }) {
  const pieces = ranges || [{ start, end }]

  return pieces.reduce(
    (current, range) => publishOne(current, { days, start: range.start, end: range.end, price, scope, date }),
    rows
  )
}

function publishOne(rows, { days, start, end, price, scope, date }) {
  let next = rows.map(row => ({ ...row }))

  days.forEach(day => {
    const carved = []

    next.forEach(row => {
      if (row.day !== day || !timeOverlap(row, start, end)) {
        carved.push(row)

        return
      }

      if (scope === 'once') {
        carved.push(...carveOnce(row, date, start, end))

        return
      }

      carved.push(...splitTime(row, start, end))
    })

    carved.push({
      day,
      start,
      end,
      price: Number(price),
      from: scope === 'once' ? date : null,
      to: scope === 'once' ? date : null
    })
    next = mergeRows(carved)
  })

  return next
}

function matchingRows(rows, { days, ranges, start, end, scope, date }) {
  const pieces = ranges || [{ start, end }]

  return rows.filter(row => {
    if (!days.includes(row.day) || !pieces.some(range => timeOverlap(row, range.start, range.end))) return false
    if (scope === 'once') return coversDate(row, date)

    return true
  })
}

function rangeCovered(rows, day, start, end, price, scope, date) {
  let cursor = start
  const parts = rows
    .filter(row => {
      if (row.day !== day || row.price !== price || !timeOverlap(row, start, end)) return false
      if (scope === 'once') return coversDate(row, date)

      return !row.from && !row.to
    })
    .sort((a, b) => a.start - b.start)

  parts.forEach(part => {
    if (part.start > cursor) return
    if (part.end > cursor) cursor = part.end
  })

  return cursor >= end
}

export function priceOutcome(rows, action) {
  const hits = matchingRows(rows, action)
  const prices = [...new Set(hits.map(row => row.price))]
  const pieces = action.ranges || [{ start: action.start, end: action.end }]
  const covered = action.days.every(day =>
    pieces.every(range => rangeCovered(rows, day, range.start, range.end, Number(action.price), action.scope, action.date))
  )

  if (covered && prices.length === 1 && prices[0] === Number(action.price)) return { kind: 'same', prices }
  if (prices.length > 0) return { kind: 'replace', prices }

  return { kind: 'new', prices }
}

export function toReplacePayload(rows) {
  return rows.map(row => ({
    dia_semana: [row.day],
    hora_inicio: minutesToTime(row.start),
    hora_fin: minutesToTime(row.end),
    precio: row.price,
    estado: true,
    ...(row.from ? { vigencia_desde: row.from } : {}),
    ...(row.to ? { vigencia_hasta: row.to } : {})
  }))
}

export function toggleHour(ranges, startM) {
  const hours = (ranges || []).flatMap(range => {
    const list = []

    for (let cursor = range.start; cursor < range.end; cursor += 60) list.push(cursor)

    return list
  })
  const next = hours.includes(startM)
    ? hours.filter(hour => hour !== startM)
    : [...hours, startM].sort((left, right) => left - right)

  return next.reduce((list, hour) => {
    const last = list[list.length - 1]

    if (last && last.end === hour) last.end += 60
    else list.push({ start: hour, end: hour + 60 })

    return list
  }, [])
}

export function hourSlots() {
  const slots = []

  for (let cursor = DAY_START; cursor + 60 <= DAY_END; cursor += 60) {
    const end = cursor + 60

    slots.push({
      start: minutesToTime(cursor),
      end: end === DAY_END ? '24:00' : minutesToTime(end),
      startM: cursor,
      endM: end
    })
  }

  return slots
}

export function slotKind({ fecha, start, end, schedules, blocks, occupied }) {
  const day = weekdayOf(fecha)
  const startM = timeToMinutes(start)
  const endM = end === '24:00' ? DAY_END : spanEnd(startM, timeToMinutes(end))
  const slotFrom = atMinutes(fecha, startM).getTime()
  const slotTo = atMinutes(fecha, endM).getTime()
  const booked = (occupied || []).some(row => {
    const rowStart = timeToMinutes(row.hora_inicio)
    const rowEnd = spanEnd(rowStart, timeToMinutes(row.hora_fin))

    return rowStart < endM && rowEnd > startM
  })

  if (booked) return { kind: 'booked', label: 'Reservada' }

  const block = (blocks || []).find(item => item.from < slotTo && item.to > slotFrom)

  if (block) return { kind: 'closed', label: 'Cerrada', block }

  const priced = (schedules || []).filter(
    row => row.day === day && coversDate(row, fecha) && row.start <= startM && row.end >= endM
  )
  const specific =
    priced.find(row => row.from === fecha && row.to === fecha) ||
    priced.sort((a, b) => {
      const span = row => (row.from && row.to ? 0 : 1)

      return span(a) - span(b)
    })[0]

  if (specific) {
    const price = Number.isInteger(specific.price) ? specific.price : specific.price.toFixed(2)

    return { kind: 'priced', label: `S/ ${price}`, price: specific.price }
  }

  return { kind: 'empty', label: 'Sin precio' }
}

export function rangesTouchingBlocks(blocks, fecha, ranges) {
  return (blocks || []).filter(block =>
    ranges.some(range => {
      const from = atMinutes(fecha, range.start).getTime()
      const to = atMinutes(fecha, range.end).getTime()

      return block.from < to && block.to > from
    })
  )
}

export function blockExtendsOutside(block, fecha, ranges) {
  const start = Math.min(...ranges.map(range => range.start))
  const end = Math.max(...ranges.map(range => range.end))
  const from = atMinutes(fecha, start).getTime()
  const to = atMinutes(fecha, end).getTime()

  return block.from < from || block.to > to
}

export function closeInstants(fecha, ranges, scope, days) {
  const dates = []

  if (scope === 'once') {
    dates.push(fecha)
  } else {
    const first = parseYYYYMMDD(fecha)

    for (let offset = 0; offset < 56; offset += 1) {
      const date = new Date(first)

      date.setDate(first.getDate() + offset)
      const value = toYYYYMMDD(date)

      if (scope === 'all' || days.includes(date.getDay())) dates.push(value)
    }
  }

  return dates.flatMap(date =>
    ranges.map(range => ({
      fecha: date,
      fecha_inicio: atMinutes(date, range.start).toISOString(),
      fecha_fin: atMinutes(date, range.end).toISOString()
    }))
  )
}

export function formatRanges(ranges) {
  const clock = total => (total === DAY_END ? '24:00' : minutesToTime(total))

  return ranges.map(range => `${clock(range.start)}–${clock(range.end)}`).join(' y ')
}

export function formatDays(days) {
  return WEEKDAYS.filter(day => days.includes(day))
    .map(day => SHORT_DAYS[day])
    .join(', ')
}

export function formatLongDate(value) {
  const label = parseYYYYMMDD(value).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMoney(amount) {
  const value = Number(amount) || 0

  return Number.isInteger(value) ? `S/ ${value}` : `S/ ${value.toFixed(2)}`
}

export function freeRanges(fecha, schedules, blocks, occupied) {
  const open = []
  let cursor = null

  hourSlots().forEach(slot => {
    const status = slotKind({ fecha, ...slot, schedules, blocks, occupied })

    if (status.kind === 'booked') {
      cursor = null

      return
    }

    const start = timeToMinutes(slot.start)
    const end = timeToMinutes(slot.end)

    if (!cursor) {
      cursor = { start, end }
      open.push(cursor)

      return
    }

    cursor.end = end
  })

  return open
}

export { DAY_START, DAY_END, SHORT_DAYS }
