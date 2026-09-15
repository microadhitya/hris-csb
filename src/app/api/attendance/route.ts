import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { calculateDistance } from '@/lib/utils'

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
    const branchId = searchParams.get('branchId')

    // For karyawan, only show their own attendance
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

    // If filtering by branch, get employees in that branch first
    if (branchId && payload.role === 'ADMIN') {
      const branchEmployees = await prisma.employee.findMany({
        where: { branchId },
        select: { id: true },
      })
      where.employeeId = { in: branchEmployees.map((e: { id: string }) => e.id) }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { branch: true },
        },
      },
      orderBy: [{ date: 'desc' }, { checkIn: 'desc' }],
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, type, gpsLat, gpsLng, selfieUrl, faceScore } = body

    // Get employee
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { branch: true },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if attendance already exists for today
    const existingAttendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    })

    if (type === 'check-in' && existingAttendance?.checkIn) {
      return NextResponse.json({ error: 'Sudah absen masuk hari ini' }, { status: 400 })
    }

    if (type === 'check-out' && existingAttendance?.checkOut) {
      return NextResponse.json({ error: 'Sudah absen pulang hari ini' }, { status: 400 })
    }

    if (type === 'check-out' && !existingAttendance?.checkIn) {
      return NextResponse.json({ error: 'Belum absen masuk hari ini' }, { status: 400 })
    }

    // Check geofencing
    let isWithinRadius = false
    let needsApproval = false

    if (employee.branch && gpsLat && gpsLng) {
      const distance = calculateDistance(
        parseFloat(gpsLat),
        parseFloat(gpsLng),
        Number(employee.branch.latitude),
        Number(employee.branch.longitude)
      )
      isWithinRadius = distance <= employee.branch.radiusMeters
      needsApproval = !isWithinRadius
    }

    // Check if late
    let status = 'HADIR'
    if (employee.branch && type === 'check-in') {
      const [hours, minutes] = employee.branch.workStart.split(':').map(Number)
      const scheduledTime = new Date(today)
      scheduledTime.setHours(hours, minutes, 0, 0)

      const checkInTime = new Date()
      if (checkInTime > scheduledTime) {
        const diffMinutes = (checkInTime.getTime() - scheduledTime.getTime()) / 60000
        if (diffMinutes > 15) {
          status = 'TERLAMBAT'
        }
      }
    }

    const now = new Date()

    if (type === 'check-in') {
      const attendance = await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId, date: today } },
        update: {
          checkIn: now,
          selfieIn: selfieUrl,
          gpsLatIn: gpsLat ? parseFloat(gpsLat) : null,
          gpsLngIn: gpsLng ? parseFloat(gpsLng) : null,
          faceScore: faceScore ? parseFloat(faceScore) : null,
          status: status as 'HADIR' | 'TERLAMBAT',
        },
        create: {
          employeeId,
          date: today,
          checkIn: now,
          selfieIn: selfieUrl,
          gpsLatIn: gpsLat ? parseFloat(gpsLat) : null,
          gpsLngIn: gpsLng ? parseFloat(gpsLng) : null,
          faceScore: faceScore ? parseFloat(faceScore) : null,
          status: status as 'HADIR' | 'TERLAMBAT',
        },
      })

      // If needs approval, create approval record
      if (needsApproval) {
        await prisma.approval.create({
          data: {
            employeeId,
            type: 'OUT_OF_RADIUS',
            attendanceDate: today,
            gpsLat: parseFloat(gpsLat),
            gpsLng: parseFloat(gpsLng),
            photoUrl: selfieUrl,
          },
        })
      }

      return NextResponse.json({
        attendance,
        needsApproval,
        message: needsApproval
          ? 'Absensi berhasil, namun lokasi anda di luar radius. Menunggu persetujuan admin.'
          : 'Absen masuk berhasil!',
      })
    } else {
      const attendance = await prisma.attendance.update({
        where: { employeeId_date: { employeeId, date: today } },
        data: {
          checkOut: now,
          selfieOut: selfieUrl,
          gpsLatOut: gpsLat ? parseFloat(gpsLat) : null,
          gpsLngOut: gpsLng ? parseFloat(gpsLng) : null,
        },
      })

      if (needsApproval) {
        await prisma.approval.create({
          data: {
            employeeId,
            type: 'OUT_OF_RADIUS',
            attendanceDate: today,
            gpsLat: parseFloat(gpsLat),
            gpsLng: parseFloat(gpsLng),
            photoUrl: selfieUrl,
          },
        })
      }

      return NextResponse.json({
        attendance,
        needsApproval,
        message: needsApproval
          ? 'Absen pulang berhasil, namun lokasi anda di luar radius. Menunggu persetujuan admin.'
          : 'Absen pulang berhasil!',
      })
    }
  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
