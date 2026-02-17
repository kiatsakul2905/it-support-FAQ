// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const rows = await db.select().from(categories).orderBy(desc(categories.problemCount))
    return NextResponse.json({ categories: rows })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-admin-key')
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, icon, color, description } = body

    const slug = slugify(name)
    const [cat] = await db.insert(categories).values({
      name, slug, icon, color, description
    }).returning()

    return NextResponse.json({ category: cat }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
