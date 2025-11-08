# 🛠️ Chrome DevTools MCP - 開発効率化ガイド

MCPサーバーを使ってChrome拡張機能の開発効率を劇的に向上させる方法

---

## 🎯 できること

### 1. **リアルタイムデバッグ**
- ✅ コンソールログをリアルタイムで監視
- ✅ JavaScriptエラーを即座に検出
- ✅ 警告を自動収集

### 2. **ネットワーク分析**
- ✅ API呼び出しの成功/失敗を確認
- ✅ CORSエラーの原因を特定
- ✅ リクエスト失敗の理由を解析

### 3. **UI/UX検証**
- ✅ ボタンクリックやフォーム入力を自動化
- ✅ DOM要素の存在確認
- ✅ スタイル・レイアウトの検査

### 4. **パフォーマンス測定**
- ✅ ページロード時間
- ✅ JSヒープサイズ
- ✅ DOMノード数とイベントリスナー数

---

## 🚀 使い方

### 基本コマンド

```bash
# 完全テスト（推奨）
node dev-helper.js test

# 特定URLでデバッグ
node dev-helper.js debug https://example.com

# ポップアップのみテスト
node dev-helper.js popup yahoo.co.jp

# パフォーマンス測定のみ
node dev-helper.js performance https://yahoo.co.jp
```

---

## 📋 実行例

### 例1: 拡張機能の動作確認

```bash
node dev-helper.js test
```

**出力例:**
```
🚀 Chromeを起動中...
✅ ページ読み込み完了

📊 パフォーマンス測定
  📈 ページ読み込み: 1669ms
  📈 JSヒープサイズ: 22.06MB

🔍 拡張機能ポップアップテスト
  ✅ ドメイン入力フィールド
  ✅ 検索ボタン
  ✅ 結果テーブル

⌨️  テスト検索: yahoo.co.jp
✅ 検索結果が表示されました

📋 デバッグセッションサマリー
❌ エラー: 0件
⚠️  警告: 3件
```

### 例2: 特定のサイトでデバッグ

```bash
node dev-helper.js debug https://google.com
```

**動作:**
1. Chromeが開く（DevTools自動表示）
2. google.comにアクセス
3. コンソールログをリアルタイム監視
4. エラー・警告を自動収集

### 例3: ポップアップUI検証

```bash
node dev-helper.js popup example.com
```

**動作:**
1. popup.htmlを開く
2. UI要素の存在確認
3. `example.com`で検索を実行
4. 結果表示を確認

---

## 🔧 高度な使い方

### カスタムテストスクリプト

`test-devtools-mcp.js`をベースにカスタマイズできます：

```javascript
const { ChromeDevToolsMCP } = require('./test-devtools-mcp');

async function myCustomTest() {
  const mcp = new ChromeDevToolsMCP();
  
  await mcp.launch();
  await mcp.openPage('https://my-site.com');
  
  // 特定の要素をチェック
  await mcp.analyzeDOMAndCSS('.my-class');
  
  // パフォーマンス測定
  await mcp.collectPerformanceMetrics();
  
  mcp.generateReport();
}

myCustomTest();
```

---

## 📊 レポート機能

テスト実行後、`test-report.json`が生成されます：

```json
{
  "console": [
    {"type": "error", "text": "...", "timestamp": "..."}
  ],
  "network": [
    {"type": "request", "url": "...", "method": "GET"}
  ],
  "errors": [
    {"url": "...", "failure": "..."}
  ],
  "performance": {
    "loadTime": 1669,
    "JSHeapUsedSize": 23146496
  }
}
```

---

## 💡 開発ワークフロー

### 推奨ワークフロー

1. **コード修正**
   ```bash
   # popup.jsやbackground.jsを編集
   code popup.js
   ```

2. **即座にテスト**
   ```bash
   # 自動テストを実行
   node dev-helper.js test
   ```

3. **問題を確認**
   - ブラウザのDevToolsで詳細確認
   - コンソールログで挙動チェック
   - test-report.jsonでエラー確認

4. **修正→再テスト**
   ```bash
   # 修正後、再度テスト
   node dev-helper.js test
   ```

---

## 🐛 トラブルシューティング

### Q: Chromeが起動しない

**A:** Puppeteerのインストールを確認
```bash
npm install puppeteer
```

### Q: 拡張機能が読み込まれない

**A:** manifest.jsonのパスを確認
```bash
# カレントディレクトリを確認
pwd
# manifest.jsonの存在確認
ls manifest.json
```

### Q: CORSエラーが出る

**A:** `--disable-web-security`フラグを追加（テスト環境のみ）
```javascript
args: [
  '--disable-web-security',
  // ...
]
```

---

## 📚 参考リソース

- [Puppeteer公式ドキュメント](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Chrome拡張機能開発ガイド](https://developer.chrome.com/docs/extensions/)

---

## 🎓 実践例

### 例: サジェスト機能のデバッグ

```javascript
// カスタムテスト例
async function testSuggestions() {
  const helper = new DevHelper();
  
  await helper.launchWithExtension();
  const popupPage = await helper.testPopup('yahoo.co.jp');
  
  // サジェストボタンをクリック
  await popupPage.click('#checkGoogleSuggest');
  await new Promise(r => setTimeout(r, 3000));
  
  // サジェストが表示されているか確認
  const suggestions = await popupPage.$$('.suggest-item');
  console.log(`📝 サジェスト件数: ${suggestions.length}`);
  
  helper.showSummary();
}

testSuggestions();
```

---

## 🎯 まとめ

### メリット

✅ **時間短縮**: 手動テストの1/10の時間で検証完了  
✅ **自動化**: 繰り返しテストを自動実行  
✅ **網羅性**: エラー・警告を漏れなく検出  
✅ **効率化**: コード修正→テスト→確認のサイクルが高速化

### 次のステップ

1. `node dev-helper.js test`を実行してみる
2. 自分のワークフローに合わせてカスタマイズ
3. CI/CDパイプラインに統合（オプション）

---

**Happy Debugging! 🚀**
