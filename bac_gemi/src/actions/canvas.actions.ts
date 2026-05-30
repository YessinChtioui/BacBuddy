"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function saveCanvasState(state: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) throw new Error("No study room")

  let room = await prisma.canvasRoom.findFirst({
    where: { relationshipId: user.relationshipId }
  })

  if (!room) {
    room = await prisma.canvasRoom.create({
      data: {
        relationshipId: user.relationshipId,
        state: state
      }
    })
  } else {
    room = await prisma.canvasRoom.update({
      where: { id: room.id },
      data: { state: state }
    })
  }

  // Broadcast state to partner
  await pusherServer.trigger(
    `presence-room-${user.relationshipId}`,
    "canvas-update",
    { state, senderId: user.id }
  )

  return { success: true }
}

export async function getCanvasState() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) return null

  const room = await prisma.canvasRoom.findFirst({
    where: { relationshipId: user.relationshipId }
  })

  return room?.state || null
}
