# 仕様書：WeeklyCharts

## 1. 役割

`WeeklyRecordPage` で表示する全てのグラフ（週次統計および生データ）をレイアウト・描画する責務を持つ。

## 2. インターフェース (Props)

- `env`: `useWeeklyEnvironment` フックの戻り値。

## 3. 描画するグラフ一覧

1. 土壌温度 (DualMode)
2. 土壌水分量 (DualMode)
3. 室内温度 (DualMode)
4. 室内湿度 (DualMode)
5. 日射量 (DualMode)
6. CO2濃度 (時系列 LineChart)
7. EC値 (週次統計 LineChart)

## 4. 特徴

- `DualModeChartCard` を使用して、集計データと生データの切り替え表示に対応。
- 共通の `xTicks7`, `xDomain7` を使用して、全てのグラフの X 軸スケールを同期。
- `komatsunaTempRange` を参照し、適温範囲の背景色を表示（温度グラフのみ）。
