# Gardening Lab 3 - feat/4 修正内容まとめ

このドキュメントは、feat/4「開発プロセスの標準化（Issue/PR テンプレートおよび CHANGELOG 運用の策定）」における変更内容を逐次記録するものです。
本ステップでは、AI とユーザーの協調作業を円滑にし、品質を一定に保つための管理基盤を整備します。

## コミット履歴

### コミット1: 開発ドキュメント標準テンプレートの策定
**推奨コミットメッセージ:**
```text
feat/4: define development documentation standards (Issue/PR templates)

- Create docs/standards/issue_template.md
- Define mandatory formats for Issue titles and descriptions
- Establish rules for markdown output and co-location integration
```

**修正内容:**
- **標準テンプレートの作成**:
  - `docs/standards/issue_template.md`: Issue と Pull Request の標準的なひな形を定義。
- **運用ルールの明文化**:
  - タイトル形式を `feat/[番号]: [概要]` に統一。
  - AI による回答をマークダウン形式（コピー用）で出力することを義務付け。
  - 完了定義 (DoD) をプロジェクトの品質基準として Issue に組み込むフローを確立。
