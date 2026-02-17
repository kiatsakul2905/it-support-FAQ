// src/app/api/problems/[slug]/rate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { problems } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()
    const { rating } = body // 'helpful' | 'not_helpful'

    if (!['helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const [problem] = await db.select().from(problems).where(eq(problems.slug, params.slug))
    if (!problem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (rating === 'helpful') {
      await db.update(problems)
        .set({ helpfulCount: sql`${problems.helpfulCount} + 1` })
        .where(eq(problems.id, problem.id))
    } else {
      await db.update(problems)
        .set({ notHelpfulCount: sql`${problems.notHelpfulCount} + 1` })
        .where(eq(problems.id, problem.id))
    }

    const [updated] = await db.select({
      helpfulCount: problems.helpfulCount,
      notHelpfulCount: problems.notHelpfulCount,
    }).from(problems).where(eq(problems.id, problem.id))

    return NextResponse.json({ ...updated })
  } catch (error) {
    console.error('POST /rate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
