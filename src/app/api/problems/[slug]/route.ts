// src/app/api/problems/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { problems, categories, tags, problemTags } from '@/lib/db/schema'
import { eq, sql, ne } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const [problem] = await db
      .select({
        id: problems.id,
        title: problems.title,
        slug: problems.slug,
        symptoms: problems.symptoms,
        causes: problems.causes,
        solution: problems.solution,
        categoryId: problems.categoryId,
        viewCount: problems.viewCount,
        helpfulCount: problems.helpfulCount,
        notHelpfulCount: problems.notHelpfulCount,
        createdAt: problems.createdAt,
        updatedAt: problems.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
      })
      .from(problems)
      .leftJoin(categories, eq(problems.categoryId, categories.id))
      .where(eq(problems.slug, params.slug))
      .limit(1)

    if (!problem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Get tags
    const problemTagRows = await db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(problemTags)
      .innerJoin(tags, eq(problemTags.tagId, tags.id))
      .where(eq(problemTags.problemId, problem.id))

    // Auto-increment view count
    await db.update(problems)
      .set({ viewCount: sql`${problems.viewCount} + 1` })
      .where(eq(problems.id, problem.id))

    return NextResponse.json({
      ...problem,
      viewCount: (problem.viewCount ?? 0) + 1,
      category: problem.categoryName ? {
        name: problem.categoryName,
        slug: problem.categorySlug,
        color: problem.categoryColor,
        icon: problem.categoryIcon,
      } : null,
      tags: problemTagRows,
    })
  } catch (error) {
    console.error('GET /api/problems/[slug] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = req.headers.get('x-admin-key')
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, symptoms, causes, solution, categoryId, tagIds } = body

    const [existing] = await db.select().from(problems).where(eq(problems.slug, params.slug))
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const newSlug = title !== existing.title
      ? slugify(title) + '-' + Date.now().toString(36)
      : existing.slug

    const [updated] = await db.update(problems)
      .set({
        title,
        slug: newSlug,
        symptoms,
        causes,
        solution,
        categoryId: categoryId || null,
        updatedAt: new Date(),
      })
      .where(eq(problems.id, existing.id))
      .returning()

    // Update tags
    if (tagIds !== undefined) {
      await db.delete(problemTags).where(eq(problemTags.problemId, existing.id))
      if (tagIds.length > 0) {
        await db.insert(problemTags).values(
          tagIds.map((tagId: number) => ({ problemId: existing.id, tagId }))
        )
      }
    }

    return NextResponse.json({ problem: updated })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = req.headers.get('x-admin-key')
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [problem] = await db.select().from(problems).where(eq(problems.slug, params.slug))
    if (!problem) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await db.delete(problems).where(eq(problems.id, problem.id))

    // Update category count
    if (problem.categoryId) {
      await db.update(categories)
        .set({ problemCount: sql`${categories.problemCount} - 1` })
        .where(eq(categories.id, problem.categoryId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
