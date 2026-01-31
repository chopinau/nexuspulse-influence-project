"use client"

import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Activity,
  BarChart3,
  Zap,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: TrendingUp },
  { id: "entities", label: "Entities", icon: Users },
  { id: "signals", label: "Signals", icon: Zap },
  { id: "activity", label: "Activity", icon: Activity },
]

const bottomItems = [
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
]

export function DashboardSidebar({ activeItem = "dashboard", onItemClick }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-border bg-sidebar lg:w-64">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="hidden text-lg font-semibold tracking-tight text-foreground lg:block">
          NEXUSPULSE
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="mb-2 hidden px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground lg:block">
          Overview
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                )}
              />
              <span className="hidden lg:block">{item.label}</span>
              {isActive && (
                <div className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-sidebar-primary lg:block" />
              )}
            </button>
          )
        })}

        <div className="my-4 h-px bg-border" />

        <div className="mb-2 hidden px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground lg:block">
          System
        </div>
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                )}
              />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  )
}
