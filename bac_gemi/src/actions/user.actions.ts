"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createStudyRoom() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Default exam date to June 5 of current year or next year
  const now = new Date()
  let examDate = new Date(now.getFullYear(), 5, 5) // June 5th
  if (now > examDate) {
    examDate = new Date(now.getFullYear() + 1, 5, 5)
  }

  const relationship = await prisma.partnerRelationship.create({
    data: {
      joinCode,
      examDate,
      users: {
        connect: { id: session.user.id }
      },
      pet: {
        create: {
          type: "CAPYBARA",
          level: 1,
          experience: 0,
        }
      }
    }
  })

  revalidatePath("/join")
  return { success: true, joinCode }
}

export async function joinStudyRoom(joinCode: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const relationship = await prisma.partnerRelationship.findUnique({
    where: { joinCode: joinCode.toUpperCase() },
    include: { users: true }
  })

  if (!relationship) {
    return { error: "Invalid join code" }
  }

  if (relationship.users.length >= 2 && !relationship.users.find(u => u.id === session.user.id)) {
    return { error: "This study room is already full (max 2 partners)" }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { relationshipId: relationship.id }
  })

  revalidatePath("/join")
  return { success: true, relationshipId: relationship.id }
}

export async function getUserStatus() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { relationship: true }
  })

  return { 
    hasRoom: !!user?.relationshipId,
    joinCode: user?.relationship?.joinCode
  }
}
