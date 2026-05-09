# 仕様書：DateSelector (日付選択コンポーネント)

## 1. 目的

表示するデータの対象日を選択し、画面全体の日付状態を管理する。また、現在の閲覧基準時刻を表示する。

## 2. インターフェース (Props)

### Props

- `selectedDate`: `Dayjs` (現在選択されている日付)
- `onDateChange`: `(date: Dayjs) => void` (日付変更時のコールバック)
- `plantType`: `string | undefined` (戻るボタンの遷移先用)

## 3. 表示仕様

- MUI X の `DatePicker` を使用して日付を選択可能にする。
- 戻るボタンを左側に配置し、プランター選択画面へ戻れるようにする。
- 植物種別タブ（`RecordTabs`）を中央付近に配置する。

## 4. テスト項目

- [ ] 日付を選択すると `onDateChange` が呼ばれ、新しい日付が渡されること。
- [ ] 戻るボタンをクリックすると、正しいURL（`/select-planter/[plantType]`）に遷移すること。
