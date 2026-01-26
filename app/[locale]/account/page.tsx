import { getUserDashboardData } from "@/app/actions";
import GlowCard from "@/components/GlowCard";

export default async function AccountPage() {
  const data = await getUserDashboardData();

  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-white">Account Settings</h1>

      <GlowCard className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
            <div className="mt-1 text-lg text-white font-mono">{data.user.email}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Current Plan</label>
            <div className="mt-1 text-lg text-cyber-neon font-bold">{data.user.plan}</div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">Subscription</h3>
          {data.user.plan === 'FREE' ? (
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
              <span className="text-gray-400 text-sm">You are on the Free tier</span>
              <button className="text-xs bg-cyber-neon text-cyber-dark px-3 py-1.5 rounded font-bold">
                Upgrade
              </button>
            </div>
          ) : (
             <div className="flex items-center justify-between bg-cyber-green/10 border border-cyber-green/30 p-4 rounded-lg">
              <span className="text-cyber-green text-sm">Active Subscription</span>
              <span className="text-xs text-cyber-green/70">Manage billing via Stripe</span>
            </div>
          )}
        </div>
      </GlowCard>
      
      <div className="text-center text-xs text-gray-600">
        User ID: {data.user.email?.split('@')[0]}_HashX99
      </div>
    </div>
  );
}
