"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../utils/firebaseConfig";
import { useRouter, useParams } from "next/navigation";
import { ROOMS } from "../../../components/MakePoll";
import { Clock, Users, Trophy, ArrowLeft, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PollOption { id: string; text: string; votes: number; }
interface Poll { id: string; question: string; options: PollOption[]; createdAt: any; room?: string; }

function RoomPollCard({ poll, onClick }: { poll: Poll; onClick: () => void }) {
  const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0);
  const winner = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
  const date = poll.createdAt?.toDate
    ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true })
    : "Just now";

  const topOptions = [...poll.options].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0f0f11] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-[#13131a] transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug">
            {poll.question}
          </h3>
          <span className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-600">
            <Clock size={11} /> {date}
          </span>
        </div>

        {/* Mini bars */}
        {totalVotes > 0 && (
          <div className="space-y-1.5 mb-3">
            {topOptions.map(opt => {
              const pct = Math.round((opt.votes / totalVotes) * 100);
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-24 truncate">{opt.text}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={11} /> {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </span>
          {totalVotes > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500/80 font-medium">
              <Trophy size={11} /> {winner.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const room = ROOMS.find(r => r.id === roomId);

  useEffect(() => {
    if (!roomId) return;
    const fetchPolls = async () => {
      try {
        const q = query(
          collection(db, "polls"),
          where("room", "==", roomId),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [roomId]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Room not found.</p>
      </div>
    );
  }

  const totalVotes = polls.reduce((acc, p) => acc + p.options.reduce((a, o) => a + o.votes, 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      {/* Back */}
      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        All Rooms
      </Link>

      {/* Room Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="text-5xl">{room.emoji}</div>
        <div>
          <h1 className="text-3xl font-bold text-white">{room.label}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span>{polls.length} {polls.length === 1 ? "poll" : "polls"}</span>
            <span>·</span>
            <span>{totalVotes.toLocaleString()} total votes</span>
          </div>
        </div>
      </div>

      {/* Polls */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : polls.length > 0 ? (
        <div className="space-y-3">
          {polls.map(poll => (
            <RoomPollCard
              key={poll.id}
              poll={poll}
              onClick={() => router.push(`/poll/${poll.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Inbox size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-300 font-semibold mb-1">No polls in {room.label} yet</p>
          <p className="text-slate-600 text-sm">Create a poll and select <strong className="text-slate-500">{room.label}</strong> as the room.</p>
        </div>
      )}
    </div>
  );
}
