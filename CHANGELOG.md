# Changelog

All notable changes to this project will be documented in this file.

This project is currently in active development and has not yet had a formal versioned release to production.

---

## [Unreleased]

This section tracks what is currently implemented in the codebase but has not yet gone through a formal production release cycle.

### Added

#### Authentication
- Google OAuth sign-in via Supabase Auth
- OAuth callback handler at `/auth/callback`
- Session detection on app load — routes returning users directly to the application and new users to the onboarding form

#### User Onboarding
- New-user profile setup form (username, age, gender, mobile number)
- Name pre-filled and read-only from Google account data
- Form validation (username format, age range 13–120, 10-digit mobile number, gender selection required)
- On completion, user enters the main application

#### User Directory
- Users section listing all registered users (excluding the current user)
- Search / filter by name or username
- Real-time update: when a new user registers, existing logged-in users see the new entry appear without a page refresh (Supabase Realtime on `profiles` table — `INSERT` event)

#### Friend Requests
- Send a friend invitation to any user in the Users list
- Cancel a previously sent (pending) request
- Incoming requests delivered in real time via Supabase Realtime (`friend_requests` table — `INSERT` event)
- Accept or reject incoming friend requests
- Friend request status transitions: `pending` → `accepted` / `rejected` / `cancelled`
- Accepted friendships reflected on both users' Friends lists via real-time `UPDATE` event

#### Notifications
- In-app toast notification when a new friend request is received
- Requests navigation tab badge shows count of pending incoming requests
- Friends navigation tab badge shows total unread message count across all conversations

#### Friends
- Friends section displaying accepted friends
- Each friend entry shows: avatar (or generated initials), name, last message preview or username, online indicator, per-conversation unread count badge
- Friends, requests, and users data loaded once at session start and held in application state — avoids redundant re-fetches on tab navigation

#### One-to-One Real-Time Chat
- Text messaging between accepted friends
- Messages sent via Next.js Server Actions (insert into `messages` table)
- Incoming messages delivered in real time via Supabase Realtime (`messages` table — `INSERT` event filtered by `receiver_id`)
- Message list with sender/receiver visual distinction, timestamps, and date separators
- Auto-scroll to latest message on new message or open
- Send via Enter key or send button

#### Unread Message Counts
- Unread count incremented per conversation when a message arrives and the conversation is not currently open
- Unread counts stored in application state and persisted to `localStorage` (keyed by user ID)
- Counts survive page refresh
- Opening a conversation resets the unread count to 0 immediately
- Messages that arrive while the conversation is open do not increment the unread count

#### Clear Chat (Per-User)
- Clear Chat action available in the chat header (trash icon) for any open conversation
- Confirmation dialog before clearing
- Uses `chat_clears` table: stores a `cleared_at` timestamp per `(user_id, other_user_id)` pair
- Only messages created after `cleared_at` are returned to the current user on next fetch
- The other user's conversation and message history are unaffected
- The `messages` table is not modified
- Clearing a previously cleared conversation updates the existing `cleared_at` timestamp
- Messages received after the clear point appear normally

#### Profile
- Profile section with view and edit modes
- Google profile picture displayed when available
- **Editable fields:** username, mobile number
- **Read-only fields:** name (from Google), age (set at onboarding), gender (set at onboarding), email (from Google)

#### Theme
- Light and dark theme support
- Theme defaults to system preference (`prefers-color-scheme`) on first visit
- Theme preference persisted in `localStorage`
- Theme toggle available on welcome, register, and main application screens

#### UI / UX
- Responsive layout — mobile, tablet, desktop
- SPA-like navigation — tab switching handled client-side without page reload
- Bottom navigation bar with Friends, Users, Requests, Profile tabs
- In-app toast notification system (auto-dismisses after ~2.5 seconds)
- Search input on Friends and Users lists (filters by name or username)
- Avatar component with Google profile picture or generated initials with deterministic colour

#### Infrastructure
- Next.js 16 App Router
- React 19
- TypeScript throughout
- Tailwind CSS v4
- Supabase PostgreSQL database with Row Level Security (RLS) on all tables
- Supabase Auth (Google OAuth)
- Supabase Realtime (postgres_changes subscriptions)
- Supabase SSR client (`@supabase/ssr`)
- Next.js Server Actions for all data mutations
- Vercel deployment target
- `supabase_schema.sql` — full database schema including tables, RLS policies, indexes, triggers, and Realtime publication setup

---

## Notes

- This project has not yet had an official versioned release.
- The `[Unreleased]` section above represents the current state of the codebase in active development.
- A versioned release entry (e.g., `[0.1.0]`) will be added when the application completes Phase 2 testing and is formally released to production.
