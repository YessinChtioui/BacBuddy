"use client"

import { Bell, Search, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function Header({ user }: { user?: { name?: string | null, email?: string | null, totalStars?: number } }) {
  return (
    <header className="h-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-purple-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search tasks, notes..." 
            className="w-full bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-9 rounded-full focus-visible:ring-purple-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Stars Economy display */}
        <div className="hidden sm:flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 px-3 py-1.5 rounded-full">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{user?.totalStars || 0}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200 dark:bg-slate-700" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-purple-100 dark:border-slate-700 hover:ring-2 ring-purple-400 transition-all">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email || "avatar"}`} alt="@avatar" />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}

function Separator({ orientation, className }: { orientation: string, className: string }) {
  return <div className={className} />
}
