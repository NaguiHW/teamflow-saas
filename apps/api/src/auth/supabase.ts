import "dotenv/config";
import { createClient, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ?? "local-development-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const getUserFromAccessToken = async (
  accessToken: string,
): Promise<User> => {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error("Invalid access token");
  }
  return data.user;
};
