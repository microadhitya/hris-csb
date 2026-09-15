"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface WeeklyAttendance {
  date: string
  dayName: string
  formattedDate: string
  checkIn: string | null
  checkOut: string | null
  status: string
}

export default function KaryawanHome() {
  const { user, token } = useAuth()
  const [weeklyData, setWeeklyData] = useState<WeeklyAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [todayStatus, setTodayStatus] = useState<{
    checkIn: boolean
    checkOut: boolean
  }>({ checkIn: false, checkOut: false })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/attendance/weekly", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setWeeklyData(data)

          // Set today's status
          const today = data[0]
          if (today) {
            setTodayStatus({
              checkIn: !!today.checkIn,
              checkOut: !!today.checkOut,
            })
          }
        }
      } catch (error) {
        console.error("Error:", error)
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Halo, {user?.employee?.fullName || "Karyawan"} 👋
        </h1>
        <p className="text-gray-600">
          {user?.employee?.branch?.name || "Tidak ada cabang"} •{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Today Status */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Status Absensi Hari Ini</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg text-center ${
              todayStatus.checkIn ? "bg-green-50 border-2 border-green-200" : "bg-gray-50"
            }`}
          >
            <p className="text-sm text-gray-600">Masuk</p>
            <p className="text-lg font-bold">
              {todayStatus.checkIn ? "✅ Sudah" : "⏳ Belum"}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg text-center ${
              todayStatus.checkOut ? "bg-green-50 border-2 border-green-200" : "bg-gray-50"
            }`}
          >
            <p className="text-sm text-gray-600">Pulang</p>
            <p className="text-lg font-bold">
              {todayStatus.checkOut ? "✅ Sudah" : "⏳ Belum"}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly History */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">📋 Riwayat Minggu Ini</h2>
        <div className="space-y-3">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {day.dayName}, {day.formattedDate}
                </p>
                <p className="text-sm text-gray-600">
                  Masuk:{" "}
                  {day.checkIn
                    ? new Date(day.checkIn).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}{" "}
                  | Pulang:{" "}
                  {day.checkOut
                    ? new Date(day.checkOut).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : day.checkIn
                    ? "Belum absen pulang"
                    : "-"}
                </p>
              </div>
              <span
                className={`status-badge ${
                  day.status === "HADIR"
                    ? "status-hadir"
                    : day.status === "TERLAMBAT"
                    ? "status-terlambat"
                    : day.status === "ALPHA"
                    ? "status-alpha"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {day.status === "TIDAK_ADA_JADWAL"
                  ? "-"
                  : day.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
