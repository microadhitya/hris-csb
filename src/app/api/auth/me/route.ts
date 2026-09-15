import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { employee: { include: { branch: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee ? {
        id: user.employee.id,
        employeeId: user.employee.employeeId,
        fullName: user.employee.fullName,
        position: user.employee.position,
        branchId: user.employee.branchId,
        branch: user.employee.branch,
      } : null,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
