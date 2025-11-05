# Yahoo!サジェストAPI調査結果

**調査日**: 2025年11月5日  
**ステータス**: 🚧 将来の課題として開発継続予定  
**調査ツール**: Genspark AI ディープリサーチ

---

## 📋 調査概要

Yahoo!サジェストAPIの実装可能性を検証し、Chrome拡張機能への統合方法を調査しました。

### 結論

- ❌ **公式APIは非公開**：Yahoo! JAPANは検索サジェストAPIを公式に提供していません
- ✅ **代替手段あり**：Puppeteer等による実装は可能だが、コスト高
- 🚧 **現状**：v5.8.1で「開発中」表示とYahoo!検索リンクで対応

---

## 🔍 試行したすべての方法

### 1. 直接APIアクセス（失敗）

試行したエンドポイント（15個以上）：

```
❌ https://search.yahoo.co.jp/search/suggest
   → HTMLページが返る（JSONではない）

❌ https://search.yahoo.co.jp/realtime/search/suggest
   → HTMLページが返る

❌ https://suggestsp.yahooapis.jp/realtime/suggest
   → DNS解決エラー（ドメインが存在しない）

❌ https://www.yahoo.co.jp/api/suggest
   → HTMLページが返る

❌ https://ff.search.yahoo.co.jp/gossip
   → Failed to fetch

❌ https://m.search.yahoo.co.jp/realtime/search/suggest
   → HTMLページが返る

❌ その他10個以上のエンドポイント
   → すべて失敗
```

### 2. DevToolsネットワーク解析（不明）

**手順**：
1. https://search.yahoo.co.jp/ を開く
2. DevTools → Network → XHR/Fetchフィルター
3. 検索窓に文字を入力
4. サジェストが画面上に表示される

**観察結果**：
- ✅ UIでサジェストは正常に表示される
- ❌ NetworkタブにAPI呼び出しが記録されない
- ❌ 表示されるのは広告リクエスト（ck.yjad.jp）のみ

**推測**：
- ページロード時に事前取得？
- Service Workerによるキャッシュ？
- JavaScriptで埋め込まれたデータ？

---

## ✅ 実装可能な代替手段（Genspark調査結果）

### 方法1: Puppeteer実装（サーバーサイド）⭐⭐⭐⭐⭐

**概要**：
- Node.js + Puppeteerでブラウザを自動操作
- 実際のYahoo!検索ページからサジェストを取得
- **サーバー環境が必須**

**重要なセレクタ（2025年最新）**：
```javascript
// 検索ボックス
const searchBoxSelector = 'input[type="search"][name="p"]';

// サジェスト領域
const suggestSelector = '[data-suggest] .suggest-item';
```

**実装コード例**：
```javascript
const puppeteer = require('puppeteer');

class YahooSuggestScraper {
  async getSuggestions(keyword) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      await page.goto('https://search.yahoo.co.jp', { 
        waitUntil: 'networkidle2' 
      });

      await page.type('input[type="search"][name="p"]', keyword, { 
        delay: 150 
      });
      await page.waitForSelector('[data-suggest] .suggest-item');

      const suggestions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-suggest] .suggest-item'))
          .map(item => item.textContent?.trim())
          .filter(Boolean);
      });

      return { success: true, suggestions };
    } finally {
      await browser.close();
    }
  }
}
```

**必要な環境**：
```bash
npm install puppeteer@latest
```

**デプロイ構成**：
```
Chrome拡張 → PHPプロキシ → Node.js+Puppeteer → Yahoo! → レスポンス
```

**コスト見積もり**：
- 実装時間：5-7時間
- サーバー費用：月額$5-20
- メンテナンス：継続的

### 方法2: Chrome拡張機能実装（クライアントサイド）⭐⭐⭐⭐

**概要**：
- background.jsでYahoo!ページを取得
- HTMLをパースしてサジェストを抽出

**制限事項**：
- CORS制限の影響を受ける
- Yahoo!の動的コンテンツの扱いが難しい

### 方法3: 統合サービス実装⭐⭐⭐

**概要**：
- 上記2つを組み合わせ
- キャッシュ機能を追加
- フォールバック処理を実装

---

## 📊 技術比較表

| 実装方法 | 難易度 | 安定性 | 速度 | コスト | 法的リスク | 推奨度 |
|---------|--------|--------|------|--------|-----------|--------|
| Puppeteer | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 中-高 | 低 | ⭐⭐⭐⭐⭐ |
| Chrome拡張 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 低 | 中 | ⭐⭐⭐ |
| 統合サービス | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 高 | 低 | ⭐⭐⭐ |

---

## 🎯 現在の実装（v5.8.1）

### 採用した方針

**「開発中」表示 + Yahoo!検索リンク提供**

**理由**：
1. ✅ GoogleとBingのサジェストで十分機能する
2. ✅ Puppeteer実装のコストが高い（サーバー構築・運用）
3. ✅ Yahoo!の検索シェアは減少傾向（約5%）
4. ✅ 将来の実装余地を残す

### UI実装

```javascript
// Yahoo!サジェストセクション
html += '<div style="...グラデーション背景...">';
html += '<strong>🟣 Yahoo! サジェスト</strong>';
html += '<span>🚧 開発中</span>';
html += '<p>Yahoo!のサジェストAPIは非公開のため、現在実装を検討中です。</p>';

// Yahoo!検索へのリンクボタン
html += `<a href="https://search.yahoo.co.jp/search?p=${domain}" target="_blank">`;
html += '🔍 Yahoo!で検索する';
html += '</a>';
html += '</div>';
```

---

## 🚀 将来の実装計画

### フェーズ1: 要望調査（現在）
- ユーザーからのYahoo!サジェスト機能の要望を収集
- 必要性を評価

### フェーズ2: プロトタイプ開発（要望が多い場合）
- Puppeteerによる実装をテスト
- パフォーマンスとコストを評価

### フェーズ3: 本番実装（ROIが合う場合）
- Node.jsサーバーのセットアップ
- PHPプロキシの統合
- Chrome拡張機能への統合

---

## 📚 参考資料

### Genspark調査レポート
- [第1回ディープリサーチ](https://www.genspark.ai/agents?id=63e29cd0-724b-4314-ae2d-32c61e45691c)
- [第2回追加調査](https://www.genspark.ai/agents?id=987f8ea7-a962-40f4-9cbd-399c16b58ff1)

### 技術ドキュメント
- [Puppeteer公式ドキュメント](https://pptr.dev/)
- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

---

## 📝 メモ

### Yahoo! JAPAN検索の状況（2025年現在）
- 検索エンジンシェア：約5%（減少傾向）
- サジェスト機能：UIで正常に動作
- API：非公開（公式提供なし）

### 類似サービスの調査
- 既存のYahoo!サジェスト取得ツールは古く、現在は動作していない
- オープンソースプロジェクトも2020年以降更新されていない
- サードパーティAPIも見つからず

---

**最終更新**: 2025年11月5日  
**担当**: Windsurf AI  
**ステータス**: 将来の課題として継続調査
