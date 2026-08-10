import { Bot, User, CheckCircle2, Loader2 } from "lucide-react";
import { Citation } from "./Citation";
import { InteractiveWidget } from "./InteractiveWidget";

type MessageProps = {
  role: 'user' | 'agent' | 'system';
  content?: string;
  agentName?: string;
  isThinking?: boolean;
  citations?: any[];
  widget?: any;
};

export function MessageBubble({ role, content, agentName, isThinking, citations, widget }: MessageProps) {
  if (role === 'system') {
    return (
      <div className="flex items-center gap-3 text-xs text-muted-foreground my-4 px-4">
        <hr className="flex-1 border-border" />
        <span className="flex items-center gap-1.5 bg-card/50 px-3 py-1 rounded-full border border-border">
          {isThinking ? <Loader2 size={12} className="animate-spin text-primary" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
          {content}
        </span>
        <hr className="flex-1 border-border" />
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : ''} my-6`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && agentName && (
          <span className="text-xs font-semibold text-muted-foreground mb-1 ml-1">{agentName}</span>
        )}
        
        <div className={`p-4 rounded-2xl leading-relaxed text-sm shadow-sm ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm text-foreground'}`}>
          {content && <div dangerouslySetInnerHTML={{ __html: content }} className="whitespace-pre-wrap" />}
          
          {citations && citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1">
              {citations.map((c, i) => <Citation key={i} {...c} />)}
            </div>
          )}

          {widget && <InteractiveWidget type={widget.type} data={widget.data} />}
        </div>
      </div>
    </div>
  );
}
