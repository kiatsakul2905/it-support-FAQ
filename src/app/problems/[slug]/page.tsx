// src/app/problems/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ProblemCard from '@/components/ProblemCard'
import { formatDate, formatNumber, renderMarkdown } from '@/lib/utils'

export default function ProblemDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [problem, setProblem] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rated, setRated] = useState<string | null>(null)
  const [ratingCounts, setRatingCounts] = useState({ helpful: 0, not_helpful: 0 })

  useEffect(() => {
    if (!slug) return
    fetch(`/api/problems/${slug}`)
      .then(r => {
        if (!r.ok) { router.push('/404'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setProblem(data)
        setRatingCounts({ helpful: data.helpfulCount, not_helpful: data.notHelpfulCount })
        setLoading(false)

        // Load related problems
        if (data.categoryId) {
          fetch(`/api/problems?category=${data.category?.slug}&limit=4`)
            .then(r => r.json())
            .then(d => {
              const filtered = (d.problems || []).filter((p: any) => p.id !== data.id).slice(0, 3)
              setRelated(filtered)
            })
        }
      })
      .catch(() => setLoading(false))

    const savedRating = localStorage.getItem(`rated-${slug}`)
    if (savedRating) setRated(savedRating)
  }, [slug])

  async function handleRate(rating: 'helpful' | 'not_helpful') {
    if (rated) return
    try {
      const res = await fetch(`/api/problems/${slug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      const data = await res.json()
      setRatingCounts({ helpful: data.helpfulCount, not_helpful: data.notHelpfulCount })
      setRated(rating)
      localStorage.setItem(`rated-${slug}`, rating)
    } catch (error) {
      console.error('Rating error:', error)
    }
  }

  const total = ratingCounts.helpful + ratingCounts.not_helpful
  const helpfulPct = total > 0 ? Math.round((ratingCounts.helpful / total) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] grid-bg">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="terminal-card p-8 relative overflow-hidden">
            <div className="loading-bar absolute top-0 left-0 right-0" />
            <div className="space-y-4">
              <div className="h-8 bg-[var(--border)] rounded w-3/4" />
              <div className="h-4 bg-[var(--border)] rounded w-1/4" />
              <div className="h-px bg-[var(--border)]" />
              <div className="h-4 bg-[var(--border)] rounded w-full" />
              <div className="h-4 bg-[var(--border)] rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-mono text-[var(--dim)] mb-6">
          <Link href="/" className="hover:text-[var(--accent)]">HOME</Link>
          <span>/</span>
          <Link href="/problems" className="hover:text-[var(--accent)]">PROBLEMS</Link>
          {problem.category && (
            <>
              <span>/</span>
              <Link
                href={`/problems?category=${problem.category.slug}`}
                className="hover:text-[var(--accent)]"
                style={{ color: problem.category.color }}
              >
                {problem.category.name.toUpperCase()}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[var(--muted)] truncate max-w-[200px]">{problem.slug}</span>
        </nav>

        <article className="animate-fade-in">
          {/* Main card */}
          <div className="terminal-card p-6 sm:p-8 mb-6">
            {/* Category + stats bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {problem.category && (
                  <span
                    className="badge text-[10px]"
                    style={{ color: problem.category.color, borderColor: problem.category.color }}
                  >
                    {problem.category.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--dim)]">
                <span>◉ {formatNumber(problem.viewCount)} views</span>
                <span>📅 {formatDate(problem.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text)] mb-4 leading-tight">
              {problem.title}
            </h1>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {problem.tags.map((tag: any) => (
                  <Link
                    key={tag.slug}
                    href={`/problems?tag=${tag.slug}`}
                    className="text-[10px] font-mono text-[var(--dim)] border border-[var(--border)] px-2 py-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="h-px bg-[var(--border)] mb-6" />

            {/* Problem sections */}
            <div className="space-y-6">
              <Section icon="⚠" label="อาการ" color="var(--red)">
                <div className="prose-terminal text-sm text-[var(--text)] whitespace-pre-line">
                  {problem.symptoms}
                </div>
              </Section>

              <Section icon="◎" label="สาเหตุ" color="var(--amber)">
                <div className="prose-terminal text-sm text-[var(--text)] whitespace-pre-line">
                  {problem.causes}
                </div>
              </Section>

              <Section icon="✓" label="วิธีแก้ไข" color="var(--accent)">
                <div
                  className="prose-terminal text-sm text-[var(--text)]"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.solution) }}
                />
              </Section>
            </div>
          </div>

          {/* Rating section */}
          <div className="terminal-card p-6 mb-6">
            <div className="text-center mb-4">
              <p className="font-display font-bold text-sm text-[var(--text)] mb-1">
                วิธีแก้ไขนี้ช่วยได้ไหม?
              </p>
              <p className="text-[10px] font-mono text-[var(--dim)]">
                ช่วยเราปรับปรุงเนื้อหาให้ดีขึ้น
              </p>
            </div>

            {rated ? (
              <div className="text-center animate-fade-in">
                <div className="text-2xl mb-2">
                  {rated === 'helpful' ? '✓' : '✗'}
                </div>
                <p className="text-sm font-mono text-[var(--accent)] mb-3">
                  {rated === 'helpful' ? 'ขอบคุณสำหรับ Feedback!' : 'ขอบคุณ เราจะปรับปรุงต่อไป'}
                </p>
                <div className="max-w-xs mx-auto">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--dim)] mb-1">
                    <span>▲ {ratingCounts.helpful} ช่วยได้</span>
                    <span>{helpfulPct}%</span>
                    <span>▼ {ratingCounts.not_helpful} ไม่ช่วย</span>
                  </div>
                  <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] transition-all duration-700"
                      style={{ width: `${helpfulPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleRate('helpful')}
                  className="flex items-center gap-2 btn-primary px-6 py-2 text-sm"
                >
                  <span>▲</span> ช่วยได้ ({ratingCounts.helpful})
                </button>
                <button
                  onClick={() => handleRate('not_helpful')}
                  className="flex items-center gap-2 btn-danger px-6 py-2 text-sm"
                >
                  <span>▼</span> ไม่ช่วย ({ratingCounts.not_helpful})
                </button>
              </div>
            )}
          </div>

          {/* Related problems */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[var(--accent)] font-mono text-xs">↳</span>
                <h2 className="font-display font-bold text-sm text-[var(--text)]">ปัญหาที่เกี่ยวข้อง</h2>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}

function Section({
  icon,
  label,
  color,
  children,
}: {
  icon: string
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <span
          className="text-xs font-display font-bold tracking-widest uppercase"
          style={{ color }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: `${color}30` }} />
      </div>
      <div className="pl-4 border-l-2" style={{ borderColor: `${color}40` }}>
        {children}
      </div>
    </div>
  )
}
