// src/app/api/problems/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { problems, categories, tags, problemTags } from '@/lib/db/schema'
import { eq, like, or, desc, sql, and, ilike } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const tag = searchParams.get('tag') || ''
    const sort = searchParams.get('sort') || 'latest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db
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
      })
      .from(problems)
      .leftJoin(categories, eq(problems.categoryId, categories.id))

    const conditions = []

    if (q) {
      conditions.push(
        or(
          ilike(problems.title, `%${q}%`),
          ilike(problems.symptoms, `%${q}%`),
          ilike(problems.solution, `%${q}%`),
          ilike(problems.causes, `%${q}%`),
        )
      )
    }

    if (category) {
      conditions.push(eq(categories.slug, category))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    // Sort
    if (sort === 'views') {
      query = query.orderBy(desc(problems.viewCount)) as any
    } else if (sort === 'helpful') {
      query = query.orderBy(desc(problems.helpfulCount)) as any
    } else {
      query = query.orderBy(desc(problems.createdAt)) as any
    }

    const rows = await (query as any).limit(limit).offset(offset)

    // Get tags for each problem
    const problemIds = rows.map((r: any) => r.id)
    let tagMap: Record<number, any[]> = {}

    if (problemIds.length > 0) {
      const tagRows = await db
        .select({
          problemId: problemTags.problemId,
          tagId: tags.id,
          tagName: tags.name,
          tagSlug: tags.slug,
        })
        .from(problemTags)
        .innerJoin(tags, eq(problemTags.tagId, tags.id))
        .where(sql`${problemTags.problemId} = ANY(ARRAY[${sql.join(problemIds.map((id: number) => sql`${id}`), sql`, `)}]::int[])`)

      tagRows.forEach((row: any) => {
        if (!tagMap[row.problemId]) tagMap[row.problemId] = []
        tagMap[row.problemId].push({ id: row.tagId, name: row.tagName, slug: row.tagSlug })
      })
    }

    // Filter by tag
    let results = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      symptoms: row.symptoms,
      causes: row.causes,
      solution: row.solution,
      categoryId: row.categoryId,
      viewCount: row.viewCount,
      helpfulCount: row.helpfulCount,
      notHelpfulCount: row.notHelpfulCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: row.categoryName ? {
        name: row.categoryName,
        slug: row.categorySlug,
        color: row.categoryColor,
      } : null,
      tags: tagMap[row.id] || [],
    }))

    if (tag) {
      results = results.filter((p: any) => p.tags.some((t: any) => t.slug === tag))
    }

    return NextResponse.json({ problems: results, total: results.length })
  } catch (error) {
    console.error('GET /api/problems error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Simple auth check
    const authHeader = req.headers.get('x-admin-key')
    if (authHeader !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, symptoms, causes, solution, categoryId, tagIds } = body

    if (!title || !symptoms || !causes || !solution) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = slugify(title) + '-' + Date.now().toString(36)

    const [problem] = await db.insert(problems).values({
      title,
      slug,
      symptoms,
      causes,
      solution,
      categoryId: categoryId || null,
    }).returning()

    // Add tags
    if (tagIds && tagIds.length > 0) {
      await db.insert(problemTags).values(
        tagIds.map((tagId: number) => ({ problemId: problem.id, tagId }))
      )
      // Update tag usage counts
      for (const tagId of tagIds) {
        await db.update(tags)
          .set({ usageCount: sql`${tags.usageCount} + 1` })
          .where(eq(tags.id, tagId))
      }
    }

    // Update category count
    if (categoryId) {
      await db.update(categories)
        .set({ problemCount: sql`${categories.problemCount} + 1` })
        .where(eq(categories.id, categoryId))
    }

    return NextResponse.json({ problem }, { status: 201 })
  } catch (error) {
    console.error('POST /api/problems error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
