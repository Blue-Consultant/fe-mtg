const countWords = str => str.trim().split(/\s+/).filter(Boolean).length

const hasWordTooLong = (str, maxLength) =>
  str
    .trim()
    .split(/\s+/)
    .some(word => word.length > maxLength)

export const validateName = name => {
  if (countWords(name) > 5) return 'El nombre, traducción no debe tener más de 5 palabras.'
  if (name.length > 50) return 'El nombre, traducción no debe tener más de 50 caracteres.'
  if (hasWordTooLong(name, 60)) return 'Ninguna palabra del nombre, traducción debe tener más de 60 caracteres.'

  return null
}

export const validateDescription = (description = '') => {
  if (countWords(description) > 150) return 'La descripción no debe tener más de 150 palabras.'
  if (hasWordTooLong(description, 60)) return 'Ninguna palabra de la descripción debe tener más de 60 caracteres.'

  return null
}
