// src/app/problems/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProblemCard from '@/components/ProblemCard'
import SearchBar from '@/components/SearchBar'

type SortOption = 'latest' | 'views' | 'helpful'

function ProblemsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQ = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialTag = searchParams.get('tag') || ''
  const initialSort = (searchParams.get('sort') as SortOption) || 'latest'

  const [problems, setProblems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)
  const [tag, setTag] = useState(initialTag)
  const [sort, setSort] = useState<SortOption>(initialSort)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
    fetch('/api/tags').then(r => r.json()).then(d => setTags(d.tags || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (tag) params.set('tag', tag)
    params.set('sort', sort)

    fetch(`/api/problems?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setProblems(d.problems || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [query, category, tag, sort])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'latest', label: '🕐 ล่าสุด' },
    { value: 'views', label: '◉ ยอดดูสูง' },
    { value: 'helpful', label: '▲ ช่วยได้มาก' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-[var(--accent)]" />
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--text)]">ปัญหาทั้งหมด</h1>
            <p className="text-[10px] font-mono text-[var(--muted)]">
              {loading ? '...' : `พบ ${problems.length} รายการ`}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <SearchBar
            defaultValue={query}
            onSearch={setQuery}
            placeholder="ค้นหาปัญหา, อาการ, วิธีแก้..."
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-52 shrink-0">
            {/* Sort */}
            <div className="terminal-card p-4 mb-4">
              <div className="text-[10px] font-mono text-[var(--accent)] mb-3 uppercase tracking-widest">
                ⇅ เรียงตาม
              </div>
              <div className="flex flex-col gap-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`text-left text-xs font-mono px-2 py-1.5 transition-all ${
                      sort === opt.value
                        ? 'text-[var(--accent)] bg-[rgba(0,255,65,0.08)] border-l-2 border-[var(--accent)] pl-1.5'
                        : 'text-[var(--muted)] hover:text-[var(--text)] border-l-2 border-transparent pl-1.5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="terminal-card p-4 mb-4">
              <div className="text-[10px] font-mono text-[var(--accent)] mb-3 uppercase tracking-widest">
                ◫ หมวดหมู่
              </div>
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left text-xs font-mono px-2 py-1.5 mb-1 transition-all border-l-2 ${
                  !category ? 'text-[var(--accent)] border-[var(--accent)] bg-[rgba(0,255,65,0.06)] pl-1.5' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] pl-1.5'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(category === cat.slug ? '' : cat.slug)}
                  className={`w-full text-left text-xs font-mono px-2 py-1.5 transition-all border-l-2 pl-1.5 ${
                    category === cat.slug
                      ? 'border-l-2 pl-1.5'
                      : 'border-transparent hover:text-[var(--text)]'
                  }`}
                  style={{
                    color: category === cat.slug ? cat.color : undefined,
                    borderColor: category === cat.slug ? cat.color : undefined,
                  }}
                >
                  {cat.name} <span className="text-[var(--dim)]">({cat.problemCount})</span>
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="terminal-card p-4">
              <div className="text-[10px] font-mono text-[var(--accent)] mb-3 uppercase tracking-widest">
                # Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 15).map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => setTag(tag === t.slug ? '' : t.slug)}
                    className={`text-[10px] font-mono px-2 py-0.5 border transition-all ${
                      tag === t.slug
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,65,0.08)]'
                        : 'border-[var(--border)] text-[var(--dim)] hover:border-[var(--muted)] hover:text-[var(--muted)]'
                    }`}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Problem List */}
          <div className="flex-1">
            {/* Active filters */}
            {(query || category || tag) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {query && (
                  <div className="flex items-center gap-1 bg-[rgba(0,255,65,0.08)] border border-[var(--accent)] px-2 py-1 text-[10px] font-mono text-[var(--accent)]">
                    search: &quot;{query}&quot;
                    <button onClick={() => setQuery('')} className="ml-1 hover:text-[var(--red)]">×</button>
                  </div>
                )}
                {category && (
                  <div className="flex items-center gap-1 border px-2 py-1 text-[10px] font-mono" style={{ borderColor: categories.find(c => c.slug === category)?.color || '#fff', color: categories.find(c => c.slug === category)?.color }}>
                    cat: {category}
                    <button onClick={() => setCategory('')} className="ml-1 hover:text-[var(--red)]">×</button>
                  </div>
                )}
                {tag && (
                  <div className="flex items-center gap-1 bg-[rgba(0,212,255,0.08)] border border-[var(--blue)] px-2 py-1 text-[10px] font-mono text-[var(--blue)]">
                    #{tag}
                    <button onClick={() => setTag('')} className="ml-1 hover:text-[var(--red)]">×</button>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="terminal-card h-36 relative overflow-hidden">
                    <div className="loading-bar absolute top-0 left-0 right-0" />
                    <div className="p-5">
                      <div className="h-4 bg-[var(--border)] rounded mb-3 w-3/4" />
                      <div className="h-3 bg-[var(--border)] rounded mb-2 w-full" />
                      <div className="h-3 bg-[var(--border)] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : problems.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                {problems.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            ) : (
              <div className="terminal-card p-16 text-center animate-fade-in">
                <div className="text-5xl mb-4 text-[var(--dim)]">◫</div>
                <p className="font-display font-bold text-sm text-[var(--muted)] mb-2">
                  ไม่พบข้อมูลที่ค้นหา
                </p>
                <p className="text-xs font-mono text-[var(--dim)]">
                  ลองเปลี่ยนคำค้นหาหรือลดตัวกรอง
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsContent />
    </Suspense>
  )
}
