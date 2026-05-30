"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"

export async function startPomodoro(mode: string, focusTime: number, breakTime: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) throw new Error("No study room")

  const pomodoro = await prisma.pomodoroSession.create({
    data: {
      relationshipId: user.relationshipId,
      mode,
      focusTime,
      breakTime,
      status: "ACTIVE"
    }
  })

  await pusherServer.trigger(`presence-room-${user.relationshipId}`, "pomodoro-started", pomodoro)
  return { success: true, pomodoro }
}

export async function completePomodoro(pomodoroId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const pomodoro = await prisma.pomodoroSession.update({
    where: { id: pomodoroId },
    data: { status: "COMPLETED" }
  })

  // Award stars to both users for completing a session together
  const relationship = await prisma.partnerRelationship.findUnique({
    where: { id: pomodoro.relationshipId },
    include: { users: true, pet: true }
  })

  if (relationship) {
    for (const u of relationship.users) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          totalStars: { increment: 5 },
          weeklyStars: { increment: 5 },
          monthlyStars: { increment: 5 },
        }
      })
    }

    if (relationship.pet) {
      await prisma.pet.update({
        where: { id: relationship.pet.id },
        data: { experience: { increment: 5 } }
      })
    }
  }

  await pusherServer.trigger(`presence-room-${pomodoro.relationshipId}`, "pomodoro-completed", pomodoro)
  return { success: true }
}
