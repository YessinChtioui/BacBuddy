"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createStudyRoom, joinStudyRoom, getUserStatus } from "@/actions/user.actions"

export default function JoinPage() {
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkStatus() {
      const status = await getUserStatus()
      if (status.hasRoom) {
        router.push("/dashboard")
      } else {
        setChecking(false)
      }
    }
    checkStatus()
  }, [router])

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await createStudyRoom()
      if (res.success) {
        toast.success(`Room created! Your code is ${res.joinCode}`)
        router.push("/dashboard")
      }
    } catch (err) {
      toast.error("Failed to create room")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return

    setLoading(true)
    try {
      const res = await joinStudyRoom(joinCode)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Successfully joined the study room!")
        router.push("/dashboard")
      }
    } catch (err) {
      toast.error("Failed to join room")
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md shadow-xl border-blue-100 dark:border-blue-900/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">Join a Study Room</CardTitle>
            <CardDescription>Partner up to start your Bac journey together.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter 6-character Code" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono uppercase tracking-widest text-center text-lg"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || joinCode.length < 6}>
                Join Partner
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
              onClick={handleCreate}
              disabled={loading}
            >
              Create New Room
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
