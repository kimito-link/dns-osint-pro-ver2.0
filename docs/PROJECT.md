# DNS OSINT Pro ver2.0 - プロジェクト構成

## 📂 ディレクトリ構造

```
dns-osint-pro-ver2.0/
│
├── 📄 manifest.json          # Chrome拡張機能の設定ファイル（Manifest V3）
├── 🎨 popup.html             # ポップアップUIのHTML
├── ⚡ popup.js               # メインロジック（フロントエンド）
├── 🎨 styles.css             # スタイルシート
├── 🔧 background.js          # バックグラウンドスクリプト（API呼び出し）
├── 🛠️ utils.js               # ユーティリティ関数（DNS/RDAP）
├── 🧩 ui-components.js       # UIコンポーネント（キャラクター表示）
├── 🔗 link-templates.js      # リンクテンプレート（口コミサイト等）
│
├── 📄 設定・オプション
│   ├── options.html          # オプションページ
│   └── options.js            # オプション設定
│
├── 🖼️ images/                # キャラクター画像
│   ├── link.png              # りんく（メインキャラクター）
│   ├── konta.png             # こん太（アドバイザー）
│   ├── tanu-nee.png          # たぬ姉（警告役）
│   └── rev.png               # Reverse Rebirth Hackロゴ
│
├── 📚 docs/                  # ドキュメント
│   ├── USAGE.md              # 使用方法の詳細
│   ├── DEVELOPMENT.md        # 開発者向けガイド
│   ├── API.md                # API仕様書
│   ├── SCREENSHOT_GUIDE.md   # スクリーンショット撮影ガイド
│   ├── PROJECT.md            # このファイル
│   ├── REQUIREMENTS.md       # 要件定義書
│   ├── TODO.md               # タスクリスト
│   ├── WORKFLOW.md           # 開発ワークフロー
│   ├── DESIGN.md             # デザイン仕様
│   └── screenshots/          # スクリーンショット画像
│
├── 📁 設定ファイル
│   ├── .gitignore            # Git除外設定
│   ├── .windsurfignore       # Windsurf除外設定
│   ├── package.json          # npm設定
│   ├── README.md             # プロジェクト概要
│   ├── CHANGELOG.md          # 変更履歴
│   ├── CONTRIBUTING.md       # コントリビューションガイド
│   ├── CONTRIBUTORS.md       # 貢献者リスト
│   ├── SECURITY.md           # セキュリティポリシー
│   ├── LICENSE               # MITライセンス
│   └── privacy-policy.html   # プライバシーポリシー
│
└── 🔐 AI設定
    ├── .claude/              # Claude AI設定
    ├── .claude-flow/         # Claude Flow設定
    └── .windsurf/            # Windsurf設定
```

## 📋 ファイル説明

### コアファイル

#### manifest.json
- **目的**: Chrome拡張機能のメタデータと設定
- **Manifest Version**: 3（最新仕様）
- **主要設定**:
  - 拡張機能名・バージョン・説明
  - 権限（activeTab, storage, tabs, contextMenus）
  - ホスト権限（外部API通信用）
  - Service Worker（background.js）
  - アイコン設定
- **現在のバージョン**: 5.5.0

#### popup.html
- **目的**: 拡張機能のメインUI構造
- **主要セクション**:
  - ヘッダー（ロゴ、タイトル）
  - ドメイン入力フォーム
  - サイト健康診断結果表示エリア
  - サジェスト分析結果表示エリア
  - メールセキュリティ診断エリア
  - DNS情報表示エリア
  - WHOIS/RDAP情報表示エリア
  - 履歴表示エリア
  - フッター（相談リンク）
- **依存関係**: styles.css, popup.js, ui-components.js, utils.js, link-templates.js

#### popup.js
- **目的**: アプリケーションのメインロジック
- **主要機能**:
  - 現在のタブからドメイン自動取得
  - DNS情報取得（A, AAAA, MX, NS, TXT, CNAME, PTR）
  - WHOIS/RDAP情報取得
  - サジェスト取得（Google/Yahoo/Bing）
  - サイト名自動抽出
  - ネガティブキーワード検出
  - 風評被害アラート表示
  - サーバー会社自動識別
  - 履歴管理（chrome.storage.local）
  - 結果のコピー・ダウンロード機能
- **行数**: 約6,000行

#### styles.css
- **目的**: UIスタイルとアニメーション
- **特徴**:
  - モダンでクリーンなデザイン
  - キャラクター表示の吹き出しスタイル
  - パックマンアニメーション
  - ネガティブキーワードの赤字ハイライト
  - ボタンのホバー効果
  - レスポンシブ対応
- **主要セクション**:
  - 基本設定（CSS変数）
  - ヘッダー・フッター
  - フォーム・ボタン
  - 結果表示エリア
  - キャラクター吹き出し
  - アニメーション
- **行数**: 約100行

#### background.js
- **目的**: バックグラウンド処理とAPI呼び出し
- **主要機能**:
  - Service Workerとして動作
  - サジェストAPI呼び出し（Google/Yahoo/Bing）
  - サイト健康診断（HTTP/HTTPS確認、セキュリティヘッダー）
  - WordPress検出
  - 右クリックメニュー管理
  - メッセージング（popup.jsとの通信）
- **行数**: 約2,000行

#### utils.js
- **目的**: 汎用ユーティリティ関数
- **主要機能**:
  - DNS over HTTPS（DoH）クエリ
  - RDAP（WHOIS）クエリ
  - データパース・整形
  - エラーハンドリング
- **行数**: 約200行

#### ui-components.js
- **目的**: UIコンポーネントの生成
- **主要機能**:
  - キャラクター吹き出し生成（りんく、こん太、たぬ姉）
  - サイト健康診断結果のHTML生成
  - メールセキュリティ診断結果のHTML生成
  - アイコン・装飾の生成
- **行数**: 約600行

#### link-templates.js
- **目的**: 外部サイトへのリンクテンプレート
- **主要機能**:
  - 口コミサイトURL生成（Googleマップ、転職会議、OpenWork等）
  - サジェスト検索結果URL生成
  - エンコード処理
- **行数**: 約200行

### オプションページ

#### options.html
- **目的**: ユーザー設定画面
- **設定項目**:
  - API設定（将来拡張用）
  - 表示設定
  - キャッシュクリア

#### options.js
- **目的**: 設定の保存・読み込み
- **機能**:
  - chrome.storage.local へ設定保存
  - 設定の読み込み
  - デフォルト値の管理

### ドキュメント

#### USAGE.md
- ユーザー向け使い方ガイド
- 各機能の詳細説明
- FAQ・トラブルシューティング

#### DEVELOPMENT.md
- 開発環境のセットアップ
- コーディング規約
- デバッグ方法
- 拡張機能のビルド・デプロイ

#### API.md
- 使用している外部API仕様
- Cloudflare DoH
- RDAP
- Google/Yahoo/Bing Suggest API
- エラーハンドリング

#### SCREENSHOT_GUIDE.md
- スクリーンショット撮影手順
- 必要な画像リスト
- 画像のサイズ・形式

#### LICENSE
- MITライセンス
- 商標に関する注意事項

## 🔧 技術仕様

### フロントエンド

| 項目 | 詳細 |
|------|------|
| HTML | HTML5、セマンティックマークアップ |
| CSS | CSS3、フレックスボックス、アニメーション |
| JavaScript | ES6+、async/await、モジュール |
| Chrome API | Manifest V3、chrome.tabs、chrome.storage、chrome.runtime |

### ブラウザサポート

| ブラウザ | 最小バージョン |
|---------|----------------|
| Chrome | 88+ |
| Edge | 88+ |
| Brave | 1.20+ |
| Opera | 74+ |

## 🎨 デザインシステム

### カラーパレット

```css
--primary-color: #4a90e2;      /* メインブルー */
--secondary-color: #7b68ee;    /* パープル */
--success-color: #4caf50;      /* グリーン */
--warning-color: #ff9800;      /* オレンジ */
--danger-color: #f44336;       /* レッド */
--text-color: #333;            /* テキスト */
--bg-color: #f5f5f5;           /* 背景 */
--card-bg: #ffffff;            /* カード背景 */
```

### タイポグラフィ

```css
フォントファミリー: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
基本サイズ: 14px
行の高さ: 1.6

見出しサイズ:
- h1: 1.5rem (24px)
- h2: 1.3rem (20px)
- h3: 1.1rem (17px)
```

### スペーシング

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

## 🔌 API連携

### Cloudflare DNS over HTTPS (DoH)

#### エンドポイント
```
https://cloudflare-dns.com/dns-query
```

#### 使用方法
```javascript
const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`;
const response = await fetch(url, {
  headers: { 'accept': 'application/dns-json' }
});
const data = await response.json();
```

#### 対応レコードタイプ
- A (IPv4)
- AAAA (IPv6)
- MX (Mail Exchange)
- NS (Name Server)
- TXT (Text)
- CNAME (Canonical Name)
- PTR (Pointer - 逆引き)

### RDAP (WHOIS)

#### エンドポイント
```
https://rdap.org/domain/{domain}
https://rdap.org/ip/{ip}
```

#### 使用方法
```javascript
const url = `https://rdap.org/domain/${domain}`;
const response = await fetch(url);
const data = await response.json();
```

### Google Suggest API

#### エンドポイント
```
https://suggestqueries.google.com/complete/search?client=firefox&q={query}
```

#### レスポンス形式
```json
["検索クエリ", ["候補1", "候補2", "候補3"]]
```

### Yahoo! Suggest API

#### エンドポイント
```
https://search.yahoo.co.jp/realtime/search?p={query}
```

### Bing Autosuggest API

#### エンドポイント
```
https://api.bing.com/osjson.aspx?query={query}
```

## 📊 データフロー

### 1. ドメイン取得フロー
```
ユーザー → 拡張機能アイコンクリック → chrome.tabs.query()
→ 現在のタブURL取得 → ドメイン抽出 → 入力フォームに自動入力
```

### 2. DNS情報取得フロー
```
ユーザー → 検索ボタンクリック → popup.js → utils.js (dohQuery)
→ Cloudflare DoH API → DNSレコード取得 → パース → UI表示
```

### 3. サジェスト取得フロー
```
ユーザー → サイト名自動抽出 → background.js (fetchSuggests)
→ Google/Yahoo/Bing API → サジェスト取得 → ネガティブキーワード検出
→ 風評被害判定 → UI表示（赤字ハイライト・アラート）
```

### 4. サイト健康診断フロー
```
ユーザー → 診断開始 → background.js (analyzeSiteHealth)
→ HTTP/HTTPSアクセス → レスポンスヘッダー解析 → WordPress検出
→ セキュリティチェック → 診断結果生成 → ui-components.js
→ キャラクター吹き出し生成 → UI表示
```

### 5. 履歴管理フロー
```
検索実行 → ドメイン名・タイムスタンプ → chrome.storage.local へ保存
→ 履歴一覧に追加 → 次回起動時に読み込み → 履歴から再検索可能
```

## 🔐 セキュリティ

### 実装済み

- ✅ Content Security Policy（CSP）
- ✅ XSS対策（入力値のサニタイズ）
- ✅ DNS over HTTPS（暗号化通信）
- ✅ 最小権限の原則（必要な権限のみリクエスト）
- ✅ セキュアなAPI通信（HTTPS強制）

### セキュリティヘッダー確認項目

```
X-Frame-Options
X-Content-Type-Options
Strict-Transport-Security (HSTS)
Content-Security-Policy
X-XSS-Protection
```

## 🚀 パフォーマンス

### 最適化施策

1. **非同期処理**
   - async/await による並列処理
   - Promise.allSettled() で複数API同時呼び出し

2. **キャッシュ戦略**
   - chrome.storage.local で履歴キャッシュ
   - API結果の一時キャッシュ（実装予定）

3. **軽量化**
   - Vanilla JavaScript（フレームワーク不使用）
   - 画像最適化
   - 不要なライブラリ排除

### 目標指標

| 指標 | 目標値 |
|------|--------|
| 初回起動時間 | < 500ms |
| DNS情報取得 | < 2秒 |
| サジェスト取得 | < 3秒 |
| サイト健康診断 | < 3秒 |
| メモリ使用量 | < 50MB |

## 📈 将来の拡張計画

### Phase 1（短期）
- [ ] サブドメイン探索機能の強化
- [ ] SSL証明書情報の詳細表示
- [ ] Wayback Machine履歴の可視化
- [ ] レポートエクスポート機能（PDF/CSV）

### Phase 2（中期）
- [ ] 複数ドメインの一括診断
- [ ] スケジュール診断（定期監視）
- [ ] メール通知機能
- [ ] API連携強化（SecurityTrails、IPdata等）

### Phase 3（長期）
- [ ] AI による自動診断・レポート生成
- [ ] ダッシュボード機能
- [ ] チーム機能・共有機能
- [ ] モバイルアプリ版

## 🤝 コントリビューション

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/dns-osint-pro-ver2.0.git
cd dns-osint-pro-ver2.0

# Chrome拡張機能として読み込む
# 1. Chrome で chrome://extensions/ を開く
# 2. デベロッパーモードをON
# 3. 「パッケージ化されていない拡張機能を読み込む」をクリック
# 4. このフォルダを選択
```

### コントリビューションガイドライン

1. **Issueを作成**
   - バグ報告
   - 機能リクエスト
   - ドキュメント改善

2. **Pull Requestを作成**
   - フォーク
   - ブランチ作成（feature/*, bugfix/*）
   - コード変更
   - テスト
   - PR作成

3. **コードスタイル**
   - インデント: スペース2個
   - 命名規則: camelCase（変数・関数）、PascalCase（クラス）
   - コメント: 日本語OK
   - ESLint準拠（将来実装予定）

## 📞 サポート

### 連絡先

- **公式サイト**: https://reverse-rebirth-hack.com
- **風評対策LINE**: https://lin.ee/X2aWSFO
- **ITインフラLINE**: https://lin.ee/lrjVHvH
- **Email**: info@reverse-re-birth-hack.com
- **GitHub Issues**: [リンク]

### サポート内容

- 🚨 **風評被害対策**: ネガティブサジェストの削除・対策
- 🔒 **Webセキュリティ診断**: サイトの脆弱性チェック
- 💻 **ITインフラサポート**: サーバー管理・保守

---

## 📝 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [USAGE.md](USAGE.md) - 使用方法の詳細
- [DEVELOPMENT.md](DEVELOPMENT.md) - 開発者向けガイド
- [API.md](API.md) - API仕様書
- [REQUIREMENTS.md](REQUIREMENTS.md) - 要件定義書
- [TODO.md](TODO.md) - タスクリスト
- [WORKFLOW.md](WORKFLOW.md) - 開発ワークフロー
- [DESIGN.md](DESIGN.md) - デザイン仕様
- [CHANGELOG.md](../CHANGELOG.md) - 変更履歴

---

<div align="center">

**DNS OSINT Pro ver2.0 - Project Documentation**

君斗りんくのWEBサイト健康診断＆OSINT調査ツール

Made with ❤️ by 君斗りんく & Reverse Rebirth Hack Team

最終更新: 2025-11-04

</div>
