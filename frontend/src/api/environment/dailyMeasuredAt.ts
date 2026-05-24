import dayjs, { type Dayjs } from "dayjs";

/**
 * 選択日の環境サマリー用計測時刻文字列を生成する。
 * 本日は現在時刻、過去日は「選択日 + 現在時刻（30分単位に丸め）」とする。
 */
export function formatSnapshotMeasuredAt(targetDate: Dayjs): string {
  const now = dayjs();
  const roundedMinute = now.minute() < 30 ? 0 : 30;
  return targetDate
    .hour(now.hour())
    .minute(roundedMinute)
    .second(0)
    .millisecond(0)
    .format("YYYY-MM-DD HH:mm:ss");
}
