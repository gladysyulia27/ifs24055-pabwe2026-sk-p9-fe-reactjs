import React, { useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { generateArticle } from '../api/blogApi'
import { CATEGORIES } from '../components/PublicArticleList'

const inputCls =
  'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

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
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between bg-indigo-950 px-6 py-4 text-white">
        <div>
          <p className="text-xs text-indigo-300">AI WRITING STUDIO</p>
          <h2 className="text-lg font-bold">AI Article Generator</h2>
        </div>
        <button onClick={onClose} className="text-2xl">
          ×
        </button>
      </header>
      <main className="grid flex-1 gap-5 overflow-auto p-5 md:grid-cols-[320px_1fr]">
        <section className="grid content-start gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Topik artikel
            <textarea
              rows="4"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Dampak AI generatif terhadap pendidikan tinggi di Indonesia"
              className={inputCls}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
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
          <label className="flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100">
            <input
              type="checkbox"
              checked={search}
              onChange={(e) => setSearch(e.target.checked)}
              className="mt-1"
            />
            <span>
              <b>Integrasikan Search Engine</b>
              <small className="mt-1 block">
                Cari informasi terkini dan sertakan konteks sumber ke prompt AI.
              </small>
            </span>
          </label>
          <button
            onClick={generate}
            disabled={busy}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? 'Menelusuri & menyusun...' : '✦ Generate artikel'}
          </button>
        </section>
        <section className="min-w-0 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
          {draft ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  DRAF AI SIAP DITINJAU
                </span>
                <button
                  onClick={() => onApply(draft)}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Gunakan di editor
                </button>
              </div>
              <h1 className="mb-2 text-3xl font-bold">{draft.title}</h1>
              <p className="mb-5 text-slate-500">{draft.excerpt}</p>
              <div className="prose max-w-none dark:prose-invert">
                <MarkdownViewer content={draft.content} />
              </div>
              {sources.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <b className="text-sm">Sumber penelusuran</b>
                  {sources.map((s, i) => (
                    <p key={i} className="mt-2 break-words text-xs text-slate-500">
                      {i + 1}. {s}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full min-h-64 place-content-center text-center">
              <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-indigo-100 text-2xl text-indigo-700">
                ✦
              </div>
              <h3 className="font-bold">Draf artikel akan muncul di sini</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Tentukan topik, aktifkan pencarian web, lalu generate untuk membuat draf berbasis konteks.
              </p>
            </div>
          )}
        </section>
      </main>
      <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Tutup
        </button>
      </footer>
    </div>
  )
}
