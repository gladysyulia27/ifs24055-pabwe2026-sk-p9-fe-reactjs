import React from 'react'

export default function PostStats({ stats }) {
  const items = [
    ['Total artikel', stats?.total || 0, '▤'],
    ['Telah terbit', stats?.published || 0, '↗'],
    ['Draf', stats?.draft || 0, '◷'],
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {items.map(([label, value, icon]) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
            <span>{label}</span>
            <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
  )
}
