# 🔍 DNS OSINT Pro ver2.0

[![Version](https://img.shields.io/badge/version-5.8.0-blue.svg)](https://github.com/yourusername/dns-osint-pro-ver2.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange.svg)](https://chrome.google.com/webstore)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**君斗りんくのWEBサイト健康診断＆OSINT調査ツール**

Chrome拡張機能として動作する、ドメイン情報の総合分析ツールです。DNS情報、WHOIS、サジェスト汚染検出、サイト健康診断、メールセキュリティチェックなど、Web調査に必要な情報を一括で取得できます。

![Banner](docs/banner.png)

---

## 📸 スクリーンショット

### メイン画面
![メイン画面](docs/screenshots/main.png)
*DNS情報、WHOIS、サジェスト分析を一画面で確認*

### サイト健康診断
![サイト健康診断](docs/screenshots/site-health.png)
*りんく、こん太、たぬ姉がサイトを診断*

### サジェスト風評チェック
![サジェスト風評チェック](docs/screenshots/suggest-check.png)
*Google/Yahoo!/Bingのサジェストを自動取得・分析*

### 風評被害検出アラート
![風評被害アラート](docs/screenshots/reputation-alert.png)
*ネガティブキーワードを検出すると警告表示*

### 口コミサイトリンク
![口コミサイトリンク](docs/screenshots/review-links.png)
*主要口コミサイトへワンクリックでアクセス*

> 📝 **注意**: 現在、スクリーンショット画像は未設置です。撮影手順については [docs/SCREENSHOT_GUIDE.md](docs/SCREENSHOT_GUIDE.md) を参照してください。

---

## 📌 最新バージョン: v5.2.0 (2025-10-05)

### 🎉 新機能ハイライト

- 🔍 **サイト名抽出機能の大幅強化**: 医療機関名（〜医院、〜クリニック）や施設名を優先的に検出
- 🔗 **サジェストのリンク化**: Google/Yahoo!/Bingの検索結果へワンクリックでアクセス
- 💬 **口コミサイトリンク**: Googleマップ、転職会議、OpenWorkなど主要口コミサイトへの直接リンク
- 🎮 **パックマンアニメーション改善**: りんくのサイズ拡大とバウンドする動き
- 🎨 **UI/UXの大幅改善**: より見やすく、使いやすいレイアウトに

---

## ✨ 主な機能

### 🎯 サイト健康診断（りんくの診断機能）
現在アクセスしているサイトを自動診断し、問題点を検出します。

- ✅ **WordPress検出**: バージョン確認とセキュリティリスク評価
- ✅ **SEO分析**: タイトルタグ、メタディスクリプション、Canonical URL、OGPタグ
- ✅ **セキュリティ診断**: HTTPS設定、セキュリティヘッダー、サーバー情報の漏洩チェック
- ✅ **リダイレクト確認**: WWW統一、HTTP→HTTPSリダイレクト
- ✅ **パフォーマンス**: キャッシュ設定、圧縮（gzip/brotli）の確認

**キャラクター案内:**
- 🎀 **りんく**: 良好な点や正常な設定を褒めてくれる
- 🐕 **こん太**: 改善できる点をアドバイス
- 🦝 **たぬ姉**: 深刻な問題を警告

---

### 🚨 風評被害・サジェスト汚染チェック
検索エンジンのサジェスト機能を使い、風評被害の可能性を自動検出します。

- 🌐 **Google サジェスト**: リアルタイム取得 + 検索結果へのリンク
- 🟣 **Yahoo! サジェスト**: リアルタイム取得 + 検索結果へのリンク
- 🔵 **Bing サジェスト**: リアルタイム取得 + 検索結果へのリンク
- 🔍 **サイト名自動抽出（強化版）**: 医療機関名や施設名を優先的に検出
  - 医療機関: 〜医院、〜クリニック、〜病院、〜診療所など
  - 美容・サロン: 〜サロン、〜美容室、〜エステなど
  - 治療院: 〜整体院、〜接骨院、〜鍼灸院など
  - 飲食店: 〜レストラン、〜カフェ、〜居酒屋など
  - その他: 〜塾、〜ジム、〜法律事務所など
- 🚨 **ネガティブキーワード自動検出**: 「詐欺」「被害」「危険」「ブラック」などを赤字ハイライト
- ⚠️ **風評被害アラート**: ネガティブサジェストが見つかった場合、大きな警告を表示
- 💬 **口コミサイトへの直接リンク**:
  - 総合口コミ: Googleマップ、Yahoo!知恵袋、みん評
  - 企業評判: 転職会議、OpenWork、エン ライトハウス、Indeed

**対応キーワード例:**
詐欺、被害、危険、怪しい、最悪、ブラック、やばい、トラブル、悪質、悪い、悪評、炎上、問題、クレーム、苦情、評判悪い、倒産、閉鎖、パワハラ、セクハラ、事件

---

### 📧 メールセキュリティ診断
メール送信の信頼性とセキュリティを診断します。

- ✅ **SPFレコード**: 送信元認証の確認
- ✅ **DKIMレコード**: メール改ざん防止の確認（一般的なセレクタを自動検索）
- ✅ **DMARCレコード**: なりすまし対策の確認
- 🚨 **リスク警告**: 設定不備による迷惑メール判定リスクを警告

**設定不備で起こる問題:**
- 送信メールが迷惑メールフォルダに振り分けられる
- なりすましメール（フィッシング）のリスク増加
- メール配信率の低下
- ドメイン信頼性の低下

---

### 🔎 DNS情報の取得
DNS over HTTPS (DoH)を使用し、安全にDNS情報を取得します。

- **A レコード**: IPv4アドレス
- **AAAA レコード**: IPv6アドレス
- **MX レコード**: メールサーバー
- **NS レコード**: ネームサーバー
- **TXT レコード**: SPF、DKIM、DMARCなど
- **CNAME レコード**: エイリアス
- **逆引き（PTR）**: IPアドレスからホスト名を取得

---

### 🏢 サーバー会社の自動識別
IPアドレス、ホスト名、レジストラ情報から、使用しているサーバー会社を自動判定します。

**対応サーバー:**

**日本のホスティング:**
- 🟦 Xサーバー（エックスサーバー）
- 🍭 ロリポップサーバー
- 🌸 さくらインターネット
- 🏢 お名前ドットコム
- 🐄 ムームードメイン
- 🐾 ConoHa
- 🎨 カラフルボックス
- 🔥 mixhost
- 💼 heteml
- 🛠️ コアサーバー
- 🏛️ KAGOYA

**海外クラウド:**
- ☁️ Cloudflare
- 🟧 Amazon Web Services (AWS)
- 🔵 Google Cloud Platform (GCP)
- 🔷 Microsoft Azure
- 🌊 DigitalOcean
- 🟫 Linode
- ⚡ Vultr

---

### 🔐 WHOIS / RDAP情報
ドメインとIPアドレスの登録情報を取得します。

- **ドメイン情報**: 登録日、有効期限、ステータス、レジストラ
- **IP情報**: 組織名、国、IP範囲、連絡先
- **RDAP対応**: 最新のWHOISプロトコルに対応

---

## 🚀 インストール方法

### Chrome拡張機能としてインストール

#### 方法1: 開発者モードで読み込み（推奨）

1. **このリポジトリをダウンロード**
   ```bash
   git clone https://github.com/yourusername/dns-osint-pro-ver2.0.git
   ```
   または、ZIPファイルをダウンロードして解凍

2. **Chromeで拡張機能ページを開く**
   - Chrome で `chrome://extensions/` にアクセス
   - または、メニュー → 拡張機能 → 拡張機能を管理

3. **デベロッパーモードを有効化**
   - 右上の「デベロッパーモード」トグルをON

4. **拡張機能を読み込む**
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - ダウンロードした `dns-osint-pro-ver2.0` フォルダを選択

5. **完了！**
   - 拡張機能アイコンがツールバーに表示されます
   - 任意のWebサイトでクリックして使用開始

#### 方法2: Chrome Web Storeからインストール（公開後）

```
現在、Chrome Web Storeへの公開準備中です
```

---

## 📖 使い方

### 基本的な使い方

1. **自動分析モード**
   - 任意のWebサイトを開く
   - 拡張機能アイコンをクリック
   - 自動的に現在のドメインを分析開始

2. **手動入力モード**
   - 拡張機能を開く
   - 調べたいドメイン名を入力
   - 「検索」ボタンをクリック

3. **結果の確認**
   - サイト健康診断結果
   - サジェスト汚染チェック
   - メールセキュリティ診断
   - DNS/WHOIS情報
   - サーバー会社の推定

### サジェスト分析の見方

- **緑色の枠**: 問題なし、サジェストが正常
- **赤色の枠**: 風評被害の可能性あり、ネガティブキーワードを検出
- **赤字ハイライト**: ネガティブキーワードが強調表示
- **🔗 リンクアイコン**: クリックすると各検索エンジンの検索結果ページへジャンプ
- **💬 口コミサイトボタン**: ワンクリックで主要口コミサイトの該当ページへアクセス

### サイト健康診断の見方

- **緑色（りんく）**: 正常な設定、良好な点
- **オレンジ色（こん太）**: 改善できる点、推奨事項
- **赤色（たぬ姉）**: 深刻な問題、早急な対応が必要

---

## 📂 プロジェクト構造

```
dns-osint-pro-ver2.0/
├── 📄 manifest.json          # Chrome拡張機能の設定ファイル
├── 🎨 popup.html             # ポップアップUIのHTML
├── ⚙️ popup.js               # メインロジック（フロントエンド）
├── 🎨 styles.css             # スタイルシート
├── 🔧 background.js          # バックグラウンドスクリプト（API呼び出し）
├── 🛠️ utils.js               # ユーティリティ関数（DNS/RDAP）
├── 📄 options.html           # オプションページ
├── ⚙️ options.js             # オプション設定
│
├── 📁 icons/                 # アイコン画像
│   ├── icon16.png           # 16x16 ツールバーアイコン
│   ├── icon32.png           # 32x32
│   ├── icon48.png           # 48x48
│   ├── icon128.png          # 128x128 拡張機能ストア用
│   └── kimito-link.jpg      # ヘッダーロゴ
│
├── 📁 images/                # キャラクター画像
│   ├── link.png             # りんく
│   ├── konta.png            # こん太
│   ├── tanu-nee.png         # たぬ姉
│   └── rev.png              # Reverse Rebirth Hackロゴ
│
├── 📁 docs/                  # ドキュメント
│   ├── USAGE.md             # 使用方法の詳細
│   ├── DEVELOPMENT.md       # 開発者向けガイド
│   ├── API.md               # API仕様書
│   └── screenshot.png       # スクリーンショット
│
├── 📁 .claude/               # Claude AI設定
├── 📁 .claude-flow/          # Claude Flow設定
├── 📁 src/                   # 追加ソースコード（将来の拡張用）
│
├── 📄 README.md              # このファイル
├── 📄 CHANGELOG.md           # 変更履歴
├── 📄 LICENSE                # MITライセンス
└── 📄 package.json           # npm設定（将来の拡張用）
```

---

## 🛠️ 技術仕様

### 使用技術

- **Manifest Version**: 3（最新のChrome拡張機能形式）
- **JavaScript**: Vanilla JS（フレームワーク不使用）
- **DNS over HTTPS**: Cloudflare DoH API
- **RDAP**: RDAP.org API
- **サジェストAPI**: Google Suggest、Yahoo!、Bing

### 必要な権限

```json
{
  "permissions": [
    "activeTab",      // 現在のタブ情報の取得
    "storage",        // 設定の保存
    "tabs",           // タブ情報の取得
    "contextMenus"    // 右クリックメニュー
  ],
  "host_permissions": [
    "https://cloudflare-dns.com/*",
    "https://rdap.org/*",
    "https://suggestqueries.google.com/*",
    "https://search.yahoo.co.jp/*",
    "https://api.bing.com/*"
  ]
}
```

### DNS over HTTPS (DoH)

プライバシー保護のため、Cloudflare DoHを使用してDNSクエリを暗号化しています。

**エンドポイント:**
```
https://cloudflare-dns.com/dns-query
```

**対応レコードタイプ:**
- A (IPv4)
- AAAA (IPv6)
- MX (Mail Exchange)
- NS (Name Server)
- TXT (Text)
- CNAME (Canonical Name)
- PTR (Pointer - 逆引き)

---

## 🔧 開発者向け情報

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/dns-osint-pro-ver2.0.git
cd dns-osint-pro-ver2.0

# Chrome拡張機能として読み込む
# chrome://extensions/ → デベロッパーモード ON → パッケージ化されていない拡張機能を読み込む
```

### デバッグ方法

1. **拡張機能のリロード**
   - コード変更後、`chrome://extensions/` で更新ボタン（🔄）をクリック

2. **コンソールログの確認**
   - ポップアップを右クリック → 「検証」
   - バックグラウンドスクリプト: 拡張機能の「service worker」をクリック

3. **ネットワーク通信の確認**
   - DevTools → Network タブ

### コードの主要部分

#### popup.js - メインロジック
```javascript
// DNS情報取得
const aSet = await U.dohQuery(domain, "A");

// サジェスト取得
const response = await chrome.runtime.sendMessage({
  type: 'getSuggests',
  query: searchName
});

// サイト健康診断
const healthResult = await chrome.runtime.sendMessage({
  type: 'analyzeSiteHealth',
  domain: domain
});
```

#### background.js - バックグラウンド処理
```javascript
// サジェスト取得
async function fetchGoogleSuggest(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[1] || [];
}
```

#### utils.js - ユーティリティ
```javascript
// DoH クエリ
async dohQuery(name, type) {
  const url = `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`;
  const res = await fetch(url, {
    headers: { accept: "application/dns-json" }
  });
  return await res.json();
}
```

---

## 📝 変更履歴

詳細は [CHANGELOG.md](CHANGELOG.md) を参照してください。

### v5.2.0 (2025-10-05) - **Current**
- ✨ **サイト名抽出機能の大幅強化**: 医療機関・施設名を優先検出
- ✨ **サジェストのリンク化**: クリックで各検索エンジンへジャンプ
- ✨ **口コミサイトリンク追加**: Googleマップ、転職会議など主要サイトへの直接リンク
- 🎨 **パックマンアニメーション改善**: りんくのサイズ拡大（45px→60px）とバウンド動作
- 🎨 **UI/UXの大幅改善**: レイアウト・視認性の向上

### v5.1.0 (2025-10-05)
- ✨ サイト健康診断機能を追加
- ✨ WordPressバージョン検出機能
- ✨ メールセキュリティ診断（SPF/DKIM/DMARC）
- ✨ キャラクター案内機能（りんく、こん太、たぬ姉）
- 🐛 サジェスト取得のエラーハンドリング改善
- 🎨 UI/UXの大幅改善

### v5.0.0 (2025-10-04)
- ✨ Google/Yahoo/Bingサジェスト取得機能
- ✨ 風評被害キーワード自動検出
- ✨ サイト名自動抽出機能
- 🔧 Manifest V3への完全対応

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- **JavaScript**: ES6+を使用
- **インデント**: スペース2個
- **命名規則**: camelCase
- **コメント**: 日本語OK
- **コミットメッセージ**: 日本語または英語

---

## 📄 ライセンス

このプロジェクトは **MIT License** の下で公開されています。

```
MIT License

Copyright (c) 2025 Reverse Rebirth Hack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

詳細は [LICENSE](LICENSE) ファイルをご覧ください。

---

## 🙏 謝辞

### 使用しているサービス・API

- **Cloudflare DoH**: DNS over HTTPS によるプライバシー保護されたDNS解決
- **Google Suggest API**: リアルタイムサジェスト取得
- **Yahoo! Search API**: 日本語サジェスト取得
- **Bing Autosuggest**: 多言語サジェスト対応
- **RDAP**: 次世代WHOIS情報プロトコル

### インスピレーション

- [MxToolbox](https://mxtoolbox.com/) - DNS診断ツール
- [SecurityTrails](https://securitytrails.com/) - OSINT調査
- [BuiltWith](https://builtwith.com/) - 技術スタック解析

---

## 💼 ビジネス利用

このツールは、以下のサービスを提供する**リバースハック**が開発しています：

- 🚨 **風評被害対策** - ネガティブサジェストの削除・対策
- 🔒 **Webセキュリティ診断** - サイトの脆弱性チェック
- 💻 **ITインフラサポート** - サーバー管理・保守

### 無料相談

#### 🚨 風評被害・サジェスト対策
📱 [リバースハックに相談（風評対策）](https://lin.ee/X2aWSFO)

#### 💻 サイト診断・ITインフラサポート
💻 [リバースハックに相談（ITインフラ・WordPress・PHP・SEO）](https://lin.ee/lrjVHvH)

---

## 📧 サポート・お問い合わせ

### Issue報告

バグ報告や機能リクエストは [GitHub Issues](https://github.com/yourusername/dns-osint-pro-ver2.0/issues) まで

### 商用サポート

風評被害対策やWEBサイトのセキュリティ診断の商用サポートは、以下からお問い合わせください：

- 📱 **風評対策LINE**: [リバースハック（風評対策・サジェスト削除）](https://lin.ee/X2aWSFO)
- 💻 **ITインフラLINE**: [リバースハック（ITインフラ・WordPress・PHP・SEO）](https://lin.ee/lrjVHvH)
- 🌐 **公式サイト**: https://reverse-rebirth-hack.com
- 📧 **Email**: info@reverse-re-birth-hack.com

---

## 🔗 関連リンク

- [Chrome Web Store](https://chrome.google.com/webstore)（公開準備中）
- [使用方法詳細](docs/USAGE.md)
- [開発者ガイド](docs/DEVELOPMENT.md)
- [API仕様書](docs/API.md)
- [リバースハック公式サイト](https://reverse-rebirth-hack.com)

---

## 🌟 スターをお願いします！

このプロジェクトが役に立ったら、GitHubでスター⭐をお願いします！

---

<p align="center">
  <img src="images/link.png" width="80" />
  <img src="images/konta.png" width="80" />
  <img src="images/tanu-nee.png" width="80" />
</p>

<p align="center">
  <strong>Made with ❤️ by 君斗りんく & Reverse Rebirth Hack Team</strong>
</p>

<p align="center">
  <a href="https://reverse-rebirth-hack.com">🌐 Website</a> •
  <a href="https://lin.ee/X2aWSFO">🚨 風評対策LINE</a> •
  <a href="https://lin.ee/lrjVHvH">💻 ITインフラLINE</a> •
  <a href="https://github.com/yourusername/dns-osint-pro-ver2.0/issues">🐛 Report Bug</a> •
  <a href="https://github.com/yourusername/dns-osint-pro-ver2.0/issues">💡 Request Feature</a>
</p>
