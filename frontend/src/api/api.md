# 仕様書：API通信層（src/api/）

## 1. 役割・目的

`src/api/` は、アプリケーション全体のデータ取得処理を一元管理する「API通信層」です。
Supabase への直接アクセスとモックデータ生成を分離・抽象化し、カスタムフックやコンポーネントがデータの取得手段を一切意識しない設計（Repositoryパターン）を実現します。

## 2. ディレクトリ構成

```
src/api/
├── types.ts              # 全体共通のデータ型定義（Plant, EnvironmentData など）
├── index.ts              # ファクトリー関数（VITE_USE_MOCK の判定はここのみ）
├── plants/
│   ├── IPlantsRepository.ts          # インターフェース定義
│   ├── SupabasePlantsRepository.ts   # Supabase実装
│   └── MockPlantsRepository.ts       # モック実装
├── environment/
│   ├── IEnvironmentRepository.ts
│   ├── SupabaseEnvironmentRepository.ts
│   └── MockEnvironmentRepository.ts
└── photos/
    ├── IPhotosRepository.ts
    ├── SupabasePhotosRepository.ts
    └── MockPhotosRepository.ts
```

## 3. 設計原則

### 3.1 ファクトリー関数による切り替え

- `api/index.ts` が `import.meta.env.VITE_USE_MOCK` を唯一評価し、Mock 実装または Supabase 実装のインスタンスを返す。
- カスタムフックは `getPlantsRepository()` 等のファクトリー関数を呼ぶだけで、内部実装を知る必要がない。

### 3.2 型の一元管理

- `api/types.ts` にすべてのドメイン型（`Plant`・`EnvironmentData`・`PhotoRecord` 等）を集約する。
- フック・コンポーネント・モックジェネレーターはすべてこのファイルから型をインポートする。

### 3.3 責任の分離

| 層                                  | 責務                                  |
| :---------------------------------- | :------------------------------------ |
| Repository（api/）                  | データ取得処理・モック/本番の切り替え |
| カスタムフック（hooks/）            | 状態管理・データの加工・UIへの提供    |
| コンポーネント（pages/components/） | UI描画のみ                            |
