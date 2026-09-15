import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'KARYAWAN' || !payload.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    const start = weekStart ? new Date(weekStart) : new Date()
    start.setHours(0, 0, 0, 0)

    // Get Monday of the week
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)

    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId: payload.employeeId,
        date: { gte: start, lte: end },
      },
      include: { branch: true },
      orderBy: { date: 'asc' },
    })

    // Create array of 7 days
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)

      const schedule = schedules.find(
        (s) => new Date(s.date).toDateString() === date.toDateString()
      )

      days.push({
        date: date.toISOString(),
        dayName: date.toLocaleDateString('id-ID', { weekday: 'long' }),
        formattedDate: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        schedule: schedule ? {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          branch: schedule.branch,
        } : null,
      })
    }

    return NextResponse.json({
      weekStart: start.toISOString(),
      weekEnd: end.toISOString(),
      days,
    })
  } catch (error) {
    console.error('Get weekly schedule error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
