"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface Employee {
  id: string
  employeeId: string
  fullName: string
  salary?: number
  branch?: { name: string }
}

interface PayrollData {
  employee: Employee
  daysPresent: number
  daysLate: number
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
}

export default function PayrollPage() {
  const { token } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [payrollResult, setPayrollResult] = useState<PayrollData | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [token])

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setEmployees(await res.json())
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePayroll = async () => {
    if (!selectedEmployee) {
      alert("Pilih karyawan terlebih dahulu")
      return
    }

    setCalculating(true)
    try {
      const emp = employees.find((e) => e.id === selectedEmployee)
      if (!emp) return

      const dateFrom = `${month}-01`
      const dateTo = `${month}-31`

      const res = await fetch(
        `/api/attendance?employeeId=${selectedEmployee}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.ok) {
        const attendances = await res.json()
        const daysPresent = attendances.filter(
          (a: { status: string }) => a.status === "HADIR" || a.status === "TERLAMBAT"
        ).length
        const daysLate = attendances.filter(
          (a: { status: string }) => a.status === "TERLAMBAT"
        ).length

        const baseSalary = emp.salary || 0
        const allowances = baseSalary * 0.2 // 20% allowance
        const deductions = daysLate * 50000 // Rp 50,000 per late
        const netSalary = baseSalary + allowances - deductions

        setPayrollResult({
          employee: emp,
          daysPresent,
          daysLate,
          baseSalary,
          allowances,
          deductions,
          netSalary,
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💰 Payroll</h1>

      {/* Selection */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Karyawan</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="input"
            >
              <option value="">Pilih Karyawan</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={calculatePayroll}
            disabled={calculating || !selectedEmployee}
            className="btn btn-primary"
          >
            {calculating ? "Menghitung..." : "Hitung Gaji"}
          </button>
        </div>
      </div>

      {/* Payroll Result */}
      {payrollResult && (
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Hasil Perhitungan</h2>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Karyawan</span>
              <span className="font-medium">{payrollResult.employee.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ID Karyawan</span>
              <span className="font-medium">{payrollResult.employee.employeeId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Hadir</span>
              <span className="font-medium">{payrollResult.daysPresent} hari</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Terlambat</span>
              <span className="font-medium">{payrollResult.daysLate} hari</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between mb-2">
                <span>Gaji Pokok</span>
                <span className="font-medium">
                  Rp {payrollResult.baseSalary.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tunjangan (20%)</span>
                <span className="font-medium text-green-600">
                  + Rp {payrollResult.allowances.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Potongan Keterlambatan</span>
                <span className="font-medium text-red-600">
                  - Rp {payrollResult.deductions.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Gaji Bersih</span>
                  <span className="font-bold text-lg text-blue-600">
                    Rp {payrollResult.netSalary.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
