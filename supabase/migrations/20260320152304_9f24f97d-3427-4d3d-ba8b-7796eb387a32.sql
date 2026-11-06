
-- Rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  phase TEXT DEFAULT 'lobby' CHECK (phase IN ('lobby', 'night', 'day', 'game_over')),
  phase_end_at TIMESTAMPTZ,
  round INTEGER NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IN ('villagers', 'werewolves', NULL)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'unassigned' CHECK (role IN ('unassigned', 'werewolf', 'villager', 'seer', 'doctor', 'witch', 'hunter')),
  alive BOOLEAN NOT NULL DEFAULT true,
  is_moderator BOOLEAN NOT NULL DEFAULT false,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  has_heal_potion BOOLEAN NOT NULL DEFAULT true,
  has_poison_potion BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'public' CHECK (channel IN ('public', 'werewolf', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Game actions (night actions)
CREATE TABLE public.game_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('werewolf_kill', 'seer_check', 'doctor_save', 'witch_heal', 'witch_poison', 'hunter_shoot')),
  target_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Day votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  voter_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, round, voter_id)
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Open policies for anon access (game uses client_id, not auth)
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert rooms" ON public.rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read players" ON public.players FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read actions" ON public.game_actions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert actions" ON public.game_actions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read votes" ON public.votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert votes" ON public.votes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update votes" ON public.votes FOR UPDATE TO anon, authenticated USING (true);

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
