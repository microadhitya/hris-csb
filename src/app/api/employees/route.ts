import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, hashPassword } from '@/lib/auth'
import { generateEmployeeId } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (branchId) where.branchId = branchId
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const employees = await prisma.employee.findMany({
      where,
      include: { user: { select: { email: true } }, branch: true },
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Get employees error:', error)
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
    const { email, password, fullName, phone, position, joinDate, salary, branchId } = body

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, dan nama harus diisi' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const employeeId = generateEmployeeId()

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'KARYAWAN',
        employee: {
          create: {
            employeeId,
            fullName,
            phone,
            position,
            joinDate: new Date(joinDate),
            salary: salary ? parseFloat(salary) : null,
            branchId: branchId || null,
          },
        },
      },
      include: { employee: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
