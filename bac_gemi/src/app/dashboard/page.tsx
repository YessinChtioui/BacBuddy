import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      relationship: {
        include: {
          users: true,
          pet: true,
        }
      }
    }
  })

  if (!user?.relationship) redirect("/join")

  const partner = user.relationship.users.find(u => u.id !== user.id)

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Top Section: Exam Countdown & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exam Countdown Widget */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h2 className="text-xl font-medium text-white/80 mb-1">Tunisian Baccalaureate</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-extrabold tracking-tight">371</span>
            <span className="text-xl font-medium text-white/80">Days</span>
            <span className="text-5xl font-extrabold tracking-tight ml-4">14</span>
            <span className="text-xl font-medium text-white/80">Hours</span>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium">
              Target: {user.relationship.examDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Streak & Daily Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">🔥</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{user.currentStreak} Days</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Study Streak</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: '40%' }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Complete 1 more task today</p>
        </div>
      </div>

      {/* Middle Section: Leaderboard & Study Pet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px]">
        
        {/* Study Pet Widget */}
        <div className="lg:col-span-2 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-3xl p-6 border border-blue-100/50 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center">
          <div className="absolute top-4 left-6">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Study Pet</h3>
            <div className="flex gap-1 mt-1">
              <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Lvl {user.relationship.pet?.level || 1}</span>
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user.relationship.pet?.type.toLowerCase() || 'Capybara'}</span>
            </div>
          </div>
          
          {/* Mock Pet Graphic */}
          <div className="w-48 h-48 mt-8 relative animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-blue-400 rounded-full opacity-20 blur-2xl"></div>
            <div className="text-9xl text-center absolute inset-0 flex items-center justify-center select-none">
              🦦
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-md">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
              <span>EXP: {user.relationship.pet?.experience || 0}</span>
              <span>Next Lvl: 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(user.relationship.pet?.experience || 0) % 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Leaderboard Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex justify-between items-center">
            Duo Leaderboard
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">This Week</span>
          </h3>
          
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {/* User A */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
              {user.weeklyStars >= (partner?.weeklyStars || 0) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
              )}
              <div className="text-2xl font-bold text-slate-300 w-6 text-center">1</div>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} className="w-12 h-12 rounded-full bg-white shadow-sm" alt="avatar" />
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">You</p>
                <p className="text-xs text-slate-500">{user.weeklyStars} Stars</p>
              </div>
            </div>
            
            {/* User B */}
            <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
               {user.weeklyStars < (partner?.weeklyStars || 0) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
              )}
              <div className="text-2xl font-bold text-slate-300 w-6 text-center">2</div>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${partner?.email || 'partner'}`} className="w-12 h-12 rounded-full bg-slate-100 shadow-sm" alt="avatar" />
              <div className="flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{partner?.name || "Partner"}</p>
                <p className="text-xs text-slate-500">{partner?.weeklyStars || 0} Stars</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
