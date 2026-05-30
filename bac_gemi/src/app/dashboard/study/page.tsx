"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { startPomodoro, completePomodoro } from "@/actions/pomodoro.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { pusherClient } from "@/lib/pusher"
import { Play, Pause, Square, Award } from "lucide-react"
import dynamic from "next/dynamic"

const CanvasWidget = dynamic(() => import("@/components/canvas/CanvasWidget"), { ssr: false })
// We would ideally import ChatWidget here too, but for now we'll just link to it or embed a simple version.

export default function StudyTogetherPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState("FOCUS") // FOCUS, BREAK
  const [pomodoroId, setPomodoroId] = useState<string | null>(null)

  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      if (mode === "FOCUS" && pomodoroId) {
        completePomodoro(pomodoroId)
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, pomodoroId])

  const handleStart = async () => {
    setIsActive(true)
    if (!pomodoroId) {
      const res = await startPomodoro("25/5", 25, 5)
      if (res.success) {
        setPomodoroId(res.pomodoro.id)
      }
    }
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleStop = () => {
    setIsActive(false)
    setTimeLeft(25 * 60)
    setPomodoroId(null)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-full flex flex-col gap-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Left Column: Timer & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-white/80 text-lg font-medium tracking-wide uppercase">
                {mode === "FOCUS" ? "Focus Session" : "Break Time"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="text-7xl font-extrabold tracking-tighter my-6 tabular-nums drop-shadow-md">
                {formatTime(timeLeft)}
              </div>
              
              <div className="flex gap-4 mt-2 mb-4">
                {!isActive ? (
                  <Button onClick={handleStart} className="bg-white text-purple-600 hover:bg-slate-100 rounded-full w-14 h-14 p-0 shadow-lg">
                    <Play fill="currentColor" size={24} />
                  </Button>
                ) : (
                  <Button onClick={handlePause} className="bg-white/20 text-white hover:bg-white/30 rounded-full w-14 h-14 p-0 backdrop-blur-sm">
                    <Pause fill="currentColor" size={24} />
                  </Button>
                )}
                
                <Button onClick={handleStop} className="bg-white/10 text-white hover:bg-white/20 rounded-full w-14 h-14 p-0 backdrop-blur-sm">
                  <Square fill="currentColor" size={20} />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-4 py-1.5 rounded-full mt-2">
                <Award size={16} className="text-yellow-300" />
                <span>+5 Stars on completion</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 shadow-sm border-purple-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Study Music</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 flex items-center justify-center text-slate-500">
                Lofi Player Placeholder
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Canvas */}
        <div className="lg:col-span-2 h-full">
          <CanvasWidget />
        </div>

      </div>
    </div>
  )
}
