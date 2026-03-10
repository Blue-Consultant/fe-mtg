import { useCallback, useRef } from 'react'

// Hook - useDebounce
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null)

  const debouncedCallback = useCallback((...args) => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])

  return debouncedCallback
}

export default useDebounce
