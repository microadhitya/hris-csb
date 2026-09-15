"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface DaySchedule {
  date: string
  dayName: string
  formattedDate: string
  schedule: {
    startTime: string
    endTime: string
    branch?: { name: string }
  } | null
}

export default function KaryawanSchedule() {
  const { token } = useAuth()
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState<string>("")

  useEffect(() => {
    fetchSchedule()
  }, [token, weekStart])

  const fetchSchedule = async () => {
    try {
      const params = weekStart ? `?weekStart=${weekStart}` : ""
      const res = await fetch(`/api/schedules/weekly${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setScheduleData(data.days)
        setWeekStart(data.weekStart)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction: number) => {
    const current = new Date(weekStart || new Date())
    current.setDate(current.getDate() + direction * 7)
    setWeekStart(current.toISOString())
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📅 Jadwal Kerja Saya</h1>

      {/* Week Navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateWeek(-1)} className="btn btn-secondary">
            ← Minggu Lalu
          </button>
          <p className="font-medium">
            {scheduleData[0]?.formattedDate} -{" "}
            {scheduleData[scheduleData.length - 1]?.formattedDate}
          </p>
          <button onClick={() => navigateWeek(1)} className="btn btn-secondary">
            Minggu Depan →
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scheduleData.map((day) => (
            <div
              key={day.date}
              className={`p-4 rounded-lg border ${
                day.schedule
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="font-semibold">{day.dayName}</p>
              <p className="text-sm text-gray-600">{day.formattedDate}</p>
              {day.schedule ? (
                <div className="mt-2">
                  <p className="text-lg font-bold text-blue-600">
                    {day.schedule.startTime} - {day.schedule.endTime}
                  </p>
                  {day.schedule.branch && (
                    <p className="text-xs text-gray-500">
                      📍 {day.schedule.branch.name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">LIBUR</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
