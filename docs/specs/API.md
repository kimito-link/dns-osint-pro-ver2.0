# 📡 API仕様書 (API.md)

DNS OSINT Pro ver2.0で使用している外部APIと内部メッセージングの仕様です。

---

## 目次

1. [外部API](#外部api)
2. [内部メッセージング](#内部メッセージング)
3. [データ構造](#データ構造)

---

## 外部API

### 1. Cloudflare DNS over HTTPS (DoH)

DNS情報を安全に取得するためのAPI。

**エンドポイント:**
```
https://cloudflare-dns.com/dns-query
```

**リクエスト:**
```http
GET /dns-query?name={domain}&type={type} HTTP/1.1
Host: cloudflare-dns.com
Accept: application/dns-json
```

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| name | string | ✅ | ドメイン名またはIPアドレス |
| type | string | ✅ | レコードタイプ（A, AAAA, MX, NS, TXT, CNAME, PTR等） |

**レスポンス:**
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

**使用例:**
```javascript
const response = await fetch(
  'https://cloudflare-dns.com/dns-query?name=example.com&type=A',
  { headers: { accept: 'application/dns-json' } }
);
const data = await response.json();
const ipAddresses = data.Answer.map(record => record.data);
```

**レコードタイプ:**

| タイプ | 番号 | 説明 |
|-------|------|------|
| A | 1 | IPv4アドレス |
| AAAA | 28 | IPv6アドレス |
| MX | 15 | メールサーバー |
| NS | 2 | ネームサーバー |
| TXT | 16 | テキスト情報 |
| CNAME | 5 | エイリアス |
| PTR | 12 | 逆引き |
| SOA | 6 | 権威情報 |

**エラーハンドリング:**
```javascript
if (data.Status !== 0) {
  // Status: 0=成功, 2=サーバーエラー, 3=ドメインが存在しない
  console.error('DNS query failed:', data.Status);
}
```

---

### 2. RDAP (Registration Data Access Protocol)

WHOIS情報の次世代プロトコル。

#### 2.1 ドメインRDAP

**エンドポイント:**
```
https://rdap.org/domain/{domain}
```

**リクエスト:**
```http
GET /domain/example.com HTTP/1.1
Host: rdap.org
Accept: application/rdap+json
```

**レスポンス:**
```json
{
  "objectClassName": "domain",
  "ldhName": "example.com",
  "status": [
    "client transfer prohibited",
    "client delete prohibited"
  ],
  "events": [
    {
      "eventAction": "registration",
      "eventDate": "2020-01-15T00:00:00Z"
    },
    {
      "eventAction": "expiration",
      "eventDate": "2026-01-15T00:00:00Z"
    }
  ],
  "entities": [
    {
      "objectClassName": "entity",
      "roles": ["registrar"],
      "vcardArray": [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "Example Registrar"]
        ]
      ]
    }
  ]
}
```

**使用例:**
```javascript
const response = await fetch('https://rdap.org/domain/example.com', {
  headers: { accept: 'application/rdap+json' }
});
const data = await response.json();

console.log('ドメイン:', data.ldhName);
console.log('ステータス:', data.status);
console.log('登録日:', data.events.find(e => e.eventAction === 'registration')?.eventDate);
```

#### 2.2 IP RDAP

**エンドポイント:**
```
https://rdap.org/ip/{ip_address}
```

**リクエスト:**
```http
GET /ip/8.8.8.8 HTTP/1.1
Host: rdap.org
Accept: application/rdap+json
```

**レスポンス:**
```json
{
  "objectClassName": "ip network",
  "name": "LVLT-GOGL-8-8-8",
  "country": "US",
  "startAddress": "8.8.8.0",
  "endAddress": "8.8.8.255",
  "entities": [
    {
      "objectClassName": "entity",
      "vcard": [
        "vcard",
        [
          ["fn", {}, "text", "Google LLC"],
          ["email", {}, "text", "network-abuse@google.com"]
        ]
      ]
    }
  ]
}
```

---

### 3. Google Suggest API

検索サジェストを取得するAPI。

**エンドポイント:**
```
https://suggestqueries.google.com/complete/search
```

**リクエスト:**
```http
GET /complete/search?client=firefox&q={query} HTTP/1.1
Host: suggestqueries.google.com
```

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| client | string | ✅ | クライアントタイプ（firefox推奨） |
| q | string | ✅ | 検索クエリ |
| hl | string | ❌ | 言語コード（ja等） |

**レスポンス:**
```json
[
  "検索ワード",
  [
    "検索ワード 候補1",
    "検索ワード 候補2",
    "検索ワード 候補3"
  ]
]
```

**使用例:**
```javascript
const query = '会社名';
const response = await fetch(
  `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
);
const data = await response.json();
const suggestions = data[1] || [];

console.log('サジェスト:', suggestions);
// ['会社名 採用', '会社名 評判', '会社名 年収', ...]
```

---

### 4. Yahoo! Search Suggest API

Yahoo!のサジェスト取得API。

**エンドポイント:**
```
https://search.yahoo.co.jp/realtime/search/suggest
```

**リクエスト:**
```http
GET /realtime/search/suggest?p={query}&output=json HTTP/1.1
Host: search.yahoo.co.jp
```

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| p | string | ✅ | 検索クエリ |
| output | string | ✅ | 出力形式（json） |

**レスポンス:**
```json
{
  "ResultSet": {
    "Result": [
      { "key": "検索ワード 候補1" },
      { "key": "検索ワード 候補2" }
    ]
  }
}
```

**注意:**
CORS制限により、ブラウザから直接アクセスできない場合があります。

---

### 5. Bing Autosuggest API

Bingのサジェスト取得API。

**エンドポイント:**
```
https://api.bing.com/osjson.aspx
```

**リクエスト:**
```http
GET /osjson.aspx?query={query} HTTP/1.1
Host: api.bing.com
```

**パラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|----------|-----|------|------|
| query | string | ✅ | 検索クエリ |

**レスポンス:**
```json
[
  "検索ワード",
  [
    "検索ワード 候補1",
    "検索ワード 候補2",
    "検索ワード 候補3"
  ]
]
```

---

## 内部メッセージング

Chrome拡張機能内部での通信仕様。

### popup.js → background.js

#### 1. getSuggests

サジェスト情報を取得します。

**リクエスト:**
```javascript
const response = await chrome.runtime.sendMessage({
  type: 'getSuggests',
  query: '会社名'
});
```

**レスポンス:**
```javascript
{
  success: true,
  google: ['候補1', '候補2', '候補3'],
  yahoo: ['候補1', '候補2'],
  bing: ['候補1', '候補2', '候補3']
}
```

**エラー時:**
```javascript
{
  success: true,  // 一部失敗でもtrue
  google: [],
  yahoo: [],
  bing: [],
  error: 'Error message'
}
```

---

#### 2. analyzeSiteHealth

サイト健康診断を実行します。

**リクエスト:**
```javascript
const response = await chrome.runtime.sendMessage({
  type: 'analyzeSiteHealth',
  domain: 'example.com'
});
```

**レスポンス（成功時）:**
```javascript
{
  success: true,
  isWordPress: true,
  wpVersion: '6.4.2',
  issues: [
    'HTTPSが使用されていません',
    'セキュリティヘッダーが不足しています'
  ],
  warnings: [
    'タイトルが短すぎます (25文字)',
    'OGPタグが不完全です'
  ],
  goodPoints: [
    'WWWリダイレクトが正しく設定されています',
    '圧縮が有効です (gzip)'
  ],
  finalUrl: 'https://example.com',
  headers: {
    'content-type': 'text/html; charset=UTF-8',
    'server': 'nginx',
    // ...
  }
}
```

**レスポンス（エラー時）:**
```javascript
{
  success: false,
  error: 'タイムアウト: サイトの応答が遅すぎます（10秒以上）'
}
```

---

#### 3. getSiteInfo

サイトのメタ情報を取得します。

**リクエスト:**
```javascript
const response = await chrome.runtime.sendMessage({
  type: 'getSiteInfo',
  domain: 'example.com'
});
```

**レスポンス:**
```javascript
{
  success: true,
  info: {
    title: 'Example Site | Welcome',
    ogTitle: 'Welcome to Example',
    siteName: 'Example Site'
  }
}
```

---

#### 4. proxyFetch

CORS回避用のプロキシフェッチ。

**リクエスト:**
```javascript
const response = await chrome.runtime.sendMessage({
  type: 'proxyFetch',
  url: 'https://example.com/api/data'
});
```

**レスポンス:**
```javascript
{
  ok: true,
  status: 200,
  text: '...'
}
```

---

## データ構造

### DNSレコード

```typescript
interface DNSRecord {
  name: string;      // ドメイン名
  type: number;      // レコードタイプ番号
  TTL: number;       // Time To Live (秒)
  data: string;      // レコードデータ
}

interface DNSResponse {
  Status: number;    // 0=成功, 2=エラー, 3=存在しない
  TC: boolean;       // Truncated
  RD: boolean;       // Recursion Desired
  RA: boolean;       // Recursion Available
  AD: boolean;       // Authentic Data
  CD: boolean;       // Checking Disabled
  Question: DNSRecord[];
  Answer: DNSRecord[];
}
```

### RDAPドメイン

```typescript
interface RDAPDomain {
  objectClassName: 'domain';
  ldhName: string;           // ドメイン名
  status: string[];          // ステータス
  events: Array<{
    eventAction: string;     // 'registration' | 'expiration' | ...
    eventDate: string;       // ISO 8601形式
  }>;
  entities: Array<{
    objectClassName: 'entity';
    roles: string[];         // ['registrar', 'registrant', ...]
    vcardArray: any[];       // vCard形式の連絡先
  }>;
}
```

### RDAP IP

```typescript
interface RDAPIp {
  objectClassName: 'ip network';
  name: string;              // ネットワーク名
  country: string;           // 国コード
  startAddress: string;      // 開始IPアドレス
  endAddress: string;        // 終了IPアドレス
  entities: Array<{
    objectClassName: 'entity';
    vcard: any[];            // vCard形式の連絡先
  }>;
}
```

### サイト健康診断結果

```typescript
interface SiteHealthResult {
  success: boolean;
  isWordPress: boolean;
  wpVersion: string | null;
  issues: string[];          // 深刻な問題
  warnings: string[];        // 改善推奨
  goodPoints: string[];      // 良好な点
  finalUrl?: string;         // リダイレクト後のURL
  headers?: Record<string, string>;  // HTTPヘッダー
  error?: string;            // エラーメッセージ
}
```

---

## レート制限

### Cloudflare DoH
- **制限**: なし（公式には明記されていない）
- **推奨**: 秒間100リクエスト程度

### Google Suggest
- **制限**: なし（非公式API）
- **推奨**: 秒間10リクエスト程度

### Yahoo! Suggest
- **制限**: CORS制限あり
- **推奨**: 使用は控えめに

### Bing Autosuggest
- **制限**: なし（非公式API）
- **推奨**: 秒間10リクエスト程度

### RDAP
- **制限**: サーバーによる
- **推奨**: 秒間1-2リクエスト程度

---

## エラーコード

### DNS Status Codes

| コード | 意味 |
|-------|------|
| 0 | 成功 |
| 1 | フォーマットエラー |
| 2 | サーバーエラー |
| 3 | ドメインが存在しない (NXDOMAIN) |
| 4 | 未実装 |
| 5 | 拒否 |

### HTTP Status Codes

| コード | 意味 |
|-------|------|
| 200 | 成功 |
| 400 | リクエストエラー |
| 404 | 見つからない |
| 429 | レート制限超過 |
| 500 | サーバーエラー |
| 503 | サービス利用不可 |

---

## セキュリティ

### CSP (Content Security Policy)

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### HTTPS Only

すべての外部API通信はHTTPSで行われます。

### データの取り扱い

- ユーザーの検索履歴は保存されません
- 取得したデータはローカルのみで処理
- 外部サーバーへのデータ送信なし（API呼び出しを除く）

---

## 参考資料

- [DNS over HTTPS (RFC 8484)](https://datatracker.ietf.org/doc/html/rfc8484)
- [RDAP (RFC 7483)](https://datatracker.ietf.org/doc/html/rfc7483)
- [Chrome Extension Messaging](https://developer.chrome.com/docs/extensions/mv3/messaging/)

---

## サポート

APIに関する質問や問題がある場合は、以下からお問い合わせください：

### 🚨 風評被害・サジェスト対策
📱 [りんくが頼りにしているリバースハックに相談（風評対策）](https://lin.ee/X2aWSFO)

### 💻 サイト診断・ITインフラサポート
💻 [りんくが頼りにしているリバースハックに相談（ITインフラ）](https://lin.ee/lrjVHvH)

### その他
- 🐛 [GitHub Issues](https://github.com/yourusername/dns-osint-pro-ver2.0/issues)
- 📧 info@reverse-re-birth-hack.com

---

<p align="center">
  Made with ❤️ by Reverse Rebirth Hack Team
</p>
