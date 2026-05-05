import fs from "fs";
import csv from "csv-parser";

export type CsvRow = {
  timestamp: string;
  light: string;
  soil_moisture: string;
  room_temp: string;
  room_humid: string;
  soil_temp: string;
};

// csvを読み各行をそのままの形で配列にして返す
export function readCsvRows(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
