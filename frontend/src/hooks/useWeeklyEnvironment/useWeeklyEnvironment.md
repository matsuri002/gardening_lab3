# 仕様書：useWeeklyEnvironment (カスタムフック)

## 1. 役割

`WeeklyRecordPage` におけるデータの取得、週次集計（Max/Min/Avg）、および表示モード（生データ/集計データ）の管理を一括して行う。

## 2. インターフェース (I/O)

### 入力 (Arguments)

- `plantName`: 植物名 (URLパラメータ)

### 出力 (Return Values)

- `plantId`: 取得された植物ID
- `endDate`: 選択されている終了日 (`Dayjs`)
- `setEndDate`: 終了日の変更関数
- 各種データセット:
  - `soilTemp`, `roomTemp`, `roomHumid`, `soilMoisture`, `light`: 統計データと生データを含む
  - `ecData`: EC/TDSデータ
  - `co2Data`: CO2データ
- 各種表示モード:
  - `soilTempMode`, `roomTempMode` 等の変更関数
- 共通スケール設定:
  - `xTicks7`: 7日間の目盛り設定
  - `xDomain7`: 7日間の表示範囲

## 3. 内部ロジック

- `plantName` から `plantId` を取得。
- `plantId` と `endDate` に基づき、過去7日間の環境データを Supabase からフェッチ。
- 取得したデータを Recharts が扱える形式に整形・集計。
