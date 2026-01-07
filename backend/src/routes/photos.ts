import express from "express";

const router = express.Router();

/**
 * GET /api/photos
 * クエリ: plantId
 * 写真一覧を返す（パスのみ）
 */
router.get("/", (req, res) => {
  const { plantId } = req.query;

  res.status(200).json({
    plantId,
    photos: [
      {
        takenAt: "2025-12-09T06:00:00+09:00",
        photoPath:
          "/komatsuna_A/camera/komatsuna_A_2025-12-09_0600.jpg"
      },
      {
        takenAt: "2025-12-09T12:00:00+09:00",
        photoPath:
          "/komatsuna_A/camera/komatsuna_A_2025-12-09_1200.jpg"
      }
    ]
  });
});

export default router;
