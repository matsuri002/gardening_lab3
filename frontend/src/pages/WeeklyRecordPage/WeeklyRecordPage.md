# 仕様書：WeeklyRecordPage

## 1. 役割

植物ごとの週次センサーデータ（土壌温度、室温、湿度、土壌水分、照度、EC、CO2）をグラフ表示し、成長環境の推移を確認するページ。

## 2. 構成

### ページコンテナ (`WeeklyRecordPageContainer`)

- `useWeeklyEnvironment` フックからデータと状態を取得し、各サブコンポーネントに分配する。

### サブコンポーネント (予定)

- `WeeklyDateSelector`: 表示期間（終了日）の選択。
- `WeeklyCharts`: 各種環境データの表示（`DualModeChartCard` 等を使用）。

## 3. データフロー

1. `URLパラメータ` から `plantName` を取得。
2. `useWeeklyEnvironment` が `plantId` を取得し、指定された `endDate` から過去7日間のデータを Supabase からフェッチ。
3. フェッチした生データを日ごとの統計（Max/Min/Avg）に変換し、グラフ用データとして提供。

## 4. 課題（リファクタリングのポイント）

- 580行あるコードからデータ取得・集計ロジックをフックに逃がし、ページ本体の責務を「表示の統合」のみにする。
- 各グラフ表示の定義をコンポーネントとして独立させ、保守性を高める。
