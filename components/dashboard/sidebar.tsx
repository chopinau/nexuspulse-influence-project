"use client"

import { LayoutDashboard, BarChart2, FileText, Settings, Users, Bell } from "lucide-react"

interface DashboardSidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
}

export function DashboardSidebar({ activeItem, onItemClick }: DashboardSidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "analytics", icon: BarChart2, label: "Analytics" },
    { id: "reports", icon: FileText, label: "Reports" },
    { id: "team", icon: Users, label: "Team" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 flex-col border-r border-border bg-background transition-all duration-300 hover:w-64 lg:w-64">
      <div className="flex h-16 items-center justify-center border-b border-border px-4 lg:justify-start">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-primary" />
        </div>
        <span className="ml-3 hidden text-lg font-bold lg:block">NexusPulse</span>
      </div>

      <div className="flex flex-1 flex-col justify-between py-6">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeItem === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 min-w-[20px]" />
              <span className="ml-3 hidden overflow-hidden whitespace-nowrap lg:block">
                {item.label}
              </span>
              {item.id === "reports" && (
                <span className="ml-auto hidden h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary lg:flex">
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-2">
          <button className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="h-5 w-5 min-w-[20px]" />
            <span className="ml-3 hidden overflow-hidden whitespace-nowrap lg:block">
              Notifications
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
