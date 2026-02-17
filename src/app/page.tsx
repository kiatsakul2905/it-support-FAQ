// src/app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SearchBar from '@/components/SearchBar'
import ProblemCard from '@/components/ProblemCard'

async function getHomeData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://it-support-faq.vercel.app'

    const [problemsRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(`${baseUrl}/api/problems?sort=latest&limit=6`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/tags`, { cache: 'no-store' }),
    ])

    const problemsData = await problemsRes.json()
    const categoriesData = await categoriesRes.json()
    const tagsData = await tagsRes.json()

    return {
      problems: problemsData.problems || [],
      categories: categoriesData.categories || [],
      tags: (tagsData.tags || []).slice(0, 12),
    }
  } catch {
    return { problems: [], categories: [], tags: [] }
  }
}

const ICON_MAP: Record<string, string> = {
  cpu: '⬡',
  monitor: '▣',
  wifi: '◎',
  shield: '◈',
  mail: '◉',
  printer: '▤',
  folder: '◫',
}

export default async function HomePage() {
  const { problems, categories, tags } = await getHomeData()

  const totalProblems = categories.reduce((sum: number, c: any) => sum + (c.problemCount || 0), 0)

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 border border-[var(--border)] rotate-45 opacity-20 pointer-events-none" />
        <div className="absolute top-20 right-20 w-32 h-32 border border-[var(--accent)] rotate-45 opacity-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 border border-[var(--border)] px-3 py-1.5 mb-6">
            <div className="status-dot" />
            <span className="text-xs font-mono text-[var(--muted)]">SYSTEM ONLINE</span>
            <span className="text-xs font-mono text-[var(--dim)]">// IT Support Knowledge Base v2.0</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl mb-2 leading-none">
            <span className="text-[var(--text)]">IT</span>
            <span className="text-[var(--accent)] glow-green"> SUPPORT</span>
          </h1>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--muted)] mb-2 tracking-widest">
            KNOWLEDGE BASE
          </h2>
          <p className="text-[var(--muted)] text-sm font-mono mb-8">
            ค้นหาวิธีแก้ปัญหา IT ได้อย่างรวดเร็ว — Hardware, Software, Network และอื่นๆ
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mb-8 text-xs font-mono">
            <span>
              <span className="text-[var(--accent)]">{totalProblems}</span>
              <span className="text-[var(--dim)]"> ปัญหา</span>
            </span>
            <span className="text-[var(--border)]">|</span>
            <span>
              <span className="text-[var(--blue)]">{categories.length}</span>
              <span className="text-[var(--dim)]"> หมวดหมู่</span>
            </span>
            <span className="text-[var(--border)]">|</span>
            <span>
              <span className="text-[var(--amber)]">{tags.length}</span>
              <span className="text-[var(--dim)]"> tags</span>
            </span>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SearchBar autoFocus />
          </div>

          {/* Popular tags */}
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-[10px] font-mono text-[var(--dim)] self-center">popular:</span>
              {tags.slice(0, 8).map((tag: any) => (
                <Link
                  key={tag.slug}
                  href={`/problems?tag=${tag.slug}`}
                  className="text-[10px] font-mono text-[var(--muted)] border border-[var(--border)] px-2 py-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[var(--accent)] font-mono text-xs">01.</span>
            <h2 className="font-display font-bold text-sm tracking-widest text-[var(--text)] uppercase">
              หมวดหมู่ปัญหา
            </h2>
            <div className="flex-1 h-px bg-[var(--border)]" />
            <Link href="/categories" className="text-[10px] font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat: any) => (
              <Link key={cat.slug} href={`/problems?category=${cat.slug}`}>
                <div
                  className="terminal-card p-4 text-center hover-lift box-glow-hover transition-all group cursor-pointer"
                  style={{ borderColor: cat.color + '40' }}
                >
                  <div
                    className="text-2xl mb-2 transition-transform group-hover:scale-110"
                    style={{ filter: `drop-shadow(0 0 8px ${cat.color})` }}
                  >
                    {ICON_MAP[cat.icon] || '◫'}
                  </div>
                  <div className="font-display font-bold text-xs mb-1" style={{ color: cat.color }}>
                    {cat.name}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--dim)]">
                    {cat.problemCount} ปัญหา
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Problems */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[var(--accent)] font-mono text-xs">02.</span>
          <h2 className="font-display font-bold text-sm tracking-widest text-[var(--text)] uppercase">
            ปัญหาล่าสุด
          </h2>
          <div className="flex-1 h-px bg-[var(--border)]" />
          <Link href="/problems" className="text-[10px] font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            ดูทั้งหมด →
          </Link>
        </div>

        {problems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((problem: any) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        ) : (
          <div className="terminal-card p-12 text-center">
            <div className="text-4xl mb-3 text-[var(--dim)]">◫</div>
            <p className="font-mono text-sm text-[var(--muted)]">ยังไม่มีข้อมูลปัญหา</p>
            <Link href="/admin/problems/new" className="mt-4 inline-block btn-primary px-4 py-2 text-xs">
              + เพิ่มปัญหาแรก
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-[var(--dim)]">
          <span>IT SUPPORT KB // Built with Next.js + Neon</span>
          <span>Deployed on Cloudflare Pages</span>
        </div>
      </footer>
    </div>
  )
}
