// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { formatDate } from '@/lib/utils'

export default function AdminPage() {
  const [problems, setProblems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authInput, setAuthInput] = useState('')
  const [authError, setAuthError] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [tab, setTab] = useState<'problems' | 'categories' | 'tags'>('problems')
  const [tags, setTags] = useState<any[]>([])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const pwd = authInput.trim()
    if (!pwd) {
      setAuthError(true)
      return
    }

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })

      if (res.ok) {
        setAdminKey(pwd)
        setAuthenticated(true)
        localStorage.setItem('admin-key', pwd)
      } else {
        setAuthError(true)
      }
    } catch (err) {
      setAuthError(true)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('admin-key')
    if (saved) {
      setAdminKey(saved)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    setLoading(true)
    Promise.all([
      fetch('/api/problems?limit=100').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]).then(([pData, cData, tData]) => {
      setProblems(pData.problems || [])
      setCategories(cData.categories || [])
      setTags(tData.tags || [])
      setLoading(false)
    })
  }, [authenticated])

  async function handleDelete(slug: string, id: number) {
    if (!confirm(`ต้องการลบปัญหานี้?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/problems/${slug}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      })
      if (res.ok) {
        setProblems(prev => prev.filter(p => p.id !== id))
      } else {
        alert('ลบไม่ได้: ตรวจสอบ Admin Key')
      }
    } catch {
      alert('เกิดข้อผิดพลาด')
    }
    setDeleting(null)
  }

  function handleLogout() {
    setAuthenticated(false)
    setAdminKey('')
    localStorage.removeItem('admin-key')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] grid-bg">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="terminal-card p-8">
            <div className="text-center mb-6">
              <div className="text-3xl mb-3 text-[var(--amber)]">⚙</div>
              <h1 className="font-display font-bold text-xl text-[var(--text)]">Admin Access</h1>
              <p className="text-[10px] font-mono text-[var(--dim)] mt-1">กรอก Admin Password เพื่อเข้าระบบ</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-[10px] font-mono text-[var(--muted)] mb-1.5">
                  $ ADMIN_PASSWORD
                </label>
                <input
                  type="password"
                  value={authInput}
                  onChange={e => { setAuthInput(e.target.value); setAuthError(false) }}
                  className="search-input w-full px-3 py-2 text-sm"
                  placeholder="••••••••"
                  autoFocus
                />
                {authError && (
                  <p className="text-[10px] text-[var(--red)] font-mono mt-1">กรุณากรอก password</p>
                )}
              </div>
              <button type="submit" className="btn-primary w-full py-2.5 text-sm font-mono">
                [ AUTHENTICATE ]
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[var(--amber)]" />
            <div>
              <h1 className="font-display font-bold text-xl text-[var(--amber)]">Admin Dashboard</h1>
              <p className="text-[10px] font-mono text-[var(--dim)]">จัดการฐานข้อมูล IT Support</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/problems/new" className="btn-primary px-4 py-2 text-xs">
              + เพิ่มปัญหา
            </Link>
            <button onClick={handleLogout} className="btn-danger px-3 py-2 text-xs">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'ปัญหาทั้งหมด', value: problems.length, color: 'var(--accent)' },
            { label: 'หมวดหมู่', value: categories.length, color: 'var(--blue)' },
            { label: 'Tags', value: tags.length, color: 'var(--amber)' },
          ].map(stat => (
            <div key={stat.label} className="terminal-card p-4 text-center">
              <div className="font-display font-black text-3xl" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[10px] font-mono text-[var(--dim)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] mb-5">
          {(['problems', 'categories', 'tags'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-mono border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {t === 'problems' ? '◫ ปัญหา' : t === 'categories' ? '◈ หมวดหมู่' : '# Tags'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="terminal-card p-8 text-center">
            <div className="loading-bar" />
            <p className="font-mono text-xs text-[var(--muted)] mt-4">กำลังโหลด...</p>
          </div>
        ) : tab === 'problems' ? (
          <div className="terminal-card overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                  <th className="text-left px-4 py-3 text-[var(--accent)] uppercase tracking-widest">ชื่อปัญหา</th>
                  <th className="text-left px-4 py-3 text-[var(--accent)] uppercase tracking-widest hidden sm:table-cell">หมวด</th>
                  <th className="text-right px-4 py-3 text-[var(--accent)] uppercase tracking-widest hidden md:table-cell">Views</th>
                  <th className="text-right px-4 py-3 text-[var(--accent)] uppercase tracking-widest hidden md:table-cell">▲ Helpful</th>
                  <th className="text-right px-4 py-3 text-[var(--accent)] uppercase tracking-widest hidden lg:table-cell">วันที่</th>
                  <th className="text-right px-4 py-3 text-[var(--accent)] uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/problems/${p.slug}`}
                        className="text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-1"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.category ? (
                        <span className="badge text-[9px]" style={{ color: p.category.color, borderColor: p.category.color }}>
                          {p.category.name}
                        </span>
                      ) : <span className="text-[var(--dim)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--muted)] hidden md:table-cell">
                      {p.viewCount}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--blue)] hidden md:table-cell">
                      {p.helpfulCount}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--dim)] hidden lg:table-cell">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/problems/${p.slug}/edit`}
                          className="btn-amber px-2 py-1 text-[10px]"
                        >
                          แก้ไข
                        </Link>
                        <button
                          onClick={() => handleDelete(p.slug, p.id)}
                          disabled={deleting === p.id}
                          className="btn-danger px-2 py-1 text-[10px]"
                        >
                          {deleting === p.id ? '...' : 'ลบ'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {problems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[var(--dim)] font-mono text-sm">ยังไม่มีข้อมูลปัญหา</p>
                <Link href="/admin/problems/new" className="btn-primary inline-block mt-4 px-4 py-2 text-xs">
                  + เพิ่มปัญหาแรก
                </Link>
              </div>
            )}
          </div>
        ) : tab === 'categories' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="terminal-card p-4" style={{ borderLeftColor: cat.color, borderLeftWidth: 2 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-sm" style={{ color: cat.color }}>{cat.name}</span>
                  <span className="text-[10px] font-mono text-[var(--dim)]">{cat.problemCount} ปัญหา</span>
                </div>
                <p className="text-[10px] font-mono text-[var(--muted)] line-clamp-2">{cat.description || '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="border border-[var(--border)] px-3 py-2 flex items-center gap-2"
              >
                <span className="text-xs font-mono text-[var(--text)]">#{tag.name}</span>
                <span className="text-[9px] font-mono text-[var(--dim)]">{tag.usageCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
