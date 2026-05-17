# 仕様書：PhotoPage

## 1. 役割・目的

指定された植物（鉢）の定期撮影された写真の一覧と、自動再生（スライドショー）UIを提供するページコンポーネント。
本ファイルは各コンポーネントとロジックを統合する「コンテナ」としての役割のみを持つ。

## 2. 構成

### 2.1 データ取得・状態管理（Hooks）

- **`usePhotoRecord`**:
  - 責務：Supabaseからの写真データ（またはモックデータ）の取得、現在表示中の写真（`currentIndex`, `latestPhoto`）の管理、およびスライドショー再生のタイマー制御（`isPlaying`）。

### 2.2 UI コンポーネント（Components）

- **`PhotoViewer`** (`components/PhotoRecord/PhotoViewer`):
  - 責務：現在選択されているメイン写真の表示。
- **`PhotoControls`** (`components/PhotoRecord/PhotoControls`):
  - 責務：再生・停止ボタン、次へ・前へ遷移ボタン、インデックス表示などの操作UI。

## 3. データフロー

1. `PhotoPage` が `usePhotoRecord` を呼び出し、必要な状態（`photos`, `latestPhoto`, `currentIndex`, `isPlaying` 等）と操作関数（`handleNext`, `handlePrev`, `handlePlay`, `stopPlay` 等）を受け取る。
2. 受け取った状態と操作関数を、各種UIコンポーネント (`PhotoViewer`, `PhotoControls`) にPropsとして流し込む。
