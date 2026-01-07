import express from "express";

import plantsRouter from "./routes/plants.js";
import dailyEnvironmentRouter from "./routes/dailyEnvironment.js";
import ecMeasurementsRouter from "./routes/ecMeasurements.js";
import co2MeasurementsRouter from "./routes/co2Measurements.js";
import photosRouter from "./routes/photos.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/plants", plantsRouter);
app.use("/api/daily-environment", dailyEnvironmentRouter);
app.use("/api/ec-measurements", ecMeasurementsRouter);
app.use("/api/co2-measurements", co2MeasurementsRouter);
app.use("/api/photos", photosRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
