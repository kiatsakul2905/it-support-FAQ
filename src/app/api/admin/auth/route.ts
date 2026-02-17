import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body || {}

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
    }

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
