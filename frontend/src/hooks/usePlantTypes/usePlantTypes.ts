import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function usePlantTypes() {
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlantTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        if (import.meta.env.VITE_USE_MOCK === "true") {
          setPlantTypes(["コマツナ", "トマト"]);
          return;
        }

        const { data, error: supabaseError } = await supabase.from("plants").select("plant_type");

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const uniqueTypes = Array.from(new Set(data.map((item) => item.plant_type)));
          setPlantTypes(uniqueTypes);
        }
      } catch (err) {
        console.error("Failed to fetch plant types:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchPlantTypes();
  }, []);

  return { plantTypes, loading, error };
}
