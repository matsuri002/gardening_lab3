import "dotenv/config";
import { supabase } from "../lib/supabase.js";

async function test() {
  const { data, error } = await supabase
    .from("plants")
    .select("id, plant_name")
    .limit(1);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    process.exit(1);
  }

  console.log("✅ Supabase connected!");
  console.log(data);
}

test();
