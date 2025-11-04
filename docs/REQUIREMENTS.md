# DNS OSINT Pro ver2.0 - 要件定義書

最終更新: 2025-11-04

---

## 📋 目次

1. [システム概要](#システム概要)
2. [ユーザータイプ](#ユーザータイプ)
3. [主要機能](#主要機能)
4. [技術要件](#技術要件)
5. [データ設計](#データ設計)
6. [開発フェーズ](#開発フェーズ)

---

## 🎯 システム概要

### プロジェクト名
**DNS OSINT Pro ver2.0**

**正式名称:** 君斗りんくのWEBサイト健康診断＆OSINT Helper

**キャッチフレーズ:** ドメイン情報を一括で取得する総合OSINT調査ツール

### プロジェクトの目的

Chrome拡張機能として動作するOSINT（Open Source Intelligence）ツール。ドメインに関する情報を包括的に収集・分析し、セキュリティ研究者、Webサイト管理者、風評被害対策の専門家に必要な情報を提供する。

### ターゲットユーザー

#### 1. セキュリティ研究者 🔒
- サイバーセキュリティエンジニア
- ペネトレーションテスター
- 脆弱性診断担当者
- インシデント対応チーム

#### 2. Webサイト管理者 👤
- サーバー管理者
- システム管理者
- ドメイン管理者
- IT部門担当者

#### 3. 風評被害対策の専門家 🚨
- 風評被害コンサルタント
- デジタルマーケター
- 企業の広報担当者
- 弁護士・法律事務所

#### 4. Web制作者・開発者 💻
- フロントエンドエンジニア
- バックエンドエンジニア
- インフラエンジニア
- フリーランス

### 主要機能サマリー

- **DNS情報取得**: A/AAAA/MX/NS/TXT/CNAME/PTRレコード
- **WHOIS/RDAP情報**: ドメイン・IP登録情報
- **サイト健康診断**: WordPress検出、セキュリティヘッダー、SEO分析
- **風評被害チェック**: サジェスト汚染検出、ネガティブキーワード警告
- **メールセキュリティ**: SPF/DKIM/DMARC診断
- **サーバー識別**: 使用しているホスティング会社の自動判定
- **口コミサイト連携**: Googleマップ、転職会議などへの直接リンク

---

## 👥 ユーザータイプ

### 一般ユーザー（Chrome拡張機能利用者）

| 機能 | 権限 |
|------|------|
| 拡張機能インストール | ✅ 誰でも可能 |
| ドメイン情報取得 | ✅ 制限なし |
| DNS/WHOIS情報取得 | ✅ 制限なし |
| サジェスト分析 | ✅ 制限なし |
| サイト健康診断 | ✅ 制限なし |
| 履歴管理 | ✅ ローカル保存のみ |
| データエクスポート | ✅ CSV/JSON |

### 管理者（将来実装予定）

| 機能 | 権限 |
|------|------|
| 統計閲覧 | ✅ 利用統計 |
| 機能制限 | ✅ API制限設定 |
| ログ管理 | ✅ エラーログ閲覧 |

---

## 🗄️ データ設計

### Chrome Storage (ローカルストレージ)

#### 1. 検索履歴（searchHistory）

```json
{
  "searchHistory": [
    {
      "domain": "example.com",
      "timestamp": 1699000000000,
      "type": "auto"
    }
  ]
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| domain | string | 検索したドメイン名 |
| timestamp | number | 検索日時（UNIX時間） |
| type | string | 'auto'（自動）または 'manual'（手動） |

#### 2. 設定情報（settings）

```json
{
  "settings": {
    "autoAnalyze": true,
    "showNegativeKeywords": true,
    "maxHistoryCount": 50
  }
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| autoAnalyze | boolean | 自動分析の有効/無効 |
| showNegativeKeywords | boolean | ネガティブキーワード表示 |
| maxHistoryCount | number | 履歴保存件数上限 |

### API レスポンスデータ構造

#### DNS情報

```json
{
  "A": ["192.0.2.1", "192.0.2.2"],
  "AAAA": ["2001:db8::1"],
  "MX": [
    {"priority": 10, "host": "mail.example.com"}
  ],
  "NS": ["ns1.example.com", "ns2.example.com"],
  "TXT": ["v=spf1 include:_spf.example.com ~all"],
  "CNAME": "www.example.com"
}
```

#### RDAP（WHOIS）情報

```json
{
  "domain": "example.com",
  "registrar": "Example Registrar Inc.",
  "registrationDate": "2000-01-01",
  "expirationDate": "2030-01-01",
  "status": ["clientTransferProhibited"],
  "nameservers": ["ns1.example.com", "ns2.example.com"]
}
```

#### サジェスト情報

```json
{
  "google": ["example", "example 評判", "example 口コミ"],
  "yahoo": ["example", "example 詐欺", "example ブラック"],
  "bing": ["example", "example reviews"]
}
```

#### サイト健康診断結果

```json
{
  "wordpress": {
    "detected": true,
    "version": "6.3.2",
    "isLatest": false
  },
  "https": {
    "enabled": true,
    "redirect": true
  },
  "securityHeaders": {
    "xFrameOptions": "DENY",
    "xContentTypeOptions": "nosniff",
    "strictTransportSecurity": "max-age=31536000"
  },
  "performance": {
    "gzip": true,
    "brotli": false,
    "cache": true
  }
}
```

---

## ✨ 主要機能

### 1. DNS情報取得機能 🔎

#### 目的
ドメインのDNS設定を包括的に取得し、サーバー構成を把握する。

#### 取得情報
- **Aレコード**: IPv4アドレス
- **AAAAレコード**: IPv6アドレス
- **MXレコード**: メールサーバー（優先度付き）
- **NSレコード**: ネームサーバー
- **TXTレコード**: SPF/DKIM/DMARC等
- **CNAMEレコード**: エイリアス
- **PTRレコード**: 逆引き（IPからホスト名）

#### 実装方法
- Cloudflare DNS over HTTPS (DoH) API使用
- 暗号化通信でプライバシー保護
- 複数レコードタイプの並列取得

#### エラーハンドリング
- DNS解決失敗時の適切なエラーメッセージ
- タイムアウト処理（5秒）
- リトライ機能（最大3回）

---

### 2. WHOIS/RDAP情報取得機能 🏢

#### 目的
ドメインとIPアドレスの登録情報を取得。

#### 取得情報
- **ドメイン情報**:
  - 登録日・有効期限
  - レジストラ
  - ドメインステータス
  - ネームサーバー
- **IP情報**:
  - 組織名
  - 国・地域
  - IP範囲（CIDR）
  - 連絡先情報

#### 実装方法
- RDAP.org API使用
- 次世代WHOISプロトコル対応
- JSONレスポンス解析

---

### 3. サイト健康診断機能 🏥

#### 目的
現在アクセスしているサイトの技術スタックとセキュリティ設定を診断。

#### 診断項目

##### WordPress検出
- WordPress使用の有無
- バージョン検出（wp-includes/version.php）
- 最新版との比較
- セキュリティリスク評価

##### HTTPS設定
- HTTPS対応の確認
- HTTP→HTTPSリダイレクト確認
- 混在コンテンツチェック

##### セキュリティヘッダー
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- Content-Security-Policy
- X-XSS-Protection

##### SEO分析
- タイトルタグ
- メタディスクリプション
- Canonical URL
- OGPタグ

##### パフォーマンス
- Gzip圧縮
- Brotli圧縮
- キャッシュ設定

#### キャラクター案内
- **りんく（緑）**: 良好な設定を褒める
- **こん太（オレンジ）**: 改善点をアドバイス
- **たぬ姉（赤）**: 深刻な問題を警告

---

### 4. 風評被害・サジェスト汚染チェック機能 🚨

#### 目的
検索エンジンのサジェスト機能を利用し、風評被害の可能性を検出。

#### 対応検索エンジン
- **Google**: リアルタイムサジェスト
- **Yahoo!**: 日本語サジェスト
- **Bing**: 多言語サジェスト

#### サイト名自動抽出

医療機関・施設名を優先的に検出：

```
優先パターン:
- 〜医院、〜クリニック、〜病院、〜診療所
- 〜サロン、〜美容室、〜エステ
- 〜整体院、〜接骨院、〜鍼灸院
- 〜レストラン、〜カフェ、〜居酒屋
- 〜塾、〜ジム、〜法律事務所
```

#### ネガティブキーワード検出

以下のキーワードを検出時、赤字ハイライト表示：

```
詐欺、被害、危険、怪しい、最悪、ブラック、やばい、
トラブル、悪質、悪い、悪評、炎上、問題、クレーム、
苦情、評判悪い、倒産、閉鎖、パワハラ、セクハラ、事件
```

#### 風評被害アラート
ネガティブキーワードが検出された場合：
- 大きな警告ボックス表示
- 検出されたキーワード一覧表示
- 相談リンク表示

#### サジェストのリンク化
各サジェストキーワードに検索結果へのリンクを追加：
- Googleで検索
- Yahoo!で検索
- Bingで検索

---

### 5. メールセキュリティ診断機能 📧

#### 目的
メール送信の信頼性とセキュリティを診断。

#### 診断項目

##### SPFレコード（Sender Policy Framework）
- SPFレコード存在確認
- 設定内容の解析
- 推奨設定との比較

##### DKIMレコード（DomainKeys Identified Mail）
- 一般的なセレクタの自動検索
  - default._domainkey
  - google._domainkey
  - selector1._domainkey
  - selector2._domainkey
- DKIM公開鍵の確認
- 設定状況の評価

##### DMARCレコード
- DMARCポリシー確認
- レポート送信先確認
- 推奨設定との比較

#### リスク警告
設定不備がある場合の警告：
- 迷惑メール判定のリスク
- なりすまし（フィッシング）のリスク
- メール配信率低下のリスク
- ドメイン信頼性低下のリスク

---

### 6. サーバー会社自動識別機能 🖥️

#### 目的
IPアドレス、ホスト名、レジストラ情報から、使用しているホスティング会社を自動判定。

#### 対応サーバー

**日本のホスティング:**
- Xサーバー
- ロリポップ
- さくらインターネット
- お名前ドットコム
- ムームードメイン
- ConoHa
- カラフルボックス
- mixhost
- heteml
- コアサーバー
- KAGOYA

**海外クラウド:**
- Cloudflare
- Amazon Web Services (AWS)
- Google Cloud Platform (GCP)
- Microsoft Azure
- DigitalOcean
- Linode
- Vultr

#### 識別方法
1. IPアドレス範囲による判定
2. ホスト名パターンマッチング
3. レジストラ情報による判定
4. WHOISの組織名による判定

---

### 7. 口コミサイト連携機能 💬

#### 目的
主要な口コミサイトへの直接リンクを提供。

#### 対応サイト

**総合口コミ:**
- Googleマップ
- Yahoo!知恵袋
- みん評

**企業評判:**
- 転職会議
- OpenWork
- エン ライトハウス
- Indeed

#### 機能
- サイト名自動抽出
- 各口コミサイトの検索URL生成
- ワンクリックで該当ページへジャンプ

---

### 8. 履歴管理機能 📋

#### 目的
過去に検索したドメインを保存し、再検索を容易にする。

#### 機能
- 検索ごとに自動保存
- タイムスタンプ付き
- 最大50件まで保存
- 古いものから自動削除
- 履歴からワンクリック再検索
- 履歴のクリア機能

#### データ保存
- chrome.storage.local使用
- 端末内にのみ保存
- 外部サーバーへの送信なし

---

### 9. データエクスポート機能 💾

#### 目的
取得した情報をコピー・ダウンロードして保存。

#### エクスポート形式
- **テキストコピー**: クリップボードへコピー
- **JSON形式**: 構造化データとしてダウンロード
- **CSV形式**（将来実装）: 表計算ソフトで開く

#### エクスポート内容
- DNS情報
- WHOIS情報
- サジェスト一覧
- サイト健康診断結果

---

## 🛠 技術要件

### 必須環境

| 項目 | 要件 |
|------|------|
| ブラウザ | Chrome 88+ / Edge 88+ / Brave 1.20+ |
| Manifest Version | 3 |
| 言語 | JavaScript (ES6+) |
| フレームワーク | Vanilla JS（不使用） |

### 必要な権限

```json
{
  "permissions": [
    "activeTab",      // 現在のタブ情報の取得
    "storage",        // 設定・履歴の保存
    "tabs",           // タブ情報の取得
    "contextMenus"    // 右クリックメニュー
  ],
  "host_permissions": [
    "https://cloudflare-dns.com/*",
    "https://rdap.org/*",
    "https://suggestqueries.google.com/*",
    "https://search.yahoo.co.jp/*",
    "https://api.bing.com/*",
    "http://*/*",
    "https://*/*"
  ]
}
```

### 外部API

| API | 用途 | エンドポイント |
|-----|------|----------------|
| Cloudflare DoH | DNS情報取得 | https://cloudflare-dns.com/dns-query |
| RDAP | WHOIS情報取得 | https://rdap.org/domain/{domain} |
| Google Suggest | サジェスト取得 | https://suggestqueries.google.com/complete/search |
| Yahoo! Suggest | サジェスト取得 | https://search.yahoo.co.jp/realtime/search |
| Bing Autosuggest | サジェスト取得 | https://api.bing.com/osjson.aspx |

---

## 🚀 開発フェーズ

### Phase 1: 基本機能実装 ⚙️

**期間:** 1週間

**ステータス:** ✅ 完了

- ✅ Chrome拡張機能の基本構造作成
- ✅ Manifest V3設定
- ✅ popup.html/popup.js 実装
- ✅ background.js 実装
- ✅ DNS情報取得機能（DoH）
- ✅ WHOIS/RDAP情報取得
- ✅ UI基本デザイン

---

### Phase 2: サジェスト分析機能 🚨

**期間:** 3日

**ステータス:** ✅ 完了

- ✅ Google Suggest API連携
- ✅ Yahoo! Suggest API連携
- ✅ Bing Autosuggest API連携
- ✅ サイト名自動抽出機能
- ✅ ネガティブキーワード検出
- ✅ 風評被害アラート表示
- ✅ サジェストのリンク化

---

### Phase 3: サイト健康診断機能 🏥

**期間:** 3日

**ステータス:** ✅ 完了

- ✅ WordPress検出機能
- ✅ バージョン検出
- ✅ HTTPS確認
- ✅ セキュリティヘッダー解析
- ✅ キャラクター吹き出し実装
- ✅ 診断結果の可視化

---

### Phase 4: メールセキュリティ診断 📧

**期間:** 2日

**ステータス:** ✅ 完了

- ✅ SPFレコード確認
- ✅ DKIMレコード確認（セレクタ自動検索）
- ✅ DMARCレコード確認
- ✅ リスク評価・警告表示

---

### Phase 5: UI/UX改善 🎨

**期間:** 2日

**ステータス:** ✅ 完了

- ✅ レイアウト最適化
- ✅ パックマンアニメーション
- ✅ ボタンデザイン改善
- ✅ ネガティブキーワードの赤字ハイライト
- ✅ レスポンシブ対応

---

### Phase 6: 口コミサイト連携 💬

**期間:** 1日

**ステータス:** ✅ 完了

- ✅ Googleマップ連携
- ✅ 転職会議連携
- ✅ OpenWork連携
- ✅ その他口コミサイト連携
- ✅ リンク生成ロジック実装

---

### Phase 7: エクスポート機能 💾

**期間:** 1日

**ステータス:** ✅ 完了

- ✅ テキストコピー機能
- ✅ JSON形式ダウンロード
- ✅ クリップボード API使用

---

### Phase 8: Chrome Web Store公開準備 🚀

**期間:** 3日

**ステータス:** ✅ 完了

- ✅ スクリーンショット作成
- ✅ プライバシーポリシー作成
- ✅ ストア掲載情報準備
- ✅ 審査申請

**現在の状態:** 審査待ち

---

### Phase 9: 追加機能（将来実装予定） 🔮

**期間:** 未定

- [ ] サブドメイン探索機能の強化
- [ ] SSL証明書情報の詳細表示
- [ ] Wayback Machine履歴の可視化
- [ ] 複数ドメインの一括診断
- [ ] スケジュール診断（定期監視）
- [ ] メール通知機能
- [ ] レポートエクスポート（PDF/CSV）

---

### Phase 10: AI機能統合（長期計画） 🤖

**期間:** 未定

- [ ] AI による自動診断・レポート生成
- [ ] 異常検知アルゴリズム
- [ ] 予測分析機能
- [ ] 自動改善提案

---

## 📊 非機能要件

### パフォーマンス

| 指標 | 目標値 |
|------|--------|
| 初回起動時間 | < 500ms |
| DNS情報取得 | < 2秒 |
| サジェスト取得 | < 3秒 |
| サイト健康診断 | < 3秒 |
| メモリ使用量 | < 50MB |

### セキュリティ

- HTTPS強制（すべてのAPI通信）
- XSS対策（入力値のサニタイズ）
- CSP（Content Security Policy）設定
- 最小権限の原則
- プライバシー保護（ローカルストレージのみ使用）

### ブラウザサポート

- Chrome 88+
- Edge 88+
- Brave 1.20+
- Opera 74+

### アクセシビリティ

- WCAG 2.1 AA準拠（目標）
- キーボード操作対応
- スクリーンリーダー対応（基本）

---

## 📝 補足資料

### 参照ドキュメント

- [PROJECT.md](PROJECT.md) - プロジェクト構成
- [USAGE.md](USAGE.md) - 使用方法の詳細
- [DEVELOPMENT.md](DEVELOPMENT.md) - 開発者向けガイド
- [API.md](API.md) - API仕様書
- [TODO.md](TODO.md) - タスクリスト
- [WORKFLOW.md](WORKFLOW.md) - 開発ワークフロー
- [DESIGN.md](DESIGN.md) - デザイン仕様

### 外部リソース

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Cloudflare DoH](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/)
- [RDAP Protocol](https://www.icann.org/rdap)

---

<div align="center">

**DNS OSINT Pro ver2.0 - 要件定義書**

君斗りんくのWEBサイト健康診断＆OSINT調査ツール

最終更新: 2025-11-04

</div>
