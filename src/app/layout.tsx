// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IT Support KB | ฐานข้อมูลแก้ปัญหา IT',
  description: 'ฐานข้อมูลแก้ปัญหาด้าน IT สำหรับ Hardware, Software, Network และอื่นๆ',
  keywords: 'IT Support, แก้ปัญหา IT, Knowledge Base, Hardware, Software, Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
