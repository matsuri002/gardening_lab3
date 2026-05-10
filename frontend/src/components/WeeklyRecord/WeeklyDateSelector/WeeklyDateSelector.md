# 仕様書：WeeklyDateSelector

## 1. 役割

`WeeklyRecordPage` において、表示期間の終点となる日付を選択し、選択された期間を表示する。

## 2. インターフェース (Props)

- `endDate`: 選択されている最終日 (`dayjs.Dayjs`)
- `onDateChange`: 日付が変更された際のコールバック関数

## 3. 構成要素

- `DatePicker`: MUI X-Date-Pickers を使用。
- `Typography`: 選択された期間を「MM/DD〜MM/DD」の形式で表示。
