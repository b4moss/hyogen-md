# repository テスト仕様

ブランチ・CI/CD 運用。自動テスト仕様は各版ファイルに分散。

`docs/specs/` と同じドメイン切り（OKF v0.1）。SemVer フォルダは使わない。

## 関連仕様

- [`docs/specs/repository.md`](../../specs/repository.md)

## 版別テスト仕様（app）

（このドメイン専用の版別ファイルは未分割。関連は [tests/README.md](../README.md) を参照）

## 新規ケースの書き方

1. 本ドメインの受け入れをここに追記する（または本 README からリンクするファイルを追加）
2. 実装マイルストーンの詳細手順は既存どおり `app/test/specs/vX.Y.Z.md` に書く（override）

----

以上
