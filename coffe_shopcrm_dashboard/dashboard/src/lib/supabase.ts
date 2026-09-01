import { createClient } from "@supabase/supabase-js";

// Browser client using the ANON key. RLS makes this read-only — the anon role
// has SELECT only, so it is safe to ship this key to every visitor.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 20 } },
});
