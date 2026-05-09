# 仕様書：DailyCharts (日次グラフセクション)

## 1. 目的

1日を通じた各センサーデータの推移を可視化する。

## 2. インターフェース (Props)

### Props

- `soilTempDaily`: `DailyDataPoint[]`
- `soilMoistureDaily`: `DailyDataPoint[]`
- `roomTHDaily`: `{ time: string, temp: number | null, humid: number | null }[]`
- `lightDaily`: `DailyDataPoint[]`
- `co2Daily`: `DailyDataPoint[]`
- `daysFromStart`: `number` (温度範囲の判定用)

## 3. 表示仕様

- 各センサーごとにグラフを表示する。
- **温度グラフ**:
  - `soilTempDaily` を表示。
  - `daysFromStart` に基づき「発芽適温」または「生育適温」の `ReferenceArea` を表示する。
- **温湿度グラフ**:
  - `roomTHDaily` を使用し、室温と湿度を一つのグラフに表示する。
- **水分量・日射量・CO2グラフ**:
  - それぞれ単独の `LineChart` で表示。
- 全グラフ共通で `ChartCardFrame` を使用し、デザインを統一する。

## 4. テスト項目

- [ ] 経過日数に応じて、背景の適温範囲（緑/赤）が正しく切り替わること。
- [ ] グラフ上のポイントにマウスオーバーした際、正しい時刻と値がツールチップに表示されること。
- [ ] データが空の場合でも、空の座標軸が表示されること。
