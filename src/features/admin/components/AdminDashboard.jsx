import React, { useState } from 'react'
import { IconEye, IconShield } from '@tabler/icons-react'

export default function AdminDashboard({ users, onLoadUserTodos }) {
  const [selectedUserTodos, setSelectedUserTodos] = useState(null)
  const [selectedUsername, setSelectedUsername] = useState('')

  const handleInspect = async (user) => {
    setSelectedUsername(user.username)
    const todos = await onLoadUserTodos(user.id)
    setSelectedUserTodos(todos || [])
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Panel Pengawasan Administrator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Memantau seluruh pengguna terdaftar dan menginspeksi aktivitas todolist pengguna lain dalam mode baca saja (read-only).
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Pengguna</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Peran</th>
              <th className="px-6 py-3 text-center">Total Todo</th>
              <th className="px-6 py-3 text-center">Selesai</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users && users.length > 0 ? (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{u.username}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {u.total_todos}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    {u.total_selesai}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleInspect(u)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <IconEye size={14} />
                      <span>Monitoring Todo</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Read-Only Modal for Inspected User Todos */}
      {selectedUserTodos !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-white/10 rounded-lg flex items-center justify-center">
                  <IconShield size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold">
                    Monitoring Tugas Pengguna: {selectedUsername} (Read-Only)
                  </h3>
                  <p className="text-xs text-slate-400">Panel inspeksi tugas anggota oleh administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserTodos(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold transition cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <h4 className="font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Daftar Tugas Milik {selectedUsername} ({selectedUserTodos.length} item)
                </h4>
                <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  {selectedUserTodos.length > 0 ? (
                    selectedUserTodos.map((t) => (
                      <div key={t.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{t.title}</p>
                          {t.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
                          )}
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          {t.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-6 text-center text-xs text-slate-400">Pengguna ini belum memiliki tugas.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserTodos(null)}
                className="px-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition cursor-pointer"
              >
                Tutup Pemantauan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
