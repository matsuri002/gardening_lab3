import type { PhotoRecord } from "../types";
import type { IPhotosRepository } from "./IPhotosRepository";

const MOCK_PHOTOS: PhotoRecord[] = [
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

export class MockPhotosRepository implements IPhotosRepository {
  async getPhotosByPlantId(_plantId: string): Promise<PhotoRecord[]> {
    return MOCK_PHOTOS;
  }
}
