# 仕様書：SelectPlanterPage

## 1. 役割・目的

選択した野菜の種類（`plantType`）に対応する鉢（プランター）を選択するための画面。
データベース（またはモックデータ）から該当する種類の鉢一覧を取得してボタンとして表示する。
本ファイルはコンポーネントとロジックを統合する「コンテナ」としての役割のみを持つ。

## 2. 構成

### 2.1 データ取得・状態管理（Hooks）

- **`usePlants`**:
  - 責務：Supabaseの `plants` テーブルから、URLパラメータで指定された野菜の種類（`plant_type`）に一致する鉢データ一覧（`id`, `year`, `plant_type`, `plant_name`）を取得する。モック切り替えフラグ（`VITE_USE_MOCK`）の制御もこの中でカプセル化する。

### 2.2 UI コンポーネント

- Material-UI（MUI）の `Button` や `Container` を使用して、取得した鉢（プランター）の選択肢を並べる。
- 「戻るボタン（`BackButton`）」を設置し、トップ画面（`/`）へ戻れるようにする。
- ボタン押下時に、選択したプランターのグラフ画面（`/plants/:plantType/:plantName/daily`）へ画面遷移（`useNavigate`）する。

## 3. データフロー

1. `SelectPlanterPage` が `usePlants` を呼び出し、鉢一覧（`plants`）を受け取る。
2. `plants` をループしてボタンを描画し、クリック時に `navigate` を実行する。
