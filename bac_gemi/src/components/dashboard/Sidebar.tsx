"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CheckSquare, MessageCircle, PenTool, Trophy, Award, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Study Together", href: "/dashboard/study", icon: PenTool },
  { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Achievements", href: "/dashboard/achievements", icon: Award },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-r border-purple-100 dark:border-slate-800 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
          <BookOpen size={18} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">BacBuddy</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon size={18} className={cn(isActive && "text-purple-600 dark:text-purple-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-purple-100/50 dark:border-slate-800/50">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800/50 dark:to-purple-900/20 p-4 rounded-xl border border-blue-100 dark:border-purple-800/30">
          <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider mb-2">Study Session</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Partner is offline.</p>
          <button className="w-full py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            Ping Partner
          </button>
        </div>
      </div>
    </div>
  )
}
