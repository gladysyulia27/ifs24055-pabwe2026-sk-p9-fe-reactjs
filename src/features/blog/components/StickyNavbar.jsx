import React from 'react'

export default function StickyNavbar({ token, user, theme, onNavigate, onLogout, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 text-slate-900 backdrop-blur-xl transition-colors dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 text-slate-900 transition hover:opacity-90 dark:text-white"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-700 font-black text-white shadow-sm">
            D
          </span>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            delcom<span className="text-indigo-700 dark:text-indigo-300">.</span>
            <small className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">BLOG</small>
          </span>
        </button>

        <nav aria-label="Navigasi utama" className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => onNavigate('/public')}
            className="hidden rounded-xl px-3.5 py-2 font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-indigo-700 sm:block dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
          >
            Jelajahi
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/articles')}
            className="hidden rounded-xl px-3.5 py-2 font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-indigo-700 sm:block dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
          >
            Artikel
          </button>

          {token ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate(user?.role === 'admin' ? '/admin' : '/author')}
                className="rounded-xl px-3.5 py-2 font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
              >
                Workspace
              </button>
              <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 sm:block dark:bg-slate-800 dark:text-slate-200">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
              >
                Mulai menulis
              </button>
            </>
          )}

          <button
            type="button"
            title="Toggle theme"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
            className="ml-1 grid size-9 place-items-center rounded-xl border border-slate-300 bg-white text-base text-slate-800 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </nav>
      </div>
    </header>
  )
}
