// src/app/admin/problems/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function NewProblemPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [allTags, setAllTags] = useState<any[]>([])
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')

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

    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/tags').then(r => r.json()).then(d => setAllTags(d.tags || []))
  }, [])

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
      setForm(prev => ({
        ...prev,
        newTag: '',
        tagIds: [...prev.tagIds, data.tag.id],
      }))
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
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
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
        const data = await res.json()
        setError(data.error || 'เกิดข้อผิดพลาด กรุณาตรวจสอบ Admin Key')
      }
    } catch {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-[var(--accent)]" />
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--text)]">เพิ่มปัญหาใหม่</h1>
            <p className="text-[10px] font-mono text-[var(--dim)]">New Problem Entry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="terminal-card p-5">
            <FormField label="ชื่อปัญหา *" hint="ตั้งชื่อให้ชัดเจน เช่น 'WiFi เชื่อมต่อไม่ได้'">
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className="search-input w-full px-3 py-2 text-sm"
                placeholder="ชื่อปัญหา..."
              />
            </FormField>
          </div>

          {/* Category + Tags */}
          <div className="terminal-card p-5 grid sm:grid-cols-2 gap-5">
            <FormField label="หมวดหมู่" hint="เลือกหมวดที่เหมาะสม">
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
            </FormField>

            <FormField label="Tags" hint="เลือก tags หรือเพิ่มใหม่">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.newTag}
                  onChange={e => set('newTag', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                  className="search-input flex-1 px-3 py-1.5 text-xs"
                  placeholder="พิมพ์ tag ใหม่..."
                />
                <button type="button" onClick={addNewTag} className="btn-primary px-3 py-1 text-xs">
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 border transition-all ${
                      form.tagIds.includes(tag.id)
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,65,0.08)]'
                        : 'border-[var(--border)] text-[var(--dim)] hover:border-[var(--muted)]'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {/* Symptoms */}
          <div className="terminal-card p-5">
            <FormField label="⚠ อาการ *" hint="บอกอาการที่สังเกตได้ (แต่ละอาการขึ้นบรรทัดใหม่)" color="var(--red)">
              <textarea
                value={form.symptoms}
                onChange={e => set('symptoms', e.target.value)}
                className="search-input w-full px-3 py-2 text-sm resize-none"
                rows={4}
                placeholder="- อาการที่ 1&#10;- อาการที่ 2&#10;- อาการที่ 3"
              />
            </FormField>
          </div>

          {/* Causes */}
          <div className="terminal-card p-5">
            <FormField label="◎ สาเหตุ *" hint="ระบุสาเหตุที่เป็นไปได้" color="var(--amber)">
              <textarea
                value={form.causes}
                onChange={e => set('causes', e.target.value)}
                className="search-input w-full px-3 py-2 text-sm resize-none"
                rows={4}
                placeholder="- สาเหตุที่ 1&#10;- สาเหตุที่ 2"
              />
            </FormField>
          </div>

          {/* Solution */}
          <div className="terminal-card p-5">
            <FormField label="✓ วิธีแก้ไข *" hint="รองรับ Markdown: ### หัวข้อ, ```code```, - รายการ" color="var(--accent)">
              <textarea
                value={form.solution}
                onChange={e => set('solution', e.target.value)}
                className="search-input w-full px-3 py-2 text-sm resize-none font-mono text-xs"
                rows={10}
                placeholder="### วิธีที่ 1&#10;1. ขั้นตอนแรก&#10;2. ขั้นตอนสอง&#10;&#10;```&#10;คำสั่ง&#10;```"
              />
            </FormField>
          </div>

          {error && (
            <div className="border border-[var(--red)] p-3 text-xs font-mono text-[var(--red)]">
              ⚠ {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="btn-danger px-6 py-2.5 text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-2.5 text-sm"
            >
              {saving ? '[ กำลังบันทึก... ]' : '[ บันทึกข้อมูล ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({
  label,
  hint,
  color,
  children,
}: {
  label: string
  hint?: string
  color?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-mono font-bold mb-1" style={{ color: color || 'var(--accent)' }}>
        {label}
      </label>
      {hint && <p className="text-[10px] font-mono text-[var(--dim)] mb-2">{hint}</p>}
      {children}
    </div>
  )
}
