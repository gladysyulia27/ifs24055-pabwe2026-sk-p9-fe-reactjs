import React from 'react'
import PostStats from './PostStats'

export default function AuthorDashboard({
  posts,
  stats,
  onOpenAiModal,
  onCreatePost,
  onEditPost,
  onTogglePublish,
  onDeletePost,
}) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">AUTHOR WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Ruang publikasi</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Kelola ide, draf, dan artikel yang telah diterbitkan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={onOpenAiModal}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ✦ AI Generator
          </button>
          <button
            type="button"
            onClick={onCreatePost}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            ＋ Tulis artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="border-b border-slate-200 p-5 font-bold text-slate-900 dark:border-slate-800 dark:text-white">
          Artikel saya <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">{posts.length} artikel</span>
        </h2>
        {posts.length === 0 ? (
          <div className="p-14 text-center">
            <p className="font-bold text-slate-900 dark:text-white">Belum ada artikel</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Mulai dengan menulis artikel atau gunakan AI Generator.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="truncate font-bold text-slate-900 dark:text-white">{p.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.is_published
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {p.is_published ? 'TERBIT' : 'DRAF'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {p.category} · {p.slug} · {new Date(p.updated_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(p.id)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {p.is_published ? 'Jadikan draf' : 'Terbitkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditPost(p)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePost(p.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/80 dark:text-rose-300 dark:hover:bg-rose-900/60"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
