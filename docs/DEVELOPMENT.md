# 🛠️ 開発者ガイド (DEVELOPMENT.md)

DNS OSINT Pro ver2.0の開発に参加するための技術ドキュメントです。

---

## 目次

1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [プロジェクト構造](#プロジェクト構造)
3. [コードの説明](#コードの説明)
4. [機能の追加方法](#機能の追加方法)
5. [デバッグ方法](#デバッグ方法)
6. [ビルド・デプロイ](#ビルドデプロイ)
7. [コーディング規約](#コーディング規約)

---

## 開発環境のセットアップ

### 必要なツール

- **Google Chrome** 120以上
- **テキストエディタ**: VS Code推奨
- **Git**: バージョン管理
- **Node.js**: 18.x以上（将来的にビルドツールを導入する場合）

### VS Code 推奨拡張機能

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/yourusername/dns-osint-pro-ver2.0.git
cd dns-osint-pro-ver2.0

# 2. （オプション）npm依存関係のインストール
# npm install

# 3. Chromeで開発者モードで読み込み
# chrome://extensions/ → デベロッパーモード ON
# → パッケージ化されていない拡張機能を読み込む
```

---

## プロジェクト構造

### ファイル一覧と役割

```
dns-osint-pro-ver2.0/
├── manifest.json          ★ Chrome拡張機能の設定ファイル
│   └── バージョン、権限、背景スクリプトの定義
│
├── popup.html             ★ ポップアップUIのHTML
│   └── 拡張機能アイコンクリック時に表示される画面
│
├── popup.js               ★ フロントエンドのメインロジック
│   ├── fetchAll()        - DNS/WHOIS/サジェストを取得
│   ├── checkSuggestPollution() - サジェスト分析
│   ├── extractSiteName() - サイト名抽出
│   └── identifyServer()  - サーバー会社識別
│
├── background.js          ★ バックグラウンド処理（Service Worker）
│   ├── fetchGoogleSuggest() - Googleサジェスト取得
│   ├── fetchYahooSuggest()  - Yahoo!サジェスト取得
│   ├── fetchBingSuggest()   - Bingサジェスト取得
│   └── analyzeSiteHealth()  - サイト健康診断
│
├── utils.js               ★ ユーティリティ関数
│   ├── dohQuery()        - DNS over HTTPS クエリ
│   ├── rdapDomain()      - ドメインRDAP情報取得
│   └── rdapIp()          - IP RDAP情報取得
│
├── styles.css             ★ スタイルシート
│   └── ポップアップのデザイン
│
├── options.html/js        - オプションページ（設定画面）
│
├── icons/                 - アイコン画像
│   ├── icon16.png        (16x16)
│   ├── icon32.png        (32x32)
│   ├── icon48.png        (48x48)
│   ├── icon128.png       (128x128)
│   └── kimito-link.jpg   (ヘッダーロゴ)
│
└── images/                - キャラクター画像
    ├── link.png          (りんく)
    ├── konta.png         (こん太)
    └── tanu-nee.png      (たぬ姉)
```

---

## コードの説明

### manifest.json

Chrome拡張機能の設定ファイルです。

```json
{
  "manifest_version": 3,           // Manifest V3を使用
  "name": "DNS & WHOIS & Wayback – OSINT Helper",
  "version": "5.1.0",              // バージョン番号（Semantic Versioning）
  "permissions": [
    "activeTab",                   // 現在のタブ情報の取得
    "storage",                     // ローカルストレージへのアクセス
    "tabs",                        // タブ操作
    "contextMenus"                 // 右クリックメニュー
  ],
  "host_permissions": [            // アクセスを許可するホスト
    "https://cloudflare-dns.com/*",
    "https://rdap.org/*",
    "https://suggestqueries.google.com/*",
    "https://search.yahoo.co.jp/*",
    "https://api.bing.com/*"
  ],
  "background": {
    "service_worker": "background.js"  // Manifest V3: Service Worker
  }
}
```

### popup.js の主要関数

#### `fetchAll(domain)`
メイン処理。DNS、WHOIS、サジェストなどを順番に取得します。

```javascript
async function fetchAll(domain) {
  if (!domain) return;
  
  clearResults();
  els.resultBody.innerHTML = '';
  
  // 1. サイト健康診断
  addRow("💫 君斗りんくのWEBサイト健康診断！", '...');
  const healthResult = await chrome.runtime.sendMessage({
    type: 'analyzeSiteHealth',
    domain: domain
  });
  
  // 2. サジェスト情報
  addRow("🚨 サジェスト情報", '...');
  const tabTitle = await getActiveTabTitle();
  await checkSuggestPollution(domain, tabTitle);
  
  // 3. DNS情報（A、AAAA、NS、MX、TXT、CNAME）
  const aSet = await U.dohQuery(domain, "A");
  // ...
  
  // 4. WHOIS / RDAP
  const dr = await U.rdapDomain(domain);
  // ...
}
```

#### `extractSiteName(title)`
ページタイトルからサイト名を抽出します。

```javascript
function extractSiteName(title) {
  if (!title) return null;
  
  let siteName = title;
  
  // 1. プレフィックス除去（【公式】など）
  siteName = siteName.replace(/^[【\[](公式|PR|広告)[】\]]\s*/g, '');
  
  // 2. セパレーターで分割
  const separators = ['｜', '|', ' - ', '－', '・', '【', '】'];
  for (const sep of separators) {
    if (siteName.includes(sep)) {
      siteName = siteName.split(sep)[0].trim();
      break;
    }
  }
  
  // 3. 法人格を除去
  siteName = siteName.replace(/^(株式会社|有限会社)\s*/g, '');
  
  return siteName || null;
}
```

#### `identifyServer(text)` / `identifyFromIp(ip)`
サーバー会社を識別します。

```javascript
function identifyServer(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // キーワードマッチング
  if (lower.includes('xserver')) return '🟦 Xサーバー';
  if (lower.includes('lolipop')) return '🍭 ロリポップサーバー';
  // ...
  
  return null;
}

function identifyFromIp(ip) {
  const parts = ip.split('.').map(Number);
  
  // IP範囲マッチング
  if (parts[0] === 160 && parts[1] === 251) return '🟦 XサーバーのIP範囲';
  // ...
  
  return null;
}
```

### background.js の主要関数

#### `analyzeSiteHealth(domain)`
サイト健康診断のメイン処理です。

```javascript
async function analyzeSiteHealth(domain) {
  try {
    const httpsUrl = `https://${domain}`;
    
    // タイムアウト付きでfetch（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(httpsUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const html = await response.text();
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    
    const issues = [];      // 深刻な問題
    const warnings = [];    // 改善推奨
    const goodPoints = [];  // 良好な点
    
    // === チェック処理 ===
    
    // 1. HTTPSチェック
    if (finalUrl.startsWith('https://')) {
      goodPoints.push('HTTPSで保護されています');
    } else {
      issues.push('HTTPSが使用されていません');
    }
    
    // 2. タイトルタグチェック
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title.length < 30) {
        warnings.push(`タイトルが短すぎます (${title.length}文字)`);
      } else if (title.length > 60) {
        warnings.push(`タイトルが長すぎます (${title.length}文字)`);
      } else {
        goodPoints.push('タイトルタグの文字数が適切です');
      }
    }
    
    // 3. WordPress検出
    let isWordPress = false;
    if (html.includes('wp-content') || html.includes('wp-includes')) {
      isWordPress = true;
      // バージョン検出
      const versionMatch = html.match(/<meta name=["']generator["'] content=["']WordPress ([0-9.]+)["']/i);
      if (versionMatch) {
        wpVersion = versionMatch[1];
      }
    }
    
    return {
      success: true,
      isWordPress,
      wpVersion,
      issues,
      warnings,
      goodPoints
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
```

#### `fetchGoogleSuggest(query)`
Googleサジェストを取得します。

```javascript
async function fetchGoogleSuggest(query) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    // レスポンス例: ["検索ワード", ["候補1", "候補2", "候補3"]]
    return data[1] || [];
  } catch (e) {
    console.error('Google Suggest error:', e);
    return [];
  }
}
```

### utils.js の主要関数

#### `dohQuery(name, type)`
DNS over HTTPSでDNSクエリを実行します。

```javascript
const OsintUtils = {
  async dohQuery(name, type) {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
    const res = await fetch(url, {
      headers: { accept: "application/dns-json" }
    });
    
    if (!res.ok) throw new Error(`DoH failed: ${res.status}`);
    
    return await res.json();
  },
  
  // ...
};

window.OsintUtils = OsintUtils;
```

#### `rdapDomain(domain)`
ドメインのRDAP情報を取得します。

```javascript
async rdapDomain(domain) {
  const res = await fetch(`https://rdap.org/domain/${domain}`, {
    headers: { accept: "application/rdap+json" }
  });
  
  if (!res.ok) throw new Error(`RDAP failed: ${res.status}`);
  
  return await res.json();
}
```

---

## 機能の追加方法

### 新しいDNSレコードタイプを追加

1. **`popup.js`の`fetchAll()`に追加**

```javascript
// SOAレコードを追加する例
try {
  const soa = await U.dohQuery(domain, "SOA");
  const soaRecords = (soa.Answer || []).map(r => r.data).sort();
  if (soaRecords.length > 0) {
    addRow("SOA (権威情報)", soaRecords.join("<br>"));
  }
} catch {}
```

### 新しいサーバー会社を追加

1. **`popup.js`の`identifyServer()`に追加**

```javascript
function identifyServer(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // 新しいサーバーを追加
  if (lower.includes('newserver')) return '🆕 新サーバー';
  
  // 既存のサーバー
  if (lower.includes('xserver')) return '🟦 Xサーバー';
  // ...
  
  return null;
}
```

2. **IP範囲がわかる場合、`identifyFromIp()`にも追加**

```javascript
function identifyFromIp(ip) {
  const parts = ip.split('.').map(Number);
  
  // 新サーバーのIP範囲: 203.0.113.0/24
  if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) {
    return '🆕 新サーバーのIP範囲';
  }
  
  // ...
}
```

### 新しいサジェスト源を追加

1. **`background.js`に関数を追加**

```javascript
async function fetchNewSuggest(query) {
  try {
    const url = `https://api.newengine.com/suggest?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.suggestions || [];
  } catch (e) {
    console.error('New Suggest error:', e);
    return [];
  }
}
```

2. **`getSuggests`メッセージハンドラーに追加**

```javascript
else if (msg?.type === "getSuggests") {
  const [google, yahoo, bing, newEngine] = await Promise.allSettled([
    fetchGoogleSuggest(query),
    fetchYahooSuggest(query),
    fetchBingSuggest(query),
    fetchNewSuggest(query)  // 追加
  ]);
  
  const result = {
    success: true,
    google: google.status === 'fulfilled' ? google.value : [],
    yahoo: yahoo.status === 'fulfilled' ? yahoo.value : [],
    bing: bing.status === 'fulfilled' ? bing.value : [],
    newEngine: newEngine.status === 'fulfilled' ? newEngine.value : []  // 追加
  };
  
  sendResponse(result);
}
```

3. **`popup.js`の表示処理に追加**

```javascript
if (response?.success) {
  const google = response.google || [];
  const yahoo = response.yahoo || [];
  const bing = response.bing || [];
  const newEngine = response.newEngine || [];  // 追加
  
  // 表示処理
  if (newEngine.length > 0) {
    html += `<div style="...">`;
    html += `<strong>🆕 New Engine サジェスト</strong><br><br>`;
    newEngine.slice(0, 10).forEach((item, index) => {
      html += `<div>${index + 1}. ${item}</div>`;
    });
    html += '</div>';
  }
}
```

---

## デバッグ方法

### 基本的なデバッグ

#### 1. コンソールログの確認

**ポップアップのコンソール:**
```javascript
// popup.jsでログ出力
console.log('DNS取得結果:', aSet);
```

確認方法:
1. 拡張機能を開く
2. ポップアップを右クリック → 「検証」
3. Consoleタブで確認

**バックグラウンドのコンソール:**
```javascript
// background.jsでログ出力
console.log('サジェスト取得:', result);
```

確認方法:
1. `chrome://extensions/` を開く
2. 拡張機能の「service worker」をクリック
3. DevToolsが開き、ログが表示される

#### 2. ネットワーク通信の確認

1. DevToolsの「Network」タブを開く
2. 拡張機能を操作
3. API呼び出しを確認

#### 3. ブレークポイントの設定

1. DevToolsの「Sources」タブを開く
2. `popup.js`や`background.js`を開く
3. 行番号をクリックしてブレークポイントを設定
4. 拡張機能を操作すると、その行で停止

### よくあるエラーと解決法

#### エラー1: `Uncaught ReferenceError: U is not defined`

**原因:**
`utils.js`が読み込まれる前に`popup.js`が実行されている

**解決:**
`popup.html`でスクリプトの読み込み順序を確認
```html
<script src="utils.js"></script>  <!-- 先に読み込む -->
<script src="popup.js"></script>
```

#### エラー2: `Failed to fetch`

**原因:**
- CORS制限
- ネットワークエラー
- タイムアウト

**解決:**
```javascript
try {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
} catch (e) {
  console.error('Fetch error:', e);
  // フォールバック処理
}
```

#### エラー3: `chrome.runtime.sendMessage`が応答しない

**原因:**
`background.js`で`return true;`を忘れている

**解決:**
```javascript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    // 非同期処理
    const result = await someAsyncFunction();
    sendResponse(result);
  })();
  return true;  // ← これを忘れない！
});
```

---

## ビルド・デプロイ

### 拡張機能のパッケージング

#### 1. ZIPファイルの作成

```bash
# 不要なファイルを除外してZIP作成
zip -r dns-osint-pro-ver2.0.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*docs/*" \
  -x "*.md"
```

#### 2. Chrome Web Storeへの公開

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)にアクセス
2. 「新しいアイテム」をクリック
3. ZIPファイルをアップロード
4. ストアの詳細情報を入力
5. 審査を申請

### バージョン管理

**Semantic Versioning:**
```
MAJOR.MINOR.PATCH

例: 5.1.0 → 5.1.1 (バグ修正)
例: 5.1.0 → 5.2.0 (機能追加)
例: 5.1.0 → 6.0.0 (破壊的変更)
```

**バージョンアップ手順:**
1. `manifest.json`の`version`を更新
2. `CHANGELOG.md`に変更内容を記録
3. Git にコミット・プッシュ
4. GitHubでリリースタグを作成

```bash
git add manifest.json CHANGELOG.md
git commit -m "Bump version to 5.2.0"
git tag v5.2.0
git push origin main --tags
```

---

## コーディング規約

### JavaScript

```javascript
// ✅ Good: camelCase
const userName = 'John';
function getUserData() {}

// ❌ Bad: snake_case
const user_name = 'John';
function get_user_data() {}

// ✅ Good: const/let
const API_URL = 'https://example.com';
let counter = 0;

// ❌ Bad: var
var counter = 0;

// ✅ Good: アロー関数
const double = (x) => x * 2;

// ✅ Good: async/await
async function fetchData() {
  const res = await fetch(url);
  return await res.json();
}

// ❌ Bad: Promise.then()
function fetchData() {
  return fetch(url).then(res => res.json());
}
```

### HTML

```html
<!-- ✅ Good: インデント2スペース -->
<div>
  <p>テキスト</p>
</div>

<!-- ✅ Good: セマンティックHTML -->
<header>
  <h1>タイトル</h1>
</header>

<!-- ❌ Bad: 意味のないdiv -->
<div class="header">
  <div class="title">タイトル</div>
</div>
```

### CSS

```css
/* ✅ Good: kebab-case */
.user-profile {}
.btn-primary {}

/* ❌ Bad: camelCase */
.userProfile {}
.btnPrimary {}

/* ✅ Good: BEM記法 */
.block {}
.block__element {}
.block--modifier {}
```

### コメント

```javascript
// ✅ Good: 日本語コメントOK
// DNS情報を取得する関数
async function fetchDNS(domain) {
  // A レコードを取得
  const aRecords = await U.dohQuery(domain, "A");
  return aRecords;
}

// ✅ Good: JSDocスタイル
/**
 * サジェストを取得する
 * @param {string} query - 検索クエリ
 * @returns {Promise<string[]>} サジェストの配列
 */
async function getSuggests(query) {
  // ...
}
```

---

## テスト

### 手動テスト

#### チェックリスト

- [ ] 自動分析が正しく動作する
- [ ] 手動入力で検索できる
- [ ] すべてのDNSレコードタイプが取得できる
- [ ] サーバー会社が正しく識別される
- [ ] サジェストが取得できる
- [ ] 風評被害が検出される
- [ ] サイト健康診断が動作する
- [ ] メールセキュリティチェックが動作する
- [ ] エラーハンドリングが正しく動作する

#### テストケース

```javascript
// テスト用のドメイン
const testDomains = [
  'example.com',        // 基本的なドメイン
  'www.example.com',    // www付き
  'sub.example.com',    // サブドメイン
  'example.co.jp',      // .co.jp
  'localhost',          // localhost
  '192.168.1.1',        // IPアドレス
];
```

### 将来的な自動テスト

```javascript
// Jest を使った単体テスト（将来的に導入）
describe('extractSiteName', () => {
  test('should extract site name from title', () => {
    expect(extractSiteName('会社名｜サービス名')).toBe('会社名');
    expect(extractSiteName('【公式】会社名')).toBe('会社名');
    expect(extractSiteName('株式会社テスト')).toBe('テスト');
  });
});
```

---

## コントリビューション

プロジェクトへの貢献は大歓迎です！

### プルリクエストの手順

1. Forkする
2. ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### コミットメッセージ

```bash
# ✅ Good
git commit -m "Add: サブドメイン検索機能を追加"
git commit -m "Fix: サジェスト取得のバグを修正"
git commit -m "Update: README.mdを更新"

# 英語でもOK
git commit -m "Add subdomain search feature"
git commit -m "Fix suggest fetching bug"
```

---

## 参考資料

### Chrome拡張機能

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/to-service-workers/)

### API仕様

- [DNS over HTTPS (RFC 8484)](https://datatracker.ietf.org/doc/html/rfc8484)
- [RDAP (RFC 7483)](https://datatracker.ietf.org/doc/html/rfc7483)
- [Google Suggest API](https://suggestqueries.google.com/)

### 開発ツール

- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Postman](https://www.postman.com/) - API テスト

---

## サポート

開発に関する質問や商用サポートは以下まで：

### 🚨 風評被害・サジェスト対策
📱 [りんくが頼りにしているリバースハックに相談（風評対策）](https://lin.ee/X2aWSFO)

### 💻 サイト診断・ITインフラサポート
💻 [りんくが頼りにしているリバースハックに相談（ITインフラ）](https://lin.ee/lrjVHvH)

### 開発コミュニティ
- 🐛 [GitHub Issues](https://github.com/yourusername/dns-osint-pro-ver2.0/issues)
- 💬 [Discussions](https://github.com/yourusername/dns-osint-pro-ver2.0/discussions)
- 📧 info@reverse-re-birth-hack.com

---

<p align="center">
  Happy Coding! 🚀
  <br>
  Made with ❤️ by Reverse Rebirth Hack Team
</p>
