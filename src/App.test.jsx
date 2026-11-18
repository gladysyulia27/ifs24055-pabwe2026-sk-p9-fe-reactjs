import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import Swal from 'sweetalert2'

const refControl = vi.hoisted(() => ({ forceNull: false }))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: actual.default,
    useRef: (init) => {
      const realRef = actual.useRef(init)
      if (refControl.forceNull) {
        return Object.defineProperty({}, 'current', {
          get: () => null,
          set: () => {},
          configurable: true,
        })
      }
      return realRef
    },
  }
})

vi.mock('@tabler/icons-react', () => ({
  IconEye: () => <span data-testid="icon-eye" />,
  IconShield: () => <span data-testid="icon-shield" />,
  IconLock: () => <span data-testid="icon-lock" />,
}))

export const editorState = {
  lastInstance: null,
  lastViewer: null,
  factoryReturnNull: false,
}

vi.mock('@toast-ui/editor', () => {
  class MockEditor {
    constructor(options = {}) {
      this.options = options
      this.markdown = options.initialValue || ''
      this.listeners = {}
      if (options.events?.change) {
        this.listeners.change = options.events.change
      }
      editorState.lastInstance = this
    }
    on(event, cb) {
      this.listeners[event] = cb
    }
    triggerChange(newMd) {
      if (newMd !== undefined) this.markdown = newMd
      if (this.listeners.change) this.listeners.change()
    }
    getMarkdown() {
      return this.markdown
    }
    setMarkdown(md) {
      this.markdown = md
    }
    destroy() {
      this.destroyed = true
    }
    static factory(options = {}) {
      if (editorState.factoryReturnNull) {
        return null
      }
      const viewer = {
        options,
        markdown: options.initialValue || '',
        setMarkdown(md) {
          this.markdown = md
        },
        destroy() {
          this.destroyed = true
        },
      }
      editorState.lastViewer = viewer
      return viewer
    }
  }
  return { default: MockEditor }
})

import App from './App'
import MarkdownEditor from './components/MarkdownEditor'
import MarkdownViewer from './components/MarkdownViewer'
import AdminDashboard from './features/admin/components/AdminDashboard'
import { getAdminPosts, getAdminUserPosts, getAdminUsers } from './features/admin/api/adminApi'
import { getProfile, loginAuthor, registerAuthor, updateProfile } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import {
  createPost,
  deletePost,
  generateArticle,
  getMyPosts,
  getPostStats,
  getPublicPost,
  getPublicPosts,
  togglePostPublication,
  updatePost,
} from './features/blog/api/blogApi'
import { apiRequest } from './helpers/apiHelper'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from './helpers/toolsHelper'
import useInput from './hooks/useInput'
import { ACCENTS, useTheme } from './hooks/useTheme'

beforeEach(() => {
  editorState.lastInstance = null
  editorState.lastViewer = null
  editorState.factoryReturnNull = false
  window.scrollTo = vi.fn()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  vi.spyOn(window, 'confirm').mockImplementation(() => true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-accent')
  history.pushState({}, '', '/')
})

describe('Helper, Hook, and API Unit Tests', () => {
  it('covers apiHelper branches including fallback base url and error handling', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    // Success GET without options
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: { hello: 'world' } }),
    })
    const res1 = await apiRequest('/ping')
    expect(res1).toEqual({ hello: 'world' })

    // Success POST with token and body
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: { created: true } }),
    })
    const res2 = await apiRequest('/items', { method: 'POST', body: { name: 'a' }, token: 'tok123' })
    expect(res2).toEqual({ created: true })

    // Error when payload.status === 'error'
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'error', message: 'Custom error' }),
    })
    await expect(apiRequest('/err1')).rejects.toThrow('Custom error')

    // Error when payload.status === 'fail'
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'fail', message: 'Fail message' }),
    })
    await expect(apiRequest('/err2')).rejects.toThrow('Fail message')

    // Error when !response.ok and non-JSON response (fallback message)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    })
    await expect(apiRequest('/err3')).rejects.toThrow('Request failed (502)')

    // Fallback API_BASE when VITE_API_BASE_URL is empty
    const prevEnv = import.meta.env.VITE_API_BASE_URL
    import.meta.env.VITE_API_BASE_URL = ''
    vi.resetModules()
    const { apiRequest: freshRequest } = await import('./helpers/apiHelper')
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: 'ok' }),
    })
    expect(await freshRequest('/check')).toBe('ok')
    import.meta.env.VITE_API_BASE_URL = prevEnv
  })

  it('covers adminApi, authApi, and blogApi wrappers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: 'ok' }),
      })
    )

    expect(await getAdminUsers('t')).toBe('ok')
    expect(await getAdminPosts('t')).toBe('ok')
    expect(await getAdminUserPosts(5, 't')).toBe('ok')

    expect(await registerAuthor({ username: 'u' })).toBe('ok')
    expect(await loginAuthor({ username: 'u' })).toBe('ok')
    expect(await getProfile('t')).toBe('ok')
    expect(await updateProfile({ bio: 'b' }, 't')).toBe('ok')

    expect(await getPublicPosts()).toBe('ok')
    expect(await getPublicPosts('react', 'Teknologi')).toBe('ok')
    expect(await getPublicPost('judul-artikel')).toBe('ok')
    expect(await getMyPosts('t')).toBe('ok')
    expect(await getPostStats('t')).toBe('ok')
    expect(await createPost({ title: 'T' }, 't')).toBe('ok')
    expect(await updatePost(1, { title: 'T' }, 't')).toBe('ok')
    expect(await deletePost(1, 't')).toBe('ok')
    expect(await togglePostPublication(1, 't')).toBe('ok')
    expect(await generateArticle({ topic: 'AI' }, 't')).toBe('ok')
  })

  it('covers toolsHelper functions and branches', async () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate(null)).toBe('-')
    expect(formatDate('not-a-date')).toBe('-')
    expect(formatDate('2026-05-10T00:00:00Z')).not.toBe('-')

    const fireSpy = vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true })
    await showErrorAlert('Pesan error')
    await showErrorAlert('Pesan error', 'Judul Error')
    await showSuccessAlert('Pesan sukses')
    await showSuccessAlert('Pesan sukses', 'Judul Sukses')
    const confirmed = await showConfirmDialog('Yakin hapus?')
    const confirmedCustom = await showConfirmDialog('Yakin hapus?', 'Judul Konfirmasi')
    expect(confirmed).toBe(true)
    expect(confirmedCustom).toBe(true)
    expect(fireSpy).toHaveBeenCalledTimes(6)
  })

  it('covers useInput and useTheme hooks', () => {
    const { result: inputRes } = renderHook(() => useInput())
    expect(inputRes.current[0]).toBe('')
    act(() => {
      inputRes.current[1]({ target: { value: 'baru' } })
    })
    expect(inputRes.current[0]).toBe('baru')

    const { result: inputInit } = renderHook(() => useInput('awal'))
    expect(inputInit.current[0]).toBe('awal')

    const { result: themeRes } = renderHook(() => useTheme())
    expect(themeRes.current.mode).toBe('light')
    expect(themeRes.current.accent).toBe('indigo')
    expect(themeRes.current.accents).toEqual(ACCENTS)

    act(() => {
      themeRes.current.toggleMode()
    })
    expect(themeRes.current.mode).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      themeRes.current.toggleMode()
      themeRes.current.changeAccent('rose')
    })
    expect(themeRes.current.mode).toBe('light')
    expect(themeRes.current.accent).toBe('rose')
    expect(document.documentElement.getAttribute('data-accent')).toBe('rose')
  })

  it('covers services/api.js and main.jsx', async () => {
    vi.resetModules()
    const mockHelper = {
      getAccessToken: vi.fn(() => 'tok'),
      putAccessToken: vi.fn(),
      getUser: vi.fn(() => ({ id: 1 })),
      putUser: vi.fn(),
      fetchData: vi.fn().mockResolvedValue({ ok: true }),
    }
    vi.doMock('./helpers/apiHelper', () => ({
      default: mockHelper,
      apiRequest: vi.fn().mockResolvedValue([]),
    }))

    const apiService = await import('./services/api')
    expect(apiService.getToken()).toBe('tok')
    apiService.setToken('new-tok')
    apiService.removeToken()
    expect(mockHelper.putAccessToken).toHaveBeenCalledWith('')

    expect(apiService.getUser()).toEqual({ id: 1 })
    apiService.setUser({ id: 2 })
    apiService.removeUser()
    expect(mockHelper.putUser).toHaveBeenCalledWith(null)

    await apiService.apiRequest('/items')
    await apiService.apiRequest('/items', 'POST', { a: 1 })
    await apiService.apiRequest('/items', 'PUT', { a: 2 })
    await apiService.apiRequest('/items', 'PATCH', { a: 3 })
    await apiService.apiRequest('/items', 'DELETE', { a: 4 })
    expect(mockHelper.fetchData).toHaveBeenCalledTimes(5)

    vi.doUnmock('./helpers/apiHelper')
    vi.resetModules()

    // Cover main.jsx
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', data: [] }),
      })
    )
    const rootDiv = document.createElement('div')
    rootDiv.id = 'root'
    document.body.appendChild(rootDiv)
    await act(async () => {
      await import('./main.jsx')
    })
    document.body.removeChild(rootDiv)
  })
})

describe('Standalone Components Coverage', () => {
  it('covers MarkdownViewer and MarkdownEditor in all states', () => {
    // Early return when ref.current is null
    refControl.forceNull = true
    const { unmount: unmountNullViewer } = render(<MarkdownViewer />)
    unmountNullViewer()
    const { unmount: unmountNullEditor } = render(<MarkdownEditor />)
    unmountNullEditor()
    refControl.forceNull = false

    // Viewer when factory returns null (with empty content to cover initialValue: content || '')
    editorState.factoryReturnNull = true
    const { unmount: unmountFactoryNull } = render(<MarkdownViewer />)
    unmountFactoryNull()
    editorState.factoryReturnNull = false

    // Normal Viewer mount, update, empty content, unmount
    const { rerender: rerenderViewer, unmount: unmountViewer } = render(<MarkdownViewer content="Awal" />)
    rerenderViewer(<MarkdownViewer content="" />)
    unmountViewer()

    // Editor in light and dark modes, with and without onChange
    document.documentElement.classList.add('dark')
    const onChange = vi.fn()
    const { rerender: rerenderEditor, unmount: unmountEditor } = render(
      <MarkdownEditor value="Konten awal" onChange={onChange} />
    )
    act(() => {
      editorState.lastInstance.triggerChange('Konten diubah')
    })
    expect(onChange).toHaveBeenCalledWith('Konten diubah')

    // Rerender with same value vs different value vs empty value
    rerenderEditor(<MarkdownEditor value="Konten diubah" onChange={onChange} />)
    rerenderEditor(<MarkdownEditor value="Konten baru" onChange={onChange} />)
    rerenderEditor(<MarkdownEditor value="" onChange={onChange} />)
    unmountEditor()

    // Editor in light mode without onChange and null value
    document.documentElement.classList.remove('dark')
    const { unmount: unmountEditorLight } = render(<MarkdownEditor value={null} />)
    act(() => {
      editorState.lastInstance.triggerChange('Tanpa onChange')
    })
    unmountEditorLight()
  })

  it('covers AdminDashboard component', async () => {
    const { rerender } = render(<AdminDashboard users={[]} onLoadUserTodos={vi.fn()} />)
    expect(screen.getByText('Tidak ada data pengguna.')).toBeInTheDocument()

    const onLoadUserTodos = vi
      .fn()
      .mockResolvedValueOnce([
        { id: 1, title: 'Tugas 1', description: 'Deskripsi 1', status: 'Selesai' },
        { id: 2, title: 'Tugas 2', description: '', status: 'Proses' },
      ])
      .mockResolvedValueOnce(null)

    const users = [
      { id: 1, username: 'admin1', email: 'a@delcom.id', role: 'admin', total_todos: 2, total_selesai: 1 },
      { id: 2, username: 'member1', email: 'm@delcom.id', role: 'member', total_todos: 0, total_selesai: 0 },
    ]
    rerender(<AdminDashboard users={users} onLoadUserTodos={onLoadUserTodos} />)

    const monitorButtons = screen.getAllByText('Monitoring Todo')
    await act(async () => {
      fireEvent.click(monitorButtons[0])
    })
    expect(screen.getByText('Tugas 1')).toBeInTheDocument()
    fireEvent.click(screen.getByText('×'))

    await act(async () => {
      fireEvent.click(monitorButtons[1])
    })
    expect(screen.getByText('Pengguna ini belum memiliki tugas.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Tutup Pemantauan'))
  })

  it('covers AuthPage and AuthModal components', async () => {
    let resolveLogin
    const onLogin = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => { resolveLogin = r }))
      .mockRejectedValueOnce(new Error('Kredensial salah'))
      .mockRejectedValueOnce(new Error(''))
    const onRegister = vi.fn().mockResolvedValueOnce({})
    const onNavigate = vi.fn()

    const { rerender } = render(<AuthPage onLogin={onLogin} onRegister={onRegister} onNavigate={onNavigate} />)
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ubaid' } })
    fireEvent.change(screen.getByLabelText('Kata Sandi'), { target: { value: 'secret123' } })

    // Pending submit state
    fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form'))
    expect(screen.getByRole('button', { name: 'Memproses...' })).toBeDisabled()
    await act(async () => {
      resolveLogin({})
    })
    expect(onNavigate).toHaveBeenCalledWith('/')

    // Error with message
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form'))
    })
    expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Kredensial salah')

    // Error with empty message fallback
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form'))
    })
    expect(screen.getByTestId('auth-error-msg')).toHaveTextContent('Terjadi kesalahan autentikasi.')

    fireEvent.click(screen.getByText('Daftar di sini'))
    expect(onNavigate).toHaveBeenCalledWith('/register')
    fireEvent.click(screen.getByText(/Kembali ke Halaman Utama/))

    // Register mode
    rerender(<AuthPage mode="register" onLogin={onLogin} onRegister={onRegister} onNavigate={onNavigate} />)
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'baru' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'baru@delcom.id' } })
    fireEvent.change(screen.getByLabelText('Kata Sandi'), { target: { value: 'secret123' } })
    fireEvent.change(screen.getByLabelText('Peran Akun'), { target: { value: 'admin' } })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Daftar Sekarang' }).closest('form'))
    })
    expect(onRegister).toHaveBeenCalled()
    fireEvent.click(screen.getByText('Masuk di sini'))

    // AuthModal closed vs open
    const onClose = vi.fn()
    let resolveModalLogin
    const modalLogin = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => { resolveModalLogin = r }))
      .mockRejectedValueOnce(new Error('Modal gagal'))
      .mockRejectedValueOnce(new Error(''))
    const modalRegister = vi.fn().mockResolvedValueOnce({})

    const { rerender: rerenderModal } = render(
      <AuthModal isOpen={false} onClose={onClose} onLogin={modalLogin} onRegister={modalRegister} />
    )
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()

    rerenderModal(<AuthModal isOpen={true} onClose={onClose} onLogin={modalLogin} onRegister={modalRegister} />)
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'user1' } })
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass123' } })

    fireEvent.submit(screen.getByTestId('btn-submit-auth').closest('form'))
    expect(screen.getByTestId('btn-submit-auth')).toHaveTextContent('Memproses...')
    await act(async () => {
      resolveModalLogin({})
    })
    expect(onClose).toHaveBeenCalled()

    // Error with message and fallback
    await act(async () => {
      fireEvent.submit(screen.getByTestId('btn-submit-auth').closest('form'))
    })
    expect(screen.getByText('Modal gagal')).toBeInTheDocument()

    await act(async () => {
      fireEvent.submit(screen.getByTestId('btn-submit-auth').closest('form'))
    })
    expect(screen.getByText('Terjadi kesalahan autentikasi.')).toBeInTheDocument()

    // Switch tabs
    fireEvent.click(screen.getByText('Daftar (Register)'))
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'u@email.com' } })
    fireEvent.change(screen.getByDisplayValue('Member (Pengguna Biasa)'), { target: { value: 'admin' } })
    await act(async () => {
      fireEvent.submit(screen.getByTestId('btn-submit-auth').closest('form'))
    })
    expect(modalRegister).toHaveBeenCalled()

    fireEvent.click(screen.getByText('Masuk (Login)'))
  })
})

describe('Delcom Blog SPA (App.jsx)', () => {
  it('renders public landing page, search, categories, detail page, and handles errors', async () => {
    const samplePosts = [
      {
        id: 1,
        title: 'Artikel Satu',
        slug: 'artikel-satu',
        category: 'Teknologi',
        excerpt: 'Ringkasan satu',
        cover_image_path: 'https://example.com/cover.jpg',
        author: { username: 'penulis1' },
        published_at: '2026-01-02T00:00:00Z',
      },
      {
        id: 2,
        title: 'Artikel Dua',
        slug: 'artikel-dua',
        category: 'Pendidikan',
        excerpt: 'Ringkasan dua',
        cover_image_path: '',
        author: null,
        published_at: null,
        created_at: '2026-01-03T00:00:00Z',
      },
    ]

    const fetchMock = vi.fn().mockImplementation(async (url) => {
      const u = String(url)
      if (u.includes('/public/posts/artikel-satu')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: {
              reading_time: 3,
              post: {
                title: 'Artikel Satu',
                category: 'Teknologi',
                excerpt: 'Ringkasan satu',
                content: '# Isi Artikel',
                cover_image_path: 'https://example.com/cover.jpg',
                author: { username: 'penulis1' },
                published_at: '2026-01-02T00:00:00Z',
              },
            },
          }),
        }
      }
      if (u.includes('/public/posts/artikel-dua')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: {
              reading_time: 2,
              post: {
                title: 'Artikel Dua',
                category: 'Pendidikan',
                excerpt: 'Ringkasan dua',
                content: 'Isi dua',
                cover_image_path: '',
                author: null,
                published_at: '2026-01-03T00:00:00Z',
              },
            },
          }),
        }
      }
      if (u.includes('/public/posts/tidak-ada') || u.endsWith('/public/posts/')) {
        return {
          ok: false,
          status: 404,
          json: async () => ({ status: 'fail', message: 'Not found' }),
        }
      }
      if (u.includes('q=error')) {
        throw new Error('Network error')
      }
      if (u.includes('q=kosong')) {
        return {
          ok: true,
          json: async () => ({ status: 'success', data: null }),
        }
      }
      return {
        ok: true,
        json: async () => ({ status: 'success', data: samplePosts }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    expect(screen.getByText(/Cerita yang baik/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Artikel Satu')).toBeInTheDocument())
    expect(screen.getByText('@Penulis')).toBeInTheDocument()

    // Toggle theme dark -> light
    const themeBtn = screen.getByTitle('Toggle theme')
    fireEvent.click(themeBtn)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    fireEvent.click(themeBtn)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Filter by category and search (empty & error)
    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    const searchInput = screen.getByPlaceholderText('Cari artikel...')
    fireEvent.change(searchInput, { target: { value: 'kosong' } })
    await waitFor(() => expect(screen.getByText('Belum ada artikel yang cocok.')).toBeInTheDocument())

    fireEvent.change(searchInput, { target: { value: 'error' } })
    await waitFor(() => expect(console.error).toHaveBeenCalled())

    fireEvent.change(searchInput, { target: { value: '' } })
    await waitFor(() => expect(screen.getByText('Artikel Satu')).toBeInTheDocument())

    // Open article 1 detail (with cover & author username)
    fireEvent.click(screen.getByText('Artikel Satu'))
    await waitFor(() => expect(screen.getByText('3 menit membaca')).toBeInTheDocument())
    fireEvent.click(screen.getByText('← Kembali ke artikel'))
    await waitFor(() => expect(screen.getByText('Artikel Dua')).toBeInTheDocument())

    // Open article 2 detail (without cover & without author username -> 'D' avatar fallback)
    fireEvent.click(screen.getByText('Artikel Dua'))
    await waitFor(() => expect(screen.getByText('2 menit membaca')).toBeInTheDocument())

    // Navigate via popstate to /public and /posts/tidak-ada and /posts/
    act(() => {
      history.pushState({}, '', '/public')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.getByText('Jelajahi artikel')).toBeInTheDocument())

    act(() => {
      history.pushState({}, '', '/posts/tidak-ada')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.getByText('Artikel tidak ditemukan.')).toBeInTheDocument())

    act(() => {
      history.pushState({}, '', '/posts/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.getByText('Artikel tidak ditemukan.')).toBeInTheDocument())

    // Hero CTA when logged out -> /register, then nav buttons
    fireEvent.click(screen.getByText('Jelajahi'))
    await waitFor(() => expect(screen.getByText('Mulai menulis ↗')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Mulai menulis ↗'))
    expect(screen.getByText('Buat akun penulis')).toBeInTheDocument()

    // Brand logo click returns to '/'
    fireEvent.click(screen.getByText('BLOG'))
    expect(screen.getByText('Jelajahi artikel')).toBeInTheDocument()
  })

  it('handles unmounted/stale detail request when navigating away before fetch settles', async () => {
    let resolveDetail
    let rejectDetail
    const fetchMock = vi.fn().mockImplementation((url) => {
      const u = String(url)
      if (u.includes('/public/posts/lambat-ok')) {
        return new Promise((r) => {
          resolveDetail = r
        })
      }
      if (u.includes('/public/posts/lambat-err')) {
        return new Promise((_, rej) => {
          rejectDetail = rej
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'success', data: [] }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    history.pushState({}, '', '/posts/lambat-ok')
    render(<App />)
    expect(screen.getByText('Memuat artikel...')).toBeInTheDocument()

    // Navigate away before lambat-ok resolves
    act(() => {
      history.pushState({}, '', '/posts/lambat-err')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    // Navigate away before lambat-err rejects
    act(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await act(async () => {
      resolveDetail({
        ok: true,
        json: async () => ({ status: 'success', data: { reading_time: 1, post: { title: 'Lambat' } } }),
      })
      rejectDetail(new Error('Gagal'))
    })
  })

  it('covers authentication flows, route guards, author workspace, editor modal, and AI generator', async () => {
    let postsData = [
      {
        id: 10,
        title: 'Post Draf',
        slug: 'post-draf',
        category: 'Teknologi',
        excerpt: 'Ringkasan draf',
        content: '# Konten Draf',
        cover_image_path: 'https://example.com/img.png',
        is_published: false,
        updated_at: '2026-02-01T00:00:00Z',
      },
      {
        id: 11,
        title: 'Post Terbit',
        slug: 'post-terbit',
        category: 'Opini',
        excerpt: 'Ringkasan terbit',
        content: '# Konten Terbit',
        cover_image_path: '',
        is_published: true,
        updated_at: '2026-02-02T00:00:00Z',
      },
    ]

    let shouldFailSave = false
    let shouldFailDelete = false
    let shouldFailToggle = false
    let shouldFailAI = false
    let emptyAISources = false

    const fetchMock = vi.fn().mockImplementation(async (url, opts = {}) => {
      const u = String(url)
      const method = opts.method || 'GET'

      if (u.endsWith('/auth/register')) {
        const body = JSON.parse(opts.body)
        if (body.username === 'failuser') {
          return { ok: false, status: 400, json: async () => ({ status: 'fail', message: 'Registrasi gagal' }) }
        }
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: { token: 'author-token', user: { id: 1, username: body.username, role: 'author' } },
          }),
        }
      }
      if (u.endsWith('/posts/stats')) {
        return {
          ok: true,
          json: async () => ({ status: 'success', data: { total: 2, published: 1, draft: 1 } }),
        }
      }
      if (u.endsWith('/posts/ai-generate')) {
        if (shouldFailAI) {
          return { ok: false, status: 500, json: async () => ({ status: 'error', message: 'AI gagal' }) }
        }
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: {
              article: {
                title: 'Judul AI',
                category: 'Teknologi',
                excerpt: 'Kutipan AI',
                content: 'Isi AI markdown',
              },
              search_sources: emptyAISources ? null : ['https://sumber.id/1'],
            },
          }),
        }
      }
      if (u.match(/\/posts\/\d+\/toggle-publish/)) {
        if (shouldFailToggle) {
          return { ok: false, status: 500, json: async () => ({ status: 'error', message: 'Toggle gagal' }) }
        }
        return { ok: true, json: async () => ({ status: 'success', data: {} }) }
      }
      if (u.match(/\/posts\/\d+$/) && method === 'DELETE') {
        if (shouldFailDelete) {
          return { ok: false, status: 500, json: async () => ({ status: 'error', message: 'Hapus gagal' }) }
        }
        postsData = []
        return { ok: true, json: async () => ({ status: 'success', data: {} }) }
      }
      if ((u.endsWith('/posts') && method === 'POST') || (u.match(/\/posts\/\d+$/) && method === 'PUT')) {
        if (shouldFailSave) {
          return { ok: false, status: 500, json: async () => ({ status: 'error', message: 'Simpan gagal' }) }
        }
        return { ok: true, json: async () => ({ status: 'success', data: {} }) }
      }
      if (u.endsWith('/posts') && method === 'GET') {
        return { ok: true, json: async () => ({ status: 'success', data: postsData }) }
      }
      return { ok: true, json: async () => ({ status: 'success', data: [] }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    // Unauthenticated access to /author redirects to /login
    history.pushState({}, '', '/author')
    render(<App />)
    await waitFor(() => expect(screen.getByText('Masuk ke akun')).toBeInTheDocument())

    // Switch between /login and /register
    fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))
    expect(screen.getByText('Buat akun penulis')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Masuk' })[1])
    expect(screen.getByText('Masuk ke akun')).toBeInTheDocument()

    // Nav buttons Masuk & Mulai menulis
    fireEvent.click(screen.getAllByRole('button', { name: 'Masuk' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Mulai menulis' }))
    expect(screen.getByText('Buat akun penulis')).toBeInTheDocument()

    // Failed registration alerts error
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'failuser' } })
    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), { target: { value: 'f@mail.com' } })
    fireEvent.change(screen.getByPlaceholderText('Minimal 6 karakter'), { target: { value: '123456' } })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Daftar akun' }).closest('form'))
    })
    expect(window.alert).toHaveBeenCalledWith('Registrasi gagal')

    // Successful registration redirects to /author
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'penulis' } })
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Daftar akun' }).closest('form'))
    })
    await waitFor(() => expect(screen.getByText('Ruang publikasi')).toBeInTheDocument())
    expect(screen.getByText('Post Draf')).toBeInTheDocument()
    expect(screen.getByText('Post Terbit')).toBeInTheDocument()

    // Non-admin visiting /admin redirects back to /author
    act(() => {
      history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(location.pathname).toBe('/author'))

    // Visit '/' while logged in and click Hero 'Mulai menulis ↗' & Nav 'Workspace'
    fireEvent.click(screen.getByText('Jelajahi'))
    await waitFor(() => expect(screen.getByText('Mulai menulis ↗')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Mulai menulis ↗'))
    await waitFor(() => expect(screen.getByText('Ruang publikasi')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Workspace'))

    // AI Generator modal
    fireEvent.click(screen.getByText('✦ AI Generator'))
    expect(screen.getByText('AI Article Generator')).toBeInTheDocument()

    // Empty topic validation
    fireEvent.click(screen.getByText('✦ Generate artikel'))
    expect(window.alert).toHaveBeenCalledWith('Masukkan topik artikel.')

    // Fill AI form & test error then success with sources & without sources
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Dampak AI/i), { target: { value: 'Topik AI' } })
    fireEvent.change(screen.getByDisplayValue('Teknologi'), { target: { value: 'Pendidikan' } })
    fireEvent.click(screen.getByRole('checkbox'))

    shouldFailAI = true
    await act(async () => {
      fireEvent.click(screen.getByText('✦ Generate artikel'))
    })
    expect(window.alert).toHaveBeenCalledWith('AI gagal')

    shouldFailAI = false
    await act(async () => {
      fireEvent.click(screen.getByText('✦ Generate artikel'))
    })
    expect(screen.getByText('Judul AI')).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/sumber\.id\/1/)).toBeInTheDocument()

    // Generate again with null search_sources
    emptyAISources = true
    await act(async () => {
      fireEvent.click(screen.getByText('✦ Generate artikel'))
    })

    // Close AI modal via Tutup, reopen, and apply draft to EditorModal
    fireEvent.click(screen.getByText('Tutup'))
    fireEvent.click(screen.getByText('✦ AI Generator'))
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Dampak AI/i), { target: { value: 'Topik AI' } })
    await act(async () => {
      fireEvent.click(screen.getByText('✦ Generate artikel'))
    })
    fireEvent.click(screen.getByText('Gunakan di editor'))
    expect(screen.getByText('Edit artikel')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Batal'))

    // Open New Article EditorModal
    fireEvent.click(screen.getByText('＋ Tulis artikel'))
    expect(screen.getByText('Tulis artikel baru')).toBeInTheDocument()

    // Validation when title/content empty
    fireEvent.click(screen.getByText('Simpan artikel'))
    expect(window.alert).toHaveBeenCalledWith('Judul dan konten wajib diisi.')

    // Fill inputs & trigger markdown editor change
    fireEvent.change(screen.getByPlaceholderText('Judul artikel yang menarik...'), {
      target: { value: 'Judul Baru' },
    })
    fireEvent.change(screen.getByDisplayValue('Teknologi'), { target: { value: 'Bisnis' } })
    fireEvent.change(screen.getByPlaceholderText('Ringkasan singkat artikel...'), {
      target: { value: 'Ringkasan baru' },
    })
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://img.com/a.jpg' },
    })
    act(() => {
      editorState.lastInstance.triggerChange('# Isi Baru')
    })

    // Switch to Pratinjau and back to Editor Markdown, then Pratinjau to test save while in preview
    fireEvent.click(screen.getByText('Pratinjau'))
    fireEvent.click(screen.getByText('Editor Markdown'))
    fireEvent.click(screen.getByText('Pratinjau'))

    shouldFailSave = true
    await act(async () => {
      fireEvent.click(screen.getByText('Simpan artikel'))
    })
    expect(window.alert).toHaveBeenCalledWith('Simpan gagal')

    shouldFailSave = false
    fireEvent.click(screen.getByText('Editor Markdown'))
    await act(async () => {
      fireEvent.click(screen.getByText('Simpan artikel'))
    })

    // Edit existing article (PUT)
    fireEvent.click(screen.getAllByText('Edit')[0])
    expect(screen.getByText('Edit artikel')).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(screen.getByText('Simpan artikel'))
    })

    // Toggle publish (fail & success)
    shouldFailToggle = true
    await act(async () => {
      fireEvent.click(screen.getByText('Terbitkan'))
    })
    expect(window.alert).toHaveBeenCalledWith('Toggle gagal')

    shouldFailToggle = false
    await act(async () => {
      fireEvent.click(screen.getByText('Terbitkan'))
    })

    // Delete post: cancel confirm, fail delete, succeed delete (which empties posts list)
    window.confirm.mockReturnValueOnce(false)
    await act(async () => {
      fireEvent.click(screen.getAllByText('Hapus')[0])
    })

    shouldFailDelete = true
    await act(async () => {
      fireEvent.click(screen.getAllByText('Hapus')[0])
    })
    expect(window.alert).toHaveBeenCalledWith('Hapus gagal')

    shouldFailDelete = false
    await act(async () => {
      fireEvent.click(screen.getAllByText('Hapus')[0])
    })
    await waitFor(() => expect(screen.getByText('Belum ada artikel')).toBeInTheDocument())
  })

  it('covers admin login, admin workspace, null fallbacks, and error handling in loadAuthor/loadAdmin', async () => {
    localStorage.setItem('delcom_theme', 'dark')
    let failAdminLoad = false
    let nullAdminData = false
    let failAuthorLoad = false
    let nullAuthorData = true

    const fetchMock = vi.fn().mockImplementation(async (url) => {
      const u = String(url)
      if (u.endsWith('/auth/login')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: { token: 'admin-tok', user: { id: 99, username: 'superadmin', role: 'admin' } },
          }),
        }
      }
      if (u.endsWith('/admin/users')) {
        if (failAdminLoad) {
          return { ok: false, status: 500, json: async () => ({ status: 'error', message: 'Admin error' }) }
        }
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: nullAdminData
              ? null
              : [{ id: 1, username: 'u1', email: 'u1@mail.com', role: 'author', total_posts: 2, published_posts: 1 }],
          }),
        }
      }
      if (u.endsWith('/admin/posts')) {
        return {
          ok: true,
          json: async () => ({
            status: 'success',
            data: nullAdminData
              ? null
              : [
                  { id: 1, title: 'Admin Post 1', category: 'Umum', is_published: true, author: { username: 'u1' } },
                  { id: 2, title: 'Admin Post 2', category: 'Umum', is_published: false, author: { username: 'u1' } },
                ],
          }),
        }
      }
      if (u.endsWith('/posts') || u.endsWith('/posts/stats')) {
        if (failAuthorLoad) {
          return { ok: false, status: 401, json: async () => ({ status: 'error', message: 'Sesi habis' }) }
        }
        return { ok: true, json: async () => ({ status: 'success', data: nullAuthorData ? null : [] }) }
      }
      return { ok: true, json: async () => ({ status: 'success', data: [] }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    history.pushState({}, '', '/login')
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText('username'), { target: { value: 'superadmin' } })
    fireEvent.change(screen.getByPlaceholderText('Minimal 6 karakter'), { target: { value: 'admin123' } })
    await act(async () => {
      fireEvent.submit(document.getElementById('login-submit').closest('form'))
    })

    await waitFor(() => expect(screen.getByText('System overview')).toBeInTheDocument())
    expect(screen.getByText('Admin Post 1')).toBeInTheDocument()
    expect(screen.getByText('Admin Post 2')).toBeInTheDocument()

    // Click Workspace as admin
    fireEvent.click(screen.getByText('Workspace'))

    // Null admin data fallback
    nullAdminData = true
    act(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    act(() => {
      history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.getByText('System overview')).toBeInTheDocument())

    // Error in loadAdmin
    failAdminLoad = true
    act(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    act(() => {
      history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Admin error'))

    // Visit /author with nullAuthorData = true (covers p || [] and s || {})
    act(() => {
      history.pushState({}, '', '/author')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.getByText('Ruang publikasi')).toBeInTheDocument())

    // Error in loadAuthor triggers alert and logout
    failAuthorLoad = true
    act(() => {
      history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    act(() => {
      history.pushState({}, '', '/author')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Sesi habis'))
  })
})
