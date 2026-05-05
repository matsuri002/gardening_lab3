import { execSync } from "child_process";

export function listCsvFiles(path: string): string[] {
  const result = execSync(`rclone lsf ${path}`, {
    encoding: "utf-8",
  });

  return result.split("\n").filter((file) => file.endsWith(".csv"));
}
