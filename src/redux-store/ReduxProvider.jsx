'use client'

// Third-party Imports
import { useEffect, useState } from 'react'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from '@/redux-store'

const ReduxProvider = ({ children }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Verificar si estamos en el lado del cliente
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ReduxProvider
