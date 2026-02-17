// src/lib/db/schema.ts
import { pgTable, serial, varchar, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icon: varchar('icon', { length: 50 }).default('folder'),
  color: varchar('color', { length: 20 }).default('#00ff41'),
  description: text('description'),
  problemCount: integer('problem_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// Tags table
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  usageCount: integer('usage_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// Problems table (main content)
export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  slug: varchar('slug', { length: 300 }).notNull().unique(),
  symptoms: text('symptoms').notNull(),
  causes: text('causes').notNull(),
  solution: text('solution').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  viewCount: integer('view_count').default(0),
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Problem-Tag junction
export const problemTags = pgTable('problem_tags', {
  problemId: integer('problem_id').references(() => problems.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.problemId, table.tagId] }),
}))
