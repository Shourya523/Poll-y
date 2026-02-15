import { Clock, Trophy, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    options: PollOption[];
    createdAt: any;
  };
  onClick?: () => void;
}

export default function PastPollCard({ poll, onClick }: PollCardProps) {
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  
  const winningOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];

  const formattedDate = poll.createdAt?.toDate 
    ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true })
    : "Just now";

  return (
    <div 
      onClick={onClick}
      className="group relative w-full bg-[#121212] border border-white/5 rounded-xl p-5 transition-all hover:bg-[#1a1a1a] hover:border-white/10 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Clock size={12} />
            {formattedDate}
          </div>
          <h3 className="text-lg font-semibold text-slate-100 line-clamp-1 group-hover:text-white transition-colors">
            {poll.question}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Leading Option</p>
            <div className="flex items-center gap-2 text-sm text-indigo-400 font-medium">
              <Trophy size={14} className="text-amber-500" />
              {totalVotes > 0 ? winningOption.text : "No votes yet"}
            </div>
          </div>

          <div className="space-y-1 min-w-[80px]">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Engagement</p>
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <Users size={14} />
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        </div>
        
        <div className="hidden md:block pl-4 border-l border-white/5">
          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
            <div className="h-2 w-2 border-t-2 border-r-2 border-slate-500 rotate-45 group-hover:border-indigo-400 transition-colors" />
          </div>
        </div>

      </div>
    </div>
  );
}