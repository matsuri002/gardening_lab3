import { useState, useEffect } from "react";
import { getPlantsRepository } from "../../api";
import type { Plant } from "../../api/types";

export type { Plant };

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
        const repo = getPlantsRepository();
        const data = await repo.getPlants(plantType);
        setPlants(data);
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
