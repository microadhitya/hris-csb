"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"

export default function AbsenPage() {
  const { user, token } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [attendanceType, setAttendanceType] = useState<"check-in" | "check-out">("check-in")
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [todayStatus, setTodayStatus] = useState<{
    checkIn: boolean
    checkOut: boolean
  }>({ checkIn: false, checkOut: false })

  // Get GPS location
  const refreshGps = useCallback(() => {
    setGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setGpsLoading(false)
        },
        (error) => {
          console.error("GPS Error:", error)
          setMessage({
            type: "error",
            text: "Tidak bisa mendapatkan lokasi. Aktifkan GPS.",
          })
          setGpsLoading(false)
        }
      )
    } else {
      setMessage({
        type: "error",
        text: "Browser tidak mendukung GPS",
      })
      setGpsLoading(false)
    }
  }, [])

  // Fetch today's status
  useEffect(() => {
    const fetchTodayStatus = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const res = await fetch(
          `/api/attendance?dateFrom=${today}&dateTo=${today}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            const att = data[0]
            setTodayStatus({
              checkIn: !!att.checkIn,
              checkOut: !!att.checkOut,
            })
          }
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }

    if (token) {
      fetchTodayStatus()
      refreshGps()
    }
  }, [token, refreshGps])

  // Start camera
  const startCamera = async (type: "check-in" | "check-out") => {
    setAttendanceType(type)
    setShowCamera(true)
    setMessage(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera Error:", error)
      setMessage({
        type: "error",
        text: "Tidak bisa mengakses kamera. Izinkan akses kamera.",
      })
      setShowCamera(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // Capture photo and submit attendance
  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setLoading(true)
    setMessage(null)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0)
      const selfieUrl = canvas.toDataURL("image/jpeg", 0.8)

      // Submit attendance
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: user?.employee?.id,
          type: attendanceType,
          gpsLat: gpsLocation?.lat?.toString(),
          gpsLng: gpsLocation?.lng?.toString(),
          selfieUrl,
          faceScore: 0.85, // Placeholder - in real app, use face-api.js
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message,
        })
        setTodayStatus((prev) => ({
          checkIn: attendanceType === "check-in" ? true : prev.checkIn,
          checkOut: attendanceType === "check-out" ? true : prev.checkOut,
        }))
        stopCamera()
      } else {
        setMessage({
          type: "error",
          text: data.error || "Gagal melakukan absensi",
        })
      }
    } catch (error) {
      console.error("Submit Error:", error)
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const canCheckIn = !todayStatus.checkIn
  const canCheckOut = todayStatus.checkIn && !todayStatus.checkOut

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Absen Sekarang</h1>

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

      {/* GPS Location */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">📍 Lokasi Anda</h2>
            {gpsLocation ? (
              <p className="text-sm text-gray-600">
                {gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                {gpsLoading ? "Mendapatkan lokasi..." : "Lokasi belum tersedia"}
              </p>
            )}
          </div>
          <button
            onClick={refreshGps}
            disabled={gpsLoading}
            className="btn btn-secondary text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Attendance Buttons */}
      <div className="card mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => startCamera("check-in")}
            disabled={!canCheckIn || loading}
            className={`p-6 rounded-lg text-center ${
              canCheckIn
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <p className="text-2xl mb-2">🌅</p>
            <p className="font-semibold">Absen Masuk</p>
            {todayStatus.checkIn && (
              <p className="text-xs mt-1">Sudah absen masuk</p>
            )}
          </button>

          <button
            onClick={() => startCamera("check-out")}
            disabled={!canCheckOut || loading}
            className={`p-6 rounded-lg text-center ${
              canCheckOut
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <p className="text-2xl mb-2">🌅</p>
            <p className="font-semibold">Absen Pulang</p>
            {!todayStatus.checkIn && (
              <p className="text-xs mt-1">Belum absen masuk</p>
            )}
            {todayStatus.checkOut && (
              <p className="text-xs mt-1">Sudah absen pulang</p>
            )}
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {attendanceType === "check-in" ? "📸 Absen Masuk" : "📸 Absen Pulang"}
            </h2>

            <div className="relative mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-3">
              <button
                onClick={captureAndSubmit}
                disabled={loading || !gpsLocation}
                className="btn btn-primary flex-1"
              >
                {loading ? "Memproses..." : "Ambil Foto & Absen"}
              </button>
              <button
                onClick={stopCamera}
                disabled={loading}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
            </div>

            {!gpsLocation && (
              <p className="text-sm text-red-600 mt-3">
                ⚠️ GPS belum aktif. Aktifkan GPS untuk bisa absen.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
