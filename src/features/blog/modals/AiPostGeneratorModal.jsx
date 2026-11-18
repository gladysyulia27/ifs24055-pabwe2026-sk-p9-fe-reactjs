import React, { useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { generateArticle } from '../api/blogApi'
import { CATEGORIES } from '../components/PublicArticleList'

const inputCls =
  'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

export default function AiPostGeneratorModal({ onClose, onApply, token }) {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [search, setSearch] = useState(true)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState(null)
  const [sources, setSources] = useState([])

  async function generate() {
    if (!topic.trim()) return alert('Masukkan topik artikel.')
    setBusy(true)
    try {
      const d = await generateArticle(
        { topic, category, include_web_search: search },
        token
      )
      setDraft(d.article)
      setSources(d.search_sources || [])
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-indigo-900 bg-indigo-950 px-6 py-4 text-white">
        <div>
          <p className="text-xs font-semibold text-indigo-300">AI WRITING STUDIO</p>
          <h2 className="text-lg font-bold text-white">AI Article Generator</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-xl bg-white/10 text-xl font-bold text-white transition hover:bg-white/20"
        >
          ×
        </button>
      </header>
      <main className="grid flex-1 gap-6 overflow-auto p-6 md:grid-cols-[320px_1fr]">
        <section className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Topik artikel
            <textarea
              rows="4"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Dampak AI generatif terhadap pendidikan tinggi di Indonesia"
              className={inputCls}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.filter((x) => x !== 'Semua').map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 text-sm text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100">
            <input
              type="checkbox"
              checked={search}
              onChange={(e) => setSearch(e.target.checked)}
              className="mt-1 accent-indigo-600"
            />
            <span>
              <b>Integrasikan Search Engine</b>
              <small className="mt-1 block text-indigo-800 dark:text-indigo-200">
                Cari informasi terkini dan sertakan konteks sumber ke prompt AI.
              </small>
            </span>
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? 'Menelusuri & menyusun...' : '✦ Generate artikel'}
          </button>
        </section>
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          {draft ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  DRAF AI SIAP DITINJAU
                </span>
                <button
                  type="button"
                  onClick={() => onApply(draft)}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Gunakan di editor
                </button>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">{draft.title}</h1>
              <p className="mb-5 text-slate-600 dark:text-slate-300">{draft.excerpt}</p>
              <div className="prose max-w-none dark:prose-invert">
                <MarkdownViewer content={draft.content} />
              </div>
              {sources.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <b className="text-sm text-slate-900 dark:text-white">Sumber penelusuran</b>
                  {sources.map((s, i) => (
                    <p key={i} className="mt-2 break-words text-xs text-slate-600 dark:text-slate-400">
                      {i + 1}. {s}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full min-h-64 place-content-center text-center">
              <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-indigo-100 text-2xl text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                ✦
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Draf artikel akan muncul di sini</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                Tentukan topik, aktifkan pencarian web, lalu generate untuk membuat draf berbasis konteks.
              </p>
            </div>
          )}
        </section>
      </main>
      <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Tutup
        </button>
      </footer>
    </div>
  )
}
