// src/components/SearchBar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'ค้นหาปัญหา... (เช่น wifi, printer, slow)',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)

    if (onSearch) {
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearch(v)
      }, 300)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim()) {
      router.push(`/problems?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      {/* Terminal prompt prefix */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        <span className="text-[var(--accent)] font-mono text-sm">$</span>
        <span className="text-[var(--dim)] font-mono text-xs">search</span>
        <span className="text-[var(--muted)] font-mono text-xs">›</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="search-input w-full py-3 pl-28 pr-24 text-sm rounded-none"
        style={{
          borderColor: focused ? 'var(--accent)' : 'var(--border)',
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('')
            if (onSearch) onSearch('')
          }}
          className="absolute right-16 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--red)] font-mono text-xs px-2"
        >
          [x]
        </button>
      )}

      {/* Search button */}
      <button
        type="submit"
        className="absolute right-0 top-0 bottom-0 px-4 text-xs font-mono text-[var(--accent)] border-l border-[var(--border)] hover:bg-[rgba(0,255,65,0.08)] transition-colors"
      >
        FIND
      </button>

      {/* Glow line on focus */}
      {focused && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
      )}
    </form>
  )
}
