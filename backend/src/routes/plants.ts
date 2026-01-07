import express from "express";

const router = express.Router();

/**
 * GET /api/plants
 * 栽培中の植物・鉢の一覧を返す
 * ダミーデータ
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    plants: [
      {
        id: "dummy-uuid-a",
        year: 2025,
        plant_type: "komatsuna",
        plant_name: "komatsuna_A"
      },
      {
        id: "dummy-uuid-b",
        year: 2025,
        plant_type: "komatsuna",
        plant_name: "komatsuna_B"
      },
      {
        id: "dummy-uuid-c",
        year: 2025,
        plant_type: "komatsuna",
        plant_name: "komatsuna_C"
      }
    ]
  });
});

export default router;
