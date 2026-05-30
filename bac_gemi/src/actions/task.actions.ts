"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTask(data: {
  title: string,
  description?: string,
  subject: string,
  difficulty: string,
  starReward: number,
  dueDate?: Date
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) throw new Error("No study room")

  const task = await prisma.task.create({
    data: {
      ...data,
      status: "ACTIVE", // Skipping PENDING for simplicity in MVP, but can be added back
      creatorId: user.id,
      relationshipId: user.relationshipId
    }
  })

  revalidatePath("/dashboard/tasks")
  return { success: true, task }
}

export async function completeTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || task.creatorId !== session.user.id) throw new Error("Invalid task")

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "WAITING_VALIDATION" }
  })

  revalidatePath("/dashboard/tasks")
  return { success: true }
}

export async function validateTask(taskId: string, approved: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { creator: true } })
  if (!task || task.creatorId === session.user.id) throw new Error("Cannot validate own task")

  if (approved) {
    // 1. Update task
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "COMPLETED" }
    })

    // 2. Award stars and update streaks to the creator
    const now = new Date()
    const lastStudy = task.creator.lastStudyDate
    let currentStreak = task.creator.currentStreak

    // Simple streak logic (could be improved to check calendar days)
    if (!lastStudy || (now.getTime() - lastStudy.getTime() > 24 * 60 * 60 * 1000 && now.getTime() - lastStudy.getTime() < 48 * 60 * 60 * 1000)) {
      currentStreak += 1
    } else if (lastStudy && now.getTime() - lastStudy.getTime() > 48 * 60 * 60 * 1000) {
      currentStreak = 1
    } else if (!lastStudy) {
      currentStreak = 1
    }

    await prisma.user.update({
      where: { id: task.creatorId },
      data: {
        totalStars: { increment: task.starReward },
        weeklyStars: { increment: task.starReward },
        monthlyStars: { increment: task.starReward },
        currentStreak,
        lastStudyDate: now,
      }
    })

    // 3. Update Pet EXP
    const relationship = await prisma.partnerRelationship.findUnique({
      where: { id: task.relationshipId },
      include: { pet: true }
    })

    if (relationship?.pet) {
      const newExp = relationship.pet.experience + task.starReward
      const levelUps = Math.floor(newExp / 100)
      
      await prisma.pet.update({
        where: { id: relationship.pet.id },
        data: {
          experience: newExp % 100,
          level: { increment: levelUps }
        }
      })
    }

  } else {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "REJECTED" }
    })
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/tasks")
  return { success: true }
}

export async function getTasks() {
  const session = await auth()
  if (!session?.user?.id) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user?.relationshipId) return []

  return await prisma.task.findMany({
    where: { relationshipId: user.relationshipId },
    include: { creator: true },
    orderBy: { createdAt: 'desc' }
  })
}
