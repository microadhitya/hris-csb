"use client"

import { useAuth } from "@/lib/auth-context"

export default function KaryawanProfile() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👤 Profil Saya</h1>

      <div className="card max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">
              {user?.employee?.fullName?.charAt(0) || "K"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.employee?.fullName}</h2>
            <p className="text-gray-600">{user?.employee?.position || "Karyawan"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">ID Karyawan</span>
            <span className="font-medium">{user?.employee?.employeeId}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Cabang</span>
            <span className="font-medium">
              {user?.employee?.branch?.name || "Tidak ada cabang"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Jabatan</span>
            <span className="font-medium">
              {user?.employee?.position || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
