"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { getMessages, sendMessage } from "@/actions/chat.actions"
import { pusherClient } from "@/lib/pusher"
import { getUserStatus } from "@/actions/user.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users } from "lucide-react"

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [roomDetails, setRoomDetails] = useState<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const status = await getUserStatus()
      setRoomDetails(status)
      
      const msgs = await getMessages()
      setMessages(msgs)
      
      if (status.hasRoom) {
        // Subscribe to presence channel
        // In a real app we'd fetch the exact relationship ID, 
        // here we assume we know it or fetch it. 
        // Wait, getUserStatus doesn't return relationshipId. Let me just fetch messages and they contain relationshipId.
        if (msgs.length > 0) {
           const channelId = msgs[0].relationshipId;
           subscribe(channelId)
        }
      }
    }
    init()
  }, [])

  const subscribe = (relationshipId: string) => {
    const channel = pusherClient.subscribe(`presence-room-${relationshipId}`)

    channel.bind("pusher:subscription_succeeded", (members: any) => {
      setOnlineUsers(members.count)
    })

    channel.bind("pusher:member_added", () => {
      setOnlineUsers(prev => prev + 1)
    })

    channel.bind("pusher:member_removed", () => {
      setOnlineUsers(prev => prev - 1)
    })

    channel.bind("new-message", (message: any) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      pusherClient.unsubscribe(`presence-room-${relationshipId}`)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const tempMsg = {
      id: Math.random().toString(),
      content,
      senderId: session?.user?.id,
      sender: { name: session?.user?.name, email: session?.user?.email },
      createdAt: new Date()
    }
    
    // Optimistic UI
    setMessages(prev => [...prev, tempMsg])
    setContent("")
    
    await sendMessage(tempMsg.content)
  }

  return (
    <div className="h-full flex flex-col gap-4 max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col shadow-sm border-purple-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <CardHeader className="border-b border-purple-50 dark:border-slate-800 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-purple-800 dark:text-purple-300 flex items-center gap-2">
            Study Room Chat
          </CardTitle>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <div className={`w-2 h-2 rounded-full ${onlineUsers > 1 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
            {onlineUsers > 1 ? 'Partner Online' : 'Partner Offline'}
            <Users size={16} className="ml-2" /> {onlineUsers}/2
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === session?.user?.id
                return (
                  <div key={msg.id || i} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    {!isMe && <span className="text-xs text-slate-500 mb-1 ml-1">{msg.sender.name}</span>}
                    <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="Type your message..." 
                className="rounded-full bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-purple-400"
              />
              <Button type="submit" size="icon" className="rounded-full bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
