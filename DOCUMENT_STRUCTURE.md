# ドキュメント構造ガイド

最終更新: 2026-01-21

## 概要

このドキュメントは、dns-osint-pro-ver2.0プロジェクトのすべてのドキュメントの構造と役割を説明します。
新規参加者や、ドキュメントを探している方は、このガイドを最初にお読みください。

## ドキュメント階層

### ルート階層（プロジェクト概要・重要ドキュメント）

プロジェクトの基本情報を定義する重要ドキュメント群。

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [README.md](README.md) | プロジェクト概要・使い方 | 全員 |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | 現在の開発状況・進捗 | 開発者 |
| [CHANGELOG.md](CHANGELOG.md) | 変更履歴 | 全員 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | コントリビューションガイド | コントリビューター |
| [CONTRIBUTORS.md](CONTRIBUTORS.md) | 貢献者一覧 | 全員 |
| [LICENSE](LICENSE) | ライセンス情報 | 全員 |
| [SECURITY.md](SECURITY.md) | セキュリティポリシー | 全員 |

### 開発関連ドキュメント（ルート階層）

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) | 統合計画 | 開発者 |
| [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) | 実装完了レポート | 開発者 |
| [SESSION_START.md](SESSION_START.md) | セッション開始ガイド | 開発者 |
| [QUICK_FIX.md](QUICK_FIX.md) | クイックフィックスガイド | 開発者 |

### ツール・ワークフロー関連（ルート階層）

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [COMMIT_COMMANDS.md](COMMIT_COMMANDS.md) | コミットコマンド | 開発者 |
| [GIT-AUTO-COMMIT.md](GIT-AUTO-COMMIT.md) | 自動コミット設定 | 開発者 |
| [WSL_WORKFLOW.md](WSL_WORKFLOW.md) | WSLワークフロー | 開発者 |
| [OPEN_WSL_PROJECT.md](OPEN_WSL_PROJECT.md) | WSLプロジェクト開く | 開発者 |
| [SETUP_OTHER_PROJECTS.md](SETUP_OTHER_PROJECTS.md) | 他プロジェクトセットアップ | 開発者 |

### 分析・調査ドキュメント（ルート階層）

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [UBERSUGGEST_ANALYSIS.md](UBERSUGGEST_ANALYSIS.md) | Ubersuggest分析 | 開発者 |
| [UBERSUGGEST_DEEP_ANALYSIS.md](UBERSUGGEST_DEEP_ANALYSIS.md) | Ubersuggest詳細分析 | 開発者 |
| [RELATED_KEYWORDS_CAPABILITY.md](RELATED_KEYWORDS_CAPABILITY.md) | 関連キーワード機能 | 開発者 |

### 専門ツール・機能（ルート階層）

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [DEVTOOLS_MCP.md](DEVTOOLS_MCP.md) | DevTools MCP統合 | 開発者 |
| [STORE_DESCRIPTION.md](STORE_DESCRIPTION.md) | Chrome Web Store説明文 | マーケティング |
| [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) | テスト手順 | 開発者・QA |
| [PROGRESS.md](PROGRESS.md) | 進捗レポート | 開発者 |

### docs/ 配下（詳細ドキュメント）

詳細な技術ドキュメント、仕様書、ガイド類。

| ファイル名 | 目的 | 対象者 |
|-----------|------|--------|
| [00_INDEX.md](docs/00_INDEX.md) | docsディレクトリのインデックス | 全員 |

カテゴリ別の詳細は [docs/00_INDEX.md](docs/00_INDEX.md) を参照してください。

## ドキュメントの使い分け

### 新規参加者の方へ

1. まず [README.md](README.md) を読む
2. [CONTRIBUTING.md](CONTRIBUTING.md) でコントリビューション方法を確認
3. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) で開発環境をセットアップ
4. [docs/USAGE.md](docs/USAGE.md) で使い方を理解

### 開発作業を始める方へ

1. [PROJECT_STATUS.md](PROJECT_STATUS.md) で現在の状況を確認
2. [docs/WORKFLOW.md](docs/WORKFLOW.md) でワークフローを理解
3. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) で開発環境を構築
4. [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) でテスト方法を確認

### QA・テスターの方へ

1. [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) でテスト手順を確認
2. [docs/USAGE.md](docs/USAGE.md) で機能を理解
3. バグ報告は GitHubIssuesへ

### Chrome Web Store公開準備

1. [STORE_DESCRIPTION.md](STORE_DESCRIPTION.md) でストア説明文を確認
2. [docs/SCREENSHOT_GUIDE.md](docs/SCREENSHOT_GUIDE.md) でスクリーンショット撮影
3. [docs/RELEASE_PROCEDURE.md](docs/RELEASE_PROCEDURE.md) でリリース手順を確認

## ドキュメント更新ルール

### 更新時の注意事項

1. **README.md** - 重要な変更のみ。バージョン番号は必ず更新
2. **PROJECT_STATUS.md** - 主要な成果・マイルストーン達成時に更新
3. **CHANGELOG.md** - すべてのリリースで更新
4. **docs/配下** - 機能追加・変更時に対応ドキュメントを更新

### 最終更新日の記載

各ドキュメントには最終更新日を記載してください。

```markdown
最終更新: YYYY-MM-DD
```

## 関連リンク

- プロジェクト公式サイト: https://reverse-rebirth-hack.com
- Chrome Web Store: （公開準備中）
- GitHub Issues: バグ報告・機能リクエスト

## 変更履歴

詳細な変更履歴は [CHANGELOG_DOCS.md](CHANGELOG_DOCS.md) を参照してください。

---

**DNS OSINT Pro ver2.0** - Made with ❤️ by 君斗りんく & Reverse Rebirth Hack Team
