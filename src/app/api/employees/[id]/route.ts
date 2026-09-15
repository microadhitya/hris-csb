import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { email: true } }, branch: true },
    })

    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, phone, position, salary, branchId, status } = body

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(position !== undefined && { position }),
        ...(salary !== undefined && { salary: salary ? parseFloat(salary) : null }),
        ...(branchId !== undefined && { branchId: branchId || null }),
        ...(status && { status }),
      },
      include: { user: { select: { email: true } }, branch: true },
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = getUserFromRequest(request)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json({ message: 'Karyawan berhasil di nonaktifkan' })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
