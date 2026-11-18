import '@testing-library/jest-dom'

// Default base URL for unit tests
import.meta.env.VITE_API_BASE_URL = 'http://localhost:7071/api'

if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage?.getItem !== 'function') {
  const store = new Map()
  const storage = {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, val) => { store.set(String(key), String(val)) },
    removeItem: (key) => { store.delete(String(key)) },
    clear: () => { store.clear() },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size },
  }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true })
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: storage, writable: true, configurable: true })
  }
}

