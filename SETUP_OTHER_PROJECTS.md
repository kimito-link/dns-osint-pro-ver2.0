# 🚀 他のプロジェクトでMCP DevToolsを使う方法

このガイドは、Chrome DevTools MCP統合を**他のプロジェクトで使う**ための手順です。

---

## 📦 対応プロジェクトタイプ

✅ **Chrome拡張機能**  
✅ **Webアプリケーション** (React, Vue, Next.js等)  
✅ **静的サイト**  
✅ **Node.jsアプリ**  

---

## 🎯 3ステップセットアップ

### ステップ1️⃣: ファイルをコピー

```bash
# 他のプロジェクトのルートディレクトリに移動
cd /path/to/your-project

# テンプレートファイルをコピー
cp /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0/mcp-devtools-template.js ./
```

### ステップ2️⃣: Puppeteerをインストール

```bash
npm install puppeteer --save-dev
```

または

```bash
# package.jsonがない場合
npm init -y
npm install puppeteer --save-dev
```

### ステップ3️⃣: 設定を編集

`mcp-devtools-template.js`を開いて、`CONFIG`セクションを編集：

```javascript
const CONFIG = {
  // プロジェクトタイプ
  projectType: 'extension', // または 'webapp'
  
  // テストURL
  testUrls: [
    'https://your-site.com/',  // ← 自分のサイト
  ],
  
  // プロジェクト固有の設定
  testDomain: 'example.com',    // ← テスト用ドメイン
  inputSelector: '#domain',     // ← 入力フィールド
  buttonSelector: '#submit',    // ← ボタン
  resultSelector: '#result',    // ← 結果表示エリア
};
```

---

## 📝 プロジェクト別の設定例

### 例1: Chrome拡張機能

```javascript
const CONFIG = {
  projectType: 'extension',
  extensionPath: __dirname,
  htmlFiles: ['popup.html', 'options.html'],
  testUrls: ['https://www.yahoo.co.jp/'],
  testDomain: 'yahoo.co.jp',
  inputSelector: '#domain',
  buttonSelector: '#go',
  resultSelector: '#resultBody'
};
```

### 例2: React Webアプリ

```javascript
const CONFIG = {
  projectType: 'webapp',
  devServerUrl: 'http://localhost:3000',
  testUrls: [
    'http://localhost:3000/',
    'http://localhost:3000/about'
  ],
  inputSelector: 'input[type="text"]',
  buttonSelector: 'button[type="submit"]',
  resultSelector: '.result-container'
};
```

### 例3: Vue.js アプリ

```javascript
const CONFIG = {
  projectType: 'webapp',
  devServerUrl: 'http://localhost:8080',
  testUrls: ['http://localhost:8080/'],
  inputSelector: '#search-input',
  buttonSelector: '.search-button',
  resultSelector: '.search-results'
};
```

### 例4: Next.js アプリ

```javascript
const CONFIG = {
  projectType: 'webapp',
  devServerUrl: 'http://localhost:3000',
  testUrls: [
    'http://localhost:3000/',
    'http://localhost:3000/api/test'
  ],
  inputSelector: 'input[name="query"]',
  buttonSelector: 'button[aria-label="Search"]',
  resultSelector: '.results'
};
```

---

## 🎮 使い方

### 完全テスト

```bash
node mcp-devtools-template.js test
```

### デバッグモード

```bash
node mcp-devtools-template.js debug http://localhost:3000
```

### パフォーマンス測定

```bash
node mcp-devtools-template.js performance
```

---

## 📊 実行例

```bash
$ node mcp-devtools-template.js test

🚀 Chromeを起動中...
✅ Chrome起動完了

📄 http://localhost:3000/ を開いています...
✅ ページ読み込み完了

📊 パフォーマンス測定
  📈 ページロード時間: 850ms
  📈 JSヒープサイズ: 12.5MB
  📈 DOMノード数: 1200

🎨 UIテスト: index.html
  ✅ 入力フィールド (#search-input)
  ✅ ボタン (.search-button)
  ✅ 結果エリア (.search-results)

⌨️  テスト入力: test query
✅ 結果が表示されました

📋 テストレポート
❌ エラー: 0件
⚠️  警告: 2件
🌐 ネットワークエラー: 0件

💾 詳細レポート: test-report.json
```

---

## 🔥 実践例: 3つのプロジェクトで使う

### プロジェクト1: DNS OSINT Pro (Chrome拡張)

```bash
cd /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0
node dev-helper.js test
```

### プロジェクト2: 別のChrome拡張

```bash
cd /path/to/your-extension
cp /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0/mcp-devtools-template.js ./
# CONFIG を編集
node mcp-devtools-template.js test
```

### プロジェクト3: Webアプリ

```bash
cd /path/to/your-webapp
cp /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0/mcp-devtools-template.js ./
# CONFIG を編集（projectType: 'webapp'）
npm start  # 開発サーバー起動
# 別ターミナルで
node mcp-devtools-template.js test
```

---

## 💡 便利な使い方

### package.jsonにスクリプト追加

```json
{
  "scripts": {
    "test:mcp": "node mcp-devtools-template.js test",
    "debug:mcp": "node mcp-devtools-template.js debug",
    "perf:mcp": "node mcp-devtools-template.js performance"
  }
}
```

実行:
```bash
npm run test:mcp
npm run debug:mcp
npm run perf:mcp
```

---

## 🎨 カスタマイズ

### 独自のテストを追加

```javascript
// mcp-devtools-template.js の最後に追加
async function customTest() {
  const mcp = new UniversalDevToolsMCP(CONFIG);
  await mcp.launch();
  await mcp.openPage('http://localhost:3000');
  
  // 独自のテストロジック
  const page = mcp.page;
  await page.click('.my-custom-button');
  await page.waitForSelector('.my-result');
  
  console.log('✅ カスタムテスト完了');
  
  mcp.generateReport();
  await mcp.wait();
}

// 実行
// customTest();
```

---

## 🚨 トラブルシューティング

### Q: Puppeteerのインストールが遅い

**A:** 環境変数を設定してChromiumをスキップ
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer
```

### Q: ポート番号が違う

**A:** CONFIG.devServerUrlを編集
```javascript
devServerUrl: 'http://localhost:8080', // あなたのポート番号
```

### Q: セレクタが見つからない

**A:** DevToolsで実際のセレクタを確認
```bash
# デバッグモードで起動
node mcp-devtools-template.js debug
# ブラウザのDevToolsで要素を右クリック → Copy selector
```

---

## 📚 まとめ

### ✅ できること

- どんなプロジェクトでも使える
- 3ステップで簡単セットアップ
- Chrome拡張、Webアプリ両対応
- 自動テスト、デバッグ、パフォーマンス測定

### 📝 次のステップ

1. 他のプロジェクトにファイルをコピー
2. CONFIG を編集
3. `node mcp-devtools-template.js test` を実行

---

**これで全プロジェクトで開発効率が爆上がり！🚀**
