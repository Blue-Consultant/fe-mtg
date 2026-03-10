// Third-party Imports
import 'server-only'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  es: () => import('@/data/dictionaries/es.json').then(module => module.default)
}

// Usamos un cache en memoria para almacenar las traducciones ya cargadas
const translationCache = {}

export const getDictionary = async locale => {
  // Validar que el locale sea soportado, si no, usar 'es' como predeterminado
  const validLocale = dictionaries[locale] ? locale : 'es'

  // Si la traducción ya está en el cache, la devolvemos directamente
  if (translationCache[validLocale]) {
    return translationCache[validLocale]
  }

  // Si no está en el cache, la cargamos de manera dinámica y la guardamos en el cache
  const dictionary = await dictionaries[validLocale]()

  translationCache[validLocale] = dictionary

  return dictionary
}
