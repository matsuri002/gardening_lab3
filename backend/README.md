# Backend - 開発ガイド

gardening_lab3 のバックエンド部分です。Node.js + NestJS（または Express）で構成されたサーバーサイドアプリケーションです。

## 技術スタック

- **Node.js 18.x 以上**: ランタイム
- **Express**: Web フレームワーク
- **TypeScript**: 型安全性
- **Supabase**: バックエンド・データベース
- **OneDrive**: ファイルストレージ連携
- その他の詳細は `package.json` を参照

## 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

## セットアップ

### 1. 依存パッケージをインストール

```bash
cd backend
npm install
```

### 2. 環境変数を設定

`.env` ファイルを作成し、以下の内容を設定：

```env
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ONEDRIVE_ROOT=/path/to/onedrive/root
```

**環境変数の説明:**

- `SUPABASE_URL`: Supabase プロジェクトの URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー（管理操作用）
- `ONEDRIVE_ROOT`: OneDrive ルートディレクトリのパス

### 3. 開発サーバーを起動

```bash
npm run dev
```

バックエンドサーバーが起動し、`http://localhost:3000` で利用可能になります。

## フォルダ構成

```
src/
├── index.ts                   # アプリケーションエントリポイント
├── routes/                    # API ルーティング
│   ├── plants.ts
│   ├── environment.ts
│   └── ...
├── controllers/               # リクエスト処理
├── services/                  # ビジネスロジック
├── types/                     # TypeScript 型定義
└── config/                    # 設定ファイル
```

## 開発コマンド

```bash
# 開発サーバーを起動（watch モード）
npm run dev

# プロダクション用にビルド
npm run build

# プロダクションモードで起動
npm run start

# ESLint でコード品質を確認
npm run lint

# Prettier でコード形式を統一
npm run format
```

## API エンドポイント一覧

### Plants（植物）

| メソッド | エンドポイント    | 説明                 |
| -------- | ----------------- | -------------------- |
| GET      | `/api/plants`     | 植物一覧を取得       |
| GET      | `/api/plants/:id` | 特定の植物情報を取得 |

### Environment（環境データ）

| メソッド | エンドポイント     | 説明             |
| -------- | ------------------ | ---------------- |
| GET      | `/api/environment` | 環境データを取得 |

詳細な API 仕様はバックエンドコードを参照してください。

## 認証・認可

- **Supabase**: バックエンド認証はSupabaseに委譲

## テスト

テストスイートはプロジェクト設定に応じて利用可能です。

## ストレージ連携

- **Supabase**: データベースとファイルストレージ
- **OneDrive**: ファイル同期・バックアップ用途
- `src/services/` - ストレージ処理ロジック

## コーディング規約

- **ファイル名**: `kebab-case`（例：`environment.service.ts`）
- **クラス名**: `PascalCase`（例：`EnvironmentService`）
- **メソッド名**: `camelCase`（例：`getLatestEnvironment`）
- **型定義**: インターフェース・型は各ファイル内、またはグローバル型ファイルに集約

詳細は [docs/standards](../docs/standards/) を参照してください。

## トラブルシューティング

### サーバーが起動しない

```bash
# 依存パッケージを再インストール
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Supabase 接続エラー

```bash
# SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を確認
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### ポート 3000 が既に使用されている

別のプロセスが使用していないか確認するか、異なるポートで起動してください。

## 貢献

Issue や PR の報告・提出は GitHub を使用してください：

- [Issues](https://github.com/matsuri002/gardening_lab3/issues)
- [Pull Requests](https://github.com/matsuri002/gardening_lab3/pulls)

---

**最終更新**: 2026-05-31
