

-- ============================================================
-- 2. UUID EXTENSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 3. PROFILES TABLE
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Google account information
  name TEXT NOT NULL,

  -- Application-specific information
  username TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  mobile TEXT NOT NULL,

  -- Google profile picture
  avatar_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. PROFILES RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);


CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);


CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 5. FRIEND REQUESTS TABLE
-- ============================================================

CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  sender_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  receiver_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  status TEXT NOT NULL
    CHECK (
      status IN (
        'pending',
        'accepted',
        'rejected',
        'cancelled'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one request row for the same sender/receiver pair
  UNIQUE(sender_id, receiver_id),

  -- User cannot send a request to himself
  CHECK (sender_id <> receiver_id)
);


-- ============================================================
-- 6. FRIEND REQUESTS RLS
-- ============================================================

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view their friend requests"
  ON public.friend_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  );


CREATE POLICY "Users can send friend requests"
  ON public.friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );


CREATE POLICY "Users can update their friend requests"
  ON public.friend_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  );


-- ============================================================
-- 7. MESSAGES TABLE
-- ============================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  sender_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  receiver_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (sender_id <> receiver_id)
);


-- ============================================================
-- 8. MESSAGES RLS
-- ============================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view their messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
  );


CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
  );


-- ============================================================
-- 8b. CHAT CLEARS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_clears (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cleared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, other_user_id)
);

ALTER TABLE public.chat_clears ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat clears"
  ON public.chat_clears
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 9. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender
  ON public.friend_requests(sender_id);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver
  ON public.friend_requests(receiver_id);

CREATE INDEX IF NOT EXISTS idx_friend_requests_status
  ON public.friend_requests(status);

-- Composite indexes for friend requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_status
  ON public.friend_requests(sender_id, status);

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status
  ON public.friend_requests(receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_messages_sender
  ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver
  ON public.messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages(created_at);

-- Composite index for fast conversation lookups & ordering
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON public.messages(sender_id, receiver_id, created_at);

-- Index for chat clear lookups
CREATE INDEX IF NOT EXISTS idx_chat_clears_user_other
  ON public.chat_clears(user_id, other_user_id);



-- ============================================================
-- 10. AUTOMATIC updated_at FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ============================================================
-- 11. updated_at TRIGGERS
-- ============================================================

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 12. ENABLE SUPABASE REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime
ADD TABLE public.friend_requests;

ALTER PUBLICATION supabase_realtime
ADD TABLE public.messages;

ALTER PUBLICATION supabase_realtime
ADD TABLE public.profiles;


