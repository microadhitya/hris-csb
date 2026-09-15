"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Approval {
  id: string
  type: string
  attendanceDate: string
  gpsLat?: number
  gpsLng?: number
  photoUrl?: string
  reason?: string
  status: string
  adminNotes?: string
  employee: {
    fullName: string
    branch?: { name: string }
  }
  createdAt: string
}

export default function ApprovalsPage() {
  const { token } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovals()
  }, [token])

  const fetchApprovals = async () => {
    try {
      const res = await fetch("/api/approvals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setApprovals(await res.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    const notes = prompt(
      status === "APPROVED" ? "Catatan (opsional):" : "Alasan penolakan:"
    )
    if (notes === null) return

    try {
      const res = await fetch("/api/approvals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status, adminNotes: notes }),
      })

      if (res.ok) fetchApprovals()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Approval</h1>

      {approvals.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">Tidak ada pengajuan yang menunggu persetujuan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="card">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="status-badge status-pending">
                      {approval.type === "OUT_OF_RADIUS"
                        ? "LOKASI DI LUAR RADIUS"
                        : "GAGAL FACE RECOGNITION"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(approval.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg">
                    {approval.employee.fullName}
                  </h3>
                  <p className="text-gray-600">
                    {approval.employee.branch?.name || "Tidak ada cabang"}
                  </p>

                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Tanggal:</span>{" "}
                      {new Date(approval.attendanceDate).toLocaleDateString("id-ID")}
                    </p>
                    {approval.gpsLat && approval.gpsLng && (
                      <p>
                        <span className="font-medium">Lokasi:</span>{" "}
                        {approval.gpsLat}, {approval.gpsLng}
                      </p>
                    )}
                    {approval.reason && (
                      <p>
                        <span className="font-medium">Alasan:</span>{" "}
                        {approval.reason}
                      </p>
                    )}
                  </div>

                  {approval.photoUrl && (
                    <div className="mt-3">
                      <img
                        src={approval.photoUrl}
                        alt="Selfie"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id, "APPROVED")}
                    className="btn btn-success text-sm"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id, "REJECTED")}
                    className="btn btn-danger text-sm"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
