"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, LayoutDashboard, Archive, Settings, Activity } from "lucide-react"
import { Toaster } from "sonner"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Intel Archives", href: "/archives", icon: Archive },
    { name: "System Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Toaster position="top-right" theme="dark" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/30">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold tracking-wider text-white">NEXUS<span className="text-cyan-400">PULSE</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900 border border-slate-800">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 blur-sm animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">SYSTEM ONLINE</span>
              <span className="text-[10px] text-slate-500">v2.4.0-stable</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
           {children}
        </div>
      </main>
    </div>
  )
}
