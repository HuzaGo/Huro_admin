'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Use a ref to ensure the store is only created once per request in SSR
  const storeRef = useRef(store)

  return <Provider store={storeRef.current}>{children}</Provider>
}
