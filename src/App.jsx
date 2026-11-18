import React, { useEffect, useState } from 'react'
import { apiRequest as request } from './helpers/apiHelper'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import PostModal from './features/blog/modals/PostModal'
import AiPostGeneratorModal from './features/blog/modals/AiPostGeneratorModal'

export const SEEDER_ACCOUNTS = [
  {
    label: 'writer',
    username: 'writer',
    email: 'writer@gmail.com',
    password: 'password',
    role: 'member',
  },
  {
    label: 'admin',
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'password',
    role: 'admin',
  },
]

function Field({ label, ...props }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <input
        {...props}
        className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </label>
  )
}

export default function App() {
  const [path, setPath] = useState(location.pathname)
  const [token, setToken] = useState(localStorage.getItem('delcom_token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('delcom_user') || 'null'))
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
  const [users, setUsers] = useState([])
  const [adminPosts, setAdminPosts] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('delcom_theme') || 'light')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('delcom_theme', theme)
  }, [theme])

  useEffect(() => {
    const f = () => setPath(location.pathname)
    addEventListener('popstate', f)
    return () => removeEventListener('popstate', f)
  }, [])

  function go(p) {
    history.pushState({}, '', p)
    setPath(p)
    window.scrollTo(0, 0)
  }

  async function loadPublic() {
    setLoading(true)
    try {
      setPosts(
        (await request(
          `/public/posts?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        )) || []
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const cleanPath = path.length > 1 ? path.replace(/\/+$/, '') : path
  const isPublicPath =
    cleanPath === '/' ||
    cleanPath === '/public' ||
    cleanPath === '/articles' ||
    cleanPath === '/article'

  useEffect(() => {
    if (isPublicPath) loadPublic()
  }, [cleanPath, isPublicPath, query, category])

  async function loadAuthor() {
    try {
      const [p, s] = await Promise.all([request('/posts', { token }), request('/posts/stats', { token })])
      setPosts(p || [])
      setStats(s || {})
    } catch (e) {
      alert(e.message)
      logout()
    }
  }

  async function loadAdmin() {
    try {
      const [u, p] = await Promise.all([request('/admin/users', { token }), request('/admin/posts', { token })])
      setUsers(u || [])
      setAdminPosts(p || [])
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    if (cleanPath === '/author' && token) loadAuthor()
    if (cleanPath === '/admin' && token && user?.role === 'admin') loadAdmin()
    if ((cleanPath === '/author' || cleanPath === '/admin') && !token) go('/login')
    if (cleanPath === '/admin' && token && user?.role !== 'admin') go('/author')
  }, [cleanPath, token, user?.role])

  const publicDetail =
    !isPublicPath &&
    (cleanPath.startsWith('/posts/') ||
      cleanPath.startsWith('/articles/') ||
      cleanPath.startsWith('/article/'))

  useEffect(() => {
    if (!publicDetail) {
      setDetail(null)
      return
    }
    let active = true
    const slug = decodeURIComponent(cleanPath.split('/')[2])
    setDetail(null)
    request(`/public/posts/${slug}`)
      .then((v) => {
        if (active) setDetail(v)
      })
      .catch(() => {
        if (active) setDetail({ error: true })
      })
    return () => {
      active = false
    }
  }, [cleanPath, publicDetail])

  function logout() {
    localStorage.removeItem('delcom_token')
    localStorage.removeItem('delcom_user')
    setToken('')
    setUser(null)
    go('/')
  }

  async function auth(mode) {
    try {
      const seeder = SEEDER_ACCOUNTS.find((s) => s.username === authForm.username)
      let data
      try {
        data = await request(`/auth/${mode}`, {
          method: 'POST',
          body: mode === 'register' ? authForm : { username: authForm.username, password: authForm.password },
        })
      } catch (err) {
        if (mode === 'login' && seeder) {
          data = await request('/auth/register', { method: 'POST', body: seeder })
        } else {
          throw err
        }
      }
      localStorage.setItem('delcom_token', data.token)
      localStorage.setItem('delcom_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      go(data.user.role === 'admin' ? '/admin' : '/author')
    } catch (e) {
      alert(e.message)
    }
  }

  async function savePost(form) {
    if (selected?.id) await request(`/posts/${selected.id}`, { method: 'PUT', body: form, token })
    else await request('/posts', { method: 'POST', body: form, token })
    setModal(null)
    setSelected(null)
    await loadAuthor()
  }

  async function deletePost(id) {
    if (!confirm('Hapus artikel ini secara permanen?')) return
    try {
      await request(`/posts/${id}`, { method: 'DELETE', token })
      loadAuthor()
    } catch (e) {
      alert(e.message)
    }
  }

  async function togglePost(id) {
    try {
      await request(`/posts/${id}/toggle-publish`, { method: 'PATCH', token })
      loadAuthor()
    } catch (e) {
      alert(e.message)
    }
  }

  const isAuth = cleanPath === '/login' || cleanPath === '/register'
  const nav = (
    <StickyNavbar
      token={token}
      user={user}
      theme={theme}
      onNavigate={go}
      onLogout={logout}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  )

  if (isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {nav}
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-2">
          <div className="hidden rounded-3xl bg-gradient-to-br from-indigo-700 to-slate-950 p-10 text-white shadow-xl md:block">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">Delcom Blog</p>
            <h1 className="mt-10 text-5xl font-black leading-tight text-white">
              Ideas deserve
              <br />
              to be <span className="text-indigo-300">published.</span>
            </h1>
            <p className="mt-5 leading-7 text-indigo-100">
              Ruang untuk berbagi wawasan, gagasan, dan cerita yang memberi dampak.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              auth(cleanPath === '/register' ? 'register' : 'login')
            }}
            className="my-auto grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">SELAMAT DATANG</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {cleanPath === '/register' ? 'Buat akun penulis' : 'Masuk ke akun'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {cleanPath === '/register'
                  ? 'Mulai bagikan tulisan terbaikmu.'
                  : 'Lanjutkan mengelola dan menerbitkan artikel.'}
              </p>
            </div>
            <Field
              label="Username"
              id={cleanPath === '/login' ? 'login-username' : 'register-username'}
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              required
              placeholder="username"
            />
            {cleanPath === '/register' && (
              <Field
                label="Email"
                id="register-email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                placeholder="nama@email.com"
              />
            )}
            <Field
              label="Password"
              id={cleanPath === '/login' ? 'login-password' : 'register-password'}
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              required
              placeholder="Minimal 6 karakter"
            />
            <button
              type="submit"
              id={cleanPath === '/login' ? 'login-submit' : 'register-submit'}
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {cleanPath === '/register' ? 'Daftar akun' : 'Masuk'}
            </button>
            {cleanPath === '/login' && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/50">
                <p className="mb-2 font-bold text-indigo-900 dark:text-indigo-200">
                  Akun Seeder Testing (Klik untuk isi otomatis):
                </p>
                <div className="flex flex-wrap gap-2">
                  {SEEDER_ACCOUNTS.map((s) => (
                    <button
                      key={s.username}
                      type="button"
                      onClick={() => setAuthForm({ username: s.username, email: s.email, password: s.password })}
                      className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                    >
                      {s.label} ({s.username})
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {cleanPath === '/register' ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => go(cleanPath === '/register' ? '/login' : '/register')}
                className="font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {cleanPath === '/register' ? 'Masuk' : 'Daftar'}
              </button>
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {nav}
      {cleanPath === '/author' && (
        <AuthorDashboard
          posts={posts}
          stats={stats}
          onOpenAiModal={() => setModal('ai')}
          onCreatePost={() => {
            setSelected(null)
            setModal('editor')
          }}
          onEditPost={(p) => {
            setSelected(p)
            setModal('editor')
          }}
          onTogglePublish={togglePost}
          onDeletePost={deletePost}
        />
      )}
      {cleanPath === '/admin' && (
        <main className="mx-auto max-w-7xl px-5 py-10 text-slate-900 dark:text-slate-100">
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">System overview</h1>
          <p className="mb-8 mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitoring pengguna dan seluruh publikasi Delcom Blog.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-indigo-700 p-6 text-white shadow-sm">
              <p className="text-sm text-indigo-200">Total pengguna</p>
              <b className="mt-2 block text-4xl">{users.length}</b>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total artikel</p>
              <b className="mt-2 block text-4xl text-slate-900 dark:text-white">{adminPosts.length}</b>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-600 dark:text-slate-400">Artikel terbit</p>
              <b className="mt-2 block text-4xl text-slate-900 dark:text-white">
                {adminPosts.filter((p) => p.is_published).length}
              </b>
            </div>
          </div>
          <h2 className="mb-3 mt-10 font-bold text-slate-900 dark:text-white">Direktori pengguna</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  {['ID', 'Pengguna', 'Email', 'Role', 'Artikel', 'Terbit'].map((x) => (
                    <th key={x} className="p-4">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="p-4">{u.id}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{u.username}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-4">{u.role}</td>
                    <td className="p-4">{u.total_posts}</td>
                    <td className="p-4">{u.published_posts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="mb-3 mt-10 font-bold text-slate-900 dark:text-white">Arsip semua artikel</h2>
          <div className="grid gap-3">
            {adminPosts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <b className="text-slate-900 dark:text-white">{p.title}</b>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {p.author?.username} · {p.category}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    p.is_published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {p.is_published ? 'Terbit' : 'Draf'}
                </span>
              </div>
            ))}
          </div>
        </main>
      )}
      {isPublicPath ? (
        <PublicArticleList
          posts={posts}
          loading={loading}
          query={query}
          category={category}
          token={token}
          onQueryChange={setQuery}
          onCategoryChange={setCategory}
          onSelectPost={(slug) => {
            go(`/posts/${slug}`)
            setDetail(null)
          }}
          onStartWriting={go}
        />
      ) : null}
      {publicDetail && <PublicArticleDetail detail={detail} onBack={() => go('/')} />}
      {modal === 'editor' && (
        <PostModal
          post={selected}
          onClose={() => {
            setModal(null)
            setSelected(null)
          }}
          onSave={savePost}
        />
      )}
      {modal === 'ai' && (
        <AiPostGeneratorModal
          token={token}
          onClose={() => setModal(null)}
          onApply={(draft) => {
            setSelected({
              title: draft.title,
              category: draft.category,
              excerpt: draft.excerpt,
              content: draft.content,
              is_published: false,
            })
            setModal('editor')
          }}
        />
      )}
      <footer className="mt-16 border-t border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        © {new Date().getFullYear()} Delcom Blog · Built for ideas that matter.
      </footer>
    </div>
  )
}
