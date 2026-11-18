import React from 'react'

export default function StickyNavbar({ token, user, theme, onNavigate, onLogout, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button onClick={() => onNavigate('/')} className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 font-black text-white">D</span>
          <span className="text-lg font-black tracking-tight">
            delcom<span className="text-indigo-600">.</span>
            <small className="ml-2 text-xs font-medium text-slate-400">BLOG</small>
          </span>
        </button>
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onNavigate('/')}
            className="hidden rounded-lg px-3 py-2 hover:bg-slate-100 sm:block dark:hover:bg-slate-800"
          >
            Jelajahi
          </button>
          {token ? (
            <>
              <button
                onClick={() => onNavigate(user?.role === 'admin' ? '/admin' : '/author')}
                className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Workspace
              </button>
              <span className="hidden text-slate-400 sm:block">{user?.username}</span>
              <button
                onClick={onLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('/login')} className="px-3 py-2">
                Masuk
              </button>
              <button
                onClick={() => onNavigate('/register')}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Mulai menulis
              </button>
            </>
          )}
          <button
            title="Toggle theme"
            onClick={onToggleTheme}
            className="ml-1 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  )
}
