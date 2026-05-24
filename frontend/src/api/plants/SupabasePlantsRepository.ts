import { supabase } from "../../lib/supabase";
import type { Plant, PlantType } from "../types";
import type { IPlantsRepository } from "./IPlantsRepository";

export class SupabasePlantsRepository implements IPlantsRepository {
  async getPlantTypes(): Promise<PlantType[]> {
    const { data, error } = await supabase.from("plants").select("plant_type");
    if (error) {
      console.error("plant_type取得失敗:", error);
      return [];
    }
    return Array.from(new Set((data ?? []).map((item) => item.plant_type)));
  }

  async getPlants(plantType: string): Promise<Plant[]> {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("plant_type", plantType)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("plants取得失敗:", error);
      return [];
    }
    return data ?? [];
  }

  async getPlantIdByName(plantName: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("plants")
      .select("id")
      .eq("plant_name", plantName)
      .single();
    if (error || !data) {
      console.error("plant_id取得失敗:", error);
      return null;
    }
    return data.id;
  }
}
