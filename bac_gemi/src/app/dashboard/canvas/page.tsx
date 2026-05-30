"use client"

import dynamic from "next/dynamic"

const CanvasWidget = dynamic(() => import("@/components/canvas/CanvasWidget"), {
  ssr: false,
})

export default function CanvasPage() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 min-h-[600px]">
        <CanvasWidget />
      </div>
    </div>
  )
}
