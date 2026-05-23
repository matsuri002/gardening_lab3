import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type Plant = {
  id: string;
  year: number;
  plant_type: string;
  plant_name: string;
};

export function usePlants(plantType: string | undefined) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      if (!plantType) {
        setPlants([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (import.meta.env.VITE_USE_MOCK === "true") {
          setPlants([
            {
              id: "mock_1",
              year: 2026,
              plant_type: plantType,
              plant_name: `${plantType}1号`,
            },
            {
              id: "mock_2",
              year: 2026,
              plant_type: plantType,
              plant_name: `${plantType}2号`,
            },
          ]);
          return;
        }

        const { data, error: supabaseError } = await supabase
          .from("plants")
          .select("*")
          .eq("plant_type", plantType)
          .order("created_at", { ascending: true });

        if (supabaseError) {
          throw supabaseError;
        }

        setPlants(data ?? []);
      } catch (err) {
        console.error("Failed to fetch plants:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [plantType]);

  return { plants, loading, error };
}
