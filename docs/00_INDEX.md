# docs ディレクトリ インデックス

最終更新: 2026-01-21

## 概要

このディレクトリには、dns-osint-pro-ver2.0プロジェクトの詳細ドキュメントが格納されています。

## 📁 ディレクトリ構造

```
docs/
├── 00_INDEX.md                # このファイル
│
├── guides/                    # ガイド類
│   ├── USAGE.md              # 使用方法
│   ├── DEVELOPMENT.md        # 開発者ガイド
│   ├── DEVELOPMENT_GUIDE.md  # 開発ガイド
│   ├── TEST_INSTRUCTIONS.md  # テスト手順
│   └── SCREENSHOT_GUIDE.md   # スクリーンショット撮影ガイド
│
├── specs/                     # 仕様書
│   ├── API.md                # API仕様
│   ├── SPEC.md               # 機能仕様
│   ├── DESIGN.md             # デザイン仕様
│   └── REQUIREMENTS.md       # 要件定義
│
├── workflows/                 # ワークフロー
│   ├── WORKFLOW.md           # 開発ワークフロー
│   ├── COMMIT_AND_RELEASE.md # コミット・リリース手順
│   ├── RELEASE_PROCEDURE.md  # リリース手順
│   └── DEBUG_LOG_GUIDE.md    # デバッグログガイド
│
├── research/                  # 調査記録
│   └── YAHOO_SUGGEST_RESEARCH.md # Yahoo!サジェスト調査
│
├── releases/                  # リリースノート
│   ├── CHANGELOG.md          # 変更履歴
│   └── RELEASE_NOTES_v6.5.1.md # v6.5.1リリースノート
│
└── _archive/                  # アーカイブ（古いドキュメント）
    ├── PROGRESS.md           # 旧進捗レポート
    ├── TODO.md               # 旧TODOリスト
    ├── NEXT_SESSION.md       # 旧セッションメモ
    └── PROJECT.md            # 旧プロジェクト定義
```

## 📚 カテゴリ別ドキュメント

### guides/ - ガイド類

| ファイル名 | 概要 | 対象者 |
|-----------|------|--------|
| [USAGE.md](USAGE.md) | 拡張機能の使い方 | 全ユーザー |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 開発環境セットアップ・開発ガイド | 開発者 |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | 開発ガイド（補足） | 開発者 |
| [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) | テスト手順書 | QA・開発者 |
| [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) | スクリーンショット撮影方法 | コントリビューター |

### specs/ - 仕様書

| ファイル名 | 概要 | 対象者 |
|-----------|------|--------|
| [API.md](API.md) | API仕様（DNS、WHOIS、サジェスト） | 開発者 |
| [SPEC.md](SPEC.md) | 機能仕様書 | 開発者・PM |
| [DESIGN.md](DESIGN.md) | UI/UXデザイン仕様 | デザイナー・開発者 |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 要件定義 | PM・開発者 |

### workflows/ - ワークフロー

| ファイル名 | 概要 | 対象者 |
|-----------|------|--------|
| [WORKFLOW.md](WORKFLOW.md) | 開発ワークフロー全体 | 開発者 |
| [COMMIT_AND_RELEASE.md](COMMIT_AND_RELEASE.md) | コミット・リリース手順 | 開発者 |
| [RELEASE_PROCEDURE.md](RELEASE_PROCEDURE.md) | リリース手順詳細 | リリース担当者 |
| [DEBUG_LOG_GUIDE.md](DEBUG_LOG_GUIDE.md) | デバッグログの使い方 | 開発者 |

### research/ - 調査記録

| ファイル名 | 概要 | 対象者 |
|-----------|------|--------|
| [YAHOO_SUGGEST_RESEARCH.md](YAHOO_SUGGEST_RESEARCH.md) | Yahoo!サジェストAPI調査 | 開発者 |

### releases/ - リリースノート

| ファイル名 | 概要 | 対象者 |
|-----------|------|--------|
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴（全バージョン） | 全員 |
| [RELEASE_NOTES_v6.5.1.md](RELEASE_NOTES_v6.5.1.md) | v6.5.1リリースノート | 全員 |

### _archive/ - アーカイブ

古くなったドキュメントや、別のドキュメントに統合されたものを保管しています。

| ファイル名 | 状態 | 備考 |
|-----------|------|------|
| [PROGRESS.md](PROGRESS.md) | アーカイブ | PROJECT_STATUS.mdに統合 |
| [TODO.md](TODO.md) | アーカイブ | PROJECT_STATUS.mdに統合 |
| [NEXT_SESSION.md](NEXT_SESSION.md) | アーカイブ | - |
| [PROJECT.md](PROJECT.md) | アーカイブ | README.mdに統合 |

## 🎯 目的別ガイド

### 初めてプロジェクトに参加する

1. [USAGE.md](USAGE.md) - 拡張機能の使い方を理解
2. [DEVELOPMENT.md](DEVELOPMENT.md) - 開発環境をセットアップ
3. [WORKFLOW.md](workflows/WORKFLOW.md) - 開発ワークフローを確認

### 開発を始める

1. [DEVELOPMENT.md](DEVELOPMENT.md) - 環境構築
2. [specs/SPEC.md](specs/SPEC.md) - 機能仕様を理解
3. [specs/API.md](specs/API.md) - API仕様を確認
4. [workflows/COMMIT_AND_RELEASE.md](workflows/COMMIT_AND_RELEASE.md) - コミット方法を確認

### テストする

1. [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) - テスト手順を確認
2. [workflows/DEBUG_LOG_GUIDE.md](workflows/DEBUG_LOG_GUIDE.md) - デバッグログの使い方

### リリースする

1. [workflows/RELEASE_PROCEDURE.md](workflows/RELEASE_PROCEDURE.md) - リリース手順
2. [SCREENSHOT_GUIDE.md](SCREENSHOT_GUIDE.md) - スクリーンショット撮影
3. [releases/CHANGELOG.md](releases/CHANGELOG.md) - 変更履歴を更新

### 特定の問題を調査する

1. [research/](research/) - 過去の調査記録を参照
2. [_archive/](_archive/) - 古いドキュメントを検索

## 🔄 ドキュメント更新ルール

### 新しいドキュメントを追加する場合

1. 適切なカテゴリディレクトリに配置
2. このインデックスに追加
3. 必要に応じてDOCUMENT_STRUCTURE.mdも更新

### 既存ドキュメントを更新する場合

- 最終更新日を記載
- 重要な変更はCHANGELOG_DOCS.mdにも記録

### ドキュメントをアーカイブする場合

1. `_archive/` ディレクトリに移動
2. このインデックスのアーカイブセクションに追加
3. CHANGELOG_DOCS.mdに記録

---

**DNS OSINT Pro ver2.0** - Made with ❤️ by 君斗りんく & Reverse Rebirth Hack Team
