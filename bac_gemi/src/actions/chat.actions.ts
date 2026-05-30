"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function sendMessage(content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) throw new Error("No study room")

  const message = await prisma.message.create({
    data: {
      content,
      senderId: user.id,
      relationshipId: user.relationshipId
    },
    include: {
      sender: true
    }
  })

  // Broadcast
  await pusherServer.trigger(
    `presence-room-${user.relationshipId}`,
    "new-message",
    message
  )

  return { success: true, message }
}

export async function getMessages() {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) return []

  return await prisma.message.findMany({
    where: { relationshipId: user.relationshipId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
    take: 50 // last 50 messages
  })
}
