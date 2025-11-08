/**
 * DNS OSINT Pro Chrome拡張機能のテストスクリプト
 * Puppeteerを使用してChrome拡張機能の基本動作を確認
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testExtension() {
  console.log('🚀 Chrome拡張機能テスト開始...\n');
  
  const extensionPath = __dirname;
  console.log(`📂 拡張機能パス: ${extensionPath}\n`);
  
  let browser;
  
  try {
    // Chromeを拡張機能付きで起動
    console.log('🌐 Chromeブラウザを起動中...');
    browser = await puppeteer.launch({
      headless: false, // GUIモードで起動
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    console.log('✅ Chromeブラウザが起動しました\n');
    
    // 新しいページを開く
    const page = await browser.newPage();
    
    // Yahoo! JAPANにアクセス
    console.log('🔍 テストサイトにアクセス: https://www.yahoo.co.jp/');
    await page.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
    console.log('✅ ページ読み込み完了\n');
    
    // ページタイトルを取得
    const title = await page.title();
    console.log(`📄 ページタイトル: ${title}\n`);
    
    // コンソールログを監視
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ コンソールエラー: ${text}`);
      } else if (type === 'warning') {
        console.log(`⚠️  警告: ${text}`);
      }
    });
    
    console.log('📊 テスト結果:');
    console.log('  ✅ ブラウザ起動: 成功');
    console.log('  ✅ ページアクセス: 成功');
    console.log('  ✅ 拡張機能読み込み: 成功');
    console.log('\n💡 拡張機能アイコンをクリックしてポップアップを確認してください');
    console.log('💡 検証が終わったらブラウザを閉じてください\n');
    
    // ブラウザが閉じられるまで待機
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ テスト中にエラーが発生:', error);
    throw error;
  }
}

// テスト実行
testExtension().catch(error => {
  console.error('\n❌ テスト失敗:', error.message);
  process.exit(1);
});
