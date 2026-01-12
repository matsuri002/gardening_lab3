export function extractDateFromCsv(filename: string): string {
  const match = filename.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) {
    throw new Error(`日付を抽出できません: ${filename}`);
  }
  return match[0];
}
