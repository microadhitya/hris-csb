import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'KARYAWAN' || !payload.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get last 7 days
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6)

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: payload.employeeId,
        date: {
          gte: weekAgo,
          lte: today,
        },
      },
      orderBy: { date: 'desc' },
    })

    // Create array of last 7 days
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const attendance = attendances.find(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      )

      days.push({
        date: date.toISOString(),
        dayName: date.toLocaleDateString('id-ID', { weekday: 'long' }),
        formattedDate: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        checkIn: attendance?.checkIn || null,
        checkOut: attendance?.checkOut || null,
        status: attendance?.status || 'TIDAK_ADA_JADWAL',
      })
    }

    return NextResponse.json(days)
  } catch (error) {
    console.error('Get weekly attendance error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
