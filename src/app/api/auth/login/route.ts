import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({ where: { userId: user.id } })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee?.id,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employee ? {
          id: employee.id,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          position: employee.position,
          branchId: employee.branchId,
        } : null,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
