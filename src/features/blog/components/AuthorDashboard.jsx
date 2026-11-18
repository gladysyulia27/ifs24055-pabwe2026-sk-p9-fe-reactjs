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
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-600">AUTHOR WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-black">Ruang publikasi</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola ide, draf, dan artikel yang telah diterbitkan.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenAiModal}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            ✦ AI Generator
          </button>
          <button
            onClick={onCreatePost}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            ＋ Tulis artikel
          </button>
        </div>
      </div>

      <PostStats stats={stats} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 font-bold dark:border-slate-800">
          Artikel saya <span className="ml-2 text-sm font-normal text-slate-400">{posts.length} artikel</span>
        </div>
        {posts.length === 0 ? (
          <div className="p-14 text-center">
            <p className="font-bold">Belum ada artikel</p>
            <p className="mt-1 text-sm text-slate-500">Mulai dengan menulis artikel atau gunakan AI Generator.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold">{p.title}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        p.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.is_published ? 'TERBIT' : 'DRAF'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.category} · {p.slug} · {new Date(p.updated_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onTogglePublish(p.id)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {p.is_published ? 'Jadikan draf' : 'Terbitkan'}
                  </button>
                  <button
                    onClick={() => onEditPost(p)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePost(p.id)}
                    className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950"
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
