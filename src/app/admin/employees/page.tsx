"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Employee {
  id: string
  employeeId: string
  fullName: string
  phone?: string
  position?: string
  joinDate: string
  salary?: number
  status: string
  branchId?: string
  branch?: { id: string; name: string }
  user: { email: string }
}

interface Branch {
  id: string
  name: string
}

export default function EmployeesPage() {
  const { token } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    position: "",
    joinDate: "",
    salary: "",
    branchId: "",
  })

  useEffect(() => {
    fetchData()
  }, [token, search, filterBranch])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (filterBranch) params.append("branchId", filterBranch)

      const [empRes, branchRes] = await Promise.all([
        fetch(`/api/employees?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/branches", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (empRes.ok) setEmployees(await empRes.json())
      if (branchRes.ok) setBranches(await branchRes.json())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          email: "",
          password: "",
          fullName: "",
          phone: "",
          position: "",
          joinDate: "",
          salary: "",
          branchId: "",
        })
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menambah karyawan")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menonaktifkan karyawan ini?")) return

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) fetchData()
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
        <h1 className="text-2xl font-bold">Database Karyawan</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Tambah Karyawan
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Cari nama/ID/telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
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

      {/* Employee Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Jabatan</th>
                <th>Cabang</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="font-mono text-sm">{emp.employeeId}</td>
                  <td>{emp.fullName}</td>
                  <td>{emp.user.email}</td>
                  <td>{emp.position || "-"}</td>
                  <td>{emp.branch?.name || "-"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        emp.status === "ACTIVE" ? "status-hadir" : "status-alpha"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Nonaktifkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Tambah Karyawan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No. HP</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cabang</label>
                <select
                  value={formData.branchId}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Pilih Cabang</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Masuk *</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gaji</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
