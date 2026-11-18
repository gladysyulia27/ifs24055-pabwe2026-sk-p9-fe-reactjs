import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); history.pushState({}, '', '/') })

describe('Delcom Blog SPA', () => {
  it('renders the public landing page and category navigation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'success', data: [] }) }))
    render(<App />)
    expect(screen.getByText(/Cerita yang baik/i)).toBeTruthy()
    expect(screen.getByText('Teknologi')).toBeTruthy()
  })
})
