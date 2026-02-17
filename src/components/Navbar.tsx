// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = pathname.startsWith('/admin')

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-7 h-7 border border-[var(--accent)] flex items-center justify-center relative">
              <span className="text-[var(--accent)] font-mono text-xs font-bold">IT</span>
              <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <span className="font-display font-bold text-base text-[var(--accent)] tracking-wider">
              SUPPORT<span className="text-[var(--muted)]">::</span>KB
            </span>
            <span className="hidden sm:block text-[var(--muted)] text-xs font-mono">
              [ระบบค้นหาปัญหา IT]
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === '/'}>
              ~ Home
            </NavLink>
            <NavLink href="/problems" active={pathname.startsWith('/problems') && !pathname.startsWith('/problems/')}>
              ~ ปัญหาทั้งหมด
            </NavLink>
            <NavLink href="/categories" active={pathname.startsWith('/categories')}>
              ~ หมวดหมู่
            </NavLink>
            <NavLink href="/tags" active={pathname.startsWith('/tags')}>
              ~ Tags
            </NavLink>
            
            <div className="w-px h-5 bg-[var(--border)] mx-2" />
            
            <Link
              href="/admin"
              className={`px-3 py-1.5 text-xs font-mono border transition-all ${
                isAdmin
                  ? 'border-[var(--amber)] text-[var(--amber)] bg-[rgba(255,184,0,0.08)]'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--amber)]'
              }`}
            >
              ⚙ Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[var(--muted)] hover:text-[var(--accent)] p-2 font-mono text-sm"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '[ X ]' : '[ ≡ ]'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-1">
            {[
              { href: '/', label: '~ Home' },
              { href: '/problems', label: '~ ปัญหาทั้งหมด' },
              { href: '/categories', label: '~ หมวดหมู่' },
              { href: '/tags', label: '~ Tags' },
              { href: '/admin', label: '⚙ Admin' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[var(--text)] hover:text-[var(--accent)] py-2 text-sm font-mono border-b border-[var(--border)] last:border-0"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-mono transition-all border ${
        active
          ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,65,0.06)]'
          : 'border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border)]'
      }`}
    >
      {children}
    </Link>
  )
}
