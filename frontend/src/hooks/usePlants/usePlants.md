# 仕様書：usePlants フック

## 1. 役割・目的

選択された野菜の種類（`plantType`）に紐づく鉢（プランター）データの一覧を取得するカスタムフック。
Supabase から該当する鉢のレコード一覧を取得する処理、およびモックデータへの切り替え処理をカプセル化する。

## 2. API設計

### 2.1 Hooks の入出力

- **入力（引数）**:
  - `plantType` (`string | undefined`): 取得対象の野菜の種類（例: `"コマツナ"`, `"トマト"`）。
- **出力（返り値）**:
  - `plants` (`Plant[]`): 取得した鉢データ（`id`, `year`, `plant_type`, `plant_name`）のリスト。
  - `loading` (`boolean`): データの取得状態を表すフラグ。
  - `error` (`Error | null`): エラーが発生した場合のエラーオブジェクト。

## 3. 実装詳細

- **引数検証**:
  - `plantType` が `undefined` または空の場合は、即座に空の配列 `[]` を設定して処理を完了する。
- **モックモード（`VITE_USE_MOCK === "true"`）**:
  - 指定された `plantType` を使用して、`1号` および `2号` のモックデータを作成し、即座にロード完了する。
- **本番モード**:
  - Supabase の `plants` テーブルから `plant_type` が引数 `plantType` に一致するレコードを全取得。
  - 鉢の登録日時（`created_at`）の昇順で並び替えて `plants` に設定する。
