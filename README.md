# gardening_lab3

Gardening Lab 3 は、室内植物の生育状況を記録・管理するための統合システムです。環境データ（温度、湿度、CO2）の自動取得、毎日の成長記録、過去データの可視化を通じて、健全な植物育成をサポートします。

## 🌱 プロジェクト概要

- **frontend**: React + TypeScript + Vite を用いたレスポンシブウェブアプリケーション
- **backend**: Node.js バックエンド（API サーバー、環境センサー連携）
- **目的**: ユーザーが自分の植物の健康状態をリアルタイムで追跡でき、最適な育成環境を実現

## 📋 必要な環境

- Node.js 18.x 以上
- npm 9.x 以上（または yarn）
- Git

## 🚀 クイックスタート

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd gardening_lab3
```

### 2. 依存パッケージをインストール

```bash
# リポジトリルートで frontend・backend の依存をまとめてインストール
npm install
```

もしくは個別にインストール：

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3. 開発サーバーを起動

```bash
# frontend（ポート 5173）
cd frontend
npm run dev

# backend（ポート 3000、別のターミナルで）
cd backend
npm run start:dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリケーションを確認します。

## 📁 フォルダ構成

```
gardening_lab3/
├── frontend/              # React + TypeScript UI
│   ├── src/
│   │   ├── pages/        # ページコンポーネント
│   │   ├── components/   # 再利用可能なコンポーネント
│   │   ├── api/          # API 連携ロジック
│   │   └── hooks/        # カスタムフック
│   ├── vite.config.ts
│   └── package.json
├── backend/               # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/  # ルーティング・ビジネスロジック
│   │   ├── services/     # ビジネスロジック
│   │   ├── entities/     # データモデル
│   │   └── middleware/   # 認証・エラーハンドリング
│   ├── package.json
│   └── tsconfig.json
├── docs/                  # ドキュメント
│   ├── standards/        # 開発標準・テンプレート
│   └── ...
└── README.md             # このファイル
```

## 📚 ドキュメント

- [Frontend README](./frontend/README.md) - フロントエンド開発ガイド
- [Backend README](./backend/README.md) - バックエンド開発ガイド
- [開発標準](./docs/standards/) - Issue/PR テンプレート、コーディング規約

## 🛠️ 開発ワークフロー

1. **Issue 作成**: [GitHub Issues](https://github.com/matsuri002/gardening_lab3/issues) でタスクを作成
2. **ブランチ作成**: `feat/[番号]` ブランチで開発
3. **コミット**: こまめにコミットし、CHANGELOG に記録
4. **PR 作成**: [Pull Requests](https://github.com/matsuri002/gardening_lab3/pulls) でレビューをリクエスト
5. **マージ**: レビュー完了後に main ブランチにマージ

詳細は [docs/standards](./docs/standards/) を参照してください。

## 📖 その他

- **ライセンス**: MIT
- **Issue を報告する**: [Issues](https://github.com/matsuri002/gardening_lab3/issues)
- **PR を提出する**: [Pull Requests](https://github.com/matsuri002/gardening_lab3/pulls)

---

**最終更新**: 2026-05-24
