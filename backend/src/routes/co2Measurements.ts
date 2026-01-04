import express from "express";

const router = express.Router();

/**
 * GET /api/co2-measurements
 * クエリ: plantId
 * CO₂測定データ（CSVの場所）を返す
 */
router.get("/", (req, res) => {
  const { plantId } = req.query;

  res.status(200).json({
    plantId,
    measurements: [
      {
        measuredAt: "2025-12-09T06:00:00+09:00",
        sourceCsvPath:
          "/komatsuna_A/manual_data/co2_data/co2_2025-12.csv"
      },
      {
        measuredAt: "2025-12-09T12:00:00+09:00",
        sourceCsvPath:
          "/komatsuna_A/manual_data/co2_data/co2_2025-12.csv"
      }
    ]
  });
});

export default router;
