/**
 * 汎用Chrome DevTools MCP テンプレート
 * 
 * どんなプロジェクトでも使える開発効率化ツール
 * 
 * セットアップ:
 * 1. このファイルをプロジェクトルートにコピー
 * 2. CONFIG セクションを編集
 * 3. npm install puppeteer
 * 4. node mcp-devtools-template.js [command]
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// ==========================================
// 📝 CONFIG - プロジェクトに合わせて編集
// ==========================================
const CONFIG = {
  // Chrome拡張機能の場合
  extensionPath: __dirname, // manifest.jsonがあるディレクトリ
  
  // Webアプリの場合
  devServerUrl: 'http://localhost:3000', // 開発サーバーのURL
  
  // テスト対象
  testUrls: [
    'https://www.yahoo.co.jp/',
    'https://www.google.com/'
  ],
  
  // プロジェクト固有の設定
  projectType: 'extension', // 'extension' or 'webapp'
  htmlFiles: ['popup.html', 'options.html'], // テストするHTMLファイル
  
  // テスト設定
  testDomain: 'yahoo.co.jp', // 入力テスト用のドメイン
  inputSelector: '#domain', // 入力フィールドのセレクタ
  buttonSelector: '#go', // ボタンのセレクタ
  resultSelector: '#resultBody', // 結果表示のセレクタ
};

// ==========================================
// 🛠️ DevTools MCP クラス
// ==========================================
class UniversalDevToolsMCP {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
    this.logs = {
      console: [],
      errors: [],
      warnings: [],
      network: []
    };
  }

  async launch() {
    console.log('🚀 Chromeを起動中...\n');
    
    const args = ['--no-sandbox', '--auto-open-devtools-for-tabs'];
    
    // Chrome拡張機能の場合
    if (this.config.projectType === 'extension') {
      args.push(`--disable-extensions-except=${this.config.extensionPath}`);
      args.push(`--load-extension=${this.config.extensionPath}`);
    }
    
    this.browser = await puppeteer.launch({
      headless: false,
      args
    });

    console.log('✅ Chrome起動完了\n');
  }

  async openPage(url) {
    this.page = await this.browser.newPage();
    this.setupMonitoring();
    
    console.log(`📄 ${url} を開いています...\n`);
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    console.log('✅ ページ読み込み完了\n');
  }

  setupMonitoring() {
    // コンソールログ監視
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      const entry = { type, text, timestamp: new Date().toISOString() };
      this.logs.console.push(entry);
      
      if (type === 'error') {
        this.logs.errors.push(text);
        console.log(`❌ [Error] ${text}`);
      } else if (type === 'warning') {
        this.logs.warnings.push(text);
        console.log(`⚠️  [Warning] ${text}`);
      }
    });

    // ページエラー監視
    this.page.on('pageerror', error => {
      this.logs.errors.push(error.message);
      console.log(`❌ [Page Error] ${error.message}`);
    });

    // ネットワークエラー監視
    this.page.on('requestfailed', request => {
      const failure = request.failure();
      this.logs.network.push({
        url: request.url(),
        error: failure?.errorText || 'Unknown'
      });
      console.log(`🚫 [Network] ${request.url()}`);
      console.log(`   理由: ${failure?.errorText || '不明'}`);
    });
  }

  async measurePerformance() {
    console.log('\n📊 パフォーマンス測定\n');
    
    const metrics = await this.page.metrics();
    const timing = JSON.parse(
      await this.page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    const results = {
      'ページロード時間': `${timing.loadEventEnd - timing.navigationStart}ms`,
      'DOMContentLoaded': `${timing.domContentLoadedEventEnd - timing.navigationStart}ms`,
      'JSヒープサイズ': `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`,
      'DOMノード数': metrics.Nodes,
      'イベントリスナー数': metrics.JSEventListeners
    };
    
    console.log('結果:');
    for (const [key, value] of Object.entries(results)) {
      console.log(`  📈 ${key}: ${value}`);
    }
    
    return results;
  }

  async testUI(htmlFile) {
    if (this.config.projectType !== 'extension') {
      console.log('⚠️  WebアプリはUIテストをスキップ');
      return;
    }
    
    console.log(`\n🎨 UIテスト: ${htmlFile}\n`);
    
    const testPage = await this.browser.newPage();
    const filePath = `file://${path.join(this.config.extensionPath, htmlFile)}`;
    
    await testPage.goto(filePath, { waitUntil: 'networkidle2' });
    
    // 基本的な要素チェック
    const checks = [
      { name: '入力フィールド', selector: this.config.inputSelector },
      { name: 'ボタン', selector: this.config.buttonSelector },
      { name: '結果エリア', selector: this.config.resultSelector }
    ];
    
    console.log('📋 要素チェック:');
    for (const check of checks) {
      if (!check.selector) continue;
      const exists = await testPage.$(check.selector) !== null;
      console.log(`  ${exists ? '✅' : '❌'} ${check.name} (${check.selector})`);
    }
    
    // 操作テスト
    if (this.config.inputSelector && this.config.buttonSelector && this.config.testDomain) {
      console.log(`\n⌨️  テスト入力: ${this.config.testDomain}`);
      await testPage.type(this.config.inputSelector, this.config.testDomain);
      await new Promise(r => setTimeout(r, 300));
      await testPage.click(this.config.buttonSelector);
      
      console.log('⏳ 結果を待機中...');
      await new Promise(r => setTimeout(r, 3000));
      
      if (this.config.resultSelector) {
        const hasResults = await testPage.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el && el.textContent.length > 10;
        }, this.config.resultSelector);
        
        console.log(hasResults ? '✅ 結果が表示されました' : '❌ 結果が表示されませんでした');
      }
    }
    
    return testPage;
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 テストレポート');
    console.log('='.repeat(60) + '\n');
    
    console.log(`❌ エラー: ${this.logs.errors.length}件`);
    if (this.logs.errors.length > 0) {
      this.logs.errors.slice(0, 3).forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.substring(0, 80)}...`);
      });
    }
    
    console.log(`\n⚠️  警告: ${this.logs.warnings.length}件`);
    if (this.logs.warnings.length > 0) {
      this.logs.warnings.slice(0, 3).forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.substring(0, 80)}...`);
      });
    }
    
    console.log(`\n🌐 ネットワークエラー: ${this.logs.network.length}件`);
    
    // レポートファイル保存
    const reportPath = path.join(this.config.extensionPath, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.logs, null, 2));
    console.log(`\n💾 詳細レポート: ${reportPath}\n`);
  }

  async wait() {
    console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。\n');
    await new Promise(() => {});
  }
}

// ==========================================
// 🎮 コマンドライン実行
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  const mcp = new UniversalDevToolsMCP(CONFIG);
  
  try {
    await mcp.launch();
    
    switch (command) {
      case 'test':
        console.log('🧪 完全テストモード\n');
        
        // 各URLをテスト
        for (const url of CONFIG.testUrls) {
          await mcp.openPage(url);
          await mcp.measurePerformance();
        }
        
        // UI テスト（拡張機能の場合）
        if (CONFIG.projectType === 'extension') {
          for (const htmlFile of CONFIG.htmlFiles) {
            await mcp.testUI(htmlFile);
          }
        }
        
        mcp.generateReport();
        await mcp.wait();
        break;
        
      case 'debug':
        const url = args[1] || CONFIG.testUrls[0];
        console.log(`🐛 デバッグモード: ${url}\n`);
        await mcp.openPage(url);
        console.log('\n✅ デバッグ準備完了');
        mcp.generateReport();
        await mcp.wait();
        break;
        
      case 'performance':
        console.log('⚡ パフォーマンス測定モード\n');
        const perfUrl = args[1] || CONFIG.testUrls[0];
        await mcp.openPage(perfUrl);
        await mcp.measurePerformance();
        mcp.generateReport();
        await mcp.wait();
        break;
        
      default:
        console.log('使い方:');
        console.log('  node mcp-devtools-template.js test         - 完全テスト');
        console.log('  node mcp-devtools-template.js debug [url]  - デバッグ');
        console.log('  node mcp-devtools-template.js performance  - パフォーマンス');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    process.exit(1);
  }
}

main();
