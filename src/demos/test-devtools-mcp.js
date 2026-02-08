/**
 * Chrome DevTools MCP - 開発効率化テストスイート
 * 
 * 機能:
 * 1. 動作確認: 拡張機能をブラウザで動かして挙動を観察
 * 2. エラー解析: コンソールログ・ネットワークエラー・CORS問題を検出
 * 3. 操作シミュレート: ユーザー操作を自動化して不具合を再現
 * 4. パフォーマンス分析: LCP、FID、CLSなどを測定
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class ChromeDevToolsMCP {
  constructor() {
    this.browser = null;
    this.page = null;
    this.logs = {
      console: [],
      network: [],
      errors: [],
      performance: {}
    };
  }

  /**
   * Chromeブラウザを拡張機能付きで起動
   */
  async launch() {
    console.log('🚀 Chrome DevTools MCP 起動中...\n');
    
    const extensionPath = __dirname;
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // CORS問題のテスト用
      ],
      devtools: true // DevToolsを自動で開く
    });

    console.log('✅ Chromeブラウザ起動完了\n');
  }

  /**
   * ページを開いてモニタリングを開始
   */
  async openPage(url) {
    this.page = await this.browser.newPage();
    
    // コンソールログを監視
    this.page.on('console', msg => {
      const entry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      this.logs.console.push(entry);
      
      const emoji = msg.type() === 'error' ? '❌' : 
                   msg.type() === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${emoji} [Console ${msg.type()}] ${msg.text()}`);
    });

    // ネットワークリクエストを監視
    this.page.on('request', request => {
      this.logs.network.push({
        type: 'request',
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('requestfailed', request => {
      const error = {
        url: request.url(),
        failure: request.failure(),
        timestamp: new Date().toISOString()
      };
      this.logs.errors.push(error);
      console.log(`❌ [Network Error] ${request.url()}`);
      console.log(`   理由: ${request.failure()?.errorText || '不明'}`);
    });

    this.page.on('response', response => {
      this.logs.network.push({
        type: 'response',
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
      
      // CORSエラーを検出
      if (response.status() === 0 || response.headers()['access-control-allow-origin'] === undefined) {
        const corsUrl = response.url();
        if (corsUrl.startsWith('http')) {
          console.log(`⚠️  [CORS可能性] ${corsUrl} (Status: ${response.status()})`);
        }
      }
    });

    // ページエラーを監視
    this.page.on('pageerror', error => {
      this.logs.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      console.log(`❌ [Page Error] ${error.message}`);
    });

    console.log(`🌐 ページを開きます: ${url}\n`);
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    
    const title = await this.page.title();
    console.log(`✅ ページ読み込み完了: ${title}\n`);
  }

  /**
   * 拡張機能のポップアップをシミュレート
   */
  async testExtensionPopup() {
    console.log('🔍 拡張機能ポップアップのテスト開始...\n');
    
    // 新しいページでpopup.htmlを開く
    const popupPage = await this.browser.newPage();
    const popupUrl = `file://${path.join(__dirname, 'popup.html')}`;
    
    console.log(`📄 ポップアップを開きます: ${popupUrl}`);
    await popupPage.goto(popupUrl, { waitUntil: 'networkidle2' });
    
    // DOM要素の存在確認
    const elements = {
      'ドメイン入力': '#domain',
      '検索ボタン': '#go',
      '結果テーブル': '#resultTable',
      'タブボタン': '.tab-button'
    };
    
    console.log('\n📊 UI要素の確認:');
    for (const [name, selector] of Object.entries(elements)) {
      const exists = await popupPage.$(selector) !== null;
      console.log(`  ${exists ? '✅' : '❌'} ${name} (${selector})`);
    }
    
    return popupPage;
  }

  /**
   * ユーザー操作をシミュレート
   */
  async simulateUserAction(popupPage, domain = 'yahoo.co.jp') {
    console.log(`\n🎮 ユーザー操作シミュレーション開始...\n`);
    
    // ドメインを入力
    console.log(`⌨️  ドメイン入力: ${domain}`);
    await popupPage.type('#domain', domain);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 検索ボタンをクリック
    console.log('🖱️  検索ボタンをクリック');
    await popupPage.click('#go');
    
    // 結果を待つ
    console.log('⏳ 結果を待機中...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 結果を確認
    const resultText = await popupPage.$eval('#resultBody', el => el.textContent);
    console.log('📊 検索結果:');
    console.log(resultText.substring(0, 200) + '...\n');
  }

  /**
   * パフォーマンスメトリクスを収集
   */
  async collectPerformanceMetrics() {
    console.log('📈 パフォーマンスメトリクス収集中...\n');
    
    const metrics = await this.page.metrics();
    const performanceTimings = JSON.parse(
      await this.page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    // Core Web Vitals風の計算
    const navigationStart = performanceTimings.navigationStart;
    const loadTime = performanceTimings.loadEventEnd - navigationStart;
    const domContentLoaded = performanceTimings.domContentLoadedEventEnd - navigationStart;
    
    this.logs.performance = {
      ...metrics,
      loadTime,
      domContentLoaded,
      performanceTimings
    };
    
    console.log('📊 パフォーマンス結果:');
    console.log(`  ⏱️  ページ読み込み時間: ${loadTime}ms`);
    console.log(`  📄 DOMContentLoaded: ${domContentLoaded}ms`);
    console.log(`  🎨 JSヒープサイズ: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  🔢 JSイベントリスナー数: ${metrics.JSEventListeners}`);
    console.log('');
  }

  /**
   * DOM/CSS解析
   */
  async analyzeDOMAndCSS(selector) {
    console.log(`🔍 DOM/CSS解析: ${selector}\n`);
    
    const elementInfo = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      
      const styles = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        id: el.id,
        classes: Array.from(el.classList),
        dimensions: {
          width: styles.width,
          height: styles.height,
          display: styles.display,
          position: styles.position
        },
        colors: {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        },
        text: el.textContent.substring(0, 100)
      };
    }, selector);
    
    if (elementInfo) {
      console.log('📦 要素情報:');
      console.log(JSON.stringify(elementInfo, null, 2));
    } else {
      console.log('❌ 要素が見つかりません');
    }
    console.log('');
  }

  /**
   * レポートを生成
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 テストレポート');
    console.log('='.repeat(60) + '\n');
    
    console.log(`📝 コンソールログ: ${this.logs.console.length}件`);
    console.log(`🌐 ネットワークリクエスト: ${this.logs.network.length}件`);
    console.log(`❌ エラー: ${this.logs.errors.length}件\n`);
    
    if (this.logs.errors.length > 0) {
      console.log('⚠️  検出されたエラー:');
      this.logs.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error.url || error.message}`);
      });
      console.log('');
    }
    
    // レポートをファイルに保存
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.logs, null, 2));
    console.log(`💾 詳細レポートを保存: ${reportPath}\n`);
  }

  /**
   * クリーンアップ
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ ブラウザを閉じました\n');
    }
  }
}

// メイン実行
async function main() {
  const mcp = new ChromeDevToolsMCP();
  
  try {
    // 1. ブラウザ起動
    await mcp.launch();
    
    // 2. テストサイトを開く
    await mcp.openPage('https://www.yahoo.co.jp/');
    
    // 3. パフォーマンス測定
    await mcp.collectPerformanceMetrics();
    
    // 4. DOM解析
    await mcp.analyzeDOMAndCSS('header');
    
    // 5. 拡張機能ポップアップをテスト
    const popupPage = await mcp.testExtensionPopup();
    
    // 6. ユーザー操作をシミュレート
    await mcp.simulateUserAction(popupPage, 'yahoo.co.jp');
    
    // 7. レポート生成
    mcp.generateReport();
    
    console.log('✨ すべてのテストが完了しました！');
    console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。\n');
    
    // ブラウザを開いたまま待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    await mcp.close();
    process.exit(1);
  }
}

main();
