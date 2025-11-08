# Git Commit Commands

## 🚀 今回の変更内容

### 追加・変更ファイル
- `keyword-expansion.js` - アルファベット拡張機能（新規）
- `popup.js` - タイトル抽出ロジック改善、アルファベット拡張ボタン追加
- `popup.html` - keyword-expansion.js読み込み追加
- `styles.css` - ホバー効果CSS追加
- `background.js` - タイムアウトエラー修正

### ドキュメント
- `UBERSUGGEST_ANALYSIS.md`
- `UBERSUGGEST_DEEP_ANALYSIS.md`
- `RELATED_KEYWORDS_CAPABILITY.md`
- `IMPLEMENTATION_COMPLETE.md`
- `TEST_INSTRUCTIONS.md`
- `QUICK_FIX.md`

---

## 📋 Git Bash コマンド

```bash
# 1. 現在の状態確認
git status

# 2. すべての変更をステージング
git add .

# 3. コミット（オプションA: 短いメッセージ）
git commit -m "feat: アルファベット拡張による関連キーワード取得機能を追加"

# 4. コミット（オプションB: 詳細なメッセージ）
git commit -m "feat: アルファベット拡張による関連キーワード取得機能を追加

- keyword-expansion.js: a-z拡張で300+キーワード取得
- popup.js: タイトル抽出ロジック改善（ABOUT等の一般ページ名除外）
- Google/Yahoo/Bing 3検索エンジンから取得
- ソース別表示（🌐 Google, 🔴 Yahoo, 🔵 Bing）
- 統計情報表示（検索エンジン別内訳）
- CSP対応（インラインイベント削除）
- CSV/コピーエクスポート機能
- タイムアウトエラー修正"

# 5. リモートにプッシュ（必要な場合）
git push origin main
# または
git push origin master
```

---

## 🔍 個別ファイルのみコミットする場合

```bash
# 1. 特定のファイルのみ追加
git add keyword-expansion.js
git add popup.js
git add popup.html
git add styles.css
git add background.js

# 2. コミット
git commit -m "feat: アルファベット拡張機能追加"

# 3. プッシュ
git push
```

---

## 📊 変更内容の確認

```bash
# 変更されたファイル一覧
git status

# 差分を見る
git diff

# ステージング済みの差分
git diff --staged

# 変更行数の統計
git diff --stat
```

---

## 🔄 もし間違えた場合

```bash
# 最後のコミットメッセージを修正
git commit --amend -m "新しいメッセージ"

# ステージングを取り消し
git reset HEAD <ファイル名>

# すべての変更を取り消し（注意！）
git reset --hard HEAD
```

---

## 💡 推奨コミットメッセージ

```bash
git commit -m "feat: 関連キーワード拡張機能（Ubersuggest風）

✨ 新機能
- アルファベット拡張で300-500個のキーワード取得
- Google/Yahoo/Bing 3検索エンジン対応
- ソース別バッジ表示
- 検索エンジン別統計情報
- CSV/テキストエクスポート

🐛 バグ修正
- タイトル抽出ロジック改善（ABOUT等除外）
- CSP違反修正（インラインイベント削除）
- SEO情報タイムアウトエラー修正

📝 ドキュメント
- Ubersuggest分析レポート追加
- 実装完了レポート追加
- テスト手順書追加"
```

---

## ⚡ クイックコマンド（コピペ用）

```bash
# すべてコミット＆プッシュ（1行で）
git add . && git commit -m "feat: アルファベット拡張による関連キーワード取得機能追加" && git push
```

---

## 🎯 次のステップ

```bash
# 1. コミット後、タグを付ける（バージョン管理）
git tag -a v5.9.0 -m "関連キーワード拡張機能リリース"
git push origin v5.9.0

# 2. ブランチを作成して作業する場合
git checkout -b feature/keyword-expansion
git add .
git commit -m "feat: キーワード拡張機能"
git push origin feature/keyword-expansion

# 3. 変更履歴を確認
git log --oneline -10
```

---

## 📦 リリースパッケージ作成

```bash
# ZIPファイル作成スクリプト実行
./create-release-package.sh

# または PowerShell
.\create-release-package.ps1
```
