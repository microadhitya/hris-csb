import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const approvals = await prisma.approval.findMany({
      where: { status: 'PENDING' },
      include: { employee: { include: { branch: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, adminNotes } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const approval = await prisma.approval.update({
      where: { id },
      data: {
        status,
        adminNotes,
      },
    })

    return NextResponse.json(approval)
  } catch (error) {
    console.error('Update approval error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
