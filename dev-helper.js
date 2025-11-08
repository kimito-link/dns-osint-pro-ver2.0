/**
 * 開発効率化ヘルパー - 対話型デバッグツール
 * 
 * 使い方:
 * node dev-helper.js [コマンド] [オプション]
 * 
 * コマンド:
 * - test           : 拡張機能の完全テスト
 * - debug [url]    : 指定URLでデバッグモード起動
 * - popup          : ポップアップのみテスト
 * - performance    : パフォーマンス測定のみ
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class DevHelper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.warnings = [];
  }

  async launchWithExtension(url = 'https://www.yahoo.co.jp/') {
    const extensionPath = __dirname;
    
    console.log('🚀 Chromeを起動中...\n');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--auto-open-devtools-for-tabs'
      ]
    });

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
      
      if (type === 'error') {
        this.errors.push(text);
        console.log(`❌ [Error] ${text}`);
      } else if (type === 'warning') {
        this.warnings.push(text);
        console.log(`⚠️  [Warning] ${text}`);
      } else if (type === 'log' && text.includes('[DNS OSINT]')) {
        console.log(`📝 [Extension] ${text}`);
      }
    });

    // ページエラー監視
    this.page.on('pageerror', error => {
      this.errors.push(error.message);
      console.log(`❌ [Page Error] ${error.message}`);
    });

    // リクエスト失敗を監視
    this.page.on('requestfailed', request => {
      console.log(`🚫 [Request Failed] ${request.url()}`);
      console.log(`   理由: ${request.failure()?.errorText || '不明'}`);
    });
  }

  async testPopup(domain = 'yahoo.co.jp') {
    console.log('\n🔍 拡張機能ポップアップテスト\n');
    
    const popupPage = await this.browser.newPage();
    const popupPath = `file://${path.join(__dirname, 'popup.html')}`;
    
    await popupPage.goto(popupPath, { waitUntil: 'networkidle2' });
    
    // UI要素チェック
    const checks = [
      { name: 'ドメイン入力フィールド', selector: '#domain' },
      { name: '検索ボタン', selector: '#go' },
      { name: '結果テーブル', selector: '#resultTable' },
      { name: '診断タブ', selector: '[data-tab="diagnosisTab"]' },
      { name: 'SEOタブ', selector: '[data-tab="seoTab"]' }
    ];
    
    console.log('📋 UI要素チェック:');
    for (const check of checks) {
      const exists = await popupPage.$(check.selector) !== null;
      console.log(`  ${exists ? '✅' : '❌'} ${check.name}`);
    }
    
    // ドメイン検索をシミュレート
    if (domain) {
      console.log(`\n⌨️  テスト検索: ${domain}`);
      await popupPage.type('#domain', domain);
      await new Promise(r => setTimeout(r, 300));
      await popupPage.click('#go');
      
      console.log('⏳ 結果を待機中...');
      await new Promise(r => setTimeout(r, 5000));
      
      // 結果を確認
      const hasResults = await popupPage.evaluate(() => {
        const tbody = document.querySelector('#resultBody');
        return tbody && tbody.children.length > 1;
      });
      
      console.log(hasResults ? '✅ 検索結果が表示されました' : '❌ 検索結果が表示されませんでした');
    }
    
    return popupPage;
  }

  async measurePerformance() {
    console.log('\n📊 パフォーマンス測定\n');
    
    const metrics = await this.page.metrics();
    const timing = JSON.parse(
      await this.page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    const results = {
      ページ読み込み: `${timing.loadEventEnd - timing.navigationStart}ms`,
      DOMContentLoaded: `${timing.domContentLoadedEventEnd - timing.navigationStart}ms`,
      JSヒープサイズ: `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`,
      DOMノード数: metrics.Nodes,
      イベントリスナー数: metrics.JSEventListeners
    };
    
    console.log('結果:');
    for (const [key, value] of Object.entries(results)) {
      console.log(`  📈 ${key}: ${value}`);
    }
    
    return results;
  }

  async inspectElement(selector) {
    console.log(`\n🔍 要素検査: ${selector}\n`);
    
    const info = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      
      return {
        タグ: el.tagName,
        テキスト: el.textContent.substring(0, 50),
        サイズ: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px`,
        位置: `(${rect.x.toFixed(0)}, ${rect.y.toFixed(0)})`,
        表示: styles.display,
        色: styles.color,
        背景色: styles.backgroundColor
      };
    }, selector);
    
    if (info) {
      for (const [key, value] of Object.entries(info)) {
        console.log(`  ${key}: ${value}`);
      }
    } else {
      console.log('❌ 要素が見つかりません');
    }
    
    return info;
  }

  showSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 デバッグセッションサマリー');
    console.log('='.repeat(50) + '\n');
    
    console.log(`❌ エラー: ${this.errors.length}件`);
    if (this.errors.length > 0) {
      this.errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
    }
    
    console.log(`⚠️  警告: ${this.warnings.length}件`);
    if (this.warnings.length > 0) {
      this.warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
    }
    
    console.log('\n💡 ブラウザは開いたままです。確認後に閉じてください。\n');
  }

  async wait() {
    await new Promise(() => {});
  }
}

// コマンドライン処理
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  const helper = new DevHelper();
  
  try {
    switch (command) {
      case 'test':
        console.log('🧪 完全テストモード\n');
        await helper.launchWithExtension();
        await helper.measurePerformance();
        await helper.testPopup('yahoo.co.jp');
        helper.showSummary();
        await helper.wait();
        break;
        
      case 'debug':
        const url = args[1] || 'https://www.yahoo.co.jp/';
        console.log(`🐛 デバッグモード: ${url}\n`);
        await helper.launchWithExtension(url);
        console.log('\n✅ デバッグ準備完了');
        console.log('💡 DevToolsで自由に検証してください\n');
        helper.showSummary();
        await helper.wait();
        break;
        
      case 'popup':
        console.log('🎨 ポップアップテストモード\n');
        await helper.launchWithExtension();
        await helper.testPopup(args[1] || 'yahoo.co.jp');
        helper.showSummary();
        await helper.wait();
        break;
        
      case 'performance':
        console.log('⚡ パフォーマンス測定モード\n');
        await helper.launchWithExtension(args[1] || 'https://www.yahoo.co.jp/');
        await helper.measurePerformance();
        helper.showSummary();
        await helper.wait();
        break;
        
      default:
        console.log('❌ 不明なコマンド:', command);
        console.log('\n使い方:');
        console.log('  node dev-helper.js test              - 完全テスト');
        console.log('  node dev-helper.js debug [url]       - デバッグモード');
        console.log('  node dev-helper.js popup [domain]    - ポップアップテスト');
        console.log('  node dev-helper.js performance [url] - パフォーマンス測定');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ エラー:', error.message);
    process.exit(1);
  }
}

main();
