"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useAuth } from "../../components/AuthProvider";
import { Loader2, Inbox, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import PastPollCard from "@/src/components/PollCard";

export default function MyPolls() {
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const fetchMyPolls = async () => {
      try {
        const q = query(
          collection(db, "polls"),
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setPolls(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPolls();
  }, [user, authLoading]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Your Archive</h1>
        <p className="text-slate-500 text-sm">Manage and track your previous polls.</p>
      </div>

      {(loading || authLoading) ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
          <p className="text-slate-500 text-sm">Retrieving your history...</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Lock size={24} className="text-slate-600" />
          </div>
          <p className="text-slate-300 font-semibold mb-1">Sign in required</p>
          <p className="text-slate-600 text-sm">Please sign in to view your poll history.</p>
        </div>
      ) : polls.length > 0 ? (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PastPollCard
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
          <p className="text-slate-300 font-semibold mb-1">No polls yet</p>
          <p className="text-slate-600 text-sm mb-6">You haven&apos;t settled any debates yet.</p>
          <button
            onClick={() => router.push("/")}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
          >
            Create your first poll →
          </button>
        </div>
      )}
    </div>
  );
}