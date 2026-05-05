import { createClient } from "@supabase/supabase-js";

// 環境変数から取得
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Supabase クライアントを作成
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
