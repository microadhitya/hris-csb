"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Branch {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
  radiusMeters: number
  workStart: string
  workEnd: string
  isActive: boolean
}

export default function BranchesPage() {
  const { token } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radiusMeters: "100",
    workStart: "08:00",
    workEnd: "17:00",
  })

  useEffect(() => {
    fetchBranches()
  }, [token])

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setBranches(await res.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches"
      const method = editingBranch ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingBranch(null)
        setFormData({
          name: "",
          address: "",
          latitude: "",
          longitude: "",
          radiusMeters: "100",
          workStart: "08:00",
          workEnd: "17:00",
        })
        fetchBranches()
      } else {
        const data = await res.json()
        alert(data.error || "Gagal menyimpan cabang")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address || "",
      latitude: branch.latitude.toString(),
      longitude: branch.longitude.toString(),
      radiusMeters: branch.radiusMeters.toString(),
      workStart: branch.workStart,
      workEnd: branch.workEnd,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus cabang ini?")) return

    try {
      const res = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) fetchBranches()
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
        <h1 className="text-2xl font-bold">Kelola Cabang</h1>
        <button
          onClick={() => {
            setEditingBranch(null)
            setFormData({
              name: "",
              address: "",
              latitude: "",
              longitude: "",
              radiusMeters: "100",
              workStart: "08:00",
              workEnd: "17:00",
            })
            setShowForm(true)
          }}
          className="btn btn-primary"
        >
          + Tambah Cabang
        </button>
      </div>

      {/* Branch Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Cabang</th>
                <th>Alamat</th>
                <th>Jam Kerja</th>
                <th>Radius</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="font-medium">{branch.name}</td>
                  <td>{branch.address || "-"}</td>
                  <td>
                    {branch.workStart} - {branch.workEnd}
                  </td>
                  <td>{branch.radiusMeters}m</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Branch Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingBranch ? "Edit Cabang" : "Tambah Cabang Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Cabang *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude *</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="input"
                    placeholder="-6.2297"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude *</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="input"
                    placeholder="106.8453"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Radius Geofencing (meter)
                </label>
                <input
                  type="number"
                  value={formData.radiusMeters}
                  onChange={(e) =>
                    setFormData({ ...formData, radiusMeters: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Masuk</label>
                  <input
                    type="time"
                    value={formData.workStart}
                    onChange={(e) =>
                      setFormData({ ...formData, workStart: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Pulang</label>
                  <input
                    type="time"
                    value={formData.workEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, workEnd: e.target.value })
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingBranch(null)
                  }}
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
