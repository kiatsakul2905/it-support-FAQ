// src/app/admin/problems/[slug]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function EditProblemPage() {
  const router = useRouter()
  const { slug } = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [allTags, setAllTags] = useState<any[]>([])
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [problemId, setProblemId] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: '',
    symptoms: '',
    causes: '',
    solution: '',
    categoryId: '',
    tagIds: [] as number[],
    newTag: '',
  })

  useEffect(() => {
    const key = localStorage.getItem('admin-key') || ''
    setAdminKey(key)

    Promise.all([
      fetch(`/api/problems/${slug}`).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/tags').then(r => r.json()),
    ]).then(([problem, cData, tData]) => {
      setCategories(cData.categories || [])
      setAllTags(tData.tags || [])
      setProblemId(problem.id)
      setForm({
        title: problem.title || '',
        symptoms: problem.symptoms || '',
        causes: problem.causes || '',
        solution: problem.solution || '',
        categoryId: problem.categoryId?.toString() || '',
        tagIds: (problem.tags || []).map((t: any) => t.id),
        newTag: '',
      })
      setLoading(false)
    })
  }, [slug])

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTag(tagId: number) {
    setForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  async function addNewTag() {
    if (!form.newTag.trim()) return
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ name: form.newTag.trim().toLowerCase() }),
    })
    if (res.ok) {
      const data = await res.json()
      setAllTags(prev => [...prev, data.tag])
      setForm(prev => ({ ...prev, newTag: '', tagIds: [...prev.tagIds, data.tag.id] }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.symptoms || !form.causes || !form.solution) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/problems/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          title: form.title,
          symptoms: form.symptoms,
          causes: form.causes,
          solution: form.solution,
          categoryId: form.categoryId ? parseInt(form.categoryId) : null,
          tagIds: form.tagIds,
        }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        setError('บันทึกไม่ได้ ตรวจสอบ Admin Key')
      }
    } catch {
      setError('เกิดข้อผิดพลาด')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] grid-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="font-mono text-xs text-[var(--muted)]">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-[var(--amber)]" />
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--amber)]">แก้ไขปัญหา</h1>
            <p className="text-[10px] font-mono text-[var(--dim)]">Edit Problem #{problemId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="terminal-card p-5">
            <label className="block text-xs font-mono font-bold mb-1 text-[var(--accent)]">ชื่อปัญหา *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="search-input w-full px-3 py-2 text-sm"
            />
          </div>

          <div className="terminal-card p-5 grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono font-bold mb-1 text-[var(--accent)]">หมวดหมู่</label>
              <select
                value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className="search-input w-full px-3 py-2 text-sm appearance-none"
              >
                <option value="">— ไม่ระบุ —</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold mb-1 text-[var(--accent)]">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.newTag}
                  onChange={e => set('newTag', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                  className="search-input flex-1 px-3 py-1.5 text-xs"
                  placeholder="เพิ่ม tag ใหม่..."
                />
                <button type="button" onClick={addNewTag} className="btn-primary px-3 py-1 text-xs">+</button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 border transition-all ${
                      form.tagIds.includes(tag.id)
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--dim)]'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="terminal-card p-5">
            <label className="block text-xs font-mono font-bold mb-1 text-[var(--red)]">⚠ อาการ *</label>
            <textarea
              value={form.symptoms}
              onChange={e => set('symptoms', e.target.value)}
              className="search-input w-full px-3 py-2 text-sm resize-none"
              rows={4}
            />
          </div>

          <div className="terminal-card p-5">
            <label className="block text-xs font-mono font-bold mb-1 text-[var(--amber)]">◎ สาเหตุ *</label>
            <textarea
              value={form.causes}
              onChange={e => set('causes', e.target.value)}
              className="search-input w-full px-3 py-2 text-sm resize-none"
              rows={4}
            />
          </div>

          <div className="terminal-card p-5">
            <label className="block text-xs font-mono font-bold mb-1 text-[var(--accent)]">✓ วิธีแก้ไข *</label>
            <textarea
              value={form.solution}
              onChange={e => set('solution', e.target.value)}
              className="search-input w-full px-3 py-2 text-sm resize-none font-mono text-xs"
              rows={10}
            />
          </div>

          {error && (
            <div className="border border-[var(--red)] p-3 text-xs font-mono text-[var(--red)]">⚠ {error}</div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.push('/admin')} className="btn-danger px-6 py-2.5 text-sm">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="btn-amber px-8 py-2.5 text-sm">
              {saving ? '[ กำลังบันทึก... ]' : '[ บันทึกการแก้ไข ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
