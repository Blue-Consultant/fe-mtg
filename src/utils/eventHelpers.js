export const getFirstName = fullName => {
  if (!fullName) return ''

  return fullName.trim().split(' ')[0]
}

export const formatTime = date => {
  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${hours}:${minutes} ${ampm}`
}

export const isNewEvent = selectedEvent => !selectedEvent || !selectedEvent.id

export const capitalize = string => string && string[0].toUpperCase() + string.slice(1)

export const createEventForDay = (day, startDate, endDate, baseEvent) => {
  const eventStart = new Date(day)
  const eventEnd = new Date(day)

  eventStart.setHours(startDate.getHours(), startDate.getMinutes())
  eventEnd.setHours(endDate.getHours(), endDate.getMinutes())

  return {
    ...baseEvent,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    start: eventStart,
    end: eventEnd
  }
}

export const getEventColor = (customColor, teacher, defaultColor = '#FF741F') =>
  customColor || teacher?.color || defaultColor

export const generateEventTitle = (teacherName, startDate, endDate) => {
  const startTime = formatTime(startDate)
  const endTime = formatTime(endDate)

  return `${teacherName} - ${startTime} - ${endTime}`
}

export const getEventColorWithTransparency = (customColor, teacher, defaultColor = '#FF741F', opacity = 0.3) => {
  const baseColor = customColor || teacher?.color || defaultColor

  if (baseColor && baseColor.startsWith('#')) {
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return baseColor || defaultColor
}
