import { useCallback, useEffect, useState } from "react";
import { getPhotosRepository, getPlantsRepository } from "../../api";
import type { PhotoRecord } from "../../api/types";

export type { PhotoRecord };

export function usePhotoRecord(plantName: string | undefined) {
  const [latestPhoto, setLatestPhoto] = useState<PhotoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [plantId, setPlantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolvePlantId = async () => {
      if (!plantName) {
        setPlantId(null);
        return;
      }
      const id = await getPlantsRepository().getPlantIdByName(plantName);
      if (!cancelled && id) setPlantId(id);
    };

    resolvePlantId();
    return () => {
      cancelled = true;
    };
  }, [plantName]);

  useEffect(() => {
    if (!plantId) return;

    let cancelled = false;

    const loadPhotos = async () => {
      setLoading(true);
      const photoList = await getPhotosRepository().getPhotosByPlantId(plantId);

      if (cancelled) return;

      setPhotos(photoList);
      if (photoList.length > 0) {
        const lastIndex = photoList.length - 1;
        setCurrentIndex(lastIndex);
        setLatestPhoto(photoList[lastIndex]);
      } else {
        setCurrentIndex(0);
        setLatestPhoto(null);
      }
      setLoading(false);
    };

    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [plantId]);

  useEffect(() => {
    if (!isPlaying) return;
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        if (next >= photos.length) {
          setIsPlaying(false);
          return prev;
        }

        setLatestPhoto(photos[next]);
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [isPlaying, photos]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = Math.max(prev - 1, 0);
      setLatestPhoto(photos[nextIndex]);
      return nextIndex;
    });
  }, [photos]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextIndex = Math.min(prev + 1, photos.length - 1);
      setLatestPhoto(photos[nextIndex]);
      return nextIndex;
    });
  }, [photos]);

  const handlePlay = useCallback(() => {
    if (photos.length === 0) return;

    setCurrentIndex(0);
    setLatestPhoto(photos[0]);
    setIsPlaying(true);
  }, [photos]);

  const stopPlay = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return {
    latestPhoto,
    loading,
    photos,
    currentIndex,
    isPlaying,
    handlePrev,
    handleNext,
    handlePlay,
    stopPlay,
  };
}
