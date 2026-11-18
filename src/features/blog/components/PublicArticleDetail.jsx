import React from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'

export default function PublicArticleDetail({ detail, onBack }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 text-slate-900 dark:text-slate-100">
      {detail?.error ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Artikel tidak ditemukan.</p>
        </div>
      ) : !detail ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="font-medium text-slate-600 dark:text-slate-400">Memuat artikel...</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
          >
            ← Kembali ke artikel
          </button>

          <header>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {detail.post.category}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {detail.reading_time} menit membaca
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl dark:text-white">
              {detail.post.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{detail.post.excerpt}</p>

            <div className="my-8 flex items-center gap-3.5 border-y border-slate-200 py-5 text-sm dark:border-slate-800">
              <div className="grid size-11 place-items-center rounded-full bg-indigo-600 font-bold text-white shadow-xs">
                {detail.post.author?.username?.[0]?.toUpperCase() || 'D'}
              </div>
              <div>
                <b className="text-slate-900 dark:text-white">{detail.post.author?.username}</b>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(detail.post.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>
            </div>
          </header>

          {detail.post.cover_image_path && (
            <img
              src={detail.post.cover_image_path}
              alt="Cover artikel"
              className="mb-10 max-h-[420px] w-full rounded-2xl border border-slate-200 object-cover dark:border-slate-800"
            />
          )}

          <article className="prose prose-lg max-w-none text-slate-800 dark:prose-invert dark:text-slate-100">
            <MarkdownViewer content={detail.post.content} />
          </article>
        </div>
      )}
    </main>
  )
}
