import { useRef, useCallback } from 'react'

// Hook - useCache
export const useCache = (maxSize = 50) => {
  const cacheRef = useRef(new Map())
  const maxSizeRef = useRef(maxSize)

  const get = useCallback((key) => {
    return cacheRef.current.get(key)
  }, [])

  const set = useCallback((key, value) => {
    // Si el cache está lleno, eliminar el más antiguo
    if (cacheRef.current.size >= maxSizeRef.current) {
      const firstKey = cacheRef.current.keys().next().value
      cacheRef.current.delete(firstKey)
    }

    cacheRef.current.set(key, value)
  }, [])

  const has = useCallback((key) => {
    return cacheRef.current.has(key)
  }, [])

  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const size = useCallback(() => {
    return cacheRef.current.size
  }, [])

  return { get, set, has, clear, size }
}

export default useCache
