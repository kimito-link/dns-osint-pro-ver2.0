# 🚀 次回セッション開始ガイド

## 📌 現在のステータス: v6.5.1

✅ **Chrome Web Store 審査中**（2025-11-08申請）

---

## 🎯 次回やること

### 優先度: 高 ⭐⭐⭐

#### 1. **Chrome DevTools MCP導入**（開発効率化）
- MCPサーバーのセットアップ
- Claude Desktopとの連携
- 開発時のバグ発見・パフォーマンス改善に活用

📝 参考: `docs/DEV_TOOLS_MCP_SETUP.md`

#### 2. **Performance API統合**
- Core Web Vitals測定
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
- パフォーマンススコア自動計算
- ユーザーへの改善提案

📝 参考: `docs/PERFORMANCE_API_GUIDE.md`

---

### 優先度: 中 ⭐⭐

#### 3. **AI診断機能（ユーザーAPIキー方式）**
- 設定画面でユーザーが自分のAPIキーを設定
- AI詳細診断機能の実装
- 技術的なユーザー向けオプション機能

📝 参考: `docs/AI_DIAGNOSIS_DESIGN.md`

#### 4. **ルールベース診断の充実**
- より詳細なSEOチェック
- アクセシビリティチェック
- セキュリティチェックの追加

---

### 優先度: 低 ⭐

#### 5. **ドキュメント整備**
- スクリーンショット撮影
- 使い方ビデオ作成
- FAQ作成

---

## 📂 プロジェクト構成（最新）

```
dns-osint-pro-ver2.0/
├── README.md                        # プロジェクト概要
├── manifest.json                    # v6.5.1
├── popup.html / popup.js           # メインUI
├── background.js                    # バックグラウンド処理
├── utils.js / ui-components.js     # ユーティリティ
├── styles.css                       # スタイル
├── options.html                     # 設定画面
│
├── images/                          # 画像ファイル
│   ├── link.png / konta.png / tanu-nee.png
│   └── yukkuri-link-kuchiake.png
│
├── docs/                            # ドキュメント
│   ├── NEXT_SESSION.md             # このファイル
│   ├── CHANGELOG.md                # 変更履歴
│   ├── DEVELOPMENT_GUIDE.md        # 開発ガイド
│   ├── RELEASE_NOTES_v6.5.1.md    # リリースノート
│   └── PROGRESS.md                 # 進捗メモ
│
├── create-release-package.sh       # リリース用スクリプト
└── create-release-package.ps1
```

---

## 🔧 開発環境

### 使用ツール
- **エディタ**: VSCode / Windsurf
- **Git**: Git Bash
- **ブラウザ**: Google Chrome（拡張機能開発モード）
- **AI**: Claude（開発支援）

### セットアップ確認
```bash
# Git確認
git --version

# プロジェクトディレクトリ
cd /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0

# 現在のブランチ確認
git branch

# 最新コミット確認
git log --oneline -5
```

---

## 📝 よく使うコマンド

### 開発時
```bash
# コミット
git add .
git commit -m "コミットメッセージ"

# 変更確認
git status
git diff

# ログ確認
git log --oneline -10
```

### リリース時
```bash
# ZIPファイル作成
./create-release-package.sh

# または PowerShell
.\create-release-package.ps1
```

---

## 🐛 デバッグ方法

### 1. 拡張機能のリロード
```
chrome://extensions/
→ 🔄ボタンをクリック
```

### 2. デバッグログ確認
- 拡張機能を開く
- SEO情報タブに移動
- 「🐛 デバッグログを表示」をクリック

### 3. コンソールログ確認
- 拡張機能のポップアップを右クリック → 「検証」
- または、chrome://extensions/ → service worker をクリック

---

## 📊 現在の状態

### 完了済み ✅
- [x] タブ切り替え問題修正
- [x] サイトタイトル常時表示
- [x] デバッグログ機能
- [x] サイトマップ高速化
- [x] CSPエラー解決
- [x] Chrome Web Store申請

### 次回のタスク 📋
- [ ] Chrome DevTools MCP導入
- [ ] Performance API統合
- [ ] AI診断機能設計
- [ ] ルールベース診断の充実

---

## 💡 アイデアメモ

### 将来的な機能追加
1. **リアルタイム監視**
   - サジェストの定期チェック
   - 風評被害の早期発見

2. **レポート機能**
   - PDF出力
   - 定期レポート自動生成

3. **ダッシュボード**
   - 複数ドメインの一括管理
   - トレンド分析

---

## 🔗 参考リンク

### 開発関連
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)

### AI関連
- [Claude API](https://docs.anthropic.com/)
- [Chrome DevTools MCP](https://github.com/modelcontextprotocol/servers)

---

## 📞 サポート

- 📝 進捗メモ: `docs/PROGRESS.md`
- 🐛 バグ報告: GitHub Issues
- 💬 質問: Claude AI

---

**次回セッション、頑張りましょう！ 🚀**
