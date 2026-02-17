// src/app/categories/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const ICON_MAP: Record<string, string> = {
  cpu: '⬡', monitor: '▣', wifi: '◎', shield: '◈', mail: '◉', printer: '▤', folder: '◫',
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/categories`, { cache: 'no-store' })
    const data = await res.json()
    return data.categories || []
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-[var(--blue)]" />
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--text)]">หมวดหมู่ทั้งหมด</h1>
            <p className="text-[10px] font-mono text-[var(--dim)]">
              {categories.length} หมวดหมู่ — เลือกเพื่อดูปัญหาในหมวด
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat: any) => (
            <Link key={cat.slug} href={`/problems?category=${cat.slug}`}>
              <div
                className="terminal-card p-6 hover-lift box-glow-hover transition-all cursor-pointer group"
                style={{ borderTopColor: cat.color, borderTopWidth: 2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-4xl transition-transform group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 10px ${cat.color})` }}
                  >
                    {ICON_MAP[cat.icon] || '◫'}
                  </div>
                  <div
                    className="font-display font-black text-4xl opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ color: cat.color }}
                  >
                    {cat.problemCount}
                  </div>
                </div>

                <h2 className="font-display font-bold text-lg mb-1" style={{ color: cat.color }}>
                  {cat.name}
                </h2>
                <p className="text-xs font-mono text-[var(--muted)] line-clamp-2 mb-4">
                  {cat.description || '—'}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span style={{ color: cat.color }}>{cat.problemCount} ปัญหา</span>
                  <span className="text-[var(--dim)] group-hover:text-[var(--text)] transition-colors">
                    ดูทั้งหมด →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
