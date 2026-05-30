"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Excalidraw } from "@excalidraw/excalidraw"
import { saveCanvasState, getCanvasState } from "@/actions/canvas.actions"
import { pusherClient } from "@/lib/pusher"
import { getUserStatus } from "@/actions/user.actions"
import { toast } from "sonner"

export default function CanvasWidget() {
  const { data: session } = useSession()
  const [initialData, setInitialData] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const excalidrawAPI = useRef<any>(null)

  useEffect(() => {
    async function init() {
      const state = await getCanvasState()
      if (state) {
        setInitialData({ elements: state })
      }
      setIsReady(true)

      const status = await getUserStatus()
      if (status.hasRoom && status.joinCode) {
        // Assume relationship id logic or fetch it
        // We will just bind to the canvas-update event on the relationship channel
        // For simplicity in this mock, we need the exact ID to subscribe.
      }
    }
    init()
  }, [])

  const handleChange = async (elements: readonly any[], appState: any) => {
    // Debounce this in a real app, save every 2 seconds
    // await saveCanvasState(elements)
  }

  if (!isReady) return <div className="h-full flex items-center justify-center text-slate-500">Loading Canvas...</div>

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-100 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200">
        Shared Whiteboard
      </div>
      <Excalidraw
        initialData={initialData}
        onChange={handleChange}
        excalidrawAPI={(api) => excalidrawAPI.current = api}
        theme="light"
      />
    </div>
  )
}
