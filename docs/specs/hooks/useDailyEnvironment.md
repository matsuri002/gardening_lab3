# 仕様書：useDailyEnvironment (カスタムフック)

## 1. 役割
`DailyRecordPage` におけるデータの取得、状態管理、エラーハンドリングを一括して行う。UIコンポーネントからはロジックを分離し、データを提供するのみとする。

## 2. インターフェース (I/O)

### 入力 (Arguments)
- `plantName`: 植物名 (URLパラメータから取得)
- `selectedDate`: 選択された日付 (`Dayjs`オブジェクト)

### 出力 (Return Values)
- `plantId`: 取得された植物ID
- `loading`: データ取得中フラグ
- `environment`: `{ soilTemp, soilMoisture, roomTemp, roomHumid, light, co2 }` (サマリー用)
- `measuredAt`: データ計測時刻
- `dailyData`: 各種センサーの1日分の推移データ
- `adviceText`: 栽培アドバイス文字列
- `daysFromStart`: 栽培開始からの経過日数
- `error`: エラー情報

## 3. 内部ロジック
- `plantName` が変更されたら `plantId` を取得し直す。
- `plantId` または `selectedDate` が変更されたら、以下の情報を並列/逐次で取得する。
  - 基本環境データ (`fetchEnvironmentData`)
  - センサーデータ (`fetchDailySensorData` x 5種類)
  - ECデータ (`fetchEcDataBySelectedDate`)
  - CO2データ (`fetchLatestCo2Data`, `fetchDailyCo2Data`)
- 取得した生データを UI 表示に適した形式（グラフ用配列等）に加工する。

## 4. テスト項目
- [ ] 有効な `plantName` を渡すと、正しい `plantId` が解決されること。
- [ ] 未来の日付やデータのない期間を指定した場合、`error` または `null` 状態が正しくセットされること。
- [ ] 複数のデータ取得のうち一つが失敗しても、画面全体がクラッシュしないこと。
- [ ] 日付変更時に古いデータが一瞬残らず、`loading` 状態が適切に挟まること。
