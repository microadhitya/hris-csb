"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Attendance {
  id: string
  date: string
  checkIn?: string
  checkOut?: string
  status: string
  isManual: boolean
  employee: {
    fullName: string
    employeeId: string
    branch?: { name: string }
  }
}

interface Employee {
  id: string
  fullName: string
}

interface Branch {
  id: string
  name: string
}

export default function AttendancePage() {
  const { token } = useAuth()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split("T")[0]
  )
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0])
  const [filterEmployee, setFilterEmployee] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualData, setManualData] = useState({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "HADIR",
  })

  useEffect(() => {
    fetchData()
  }, [token, dateFrom, dateTo, filterEmployee, filterBranch])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        dateFrom,
        dateTo,
      })
      if (filterEmployee) params.append("employeeId", filterEmployee)
      if (filterBranch) params.append("branchId", filterBranch)

      const [attRes, empRes, branchRes] = await Promise.all([
        fetch(`/api/attendance?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/branches", { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (attRes.ok) setAttendances(await attRes.json())
      if (empRes.ok) setEmployees(await empRes.json())
      if (branchRes.ok) setBranches(await branchRes.json())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: manualData.employeeId,
          type: "check-in",
          isManual: true,
          checkIn: manualData.checkIn,
          checkOut: manualData.checkOut,
          status: manualData.status,
        }),
      })

      if (res.ok) {
        setShowManualForm(false)
        setManualData({
          employeeId: "",
          date: "",
          checkIn: "",
          checkOut: "",
          status: "HADIR",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">⏰ Time Management</h1>
        <button onClick={() => setShowManualForm(true)} className="btn btn-primary">
          + Input Manual
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-1">Karyawan</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="input w-48"
            >
              <option value="">Semua Karyawan</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cabang</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="input w-48"
            >
              <option value="">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama</th>
                <th>ID</th>
                <th>Cabang</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id}>
                    <td>
                      {new Date(att.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{att.employee.fullName}</td>
                    <td className="font-mono text-sm">{att.employee.employeeId}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Input Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Input Absensi Manual</h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Karyawan *</label>
                <select
                  value={manualData.employeeId}
                  onChange={(e) =>
                    setManualData({ ...manualData, employeeId: e.target.value })
                  }
                  className="input"
                  required
                >
                  <option value="">Pilih Karyawan</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal *</label>
                <input
                  type="date"
                  value={manualData.date}
                  onChange={(e) =>
                    setManualData({ ...manualData, date: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={manualData.checkIn}
                    onChange={(e) =>
                      setManualData({ ...manualData, checkIn: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Pulang</label>
                  <input
                    type="time"
                    value={manualData.checkOut}
                    onChange={(e) =>
                      setManualData({ ...manualData, checkOut: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={manualData.status}
                  onChange={(e) =>
                    setManualData({ ...manualData, status: e.target.value })
                  }
                  className="input"
                >
                  <option value="HADIR">Hadir</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="IZIN">Izin</option>
                  <option value="SAKIT">Sakit</option>
                  <option value="ALPHA">Alpha</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
