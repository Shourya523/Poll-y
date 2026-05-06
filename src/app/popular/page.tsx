"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useRouter } from "next/navigation";
import { Flame, Trophy, Users, Medal, Crown, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ROOMS } from "../../components/MakePoll";

interface PollOption { id: string; text: string; votes: number; }
interface Poll { id: string; question: string; options: PollOption[]; createdAt: any; room?: string; }

function getRankStyle(rank: number) {
  if (rank === 0) return { icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "#1" };
  if (rank === 1) return { icon: Medal, color: "text-slate-300", bg: "bg-slate-500/10 border-slate-500/30", label: "#2" };
  if (rank === 2) return { icon: Medal, color: "text-amber-700", bg: "bg-orange-500/10 border-orange-500/30", label: "#3" };
  return { icon: TrendingUp, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", label: `#${rank + 1}` };
}

function PopularPollCard({ poll, rank, onClick }: { poll: Poll; rank: number; onClick: () => void }) {
  const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0);
  const winner = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
  const room = ROOMS.find(r => r.id === poll.room) || ROOMS[0];
  const date = poll.createdAt?.toDate ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true }) : "Just now";
  const style = getRankStyle(rank);
  const RankIcon = style.icon;

  // Progress bars for top options
  const topOptions = [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-[#0f0f11] border rounded-2xl p-5 hover:bg-[#13131a] transition-all cursor-pointer overflow-hidden ${rank < 3 ? "border-white/10" : "border-white/5"}`}
    >
      {rank < 3 && (
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${rank === 0 ? "from-amber-500/5" : rank === 1 ? "from-slate-400/5" : "from-orange-500/5"} to-transparent pointer-events-none`} />
      )}

      <div className="relative flex gap-4">
        {/* Rank badge */}
        <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex flex-col items-center justify-center border ${style.bg}`}>
          <RankIcon size={16} className={style.color} />
          <span className={`text-[10px] font-bold ${style.color}`}>{style.label}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white line-clamp-2 leading-snug">
              {poll.question}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <span>{room.emoji} {room.label}</span>
            <span>·</span>
            <span>{date}</span>
          </div>

          {/* Mini vote bars */}
          <div className="space-y-1.5">
            {topOptions.map(opt => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 w-12 text-right truncate">{opt.text}</span>
                  <span className="text-[10px] text-slate-400 font-medium w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vote count */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-indigo-400">
            <Users size={12} />
            <span className="text-sm font-bold text-white">{totalVotes}</span>
          </div>
          <span className="text-[10px] text-slate-600">votes</span>
        </div>
      </div>
    </div>
  );
}

export default function PopularPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const snap = await getDocs(collection(db, "polls"));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
        // Sort by total votes desc
        all.sort((a, b) => {
          const va = a.options.reduce((s, o) => s + o.votes, 0);
          const vb = b.options.reduce((s, o) => s + o.votes, 0);
          return vb - va;
        });
        setPolls(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  const topThree = polls.slice(0, 3);
  const rest = polls.slice(3);
  const totalVotesAll = polls.reduce((acc, p) => acc + p.options.reduce((a, o) => a + o.votes, 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame size={18} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Popular Polls</h1>
            <p className="text-slate-500 text-sm">Ranked by total engagement</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
          <Trophy size={12} className="text-amber-500" />
          <span>{polls.length} polls · {totalVotesAll.toLocaleString()} total votes</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
          <Flame size={32} className="text-slate-700 mb-3" />
          <p className="text-slate-400 font-medium">No polls yet</p>
          <p className="text-slate-600 text-sm">Create some polls and vote to see rankings here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Podium section */}
          {topThree.length > 0 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Podium</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              {topThree.map((poll, i) => (
                <PopularPollCard key={poll.id} poll={poll} rank={i} onClick={() => router.push(`/poll/${poll.id}`)} />
              ))}
            </>
          )}

          {/* Remaining polls */}
          {rest.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">More Polls</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              {rest.map((poll, i) => (
                <PopularPollCard key={poll.id} poll={poll} rank={i + 3} onClick={() => router.push(`/poll/${poll.id}`)} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
