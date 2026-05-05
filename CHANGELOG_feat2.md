# Gardening Lab 3 - feat/2 修正内容まとめ

このドキュメントは、feat/2「GitLab CI/CD パイプラインの構築」における変更内容を逐次記録するものです。

## コミット履歴

### コミット1: GitLab CI/CD の基本設定の導入
**推奨コミットメッセージ:**
```text
feat(ci): add .gitlab-ci.yml for automated lint and build checks

- Define stages: check, build
- Add lint and format check jobs for both frontend and backend
- Add production build check jobs for both frontend and backend
- Configure caching for node_modules to speed up pipeline execution
```

**修正内容:**
- プロジェクトルートに `.gitlab-ci.yml` を作成。
- Node.js 20 イメージを使用し、Frontend/Backend それぞれの Lint、フォーマットチェック（Prettier）、およびビルドの自動実行を定義。
- マージリクエスト時の品質担保のための基盤を構築。
