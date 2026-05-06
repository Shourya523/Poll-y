# Poll-y 🗳️ Real-Time Polling Application

A full-featured polling web app built with **Next.js 16**, **React 19**, and **Firebase**. Users can create questions with multiple options, assign them to topic rooms, share a link, and watch vote totals update live for everyone viewing the poll.

---

## 🚀 Live Demo

**[https://poll-y.vercel.app/](https://poll-y.vercel.app/)**

---

## 📌 Project Overview

The core workflow:

1. **Create a poll** — choose a topic room, add a question and at least two options.
2. **Generate a shareable URL** immediately after creation.
3. **Anyone with the link** can view the poll and cast a single vote (sign-in required).
4. **Results update in real time** via Firestore listeners — no page refresh needed.
5. **Persistence** via Firebase Firestore — polls and votes survive page reloads.

---

## ✨ Key Features

- **Sidebar navigation** — persistent desktop sidebar + mobile bottom tab bar
- **Live Feed** — home page shows recent polls with vote counts and leading options
- **Rooms** — 8 topic rooms (Tech, Gaming, Sports, Music, Movies, Food, Science, General) for organized poll browsing
- **Popular Polls** — all polls ranked by total votes with a podium UI for the top 3
- **Poll History** — view and revisit all polls you've created
- **Real-time voting** via Firestore `onSnapshot` — results update instantly across all clients
- **Google authentication** for vote tracking and poll ownership
- **Anti-abuse** — UID-backed vote tracking + localStorage flag prevents double-voting
- **Responsive** — fully functional on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling / UI | Tailwind CSS v4, Radix UI, shadcn/ui, Framer Motion |
| Backend / Realtime | Firebase Firestore & Authentication |
| Hosting | Vercel |

---

## 📁 Project Structure

```
src/
  app/
    page.tsx               # Home — live feed dashboard
    popular/               # Popular polls ranked by votes
    rooms/                 # Room directory + per-room poll views
    poll/[id]/             # Individual poll voting page
    user-history/          # Polls created by signed-in user
    layout.tsx             # Root layout with Sidebar + Header
    globals.css            # Design tokens, scrollbar, utilities

  components/
    Sidebar.tsx            # Desktop sidebar + mobile bottom nav
    Header.tsx             # Sticky header with auth controls
    MakePoll.tsx           # Poll creation dialog with room picker
    PollCard.tsx           # Poll summary card (used in history)
    AuthGate.tsx           # Sign-in prompt gate for voting
    AuthProvider.tsx       # Firebase auth context
    ui/                    # shadcn/ui primitives

  utils/
    firebaseConfig.ts      # Firebase app initialization
    tw.ts                  # cn() classname utility

  lib/
    utils.ts               # Shared utilities
```

---

## ⚙️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shourya523/Poll-y.git
   cd Poll-y
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local`** with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🏛️ Architecture & Data Model

### Firestore `polls` Collection

Each poll document follows this shape:

```ts
interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  room: string;            // e.g. "tech", "gaming", "general"
  votedUids?: string[];    // anti-double-vote control
  createdBy: string;       // Firebase UID
  createdAt: Timestamp;
}
```

The `room` field was added to power the Rooms feature — polls are tagged on creation and filtered with a Firestore `where("room", "==", roomId)` query.

### Real-time Syncing

```ts
const unsub = onSnapshot(doc(db, "polls", id as string), (doc) => {
  if (doc.exists()) {
    setPoll({ id: doc.id, ...doc.data() })
  }
})
return () => unsub() // cleanup on unmount
```

Any update from any client immediately propagates to all connected listeners.

### URL Structure

| Route | Description |
|---|---|
| `/` | Home feed — recent polls |
| `/poll/[id]` | Individual poll voting page |
| `/popular` | Polls ranked by vote count |
| `/rooms` | Room directory |
| `/rooms/[roomId]` | Polls filtered by room |
| `/user-history` | Signed-in user's poll history |

---

## 🛡️ Fairness / Anti-Abuse Mechanisms

1. **UID-backed vote tracking** — each poll stores a `votedUids` array. On vote, the user's UID is appended via `arrayUnion`. The UI checks this on load and disables voting if the UID exists.

   ```ts
   await updateDoc(pollRef, {
     options: updatedOptions,
     votedUids: arrayUnion(user.uid)
   })
   ```

2. **LocalStorage flag** — after a vote, `voted_<pollId>` is written to localStorage for instant feedback and protection against auth-flicker double-submits.

   ```ts
   localStorage.setItem(`voted_${id}`, "true")
   ```

3. **Google authentication required** — both poll creation and voting require a signed-in Google account. The `AuthGate` component blocks unauthenticated users.

---

## 🧩 Edge Cases Handled

| Case | Handling |
|---|---|
| Listener memory leaks | `onSnapshot` unsubscribed in `useEffect` cleanup |
| Zero votes (divide by zero) | `percentage = totalVotes > 0 ? Math.round(...) : 0` |
| Invalid/deleted poll ID | Graceful error state with a back-to-home button |
| Optimistic UI rollback | `setHasVoted(false)` on Firestore write failure |
| Auth state mid-session | All voting/creation actions recheck `user` before proceeding |
| Empty/invalid poll form | Question and minimum 2 non-blank options enforced before submit |

---

## ⚠️ Known Limitations

1. **No poll expiry** — polls persist indefinitely; there's no automatic archival.
2. **No rate limiting** — a determined actor with multiple Google accounts could vote repeatedly.
3. **Client-side option IDs** — uses `Math.random()` (collisions extremely unlikely but theoretically possible).

A production hardening pass would add Firebase Security Rules, server-side rate limiting, and CAPTCHA.

---

## 📝 Final Notes

- **Real-time updates** are powered by Firestore listeners — vote changes propagate instantly to every connected client.
- **Share links** are durable and stateless — polls are accessible long after the creator closes their browser.
- **Rooms** allow organized browsing of polls by topic without any backend changes — they're a pure Firestore query filter.
- **Popular polls** ranking is computed client-side by sorting all fetched polls by total vote count.

This project demonstrates a full-stack real-time application with persistence, fairness controls, a polished UI, and thoughtful edge-case handling.
