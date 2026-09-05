---
title: create
description: hyogen-md create で最小プロジェクトを生成する
---

# create

`dev` / `build` ですぐ動く最小構成を生成します。

```bash
npx hyogen-md create [dir]
npx hyogen-md create my-site --language ts
```

| フラグ | 既定 | 説明 |
|--------|------|------|
| `[dir]` | カレント | 生成先（空または未作成であること） |
| `--language` | `js` | 設定ファイルの言語: `js` または `ts` |

## 生成物

| パス | 内容 |
|------|------|
| `package.json` | `dev` / `build` スクリプト。依存 `@b4moss/hyogen-md` |
| `hyogen.config.js` または `.ts` | `defineConfig({ input: "./src/**/*.md" })` |
| `src/index.md` | サンプル入口 Markdown |
| `.gitignore` | `node_modules/`、`out/` など |

生成後:

```bash
cd my-site
npm install
npm run dev
```

## 関連

- [設定](/ja/cli/config)
- [dev](/ja/cli/dev)
- [build](/ja/cli/build)
