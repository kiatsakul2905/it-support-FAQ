// src/components/ProblemCard.tsx
import Link from 'next/link'
import { formatDate, formatNumber, getCategoryColor } from '@/lib/utils'
import type { Problem } from '@/lib/utils'

interface ProblemCardProps {
  problem: Problem & {
    category?: { name: string; slug: string; color: string }
    tags?: { name: string; slug: string }[]
  }
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  const catColor = problem.category?.color || '#00ff41'

  return (
    <Link href={`/problems/${problem.slug}`}>
      <article
        className="terminal-card p-5 hover-lift box-glow-hover transition-all cursor-pointer group"
        style={{ borderLeftColor: catColor, borderLeftWidth: '2px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-sm leading-snug">
            {problem.title}
          </h3>
          {problem.category && (
            <span
              className="badge shrink-0 text-[10px]"
              style={{ color: catColor, borderColor: catColor }}
            >
              {problem.category.name}
            </span>
          )}
        </div>

        {/* Symptoms preview */}
        <p className="text-[var(--muted)] text-xs leading-relaxed mb-3 line-clamp-2">
          {problem.symptoms.replace(/[-*#]/g, '').trim().slice(0, 120)}...
        </p>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.slug}
                className="text-[10px] font-mono text-[var(--dim)] border border-[var(--border)] px-1.5 py-0.5"
              >
                #{tag.name}
              </span>
            ))}
            {problem.tags.length > 4 && (
              <span className="text-[10px] font-mono text-[var(--dim)]">
                +{problem.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--dim)] border-t border-[var(--border)] pt-3 mt-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-[var(--accent)]">◉</span>
              {formatNumber(problem.viewCount)} views
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--blue)]">▲</span>
              {formatNumber(problem.helpfulCount)} helpful
            </span>
          </div>
          <span>{formatDate(problem.createdAt)}</span>
        </div>
      </article>
    </Link>
  )
}
