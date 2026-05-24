# 仕様書：EnvironmentSummary (環境データサマリー)

## 1. 目的

土壌温度、土壌水分量、室内温湿度、日射量、EC値、CO2濃度の最新（または指定時刻）の値をカード形式で一覧表示する。

## 2. インターフェース (Props)

### Props

- `envData`: `EnvironmentData` (soilTemp, soilMoisture, roomTemp, roomHumid, light)
- `ecData`: `EcData | null`
- `latestCo2`: `Co2DataPoint | null`
- `measuredAt`: `string | null` (計測時刻)
- `noDataMessage`: `string | null` (データがない場合のメッセージ)

## 3. 表示仕様

- 以下の6つの項目をグリッド形式で表示する。
  - **土壌温度**: `ThermostatIcon`, 単位 `°C`
  - **土壌水分量**: `WaterDropIcon`, 単位 `%`
  - **室内温度**: `ThermostatIcon`, 単位 `°C`
  - **室内湿度**: `WaterDropIcon`, 単位 `%`
  - **日射量**: `SunnyIcon`, 単位 `lux`
  - **EC値**: `BoltIcon`, 単位 `μS/cm` (TDS値も併記)
- データが `null` の場合は `--` と表示する。
- 計測時刻が存在する場合、「YYYY/MM/DD HH:mm 時点」として表示する。
- `measuredAt` は日付ピッカーで選択した日付に基づく。本日は現在時刻、過去日は選択日の日付に現在時刻（30分単位に丸め）を適用した値とする。

## 4. テスト項目

- [ ] すべての Props が `null` の場合でも、レイアウトが崩れず `--` が表示されること。
- [ ] `noDataMessage` がある場合、値の代わりにメッセージが表示されること。
- [ ] 各項目に対応する正しいアイコンが表示されていること。
