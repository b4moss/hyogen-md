# パス解決

## `.doc_root`

- プロジェクト（ドキュメントツリー）のルートを示す **マーカーファイル**
- ファイル名: `.doc_root`
- **テキストファイル**であること（中身は空でよい）
- 中身に何か書いてあっても **一切評価しない**（存在のみが意味を持つ）
- 祖先方向などに辿って `.doc_root` があるディレクトリを **`rootDir`** とする

### `.doc_root` がある場合

- 読み込みは原則として **`rootDir` 配下に限る**
- **ルート相対パス**が使える

### `.doc_root` が無い場合

- **ルート相対パスはエラー**
- **相対パスは有効**
- 相対パスの `../` による上方向への移動は **制限しない**（呼び出し側の責任）

## 絶対パス（Node）

- **禁止が基本**ではなく、正規化・解決後のパスが **`.doc_root`（rootDir）配下に収まるときだけ許可**（`constrainToRoot` 時は `assertNormalizedPathWithinRoot`）
- `.doc_root` が無い場合、絶対パスは実質エラー

## シンボリックリンク（Node）

- 本番のパス解決（`resolveTemplatePath`）は **パス正規化のみ**で root 内かを見る（`path.resolve` + `assertNormalizedPathWithinRoot`）
- `realpath` による symlink 追従チェック（`assertWithinRootDir`）は **現行の本番経路では未使用**（ユニットテスト用ヘルパとして残存）
- したがって root 内から外へ出る symlink を realpath で塞ぐ保証は **現行実装には無い**

## ブラウザ（CSR）

- ライブラリは fetch しない。**loader 必須**（[api.md](./api.md)）
- **クロスオリジンはサポートしない**

## リモート（Node / SSR・SSG）

- `https://...` 等のリモートを **`include` / `component` / `extend`** で許可する（同一の `resolveIncludePath`）
- （ブラウザのクロスオリジン禁止とは非対称）
- **`dataSources` のリモートは不可**（[api.md](./api.md)）

## `_` プレフィックス（partial）

Sass の `_` partial と同様:

- `_` で始まる **ファイル**、および `_` で始まる **ディレクトリ以下**のファイルは、**`build` / CLI build のエントリ対象外**（[pipeline.md](./pipeline.md)）
- 除外は **glob マッチ後フィルタ**。リテラルパスは常に含める。glob で含めるには **`includeUnderscoreEntries: true`**
- `include` / `component` による読み込み自体は、通常のパス規則に従い **可能**
- `renderServer` 単発は `_` エントリフィルタを適用しない

## 関連

- パイプライン: [pipeline.md](./pipeline.md)
- セキュリティ: [security.md](./security.md)

---

以上