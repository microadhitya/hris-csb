"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Attendance {
  id: string
  date: string
  checkIn?: string
  checkOut?: string
  status: string
  branch?: { name: string }
}

export default function KaryawanHistory() {
  const { token } = useAuth()
  const [history, setHistory] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  )
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchHistory()
  }, [token, dateFrom, dateTo])

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      })
      const res = await fetch(`/api/attendance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setHistory(await res.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 Riwayat Absensi</h1>

      {/* Date Filter */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dari</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sampai</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Tidak ada data absensi
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Masuk</th>
                  <th>Pulang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((att) => (
                  <tr key={att.id}>
                    <td>
                      {new Date(att.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
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
                        : "-"}
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
