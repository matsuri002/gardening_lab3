import { supabase } from "./supabase.js";

export async function getPlantIdByName(plantName: string): Promise<string> {
  const { data, error } = await supabase
    .from("plants")
    .select("id")
    .eq("plant_name", plantName)
    .single();

  if (error || !data) {
    throw new Error(`Plant not found: ${plantName}`);
  }

  return data.id;
}

