import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // For karyawan, only show their own schedules
    let targetEmployeeId = employeeId
    if (payload.role === 'KARYAWAN' && payload.employeeId) {
      targetEmployeeId = payload.employeeId
    }

    const where: Record<string, unknown> = {}
    if (targetEmployeeId) where.employeeId = targetEmployeeId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        employee: { include: { branch: true } },
        branch: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Get schedules error:', error)
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
    const { employeeIds, startDate, endDate, startTime, endTime, branchId } = body

    if (!employeeIds?.length || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check max 1 month range
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > 31) {
      return NextResponse.json({ error: 'Maksimal rentang tanggal 1 bulan' }, { status: 400 })
    }

    const schedules = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        for (const empId of employeeIds) {
          try {
            const schedule = await prisma.schedule.upsert({
              where: { employeeId_date: { employeeId: empId, date: new Date(currentDate) } },
              update: { startTime, endTime, branchId },
              create: {
                employeeId: empId,
                date: new Date(currentDate),
                startTime,
                endTime,
                branchId,
              },
            })
            schedules.push(schedule)
          } catch {
            // Skip if schedule already exists
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      message: `${schedules.length} jadwal berhasil dibuat`,
      count: schedules.length,
    })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
