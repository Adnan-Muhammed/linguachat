# Roadmap

This roadmap documents the intended development path for **linguaChat**.

> **Note:** This roadmap is intentionally flexible. Features and priorities may change based on user feedback, testing results, technical feasibility, and the direction of the project. Nothing listed in future phases is a fixed commitment.

---

## Phase 1 — Real-Time Chat Foundation

The goal of Phase 1 is to build a functional, real-world-tested real-time chat application that serves as the foundation for future AI-powered features.

- [x] Google OAuth authentication
- [x] New user onboarding / profile setup (name, username, age, gender, mobile)
- [x] Returning user session handling (bypass onboarding)
- [x] User directory (discover other registered users)
- [x] Real-time user list update when a new user registers (Supabase Realtime on `profiles`)
- [x] Send friend requests
- [x] Cancel sent friend requests
- [x] Real-time incoming friend request notifications (Supabase Realtime on `friend_requests`)
- [x] Accept / reject incoming friend requests
- [x] Real-time friend list update on accept/reject (Supabase Realtime on `friend_requests`)
- [x] Friends list with last message preview
- [x] One-to-one real-time text messaging (Supabase Realtime on `messages`)
- [x] Unread message count per conversation
- [x] Total unread count badge on Friends navigation tab
- [x] Unread count persistence across sessions (localStorage)
- [x] Mark conversation as read on open
- [x] Per-user Clear Chat feature (`chat_clears` table with `cleared_at` timestamp)
- [x] Profile view and edit (username and mobile editable)
- [x] Light and dark theme with system preference detection
- [x] Theme persistence (localStorage)
- [x] Responsive UI (mobile, tablet, desktop)
- [x] SPA-like navigation (tab switching without page reload)
- [x] In-app toast notifications
- [x] Search / filter for friends and users lists
- [x] Row Level Security (RLS) on all Supabase tables

---

## Phase 2 — Deployment and Real-User Testing

The goal of Phase 2 is to deploy the application and validate the Phase 1 implementation with real users in a real environment.

- [ ] Deploy to production (Vercel + Supabase)
- [ ] Test authentication flow (Google login, new user onboarding, returning user)
- [ ] Test user discovery and real-time user list updates
- [ ] Test friend request send / cancel / accept / reject flows
- [ ] Test real-time friend request notifications
- [ ] Test one-to-one real-time messaging
- [ ] Test unread message counts and persistence
- [ ] Test clear chat (verify only affects the current user's view)
- [ ] Test profile view and edit
- [ ] Test light / dark theme behaviour
- [ ] Test responsive layout across devices
- [ ] Test with multiple simultaneous users
- [ ] Collect UI/UX feedback
- [ ] Identify and fix issues discovered during testing

---

## Phase 3 — AI-Powered English Learning

> **Status: Not yet started. Feature set not finalized.**

The long-term goal of this project is to build an **AI-powered English learning application** using conversational interaction.

The specific features for Phase 3 will be defined **after Phase 2 testing is complete and evaluated**. The following are **possible directions** only — they are not confirmed features and may change significantly.

**Possible areas (subject to change):**

- English conversation practice with an AI assistant
- Real-time grammar and sentence correction
- Malayalam → English translation assistance
- English → Malayalam explanation support
- Phrase learning and vocabulary building
- Sentence structure analysis and feedback
- Personalized learning path or progress tracking
- Other AI-based English learning interactions

The exact shape of Phase 3 will be determined based on:
- Real user feedback from Phase 2 testing
- Technical feasibility evaluation
- Project direction and priorities at that time

---

## Roadmap Flexibility

> The roadmap is intentionally flexible. Features and priorities may change based on user feedback, testing results, technical feasibility, and the direction of the project.
>
> Nothing in Phase 3 represents a confirmed or committed feature. The AI roadmap will be revisited after Phase 2 testing is complete.
