# DNS OSINT Pro ver2.0 - 技術仕様書（SPEC）

最終更新: 2025-11-04

---

## 📋 目次

1. [システムアーキテクチャ](#システムアーキテクチャ)
2. [データフロー](#データフロー)
3. [API仕様](#api仕様)
4. [モジュール設計](#モジュール設計)
5. [データモデル](#データモデル)
6. [セキュリティ設計](#セキュリティ設計)
7. [パフォーマンス要件](#パフォーマンス要件)
8. [エラーハンドリング](#エラーハンドリング)

---

## 🏗️ システムアーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────┐
│                    Chrome Browser                   │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  popup.html  │  │ options.html │  │ background.js│ │
│  │  (UI Layer)  │  │  (Settings)  │  │(Service Worker)│
│  └──────┬───────┘  └──────────────┘  └───────┬──────┘ │
│         │                                      │        │
│  ┌──────▼──────────────────────────────────────▼─────┐ │
│  │              Core Logic Layer                     │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  popup.js   utils.js   ui-components.js          │ │
│  │  link-templates.js                               │ │
│  └───────┬───────────────────────────────────────────┘ │
│          │                                             │
│  ┌───────▼─────────────────────────────────────────┐ │
│  │          Chrome Storage API (Local)              │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
         ┌──────────────▼──────────────┐
         │    External APIs            │
         ├─────────────────────────────┤
         │ • Cloudflare DoH            │
         │ • RDAP                      │
         │ • Google Suggest            │
         │ • Yahoo Suggest             │
         │ • Bing Autosuggest          │
         │ • Wayback Machine           │
         │ • crt.sh                    │
         │ • SecurityTrails            │
         │ • IPdata                    │
         │ • WhoisXML API              │
         └─────────────────────────────┘
```

### レイヤー構成

#### 1. Presentation Layer（UI層）
- **popup.html**: メインUIの構造
- **options.html**: 設定画面
- **styles.css**: スタイル定義
- **ui-components.js**: UIコンポーネント（キャラクター表示等）

#### 2. Application Layer（アプリケーション層）
- **popup.js**: メインロジック（6,000行）
- **background.js**: バックグラウンド処理
- **utils.js**: ユーティリティ関数
- **link-templates.js**: リンクテンプレート

#### 3. Data Layer（データ層）
- **chrome.storage.local**: ローカルストレージ
  - 検索履歴
  - 設定情報

#### 4. External Integration Layer（外部連携層）
- DNS over HTTPS API
- RDAP API
- Suggest APIs
- その他外部API

---

## 🔄 データフロー

### 1. ドメイン情報取得フロー

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. ドメイン入力
       ▼
┌─────────────┐
│  popup.js   │
└──────┬──────┘
       │ 2. バリデーション
       ▼
┌─────────────┐
│  utils.js   │───┐
│ getDNSInfo()│   │ 3. DNS情報取得
└──────┬──────┘   │
       │          │
       │          ▼
       │    ┌──────────────┐
       │    │ Cloudflare   │
       │    │   DoH API    │
       │    └──────┬───────┘
       │           │ 4. レスポンス
       │◄──────────┘
       │
       │ 5. データ整形
       ▼
┌─────────────┐
│ popup.html  │
│ (DOM更新)   │
└─────────────┘
```

### 2. WHOIS/RDAP情報取得フロー

```
┌─────────────┐
│  popup.js   │
└──────┬──────┘
       │ 1. ドメイン/IP入力
       ▼
┌─────────────┐
│  utils.js   │───┐
│getRDAPInfo()│   │ 2. RDAP照会
└──────┬──────┘   │
       │          ▼
       │    ┌──────────────┐
       │    │   RDAP       │
       │    │   Server     │
       │    └──────┬───────┘
       │           │ 3. JSON レスポンス
       │◄──────────┘
       │
       │ 4. パース・整形
       ▼
┌─────────────┐
│   UI表示    │
└─────────────┘
```

### 3. サジェスト取得フロー

```
┌─────────────┐
│  popup.js   │
└──────┬──────┘
       │ 1. サイト名抽出
       ▼
┌────────────────────────────────┐
│   並列API呼び出し                │
├────────────────────────────────┤
│  Google  │  Yahoo  │   Bing    │
└─────┬────┴────┬────┴─────┬─────┘
      │         │          │
      │         │          │ 2. サジェスト取得
      ▼         ▼          ▼
┌─────────────────────────────────┐
│      結果統合・ネガティブ検出      │
└───────────────┬─────────────────┘
               │ 3. UI更新
               ▼
┌─────────────────────────────────┐
│    風評被害アラート表示           │
│    ネガティブキーワード赤字表示    │
└─────────────────────────────────┘
```

---

## 🔌 API仕様

### 1. DNS over HTTPS (Cloudflare)

**エンドポイント**: `https://cloudflare-dns.com/dns-query`

**メソッド**: GET

**パラメータ**:
```javascript
{
  name: 'example.com',  // ドメイン名
  type: 'A',            // レコードタイプ (A, AAAA, MX, TXT, NS, CNAME, PTR)
}
```

**レスポンス例**:
```json
{
  "Status": 0,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": false,
  "CD": false,
  "Question": [
    {
      "name": "example.com.",
      "type": 1
    }
  ],
  "Answer": [
    {
      "name": "example.com.",
      "type": 1,
      "TTL": 300,
      "data": "93.184.216.34"
    }
  ]
}
```

### 2. RDAP (Registration Data Access Protocol)

**ドメイン用エンドポイント**: `https://rdap.verisign.com/com/v1/domain/{domain}`

**IP用エンドポイント**: `https://rdap.arin.net/registry/ip/{ip}`

**メソッド**: GET

**レスポンス例**:
```json
{
  "objectClassName": "domain",
  "handle": "123456_DOMAIN_COM-VRSN",
  "ldhName": "example.com",
  "events": [
    {
      "eventAction": "registration",
      "eventDate": "1995-08-14T04:00:00Z"
    },
    {
      "eventAction": "expiration",
      "eventDate": "2024-08-13T04:00:00Z"
    }
  ],
  "status": [
    "client delete prohibited",
    "client transfer prohibited",
    "client update prohibited"
  ],
  "nameservers": [
    {
      "objectClassName": "nameserver",
      "ldhName": "a.iana-servers.net"
    }
  ]
}
```

### 3. Google Suggest API

**エンドポイント**: `https://suggestqueries.google.com/complete/search`

**メソッド**: GET

**パラメータ**:
```javascript
{
  client: 'firefox',
  q: 'example',  // 検索クエリ
  hl: 'ja'       // 言語（日本語）
}
```

**レスポンス例**:
```json
[
  "example",
  [
    "example 評判",
    "example 口コミ",
    "example とは",
    "example 詐欺",
    "example ブラック"
  ]
]
```

### 4. Yahoo! Suggest API

**エンドポイント**: `https://search.yahoo.co.jp/sugg/gossip/gossip-gl-msg/`

**メソッド**: GET

**パラメータ**:
```javascript
{
  output: 'json',
  p: 'example'  // 検索クエリ
}
```

### 5. Bing Autosuggest API

**エンドポイント**: `https://www.bing.com/AS/Suggestions`

**メソッド**: GET

**パラメータ**:
```javascript
{
  qry: 'example',  // 検索クエリ
  cvid: randomId
}
```

---

## 🧩 モジュール設計

### 1. popup.js

**責務**: メインUIロジック

**主要関数**:

```javascript
// ドメイン取得
async function getCurrentDomain()

// DNS情報取得
async function getDNSInfo(domain)

// WHOIS/RDAP情報取得
async function getWhoisInfo(domain)

// サジェスト取得
async function getSuggests(siteName)

// サイト健康診断
async function checkSiteHealth(domain)

// メールセキュリティ診断
async function checkEmailSecurity(domain)

// ネガティブキーワード検出
function detectNegativeKeywords(suggests)

// 風評被害アラート表示
function showReputationAlert()

// 履歴管理
async function saveHistory(domain)
async function loadHistory()

// エクスポート
function exportResults()
function downloadJSON()
```

### 2. utils.js

**責務**: ユーティリティ関数

**主要関数**:

```javascript
// DNS情報取得（Cloudflare DoH）
async function queryDNS(domain, type)

// RDAP情報取得
async function queryRDAP(domain)

// ドメインのバリデーション
function isValidDomain(domain)

// IPアドレスのバリデーション
function isValidIP(ip)

// URLからドメイン抽出
function extractDomain(url)

// タイムアウト処理
async function withTimeout(promise, ms)

// リトライ処理
async function retry(fn, maxRetries)
```

### 3. ui-components.js

**責務**: UIコンポーネント生成

**主要関数**:

```javascript
// りんくの吹き出し表示（成功）
function showRinkMessage(message)

// こん太の吹き出し表示（警告）
function showKontaMessage(message)

// たぬ姉の吹き出し表示（危険）
function showTanuMessage(message)

// パックマンアニメーション
function showPacmanAnimation()

// ローディング表示
function showLoading()
function hideLoading()
```

### 4. link-templates.js

**責務**: 口コミサイトリンク生成

**主要関数**:

```javascript
// Googleマップリンク生成
function generateGoogleMapsLink(siteName)

// 転職会議リンク生成
function generateJobkaigiLink(siteName)

// OpenWorkリンク生成
function generateOpenWorkLink(siteName)

// その他口コミサイトリンク生成
...
```

### 5. background.js

**責務**: バックグラウンド処理

**主要機能**:
- 右クリックメニュー登録
- メッセージリスナー
- API呼び出し（必要に応じて）

---

## 📊 データモデル

### 1. DNS情報

```typescript
interface DNSInfo {
  A: string[];              // IPv4アドレス
  AAAA: string[];           // IPv6アドレス
  MX: MXRecord[];           // メールサーバー
  NS: string[];             // ネームサーバー
  TXT: string[];            // TXTレコード
  CNAME: string | null;     // CNAME
  PTR: string | null;       // 逆引き
}

interface MXRecord {
  priority: number;
  host: string;
}
```

### 2. WHOIS/RDAP情報

```typescript
interface RDAPInfo {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  status: string[];
  nameservers: string[];
  contacts?: Contact[];
}

interface Contact {
  role: string;          // registrant, admin, tech
  name?: string;
  organization?: string;
  email?: string;
}
```

### 3. サジェスト情報

```typescript
interface SuggestInfo {
  google: string[];
  yahoo: string[];
  bing: string[];
  negativeKeywords: string[];  // 検出されたネガティブキーワード
  hasReputation: boolean;       // 風評被害の有無
}
```

### 4. サイト健康診断結果

```typescript
interface SiteHealthResult {
  wordpress: {
    detected: boolean;
    version?: string;
    isLatest?: boolean;
  };
  https: {
    enabled: boolean;
    redirect: boolean;
  };
  securityHeaders: {
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    strictTransportSecurity?: string;
    contentSecurityPolicy?: string;
    xXSSProtection?: string;
  };
}
```

### 5. メールセキュリティ診断結果

```typescript
interface EmailSecurityResult {
  spf: {
    exists: boolean;
    record?: string;
    valid: boolean;
  };
  dkim: {
    selectors: string[];  // 検出されたセレクタ
    records: string[];
  };
  dmarc: {
    exists: boolean;
    record?: string;
    policy?: string;  // none, quarantine, reject
  };
  riskLevel: 'low' | 'medium' | 'high';
}
```

### 6. 検索履歴

```typescript
interface SearchHistory {
  domain: string;
  timestamp: number;  // UNIX時間
  type: 'auto' | 'manual';
}
```

---

## 🔐 セキュリティ設計

### 1. Content Security Policy（CSP）

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
  }
}
```

### 2. 権限の最小化

```json
{
  "permissions": [
    "activeTab",     // 現在のタブ情報取得のみ
    "storage",       // ローカルストレージのみ
    "tabs",          // URL情報取得のみ
    "contextMenus"   // 右クリックメニューのみ
  ]
}
```

### 3. データの暗号化

- ユーザーデータは **収集しない**
- 検索履歴は **ローカルストレージのみ**に保存
- 外部サーバーへの送信は **一切なし**

### 4. API通信のセキュリティ

- すべての外部API通信は **HTTPS**
- API キーは **使用しない**（公開APIのみ使用）
- タイムアウト設定（10秒）
- リトライ制限（最大3回）

---

## ⚡ パフォーマンス要件

### 1. レスポンスタイム

| 機能 | 目標時間 | 最大時間 |
|------|---------|----------|
| DNS情報取得 | 1秒以内 | 3秒 |
| WHOIS情報取得 | 2秒以内 | 5秒 |
| サジェスト取得 | 2秒以内 | 5秒 |
| サイト健康診断 | 3秒以内 | 10秒 |
| UI描画 | 0.1秒以内 | 0.5秒 |

### 2. メモリ使用量

- ポップアップメモリ: **50MB以内**
- Service Worker: **10MB以内**

### 3. API呼び出しの最適化

```javascript
// 並列処理
const results = await Promise.all([
  getDNSInfo(domain),
  getWhoisInfo(domain),
  getSuggests(siteName)
]);

// タイムアウト設定
const result = await withTimeout(apiCall(), 10000);
```

### 4. キャッシュ戦略

```javascript
// DNS情報のキャッシュ（5分間）
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCachedDNS(domain) {
  const cached = cache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

---

## 🚨 エラーハンドリング

### 1. エラーの分類

```typescript
enum ErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  API_ERROR = 'api_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}
```

### 2. エラーハンドリング戦略

```javascript
try {
  const result = await getDNSInfo(domain);
} catch (error) {
  if (error.name === 'TimeoutError') {
    // タイムアウトエラー
    showError('APIがタイムアウトしました。時間をおいて再試行してください。');
  } else if (error.name === 'NetworkError') {
    // ネットワークエラー
    showError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
  } else {
    // その他のエラー
    console.error('Unexpected error:', error);
    showError('予期しないエラーが発生しました。');
  }
}
```

### 3. ユーザーフレンドリーなエラーメッセージ

| エラー | メッセージ |
|--------|------------|
| ドメイン無効 | 「有効なドメイン名を入力してください」 |
| DNS解決失敗 | 「DNS情報を取得できませんでした」 |
| API タイムアウト | 「APIがタイムアウトしました。時間をおいて再試行してください」 |
| ネットワークエラー | 「インターネット接続を確認してください」 |

---

## 🧪 テスト戦略

### 1. ユニットテスト

```javascript
// utils.js のテスト例
describe('isValidDomain', () => {
  it('有効なドメインを正しく判定する', () => {
    expect(isValidDomain('example.com')).toBe(true);
  });
  
  it('無効なドメインを正しく判定する', () => {
    expect(isValidDomain('invalid domain')).toBe(false);
  });
});
```

### 2. E2Eテスト（将来実装）

```javascript
// Playwright を使用したE2Eテスト例
test('DNS情報取得が正常に動作する', async ({ page }) => {
  await page.goto('chrome-extension://.../')
  await page.fill('input[name="domain"]', 'example.com');
  await page.click('button[id="search-btn"]');
  await expect(page.locator('.dns-info')).toBeVisible();
});
```

---

## 📚 参考資料

### 技術仕様
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [DNS over HTTPS (DoH)](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/)
- [RDAP Specification](https://www.icann.org/rdap)

### セキュリティ
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)

---

<div align="center">

**DNS OSINT Pro ver2.0 - Technical Specification**

君と繋がる、WEBサイト健康診断＆OSINT調査ツール

最終更新: 2025-11-04

</div>
