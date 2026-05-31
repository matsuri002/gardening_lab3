# Gardening Lab 3 - feat/11 修正内容まとめ

このドキュメントは、feat/11「frontend・backend・全体 README 作成」における変更内容を逐次記録するものです。

## コミット履歴

### コミット1: リポジトリルート・frontend・backend の README ドラフト作成

**推奨コミットメッセージ:**

```text
📚 feat/11: README.mdの追加
```

**修正内容:**

- **リポジトリルート README.md**: プロジェクト概要、セットアップ手順（npm install, npm run dev）、フォルダ構成、開発ワークフロー、ドキュメントリンク、Issue/PR 報告方法を記載
- **frontend/README.md**: React + TypeScript + Vite の技術スタック、セットアップ手順、フォルダ構成、開発コマンド（dev, build, lint, format）、ページ一覧、API 連携、コーディング規約、ビルド・デプロイ、トラブルシューティング、MIT ライセンス
- **backend/README.md**: Express + Supabase の技術スタック、セットアップ手順（環境変数：SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ONEDRIVE_ROOT の実装に基づいて記載）、フォルダ構成、開発コマンド（dev, build, start, lint, format）、API エンドポイント、Supabase・OneDrive 連携、コーディング規約、トラブルシューティング、MIT ライセンス

**検証:**

- 各 README がマークダウン形式で正しく記載されていることを確認
- 環境変数、コマンド、フォルダ構成が実装と合致していることを確認（特に backend/.env の実装に基づいて修正）

### コミット2: READMEの修正

**推奨コミットメッセージ:**

```text
🐛 feat/11: READMEの修正
```

**修正内容:**

- **READMEの修正**:
  - READMEに写真や動画などを添付し詳細に記述した

### コミット3: フロントエンドのパイプラインエラーを解消するためのフォーマット修正

**推奨コミットメッセージ:**

```text
🐛 feat/11: パイプラインエラー対策として各READMEのフォーマット修正および.gitattributesの追加
```

**修正内容:**

- **各READMEのフォーマット修正**:
  - `README.md`、`backend/README.md`、`frontend/README.md` に対し `npx prettier --write` を実行し、CI上のフォーマットチェック（`npx prettier --check .`）を通過するよう修正。
- **改行コード問題の根本解決 (.gitattributes の追加)**:
  - Windows環境とWSL/CI環境間での改行コード（CRLF / LF）の不一致による Prettier チェックエラー（`endOfLine: lf`）を防ぐため、`.gitattributes` ファイルを新規作成。リポジトリ内の全テキストファイルの改行コードを LF に強制する設定を追加。
