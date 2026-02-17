// src/app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const rows = await db.select().from(tags).orderBy(desc(tags.usageCount))
    return NextResponse.json({ tags: rows })
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
    const { name } = body
    const slug = slugify(name)

    const [tag] = await db.insert(tags).values({ name, slug }).returning()
    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
