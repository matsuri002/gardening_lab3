import express from "express";

const router = express.Router();

/**
 * GET /api/ec-measurements
 * クエリ: plantId
 * EC手入力データ（CSVの場所）を返す
 */
router.get("/", (req, res) => {
  const { plantId } = req.query;

  res.status(200).json({
    plantId,
    measurements: [
      {
        measuredDate: "2025-12-01",
        sourceCsvPath: "/komatsuna_A/manual_data/ec_data/ec_2025-12.csv",
      },
    ],
  });
});

export default router;
