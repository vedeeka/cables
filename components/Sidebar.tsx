import Link from 'next/link';
import { Home, Network, Database, Settings, ShieldAlert, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 h-full bg-card backdrop-blur-md border-r border-border flex flex-col pt-6 z-10">
      <div className="px-6 pb-6 border-b border-border mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Enterprise AI OS
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Intelligence Layer</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
          <Home size={18} className="text-blue-400" />
          AI Workspace
        </Link>
        <Link href="/organization" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
          <Network size={18} className="text-purple-400" />
          Organization View
        </Link>
        <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
          <Database size={18} className="text-emerald-400" />
          Knowledge View
        </Link>
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors">
          <Settings size={18} className="text-orange-400" />
          Sync Dashboard
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-lg p-3 flex items-start gap-3 border border-white/5 mb-3">
          <ShieldAlert size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Permission Level</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Admin (Full Access)</p>
          </div>
        </div>
        <a href="http://localhost:8000/api/v1/auth/logout" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors border border-red-500/20">
          <LogOut size={14} />
          Sign Out
        </a>
      </div>
    </div>
  );
}
