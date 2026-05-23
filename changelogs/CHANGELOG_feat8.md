# Gardening Lab 3 - feat/8 修正内容まとめ

このドキュメントは、feat/8「TopPage と SelectPlanterPage のリファクタリングとフック抽出」における変更内容を逐次記録するものです。

## コミット履歴

### コミット1: TopPage と SelectPlanterPage の Co-location 準備と仕様定義

**推奨コミットメッセージ:**

```text
🚚 feat/8: TopPage と SelectPlanterPage を Co-location 化し仕様を定義
```

**修正内容:**

- **Co-location の実施**:
  - `pages/TopPage/` ディレクトリを作成し、`TopPage.tsx` を移動。
  - `pages/SelectPlanterPage/` ディレクトリを作成し、`SelectPlanterPage.tsx` を移動。
- **インポートの修正**:
  - `App.tsx` 内の `TopPageContainer` と `SelectPlanterPageContainer` のインポートパスを更新。
- **仕様の明文化**:
  - `pages/TopPage/TopPage.md` を作成し、抽出するフックとコンポーネントの全体設計を定義。
  - `pages/SelectPlanterPage/SelectPlanterPage.md` を作成し、抽出するフックとコンポーネントの全体設計を定義。
