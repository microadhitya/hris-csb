import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error('Get branches error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, latitude, longitude, radiusMeters, workStart, workEnd } = body

    if (!name || !latitude || !longitude) {
      return NextResponse.json({ error: 'Nama, latitude, dan longitude harus diisi' }, { status: 400 })
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: radiusMeters || 100,
        workStart: workStart || '08:00',
        workEnd: workEnd || '17:00',
      },
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    console.error('Create branch error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
