# Frontend - 開発ガイド

gardening_lab3 のフロントエンド部分です。React + TypeScript + Vite を使用した、レスポンシブなウェブアプリケーションです。

## 🎨 技術スタック

- **React 19**: UI フレームワーク
- **TypeScript**: 型安全性
- **Vite**: 高速バンドラー・開発サーバー
- **MUI (Material-UI)**: UI コンポーネント
- **Dayjs**: 日時処理
- その他の詳細は `package.json` を参照

## 📋 前提条件

- Node.js 18.x 以上
- npm 9.x 以上

## 🚀 セットアップ

### 1. 依存パッケージをインストール

```bash
cd frontend
npm install
```

### 2. 環境変数を設定（必要な場合）

`.env` ファイルを作成し、以下の内容を設定：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

開発サーバーが起動し、デフォルトで `http://localhost:5173` で利用可能になります。

## 📁 フォルダ構成

```
src/
├── pages/                 # ページコンポーネント
│   ├── DailyRecordPage/  # 本日の記録
│   ├── WeeklyRecordPage/ # 一週間の記録
│   ├── PhotoPage/        # 写真管理
│   └── ...
├── components/           # 再利用可能なコンポーネント
│   ├── Header/
│   ├── Navigation/
│   └── ...
├── api/                  # バックエンド API 連携
│   ├── client.ts
│   ├── environment/
│   └── ...
├── hooks/                # カスタムフック
│   ├── useEnvironment.ts
│   └── ...
├── types/                # TypeScript 型定義
├── styles/               # グローバルスタイル
└── App.tsx              # ルートコンポーネント
```

## 🛠️ 開発コマンド

```bash
# 開発サーバーを起動（HMR 有効）
npm run dev

# プロダクション用にビルド
npm run build

# ビルド結果をプレビュー
npm run preview

# TypeScript の型チェック
npm run type-check

# ESLint でコード品質を確認
npm run lint

# Prettier でコード形式を統一
npm run format

# Prettier の形式を確認（修正なし）
npm run format:check
```

## 🧪 テスト

テストスイートはプロジェクト設定に応じて利用可能：

```bash
npm run test
npm run test:coverage
```

## 📱 ページ一覧

| ページ | 説明 |
|--------|------|
| DailyRecordPage | 本日の植物の成長記録を入力・表示 |
| WeeklyRecordPage | 過去1週間の記録をグラフで表示 |
| PhotoPage | 植物の成長写真を管理 |

## 🔌 API 連携

バックエンド API は `src/api/` に集約：

- `src/api/client.ts` - HTTP クライアント（axios ラッパー）
- `src/api/environment/` - 環境データ取得
- その他のリソースごとのファイル

詳細は [Backend README](../backend/README.md) を参照してください。

## 🎯 コーディング規約

- **コンポーネント**: `PascalCase`（例：`DailyRecordPage.tsx`）
- **ファイル**: 対応するコンポーネント、またはフィーチャーごとにフォルダ化
- **型定義**: `types/` フォルダ集約、またはコンポーネント内で定義

詳細は [docs/standards](../docs/standards/) を参照してください。

## 🚢 ビルド・デプロイ

### プロダクション用ビルド

```bash
npm run build
```

`dist/` フォルダに静的ファイルが生成されます。

### デプロイ例

- **Vercel**: リポジトリを接続し、`frontend` を root として設定
- **Netlify**: ビルドコマンド：`npm run build`、公開フォルダ：`dist/`
- **その他**: 標準的なスタティックホスティング対応

## 🐛 トラブルシューティング

### 開発サーバーが起動しない

```bash
# キャッシュをクリア
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ビルドエラー

```bash
# TypeScript エラーを確認
npm run type-check

# ESLint エラーを確認
npm run lint
```

## 🤝 貢献

Issue や PR の報告・提出は GitHub を使用してください：

- [Issues](https://github.com/matsuri002/gardening_lab3/issues)
- [Pull Requests](https://github.com/matsuri002/gardening_lab3/pulls)

## 📄 ライセンス

MIT

---

**最終更新**: 2026-05-24
