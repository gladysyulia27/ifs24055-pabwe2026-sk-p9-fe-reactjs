import React from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'

export default function PublicArticleDetail({ detail, onBack }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      {detail?.error ? (
        <p>Artikel tidak ditemukan.</p>
      ) : !detail ? (
        <p>Memuat artikel...</p>
      ) : (
        <>
          <button onClick={onBack} className="mb-8 text-sm font-semibold text-indigo-600">
            ← Kembali ke artikel
          </button>
          <div className="mb-6 flex gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
              {detail.post.category}
            </span>
            <span className="py-1 text-xs text-slate-400">{detail.reading_time} menit membaca</span>
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">{detail.post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-500">{detail.post.excerpt}</p>
          <div className="my-8 flex items-center gap-3 border-y py-5 text-sm dark:border-slate-800">
            <div className="grid size-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {detail.post.author?.username?.[0]?.toUpperCase() || 'D'}
            </div>
            <div>
              <b>{detail.post.author?.username}</b>
              <p className="text-xs text-slate-500">
                {new Date(detail.post.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
            </div>
          </div>
          {detail.post.cover_image_path && (
            <img
              src={detail.post.cover_image_path}
              alt="Cover artikel"
              className="mb-10 max-h-[420px] w-full rounded-2xl object-cover"
            />
          )}
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <MarkdownViewer content={detail.post.content} />
          </article>
        </>
      )}
    </main>
  )
}
