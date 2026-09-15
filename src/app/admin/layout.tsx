"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth, AuthProvider } from "@/lib/auth-context"

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/employees", label: "Karyawan", icon: "👥" },
    { href: "/admin/schedule", label: "Schedule", icon: "📅" },
    { href: "/admin/attendance", label: "Time Management", icon: "⏰" },
    { href: "/admin/payroll", label: "Payroll", icon: "💰" },
    { href: "/admin/branches", label: "Cabang", icon: "📍" },
    { href: "/admin/approvals", label: "Approval", icon: "✅" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold">HRIS CSB</h1>
          <p className="text-sm text-slate-400">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.employee?.fullName?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.employee?.fullName || "Admin"}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary w-full text-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  )
}
