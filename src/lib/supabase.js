import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vxanumunilveittdjrnk.supabase.co";

const supabaseAnonKey = "sb_publishable_gVfIAcrxaBt8YspgugG6GQ_GzRHYL8G";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);