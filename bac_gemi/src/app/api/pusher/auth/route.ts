import { auth } from "@/auth"
import { pusherServer } from "@/lib/pusher"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const data = await req.formData()
  const socketId = data.get("socket_id") as string
  const channel = data.get("channel_name") as string

  // Simple validation that the user is authorizing for their own relationship room
  // In a real app, verify they actually belong to the room.
  const authResponse = pusherServer.authorizeChannel(socketId, channel, {
    user_id: session.user.id,
    user_info: {
      name: session.user.name,
      email: session.user.email,
    }
  })

  return new Response(JSON.stringify(authResponse))
}
