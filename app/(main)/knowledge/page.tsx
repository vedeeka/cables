import { Database, Search, Filter, Shield } from "lucide-react";

export default function KnowledgeView() {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge View</h1>
          <p className="text-muted-foreground mt-2">Inspect indexed enterprise information and metadata.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search knowledge base..." className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary w-64" />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/10 text-sm font-medium">
            <Filter size={16} /> Filters
          </button>
        </div>
      </header>

      <div className="bg-card/50 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/40 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Document Title</th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Last Updated</th>
              <th className="px-6 py-4 font-medium">Permissions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-blue-400">Q3 Marketing Strategy.pdf</td>
              <td className="px-6 py-4">Google Drive</td>
              <td className="px-6 py-4">Sarah Jenkins</td>
              <td className="px-6 py-4">Oct 1, 2023</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                  <Shield size={12} /> Marketing Team
                </span>
              </td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-blue-400">DB_MARKETING_SPEND</td>
              <td className="px-6 py-4">Snowflake</td>
              <td className="px-6 py-4">Data Team</td>
              <td className="px-6 py-4">Nov 15, 2023</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
                  <Shield size={12} /> Executive Level
                </span>
              </td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-medium text-blue-400">Project Alpha Post-Mortem</td>
              <td className="px-6 py-4">Notion</td>
              <td className="px-6 py-4">Engineering</td>
              <td className="px-6 py-4">Dec 10, 2023</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                  <Shield size={12} /> Public (Internal)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
