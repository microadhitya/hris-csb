"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface AttendanceStats {
  total: number
  hadir: number
  terlambat: number
  alpha: number
  pendingApproval: number
}

interface TodayAttendance {
  id: string
  employee: {
    fullName: string
    branch?: { name: string }
  }
  checkIn?: string
  checkOut?: string
  status: string
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    hadir: 0,
    terlambat: 0,
    alpha: 0,
    pendingApproval: 0,
  })
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]

        // Fetch attendance
        const attRes = await fetch(
          `/api/attendance?dateFrom=${today}&dateTo=${today}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (attRes.ok) {
          const attData = await attRes.json()
          setTodayAttendance(attData)
          setStats({
            total: attData.length,
            hadir: attData.filter((a: TodayAttendance) => a.status === "HADIR").length,
            terlambat: attData.filter((a: TodayAttendance) => a.status === "TERLAMBAT").length,
            alpha: 0,
            pendingApproval: 0,
          })
        }

        // Fetch pending approvals
        const approvalRes = await fetch("/api/approvals", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (approvalRes.ok) {
          const approvalData = await approvalRes.json()
          setStats((prev) => ({
            ...prev,
            pendingApproval: approvalData.length,
          }))
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) fetchData()
  }, [token])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.hadir}</p>
          <p className="text-sm text-gray-600">Hadir Hari Ini</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.terlambat}</p>
          <p className="text-sm text-gray-600">Terlambat</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{stats.alpha}</p>
          <p className="text-sm text-gray-600">Alpha</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</p>
          <p className="text-sm text-gray-600">Menunggu Approval</p>
        </div>
      </div>

      {/* Today Attendance */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Absensi Hari Ini</h2>
        {todayAttendance.length === 0 ? (
          <p className="text-gray-500">Belum ada data absensi hari ini</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Cabang</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map((att) => (
                  <tr key={att.id}>
                    <td>{att.employee.fullName}</td>
                    <td>{att.employee.branch?.name || "-"}</td>
                    <td>
                      {att.checkIn
                        ? new Date(att.checkIn).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td>
                      {att.checkOut
                        ? new Date(att.checkOut).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Belum absen pulang"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          att.status === "HADIR"
                            ? "status-hadir"
                            : att.status === "TERLAMBAT"
                            ? "status-terlambat"
                            : "status-alpha"
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
