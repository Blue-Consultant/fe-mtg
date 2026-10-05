'use client'

import { useCallback, useState } from 'react'
import * as React from 'react'

/**
 * React 18 no exporta useOptimistic; ese hook existe desde React 19.
 * Mientras tanto se usa el mismo contrato: el valor optimista se ve al instante
 * y se descarta cuando el estado real cambia.
 */
function useOptimisticPolyfill(passthrough, reducer) {
  const [base, setBase] = useState(passthrough)
  const [overlay, setOverlay] = useState(null)

  if (passthrough !== base) {
    setBase(passthrough)
    if (overlay !== null) setOverlay(null)
  }

  const dispatch = useCallback(
    action => {
      setOverlay(current => reducer(current ?? passthrough, action))
    },
    [passthrough, reducer]
  )

  return [overlay ?? passthrough, dispatch]
}

export const useOptimistic = React.useOptimistic ?? useOptimisticPolyfill

export function appendMessages(current, incoming) {
  const items = Array.isArray(incoming) ? incoming : [incoming]

  return [...current, ...items]
}
