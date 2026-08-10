import { Network, Users, Briefcase } from "lucide-react";

export default function OrganizationView() {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Organization View</h1>
        <p className="text-muted-foreground mt-2">Explore departments, teams, and projects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><Network size={20} className="text-blue-400" /></div>
            <h3 className="font-semibold text-lg">Departments</h3>
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Users size={20} className="text-purple-400" /></div>
            <h3 className="font-semibold text-lg">Employees</h3>
          </div>
          <p className="text-3xl font-bold">1,204</p>
        </div>
        <div className="p-6 bg-card/50 backdrop-blur-md rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg"><Briefcase size={20} className="text-emerald-400" /></div>
            <h3 className="font-semibold text-lg">Active Projects</h3>
          </div>
          <p className="text-3xl font-bold">34</p>
        </div>
      </div>

      <div className="bg-card/30 backdrop-blur-md rounded-xl border border-white/5 flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Network size={48} className="mx-auto mb-4 opacity-50" />
          <p>Interactive Organization Graph visualization will render here.</p>
          <p className="text-sm mt-2 opacity-70">Requires Phase 2 Graph DB Integration.</p>
        </div>
      </div>
    </div>
  );
}
