import { useState, useEffect } from "react";
import { getPlantsRepository } from "../../api";
import type { PlantType } from "../../api/types";

export function usePlantTypes() {
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlantTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const repo = getPlantsRepository();
        const types = await repo.getPlantTypes();
        setPlantTypes(types);
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
