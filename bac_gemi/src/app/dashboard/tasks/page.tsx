"use client"

import { useState, useEffect } from "react"
import { getTasks, completeTask, validateTask, createTask } from "@/actions/task.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { Plus, Check, X } from "lucide-react"
import { useSession } from "next-auth/react"

// Simple mock types for client
type Task = {
  id: string
  title: string
  subject: string
  difficulty: string
  starReward: number
  status: string
  creatorId: string
  creator: { name: string | null }
}

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("Math")
  const [difficulty, setDifficulty] = useState("Medium")
  const [starReward, setStarReward] = useState(5)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const t = await getTasks()
    setTasks(t as any)
    setLoading(false)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading("Creating task...")
    try {
      await createTask({ title, subject, difficulty, starReward })
      toast.success("Task created!", { id: toastId })
      setIsDialogOpen(false)
      setTitle("")
      fetchTasks()
    } catch {
      toast.error("Error creating task", { id: toastId })
    }
  }

  const handleComplete = async (id: string) => {
    await completeTask(id)
    toast.success("Task sent for validation!")
    fetchTasks()
  }

  const handleValidate = async (id: string, approved: boolean) => {
    await validateTask(id, approved)
    toast.success(approved ? "Task approved!" : "Task rejected.")
    fetchTasks()
  }

  const activeTasks = tasks.filter(t => t.status === "ACTIVE" || t.status === "REJECTED")
  const waitingTasks = tasks.filter(t => t.status === "WAITING_VALIDATION")
  const completedTasks = tasks.filter(t => t.status === "COMPLETED")

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tasks</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-purple-600 hover:bg-purple-700 text-white gap-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2">
            <Plus size={16} /> New Task
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Solve Math Exam 2023" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400">
                    <option>Math</option>
                    <option>Physics</option>
                    <option>Science</option>
                    <option>Computer Science</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Star Reward: {starReward}</Label>
                <input type="range" min="1" max="10" value={starReward} onChange={e => setStarReward(Number(e.target.value))} className="w-full accent-purple-600" />
              </div>
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 items-start">
        {/* Active Tasks */}
        <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px]">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Active ({activeTasks.length})
          </h3>
          <div className="space-y-3">
            {activeTasks.map(task => (
              <TaskCard key={task.id} task={task} onAction={() => handleComplete(task.id)} actionText="Complete" sessionUserId={session?.user?.id} />
            ))}
          </div>
        </div>

        {/* Waiting Validation */}
        <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px]">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Needs Review ({waitingTasks.length})
          </h3>
          <div className="space-y-3">
            {waitingTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isReviewing={task.creatorId !== session?.user?.id}
                onApprove={() => handleValidate(task.id, true)} 
                onReject={() => handleValidate(task.id, false)} 
                sessionUserId={session?.user?.id}
              />
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px]">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Done ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} isCompleted sessionUserId={session?.user?.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onAction, actionText, isReviewing, onApprove, onReject, isCompleted, sessionUserId }: any) {
  const isMine = task.creatorId === sessionUserId

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
      <Card className="shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-none">{task.subject}</Badge>
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-500">
              {task.starReward} <span>⭐</span>
            </div>
          </div>
          <h4 className={`font-medium text-slate-800 dark:text-slate-200 ${isCompleted ? "line-through text-slate-400" : ""}`}>{task.title}</h4>
          <p className="text-xs text-slate-500 mt-2">By {isMine ? "You" : task.creator.name}</p>
          
          <div className="mt-4 flex gap-2">
            {onAction && isMine && (
              <Button size="sm" onClick={onAction} className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 shadow-none border-none">
                {actionText}
              </Button>
            )}
            {onAction && !isMine && (
              <Button size="sm" disabled className="w-full bg-slate-50 text-slate-400 shadow-none border-none">
                Waiting for {task.creator.name}
              </Button>
            )}

            {isReviewing && !isCompleted && (
              <div className="flex w-full gap-2">
                <Button size="sm" onClick={onApprove} className="w-full bg-green-50 text-green-600 hover:bg-green-100 shadow-none border-none">
                  <Check size={16} />
                </Button>
                <Button size="sm" onClick={onReject} className="w-full bg-red-50 text-red-600 hover:bg-red-100 shadow-none border-none">
                  <X size={16} />
                </Button>
              </div>
            )}
            
            {!isReviewing && !isCompleted && !onAction && !isMine && (
              <Button size="sm" disabled className="w-full bg-slate-50 text-slate-400 shadow-none border-none">
                In Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
