import React from 'react'

export const CATEGORIES = ['Semua', 'Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export default function PublicArticleList({
  posts,
  loading,
  query,
  category,
  token,
  onQueryChange,
  onCategoryChange,
  onSelectPost,
  onStartWriting,
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white dark:border-slate-800">
        <div className="absolute -right-20 -top-40 size-[520px] rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
          <p className="text-xs font-bold tracking-[.25em] text-indigo-300">IDEAS · STORIES · KNOWLEDGE</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.08] text-white md:text-7xl">
            Cerita yang baik
            <br />
            layak <span className="text-indigo-400">dibagikan.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Temukan perspektif baru, eksplorasi gagasan, dan wawasan dari komunitas penulis Delcom.
          </p>
          <button
            type="button"
            onClick={() => onStartWriting(token ? '/author' : '/register')}
            className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-indigo-500"
          >
            Mulai menulis ↗
          </button>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-14 text-slate-900 dark:text-slate-100">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">THE JOURNAL</p>
            <h2 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Jelajahi artikel</h2>
          </div>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === c
                  ? 'border border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-20 text-center font-medium text-slate-600 dark:text-slate-400">Memuat artikel...</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <b className="text-base text-slate-900 dark:text-slate-100">Belum ada artikel yang cocok.</b>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Coba kata kunci atau kategori lainnya.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <article
                key={p.id}
                onClick={() => onSelectPost(p.slug)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/60"
              >
                <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-br from-indigo-100 via-slate-100 to-violet-200 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-800">
                  {p.cover_image_path ? (
                    <img
                      src={p.cover_image_path}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-6xl font-black text-indigo-400/70 dark:text-indigo-400/50">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-indigo-700 shadow-xs dark:bg-slate-900/90 dark:text-indigo-300">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold leading-snug text-slate-900 transition group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {p.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {p.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="text-slate-700 dark:text-slate-300">@{p.author?.username || 'Penulis'}</span>
                    <div className="flex items-center gap-2">
                      <span>{p.reading_time || 1} mnt baca</span>
                      <span>·</span>
                      <span>{new Date(p.published_at || p.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
