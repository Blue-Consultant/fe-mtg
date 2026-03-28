import axios from '@/utils/axios'

export const listMyCourtFavorites = async () => {
  const { data } = await axios.get('court-favorites/me')

  return Array.isArray(data) ? data : []
}

export const checkCourtFavorite = async courtId => {
  const { data } = await axios.get(`court-favorites/check/${courtId}`, { _skipRetry: true })

  return !!data?.isFavorite
}

export const toggleCourtFavorite = async courtId => {
  const { data } = await axios.post(`court-favorites/toggle/${courtId}`)

  return !!data?.isFavorite
}
