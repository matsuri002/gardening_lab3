import type { Dayjs } from "dayjs";
import type {
  Co2DataPoint,
  Co2WeeklyPoint,
  DailyDataPoint,
  EcData,
  EcWeeklyPoint,
  EnvironmentData,
  EnvironmentSensorColumn,
  RawPoint,
  WeeklyStatPoint,
} from "../types";

/** 指定日時点の環境サマリー（最新値・計測時刻・データなしメッセージ） */
export type EnvironmentSnapshot = {
  envData: EnvironmentData;
  measuredAt: string | null;
  noDataMessage: string | null;
};

/**
 * 環境データ（日次・週次）取得のインターフェース定義。
 * Supabase 実装（SupabaseEnvironmentRepository）とモック実装（MockEnvironmentRepository）が本契約に従う。
 */
export interface IEnvironmentRepository {
  /**
   * 指定日の環境サマリー（土温・土壌水分・室温・湿度・照度の最新値）を取得する
   * @param plantId - 取得対象の植物 ID
   * @param targetDate - 取得対象の日付
   */
  getEnvironmentSnapshot(plantId: string, targetDate: Dayjs): Promise<EnvironmentSnapshot>;

  /**
   * 指定日のセンサー値の日内推移データを取得する
   * @param plantId - 取得対象の植物 ID
   * @param targetDate - 取得対象の日付
   * @param column - 取得対象のセンサーカラム（soil_temp 等）
   */
  getDailySensorSeries(
    plantId: string,
    targetDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<DailyDataPoint[]>;

  /**
   * 指定日の EC データ（EC・TDS・温度）を取得する。該当日にデータがなければ直近の計測日を参照する
   * @param plantId - 取得対象の植物 ID
   * @param targetDateStr - 取得対象の日付（YYYY-MM-DD 形式）
   */
  getEcDataForDate(plantId: string, targetDateStr: string): Promise<EcData | null>;

  /**
   * 指定日の最新 CO2 値を取得する
   * @param plantId - 取得対象の植物 ID
   * @param targetDate - 取得対象の日付
   */
  getLatestCo2(plantId: string, targetDate: Dayjs): Promise<Co2DataPoint | null>;

  /**
   * 指定日の CO2 日内推移データを取得する
   * @param plantId - 取得対象の植物 ID
   * @param targetDate - 取得対象の日付
   */
  getDailyCo2Series(plantId: string, targetDate: Dayjs): Promise<Co2DataPoint[]>;

  /**
   * 指定週（終了日から7日間）のセンサー値統計（最大・最小・平均）を取得する
   * @param plantId - 取得対象の植物 ID
   * @param endDate - 週の終了日
   * @param column - 取得対象のセンサーカラム
   */
  getWeeklyStats(
    plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<WeeklyStatPoint[]>;

  /**
   * 指定週（終了日から7日間）のセンサー生データ（時系列）を取得する
   * @param plantId - 取得対象の植物 ID
   * @param endDate - 週の終了日
   * @param column - 取得対象のセンサーカラム
   */
  getWeeklyRawSeries(
    plantId: string,
    endDate: Dayjs,
    column: EnvironmentSensorColumn,
  ): Promise<RawPoint[]>;

  /**
   * EC データの週次集計（日別平均）を取得する
   * @param plantId - 取得対象の植物 ID
   * @param endDate - 週の終了日
   */
  getEcWeeklySeries(plantId: string, endDate: Dayjs): Promise<EcWeeklyPoint[]>;

  /**
   * 指定週（終了日から7日間）の CO2 時系列データを取得する
   * @param plantId - 取得対象の植物 ID
   * @param endDate - 週の終了日
   */
  getCo2WeeklySeries(plantId: string, endDate: Dayjs): Promise<Co2WeeklyPoint[]>;
}
