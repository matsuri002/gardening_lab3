# 仕様書：フロントエンド開発用モックデータ

## 1. 役割・目的

Supabase（バックエンド）が利用できない状況でもフロントエンドの開発をブロックしないよう、UIに流し込むダミーデータを提供する。

## 2. アーキテクチャ・切り替え方式

- **環境変数による切り替え**:
  - `.env` に `VITE_USE_MOCK=true` が設定されている場合、データ取得層はモックデータを返す。
- **侵入箇所の最小化**:
  - UIコンポーネント（`components/` や `pages/`）には一切手を加えない。
  - データ取得を担っているカスタムフック（`useDailyEnvironment` や `useWeeklyEnvironment`）の内部で、環境変数を判定し、Supabaseクライアントの代わりにモックジェネレーターを呼び出す。

## 3. ファイル構成 (`frontend/src/mocks/`)

- `mock_specification.md`: 本仕様書。
- `generators.ts`: 各種データ（Daily, Weekly, EC, CO2など）のモックデータを要件（型）に合わせて生成・返却する関数群。

## 4. モックデータ生成のルール

- グラフが自然に描画されるよう、乱数を用いてある程度の揺らぎを持たせる。
- TypeScriptの既存の型（`RawPoint`, `WeeklyStatPoint`, `EcWeeklyPoint` 等）に厳格に従ったデータを返す。
