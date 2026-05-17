import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type PhotoRecord = {
  id: string;
  taken_at: string;
  storage_path: string;
  photo_url: string;
};

export function usePhotoRecord(plantName: string | undefined) {
  const [latestPhoto, setLatestPhoto] = useState<PhotoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [plantId, setPlantId] = useState<string | null>(null);

  const fetchPlantId = useCallback(async () => {
    if (!plantName) return;
    if (import.meta.env.VITE_USE_MOCK === "true") {
      setPlantId("mock_plant_id");
      return;
    }

    const { data, error } = await supabase
      .from("plants")
      .select("id")
      .eq("plant_name", plantName)
      .single();

    if (error || !data) {
      console.error("plant_id取得失敗:", error);
      return;
    }

    setPlantId(data.id);
  }, [plantName]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlantId();
  }, [fetchPlantId]);

  const fetchLatestPhoto = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);

    if (import.meta.env.VITE_USE_MOCK === "true") {
      const mockPhotos: PhotoRecord[] = [
        {
          id: "m1",
          taken_at: "2026-05-15 06:00:00",
          storage_path: "",
          photo_url: "/mock_photos/photo1.jpg",
        },
        {
          id: "m2",
          taken_at: "2026-05-16 06:00:00",
          storage_path: "",
          photo_url: "/mock_photos/photo2.jpg",
        },
        {
          id: "m3",
          taken_at: "2026-05-17 06:00:00",
          storage_path: "",
          photo_url: "/mock_photos/photo3.jpg",
        },
      ];
      setPhotos(mockPhotos);
      setCurrentIndex(mockPhotos.length - 1);
      setLatestPhoto(mockPhotos[mockPhotos.length - 1]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("photos")
      .select("id, taken_at, storage_path")
      .eq("plant_id", plantId)
      .order("taken_at", { ascending: true });

    if (error || !data) {
      console.error("最新写真取得失敗", error);
      setLatestPhoto(null);
      setLoading(false);
      return;
    }

    const photoList: PhotoRecord[] = data.map(
      (photo: { id: string; taken_at: string; storage_path: string }) => {
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(photo.storage_path);

        return {
          ...photo,
          photo_url: urlData.publicUrl,
        };
      },
    );

    setPhotos(photoList);
    setCurrentIndex(photoList.length - 1); // 最新1枚
    setLatestPhoto(photoList[photoList.length - 1]);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLatestPhoto();
  }, [fetchLatestPhoto]);

  useEffect(() => {
    if (!isPlaying) return;
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;

        if (next >= photos.length) {
          // 最後まで行ったら停止
          setIsPlaying(false);
          return prev;
        }

        setLatestPhoto(photos[next]);
        return next;
      });
    }, 90); // ← 再生速度

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
