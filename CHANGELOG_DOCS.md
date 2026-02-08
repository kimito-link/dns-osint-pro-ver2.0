# ドキュメント変更履歴

このファイルは、dns-osint-pro-ver2.0プロジェクトのドキュメントに関する変更履歴を記録します。

## [2026-01-21] ドキュメント構造リファクタリング

### 追加されたファイル

- `DOCUMENT_STRUCTURE.md` - プロジェクト全体のドキュメント構造ガイド
- `CHANGELOG_DOCS.md` - このファイル（ドキュメント変更履歴）
- `docs/00_INDEX.md` - docs配下のインデックス
- `docs/guides/` - ガイド類を分類
- `docs/specs/` - 仕様書を分類
- `docs/workflows/` - ワークフロー類を分類
- `docs/research/` - 調査記録を分類
- `docs/releases/` - リリースノートを分類
- `docs/_archive/` - 古いドキュメント用アーカイブ

### 更新されたファイル

- `README.md` - DOCUMENT_STRUCTURE.mdへの参照を追加
- `PROJECT_STATUS.md` - 最新状況に更新、リファクタリング計画への参照を追加

### 移動されたファイル

#### docs/guides/ へ移動
- `USAGE.md`
- `DEVELOPMENT.md`
- `DEVELOPMENT_GUIDE.md`
- `TEST_INSTRUCTIONS.md`
- `SCREENSHOT_GUIDE.md`

#### docs/specs/ へ移動
- `API.md`
- `SPEC.md`
- `DESIGN.md`
- `REQUIREMENTS.md`

#### docs/workflows/ へ移動
- `WORKFLOW.md`
- `COMMIT_AND_RELEASE.md`
- `RELEASE_PROCEDURE.md`
- `DEBUG_LOG_GUIDE.md`

#### docs/research/ へ移動
- `YAHOO_SUGGEST_RESEARCH.md`

#### docs/releases/ へ移動
- `CHANGELOG.md`（docsディレクトリ内のもの）
- `RELEASE_NOTES_v6.5.1.md`

#### docs/_archive/ へ移動
- `PROGRESS.md`
- `TODO.md`
- `NEXT_SESSION.md`
- `PROJECT.md`（古いプロジェクト定義）

### 削除されたファイル

- なし（すべてアーカイブまたは統合）

### 変更の目的

このリファクタリングの目的は以下の通りです：

1. **メンテナンス性の向上** - カテゴリ別に整理し、必要なドキュメントを素早く発見
2. **エラー発見の容易化** - インデックスにより、すべてのドキュメントを把握
3. **整合性の確保** - 相互参照により、情報の矛盾を防止
4. **新規参加者の支援** - 明確なドキュメント構造により、学習コストを削減

---

## 今後の変更について

このファイルは、ドキュメントに重要な変更があった際に更新してください。

### 記録すべき変更

- 新しいドキュメントの追加
- 既存ドキュメントの大幅な更新
- ドキュメントの削除や移動
- ドキュメント構造の変更

### 記録形式

```markdown
## [YYYY-MM-DD] 変更の概要

### 追加されたファイル
- ファイル名 - 説明

### 更新されたファイル
- ファイル名 - 変更内容

### 移動されたファイル
- 旧パス → 新パス

### 削除されたファイル
- ファイル名 - 削除理由
```

---

**DNS OSINT Pro ver2.0** - Made with ❤️ by 君斗りんく & Reverse Rebirth Hack Team
