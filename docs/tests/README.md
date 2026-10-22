# tests（OKF ドメイン索引）

OKF v0.1 では `docs/tests/` を **`docs/specs/` と同じドメイン切り**にする（SemVer フォルダは使わない）。  
本ディレクトリはその索引である。

## 配置ポリシー（hyogen-md）

| 置き場 | 役割 |
|--------|------|
| **`docs/tests/{domain}/`** | ドメイン別の入口・関連リンク（本ツリー） |
| **`app/test/specs/vX.Y.Z.md`** | 版別の詳細テスト仕様（TDD 入力の正。override） |

アプリ側の版別ファイルを一括でドメイン再編することはしない。新規の領域を切るときは、まずここにドメインフォルダを足し、必要なら `app/test/specs/` 側も追記する。

## ドメイン一覧

| ドメイン | specs | 版別テスト仕様（参照） |
|----------|-------|------------------------|
| [api](./api/) | [specs/api.md](../specs/api.md) | [v0.1.0](../../app/test/specs/v0.1.0.md) / [v0.5.0](../../app/test/specs/v0.5.0.md) / [v0.11.0](../../app/test/specs/v0.11.0.md) / [v0.12.0](../../app/test/specs/v0.12.0.md) |
| [pipeline](./pipeline/) | [specs/pipeline.md](../specs/pipeline.md) | [v0.5.0](../../app/test/specs/v0.5.0.md) / [v0.9.2](../../app/test/specs/v0.9.2.md) |
| [templating](./templating/) | [specs/templating.md](../specs/templating.md) | [v0.2.0](../../app/test/specs/v0.2.0.md) / [v0.4.0](../../app/test/specs/v0.4.0.md) / [v0.6.0](../../app/test/specs/v0.6.0.md) / [v0.8.0](../../app/test/specs/v0.8.0.md) |
| [variables](./variables/) | [specs/variables.md](../specs/variables.md) | [v0.7.0](../../app/test/specs/v0.7.0.md) / [v0.14.0](../../app/test/specs/v0.14.0.md) |
| [logic](./logic/) | [specs/logic.md](../specs/logic.md) | [v0.3.0](../../app/test/specs/v0.3.0.md) / [v0.7.0](../../app/test/specs/v0.7.0.md) |
| [dsl](./dsl/) | [specs/dsl.md](../specs/dsl.md) | [v0.7.0](../../app/test/specs/v0.7.0.md) |
| [toc](./toc/) | [specs/toc.md](../specs/toc.md) | [v0.12.0](../../app/test/specs/v0.12.0.md) |
| [cli](./cli/) | [specs/cli.md](../specs/cli.md) | [v0.13.0](../../app/test/specs/v0.13.0.md) |
| [highlighter](./highlighter/) | [specs/highlighter.md](../specs/highlighter.md) | [v0.14.0](../../app/test/specs/v0.14.0.md) |
| [paths](./paths/) | [specs/paths.md](../specs/paths.md) | [v0.2.0](../../app/test/specs/v0.2.0.md) |
| [security](./security/) | [specs/security.md](../specs/security.md) | [v0.2.0](../../app/test/specs/v0.2.0.md) / [v0.11.0](../../app/test/specs/v0.11.0.md) |
| [playground](./playground/) | [specs/playground.md](../specs/playground.md) | [v0.9.0](../../app/test/specs/v0.9.0.md) / [v0.10.0](../../app/test/specs/v0.10.0.md) / [v0.14.0](../../app/test/specs/v0.14.0.md) |
| [docs-site](./docs-site/) | [specs/docs-site.md](../specs/docs-site.md) | （サイト側・Playground 回帰は docs-site / highlighter テスト） |
| [distribution](./distribution/) | [specs/distribution.md](../specs/distribution.md) | [v0.10.0](../../app/test/specs/v0.10.0.md) |
| [repository](./repository/) | [specs/repository.md](../specs/repository.md) | （運用手順。自動テスト仕様は版ファイルに分散） |
| [development](./development/) | [specs/development.md](../specs/development.md) | TDD 手順の正は development.md。入力は `app/test/specs/` |

override: [override-charter.md](../override-charter.md)。OKF の定義: [charter/okf/](../charter/okf/)。

----

以上
