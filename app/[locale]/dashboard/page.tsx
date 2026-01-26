import { getUserDashboardData } from "@/app/actions";
import { PlanBadge, TrialCountdown, UsageMeter, ActivityItem } from "@/components/DashboardUI";
import GlowCard from "@/components/GlowCard";
import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  const data = await getUserDashboardData();

  if (!data) return null; // Should be handled by layout redirect

  const isFree = data.user.plan === 'FREE';
  const isTrial = data.user.plan === 'TRIAL';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {data.user.name || data.user.email}</p>
        </div>
        <PlanBadge plan={data.user.plan} />
      </div>

      {/* Trial Countdown (If applicable) */}
      {isTrial && data.user.trialEndsAt && (
        <TrialCountdown endDate={data.user.trialEndsAt} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Usage Card */}
        <GlowCard className="bg-cyber-dark/50">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full" />
              AI Consumption
            </h2>
            {isFree && (
              <Link href="/premium">
                <span className="text-[10px] bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50 px-2 py-1 rounded hover:bg-cyber-purple/30 transition-colors">
                  Upgrade to Pro
                </span>
              </Link>
            )}
          </div>
          
          <div className="space-y-6">
            <UsageMeter 
              label="Daily Queries" 
              current={data.user.usageToday} 
              max={data.limits.daily} 
            />
            <UsageMeter 
              label="Monthly Volume" 
              current={data.user.usageMonthly} 
              max={data.user.plan === 'PAID' ? 5000 : 100} 
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 text-center">
            Resets daily at 00:00 UTC
          </div>
        </GlowCard>

        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyber-purple/20 to-cyber-dark border border-cyber-purple/30 p-6 flex flex-col justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">
            {isFree ? "Unlock Full Power" : "Maximize Alpha"}
          </h2>
          <p className="text-gray-300 text-sm mb-6 relative z-10">
            {isFree 
              ? "Free plan is limited to 1 summary per day. Upgrade to analyze unlimited entities."
              : "Access real-time correlation matrices and exportable reports."}
          </p>
          <Link href="/premium" className="relative z-10">
            <button className="w-full py-3 bg-cyber-neon hover:bg-cyber-neon/80 text-cyber-dark font-bold rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all transform hover:scale-[1.02]">
              Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4 px-1">Recent Insights</h3>
        <div className="bg-cyber-panel backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {data.recentActivity.map((activity) => (
              <ActivityItem 
                key={activity.id}
                title={activity.title}
                date={activity.date}
                sentiment={activity.sentiment}
              />
            ))}
          </div>
          <div className="p-3 text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white">
              View Full History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
