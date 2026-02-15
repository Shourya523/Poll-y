"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../utils/firebaseConfig";
import { useAuth } from "../../components/AuthProvider";
import TopBar from "../../components/TopBar";
import { Loader2, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import PastPollCard from "@/src/components/PollCard";

export default function MyPolls() {
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    const fetchMyPolls = async () => {
      try {
        const q = query(
          collection(db, "polls"),
          where("createdBy", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedPolls = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPolls(fetchedPolls);
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPolls();
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <TopBar />
      
      <main className="max-w-4xl mx-auto pt-24 pb-12 px-6">
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Archive</h1>
          <p className="text-slate-400">Manage and track the results of your previous polls.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-slate-500 text-sm font-medium">Retrieving your history...</p>
          </div>
        ) : polls.length > 0 ? (
          <div className="grid gap-4">
            {polls.map((poll) => (
              <PastPollCard 
                key={poll.id} 
                poll={poll} 
                onClick={() => router.push(`/poll/${poll.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-[#121212] border border-dashed border-white/10 rounded-2xl">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Inbox className="text-slate-600" size={24} />
            </div>
            <p className="text-slate-300 font-medium">No polls found</p>
            <p className="text-slate-500 text-sm mb-6">You haven't settled any debates yet.</p>
            <button 
              onClick={() => router.push("/")}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
            >
              Create your first poll &rarr;
            </button>
          </div>
        )}
      </main>
    </div>
  );
}