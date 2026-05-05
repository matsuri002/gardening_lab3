import express from "express";

const router = express.Router();

/**
 * GET /api/daily-environment
 * クエリ: plantId, date
 * 日次環境データ（CSVの場所情報）を返す
 */
router.get("/", (req, res) => {
  const { plantId, date } = req.query;

  res.status(200).json({
    plantId,
    date,
    sourceCsvPath: "/komatsuna_A/raw_data/komatsuna_A_2025-12-09.csv",
    createdAt: "2025-12-09T23:59:00+09:00",
  });
});

export default router;
