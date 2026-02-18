# Poll-y � Real-Time Polling Application

A lightweight polling web app built with **Next.js**, **React**, and **Firebase**. Users can create a question with multiple options, share a link, and watch vote totals update live for everyone viewing the poll.

---

##  Project Overview

The core workflow implemented for the internship task:

1. **Create a poll** with a question and at least two options.
2. **Generate a shareable URL** immediately after creation.
3. **Anyone with the link** sees the poll and can cast a single vote (after signing in).
4. **Results update in real time** via Firestore listeners, without page refresh.
5. **Persistence** is handled by Firebase Firestore; polls and votes survive page reloads and longterm.

---

##  Key Features

- Intuitive poll creation UI with validation for empty/duplicate entries
- Shareable link with copytoclipboard feedback
- Singlechoice voting; users can vote once per poll
- Realtime vote count updates using Firestore `onSnapshot`
- Responsive, mobilefriendly interface styled with Tailwind CSS and Radix UI components
- Google authentication for vote tracking and poll ownership

---

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling/UI | Tailwind CSS, Radix UI, Framer Motion |
| Backend/Realtime | Firebase Firestore & Authentication |
| Hosting (suggested) | Vercel |

---

##  Project Structure

```
src/
  app/                 # Next.js pages and layouts (poll pages, user history, etc.)
  components/          # Reusable UI components (AuthGate, MakePoll, PollCard, etc.)
  utils/firebaseConfig.ts  # Firebase initialization
  lib/utils.ts         # Miscellaneous helpers
```

---

##  Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd applyo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase config keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   npm start
   ```

---

##  Fairness / AntiAbuse Mechanisms

1. **UID backed vote tracking** � each poll document stores a `votedUids` array; when a vote is submitted the voters Firebase UID is appended. The UI checks this array and disables the voting buttons if the UID already exists, preventing the same account from voting twice.

   ```ts
   // PollPage.tsx useEffect listener
   if (user && data.votedUids?.includes(user.uid)) {
       setHasVoted(true)
   }
   
   // handleVote function
   const pollRef = doc(db, "polls", id as string)
   await updateDoc(pollRef, { 
       options: updatedOptions,
       votedUids: arrayUnion(user.uid)
   })
   ```

2. **LocalStorage flag** � after a vote the client writes `voted_<pollId>` to localStorage. This gives immediate feedback and guards against accidental doublesubmissions when auth state flickers.

   ```ts
   localStorage.setItem(`voted_${id}`, "true")
   const localVoted = localStorage.getItem(`voted_${id}`)
   if (localVoted) setHasVoted(true)
   ```

3. **Google authentication requirement** � both poll creation and voting require a signedin Google user. The `AuthGate` component wraps sensitive actions, redirecting unsigned users to sign in.

   ```tsx
   export function AuthGate() {
     const { user, loading } = useAuth()
     if (!user && !loading) {
       return (
         <div className="text-center">
           <p>Please sign in to participate.</p>
           <Button onClick={signInWithGoogle}>Sign in</Button>
         </div>
       )
     }
     return null
   }
   ```

These three mechanisms together deter casual abuse; see Known Limitations for remaining gaps.

---

##  Edge Cases Handled

### Listener cleanup
Every `onSnapshot` call returns an unsubscribe function. We call it in the `useEffect` cleanup to prevent memory leaks when navigating away or when the poll ID changes.

```ts
useEffect(() => {
  if (!id) return
  const unsub = onSnapshot(doc(db, "polls", id as string), (doc) => {
      if (doc.exists()) {
          setPoll({ id: doc.id, ...doc.data() })
      }
  })
  return () => unsub()
}, [id, user])
```

### Poll creation validation
The creation form guards against invalid input:
- question must be nonempty after trimming
- at least two options with nonblank text
- options list cannot shrink below two items

```ts
const validOptions = options.filter(opt => opt.trim() !== "")
if (!question.trim() || validOptions.length < 2) return
```

### Vote percentage calculation
When nobody has voted yet, dividing by zero would produce `NaN`. We handle it explicitly:

```ts
const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0)
const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
```

### Graceful error UI
If the poll ID is invalid or the document has been deleted, `poll` remains null and we render a userfriendly message instead of a blank page.

```tsx
if (!poll) return (
  <div className="flex min-h-screen items-center justify-center bg-black">
      <p className="text-white">Poll not found or has been deleted.</p>
  </div>
)
```

### Optimistic UI and rollback
Clicking a vote button immediately disables further interaction and shows a selection; if the Firestore update fails we revert the state and log an error.

```ts
setHasVoted(true)
try {
  await updateDoc(pollRef, {...})
} catch (error) {
  console.error("Error voting:", error)
  setHasVoted(false)
}
```

### Authentication transitions
Auth state may change while a user interacts (e.g. they sign out midsession). We account for this by rechecking `user` inside the main listener and in click handlers; voting and poll creation are disabled when `user` is null.


---

##  Architecture & Data Model

`polls` collection documents follow this shape:

```ts
interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  votedUids?: string[];           // fairness control
  createdBy: string;
  createdAt: Timestamp;
}
```

Options are generated clientside with a short random ID for local UI keys:

```ts
options: validOptions.map((opt) => ({
  id: Math.random().toString(36).substring(2, 9),
  text: opt.trim(),
  votes: 0
}))
```

Realtime syncing uses Firestores `onSnapshot` listener on the specific poll document. Any update�whether from the current client or another�reruns the callback, updating React state.

```ts
const unsub = onSnapshot(doc(db, "polls", id as string), (doc) => {
  if (doc.exists()) {
    setPoll({ id: doc.id, ...doc.data() })
  }
})
```

### URL structure
Each poll is accessible at `/poll/[id]`. After creation we `router.push(`/poll/${docRef.id}`)` to send the creator to their new poll.

---

##  Known Limitations

1. **No poll expiry** � polls remain indefinitely; theres no automatic cleanup or archiving of stale data.
2. **Ratelimiting absent** � a determined user could script multiple Google accounts and vote repeatedly since theres no CAPTCHA or IP throttling.
3. **Clientside ID generation** � option IDs use `Math.random` on the client; collisions are extremely unlikely but theoretically possible.

A more robust production system would enforce Firebase security rules and implement serverside rate limiting.

---

##  Deployment

Deploy to any platform supporting Next.js (Vercel is recommended for simplicity). Ensure the same Firebase environment variables are set in production. A live demo is available at:

**https://poll-y.vercel.app/**

---

##  Final Notes

- **Realtime updates** are powered by Firestores listeners � when a vote occurs the document change propagates instantly to every connected client.
- **Share links** are durable and work long after the creator closes their browser, because all state lives in Firestore.
- **Authentication** is minimal (Google only) to satisfy assignment requirements while still providing a link between activity and a user.

This project meets all success criteria and demonstrates a fullstack realtime application with persistence, fairness controls, and thoughtful edgecase handling. Vastly more features (admin UI, analytics, expiry rules) could be added later, but the core functionality is stable and productionready.
