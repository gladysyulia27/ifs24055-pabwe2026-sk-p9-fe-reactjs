import React, { useEffect, useRef, useState } from 'react'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { CATEGORIES } from '../components/PublicArticleList'

const inputCls =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

export default function PostModal({ post, onClose, onSave }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    category: post?.category || 'Teknologi',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    cover_image_path: post?.cover_image_path || '',
    is_published: post?.is_published || false,
  })
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(false)
  const editorHost = useRef(null)
  const editorInstance = useRef(null)

  const change = (k, v) => setForm((x) => ({ ...x, [k]: v }))

  useEffect(() => {
    if (editorHost.current && !preview) {
      editorInstance.current = new Editor({
        el: editorHost.current,
        height: '55vh',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        initialValue: form.content,
        usageStatistics: false,
        toolbarItems: [
          ['heading', 'bold', 'italic'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['link', 'image'],
          ['code', 'codeblock'],
        ],
      })
      editorInstance.current.on('change', () => change('content', editorInstance.current.getMarkdown()))
      return () => {
        editorInstance.current?.destroy()
        editorInstance.current = null
      }
    }
  }, [preview])

  async function save() {
    const markdown = editorInstance.current?.getMarkdown() ?? form.content
    if (!form.title.trim() || !markdown.trim()) return alert('Judul dan konten wajib diisi.')
    setBusy(true)
    try {
      await onSave({ ...form, content: markdown })
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-6 py-4 text-white">
        <div>
          <p className="text-xs text-indigo-300">DELCom / WORKSPACE</p>
          <h2 className="text-lg font-bold">{post ? 'Edit artikel' : 'Tulis artikel baru'}</h2>
        </div>
        <button onClick={onClose} className="text-2xl">
          ×
        </button>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-5 overflow-auto p-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <section className="grid content-start gap-4">
          <input
            value={form.title}
            onChange={(e) => change('title', e.target.value)}
            placeholder="Judul artikel yang menarik..."
            className="w-full border-b border-slate-200 bg-transparent py-4 text-3xl font-bold outline-none dark:border-slate-700"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setPreview(false)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                preview
                  ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Editor Markdown
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                !preview
                  ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Pratinjau
            </button>
          </div>
          {preview ? (
            <div className="prose max-w-none dark:prose-invert">
              <MarkdownViewer content={form.content} />
            </div>
          ) : (
            <div
              ref={editorHost}
              className="min-h-[55vh] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
            />
          )}
        </section>
        <aside className="grid content-start gap-4">
          <h3 className="font-bold">Pengaturan artikel</h3>
          <label className="grid gap-2 text-sm">
            Kategori
            <select
              value={form.category}
              onChange={(e) => change('category', e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.filter((x) => x !== 'Semua').map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Ringkasan
            <textarea
              rows="4"
              value={form.excerpt}
              onChange={(e) => change('excerpt', e.target.value)}
              placeholder="Ringkasan singkat artikel..."
              className={inputCls}
            />
          </label>
          <label className="grid gap-2 text-sm">
            URL gambar sampul
            <input
              value={form.cover_image_path}
              onChange={(e) => change('cover_image_path', e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </label>
          <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Status publikasi diatur melalui tombol Terbitkan pada daftar artikel.
          </p>
          <div className="rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
            Tips: gunakan struktur heading yang jelas dan cantumkan sumber untuk klaim faktual.
          </div>
        </aside>
      </main>
      <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Batal
        </button>
        <button
          disabled={busy}
          onClick={save}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? 'Menyimpan...' : 'Simpan artikel'}
        </button>
      </footer>
    </div>
  )
}
