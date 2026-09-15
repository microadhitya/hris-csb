import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create branches
  const jakarta = await prisma.branch.create({
    data: {
      name: 'Kantor Pusat Jakarta',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat, DKI Jakarta',
      latitude: -6.2297,
      longitude: 106.8453,
      radiusMeters: 100,
      workStart: '08:00',
      workEnd: '17:00',
    },
  })

  const bandung = await prisma.branch.create({
    data: {
      name: 'Cabang Bandung',
      address: 'Jl. Asia Afrika No. 1, Bandung, Jawa Barat',
      latitude: -6.9175,
      longitude: 107.6191,
      radiusMeters: 100,
      workStart: '07:30',
      workEnd: '16:30',
    },
  })

  console.log('Branches created:', { jakarta, bandung })

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@csb.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  // Create admin employee
  await prisma.employee.create({
    data: {
      userId: adminUser.id,
      employeeId: 'ADM001',
      fullName: 'Admin HR',
      phone: '081234567890',
      position: 'HR Manager',
      joinDate: new Date('2024-01-01'),
      branchId: jakarta.id,
      status: 'ACTIVE',
    },
  })

  // Create sample karyawan
  const karyawanPasswordHash = await bcrypt.hash('karyawan123', 10)

  const budiUser = await prisma.user.create({
    data: {
      email: 'budi@csb.com',
      passwordHash: karyawanPasswordHash,
      role: 'KARYAWAN',
    },
  })

  await prisma.employee.create({
    data: {
      userId: budiUser.id,
      employeeId: 'EMP001',
      fullName: 'Budi Santoso',
      phone: '081234567891',
      position: 'Staff Marketing',
      joinDate: new Date('2024-03-15'),
      salary: 5000000,
      branchId: jakarta.id,
      status: 'ACTIVE',
    },
  })

  const sitiUser = await prisma.user.create({
    data: {
      email: 'siti@csb.com',
      passwordHash: karyawanPasswordHash,
      role: 'KARYAWAN',
    },
  })

  await prisma.employee.create({
    data: {
      userId: sitiUser.id,
      employeeId: 'EMP002',
      fullName: 'Siti Aminah',
      phone: '081234567892',
      position: 'Staff Admin',
      joinDate: new Date('2024-06-01'),
      salary: 4500000,
      branchId: bandung.id,
      status: 'ACTIVE',
    },
  })

  console.log('Users created:')
  console.log('  Admin: admin@csb.com / admin123')
  console.log('  Karyawan: budi@csb.com / karyawan123')
  console.log('  Karyawan: siti@csb.com / karyawan123')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
