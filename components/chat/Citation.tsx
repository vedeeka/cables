import { ExternalLink } from "lucide-react";

export function Citation({ source, title, date }: { source: string, title: string, date: string }) {
  return (
    <a href="#" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors mx-1">
      <ExternalLink size={10} className="text-primary" />
      <span>{title}</span>
      <span className="text-[9px] opacity-50 ml-1">{date}</span>
    </a>
  );
}
