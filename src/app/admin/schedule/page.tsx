"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Employee {
  id: string
  employeeId: string
  fullName: string
  branch?: { id: string; name: string }
}

interface Branch {
  id: string
  name: string
}

export default function SchedulePage() {
  const { token } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("17:00")
  const [branchId, setBranchId] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      const [empRes, branchRes] = await Promise.all([
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/branches", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (empRes.ok) setEmployees(await empRes.json())
      if (branchRes.ok) setBranches(await branchRes.json())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedEmployees(employees.map((e) => e.id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmployees.length === 0) {
      setMessage({ type: "error", text: "Pilih minimal 1 karyawan" })
      return
    }
    if (!startDate || !endDate) {
      setMessage({ type: "error", text: "Pilih rentang tanggal" })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          startDate,
          endDate,
          startTime,
          endTime,
          branchId: branchId || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setSelectedEmployees([])
      } else {
        setMessage({ type: "error", text: data.error || "Gagal membuat schedule" })
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({ type: "error", text: "Terjadi kesalahan" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 Schedule Management</h1>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Selection */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Pilih Karyawan</h2>
              <button type="button" onClick={selectAll} className="btn btn-secondary text-sm">
                Pilih Semua
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-lg">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">{emp.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {emp.employeeId} • {emp.branch?.name || "Tidak ada cabang"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {selectedEmployees.length} karyawan dipilih
            </p>
          </div>

          {/* Schedule Settings */}
          <div className="card">
            <h2 className="font-semibold mb-4">Pengaturan Jadwal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dari Tanggal *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sampai Tanggal *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jam Masuk</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jam Pulang</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cabang</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="input"
                >
                  <option value="">Semua Cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? "Menyimpan..." : "Buat Schedule"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
