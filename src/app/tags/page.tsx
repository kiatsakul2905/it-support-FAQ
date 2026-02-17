// src/app/tags/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'

async function getTags() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://it-support-faq.vercel.app'
    const res = await fetch(`/api/tags`, { cache: 'no-store' })
    const data = await res.json()
    return data.tags || []
  } catch {
    return []
  }
}

export default async function TagsPage() {
  const tags = await getTags()

  const maxCount = Math.max(...tags.map((t: any) => t.usageCount), 1)

  function getTagSize(count: number) {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'text-lg'
    if (ratio > 0.4) return 'text-base'
    if (ratio > 0.2) return 'text-sm'
    return 'text-xs'
  }

  function getTagOpacity(count: number) {
    const ratio = count / maxCount
    return 0.4 + ratio * 0.6
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-[var(--amber)]" />
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--text)]">Tags ทั้งหมด</h1>
            <p className="text-[10px] font-mono text-[var(--dim)]">
              {tags.length} tags — ขนาดแสดงความนิยม
            </p>
          </div>
        </div>

        {/* Tag cloud */}
        <div className="terminal-card p-8 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {tags.map((tag: any) => (
              <Link
                key={tag.slug}
                href={`/problems?tag=${tag.slug}`}
                className={`font-mono font-bold hover:text-[var(--accent)] transition-all hover:scale-110 ${getTagSize(tag.usageCount)}`}
                style={{
                  color: `rgba(0, 255, 65, ${getTagOpacity(tag.usageCount)})`,
                }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Tag list */}
        <div className="terminal-card overflow-hidden">
          <div className="border-b border-[var(--border)] bg-[var(--surface2)] px-4 py-2">
            <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest">
              รายการ Tags เรียงตามความนิยม
            </span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {tags.map((tag: any) => (
              <Link
                key={tag.slug}
                href={`/problems?tag=${tag.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface2)] transition-colors group"
              >
                <span className="text-sm font-mono text-[var(--text)] group-hover:text-[var(--accent)]">
                  #{tag.name}
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all"
                      style={{ width: `${(tag.usageCount / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--dim)] w-16 text-right">
                    {tag.usageCount} ปัญหา
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
