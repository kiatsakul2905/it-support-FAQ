// src/lib/utils.ts

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function getCategoryColor(slug: string): string {
  const colors: Record<string, string> = {
    hardware: '#ff6b35',
    software: '#00d4ff',
    network: '#00ff41',
    security: '#ff3a3a',
    email: '#ffb800',
    printer: '#a855f7',
  }
  return colors[slug] || '#00ff41'
}

export function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    hardware: 'cpu',
    software: 'monitor',
    network: 'wifi',
    security: 'shield',
    email: 'mail',
    printer: 'printer',
  }
  return icons[slug] || 'folder'
}

// Render markdown-like text (simple version)
export function renderMarkdown(text: string): string {
  return text
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`{3}([^`]+)`{3}/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
}

export type SortOption = 'latest' | 'views' | 'helpful'

export interface Problem {
  id: number
  title: string
  slug: string
  symptoms: string
  causes: string
  solution: string
  categoryId: number | null
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  createdAt: Date
  updatedAt: Date
  category?: Category
  tags?: Tag[]
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  color: string
  description: string | null
  problemCount: number
  createdAt: Date
}

export interface Tag {
  id: number
  name: string
  slug: string
  usageCount: number
}
