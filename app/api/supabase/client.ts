import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!; // ✅ Kept secret

export const supabase = createClient(supabaseUrl, supabaseKey);
