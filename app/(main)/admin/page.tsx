import { Activity, HardDrive, RefreshCw, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin & Sync Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage connected services, users, and ingestion pipelines.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">System Health</h3>
            <Activity size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">All Systems Operational</p>
        </div>
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Vector Storage</h3>
            <HardDrive size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold">14.2 GB</p>
          <p className="text-xs text-muted-foreground mt-1">1.2M chunks indexed</p>
        </div>
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Active Syncs</h3>
            <RefreshCw size={18} className="text-purple-400 animate-spin-slow" />
          </div>
          <p className="text-2xl font-bold">3 Jobs Running</p>
        </div>
        <div className="p-6 bg-orange-500/10 backdrop-blur-md rounded-xl border border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-orange-400 uppercase tracking-wider">Warnings</h3>
            <AlertTriangle size={18} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">2 Failed Syncs</p>
          <p className="text-xs text-orange-400/80 mt-1">Requires attention</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Connected Data Sources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 bg-card/30 rounded-xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="font-medium text-lg">Google Workspace</div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">Connected</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Syncs Gmail, Drive, Docs, and Sheets.</p>
          <p className="text-xs text-muted-foreground">Last synced: 2 minutes ago</p>
        </div>

        <div className="p-5 bg-card/30 rounded-xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="font-medium text-lg">PostgreSQL (Production)</div>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded font-medium">Connected</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Structured business data.</p>
          <p className="text-xs text-muted-foreground">Real-time connection</p>
        </div>

        <div className="p-5 bg-card/30 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <span className="text-2xl text-muted-foreground">+</span>
          </div>
          <p className="font-medium">Add Connector</p>
          <p className="text-xs text-muted-foreground mt-1">Slack, Notion, Jira...</p>
        </div>
      </div>
    </div>
  );
}
