/**
 * 🔥 トリプル検索エンジン同時検索デモ
 * Yahoo! JAPAN、Google、Bingで同時に検索窓に入力
 */

const puppeteer = require('puppeteer');

class TripleSearchDemo {
  constructor() {
    this.browser = null;
    this.pages = {};
  }

  async start() {
    console.log('🔥 トリプル検索エンジン同時検索デモ開始！\n');
    console.log('=' .repeat(60));
    console.log('💡 Yahoo! JAPAN、Google、Bingを同時に操作します');
    console.log('=' .repeat(60));
    console.log('');

    // ブラウザ起動
    console.log('🚀 Chromeを起動中...');
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 80,
      args: ['--start-maximized']
    });

    console.log('✅ Chrome起動完了\n');
  }

  async openAllSearchEngines() {
    console.log('📱 3つの検索エンジンを開きます...\n');

    // Yahoo! JAPAN
    console.log('1️⃣  Yahoo! JAPANを開いています...');
    this.pages.yahoo = await this.browser.newPage();
    await this.pages.yahoo.setViewport({ width: 1280, height: 800 });
    await this.pages.yahoo.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
    console.log('   ✅ Yahoo! JAPAN 準備完了');

    await new Promise(r => setTimeout(r, 1000));

    // Google
    console.log('2️⃣  Googleを開いています...');
    this.pages.google = await this.browser.newPage();
    await this.pages.google.setViewport({ width: 1280, height: 800 });
    await this.pages.google.goto('https://www.google.com/', { waitUntil: 'networkidle2' });
    console.log('   ✅ Google 準備完了');

    await new Promise(r => setTimeout(r, 1000));

    // Bing
    console.log('3️⃣  Bingを開いています...');
    this.pages.bing = await this.browser.newPage();
    await this.pages.bing.setViewport({ width: 1280, height: 800 });
    await this.pages.bing.goto('https://www.bing.com/', { waitUntil: 'networkidle2' });
    console.log('   ✅ Bing 準備完了');

    console.log('\n🎉 3つの検索エンジンの準備が完了しました！\n');
  }

  async searchAll(keyword) {
    console.log('=' .repeat(60));
    console.log(`🔍 検索キーワード: "${keyword}"`);
    console.log('=' .repeat(60));
    console.log('');

    // 並行して検索実行
    const searchPromises = [
      this.searchYahoo(keyword),
      this.searchGoogle(keyword),
      this.searchBing(keyword)
    ];

    await Promise.all(searchPromises);

    console.log('\n✨ 3つの検索エンジンで同時検索完了！\n');
  }

  async searchYahoo(keyword) {
    const page = this.pages.yahoo;
    await page.bringToFront();
    
    console.log('🟡 Yahoo! JAPAN で検索中...');
    const selector = 'input[name="p"]';
    
    await page.waitForSelector(selector);
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    
    // 1文字ずつ入力（演出効果）
    for (const char of keyword) {
      await page.keyboard.type(char);
      await new Promise(r => setTimeout(r, 100));
    }
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('   ✅ Yahoo! JAPAN 検索完了');
  }

  async searchGoogle(keyword) {
    const page = this.pages.google;
    await page.bringToFront();
    
    console.log('🔵 Google で検索中...');
    const selector = 'textarea[name="q"]';
    
    await page.waitForSelector(selector);
    await page.click(selector);
    
    // 1文字ずつ入力（演出効果）
    for (const char of keyword) {
      await page.keyboard.type(char);
      await new Promise(r => setTimeout(r, 100));
    }
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('   ✅ Google 検索完了');
  }

  async searchBing(keyword) {
    const page = this.pages.bing;
    await page.bringToFront();
    
    console.log('🟢 Bing で検索中...');
    const selector = 'input[name="q"]';
    
    await page.waitForSelector(selector);
    await page.click(selector);
    
    // 1文字ずつ入力（演出効果）
    for (const char of keyword) {
      await page.keyboard.type(char);
      await new Promise(r => setTimeout(r, 100));
    }
    
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('   ✅ Bing 検索完了');
  }

  async captureResults() {
    console.log('\n📸 検索結果のスクリーンショットを撮影中...\n');

    await this.pages.yahoo.bringToFront();
    await this.pages.yahoo.screenshot({ path: 'result-yahoo.png' });
    console.log('   💾 Yahoo! JAPAN: result-yahoo.png');

    await this.pages.google.bringToFront();
    await this.pages.google.screenshot({ path: 'result-google.png' });
    console.log('   💾 Google: result-google.png');

    await this.pages.bing.bringToFront();
    await this.pages.bing.screenshot({ path: 'result-bing.png' });
    console.log('   💾 Bing: result-bing.png');

    console.log('\n✅ スクリーンショット保存完了\n');
  }

  async showResults() {
    console.log('=' .repeat(60));
    console.log('📊 検索結果の比較');
    console.log('=' .repeat(60));
    console.log('');

    // Yahoo!
    const yahooTitle = await this.pages.yahoo.title();
    console.log('🟡 Yahoo! JAPAN:');
    console.log(`   タイトル: ${yahooTitle}`);
    
    // Google
    const googleTitle = await this.pages.google.title();
    console.log('\n🔵 Google:');
    console.log(`   タイトル: ${googleTitle}`);
    
    // Bing
    const bingTitle = await this.pages.bing.title();
    console.log('\n🟢 Bing:');
    console.log(`   タイトル: ${bingTitle}`);
    
    console.log('');
  }

  async finish() {
    console.log('=' .repeat(60));
    console.log('🎬 デモ完了！');
    console.log('=' .repeat(60));
    console.log('');
    console.log('📁 生成されたファイル:');
    console.log('   📸 result-yahoo.png - Yahoo! JAPANの検索結果');
    console.log('   📸 result-google.png - Googleの検索結果');
    console.log('   📸 result-bing.png - Bingの検索結果');
    console.log('');
    console.log('💡 3つのタブを順番に確認してください');
    console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
    console.log('');

    // タブを順番に表示（見やすく）
    await new Promise(r => setTimeout(r, 2000));
    await this.pages.yahoo.bringToFront();
    await new Promise(r => setTimeout(r, 2000));
    await this.pages.google.bringToFront();
    await new Promise(r => setTimeout(r, 2000));
    await this.pages.bing.bringToFront();

    // ブラウザを開いたまま待機
    await new Promise(() => {});
  }
}

// メイン実行
async function main() {
  const demo = new TripleSearchDemo();

  try {
    await demo.start();
    await demo.openAllSearchEngines();

    // 検索実行
    const keyword = 'Chrome DevTools MCP';
    await demo.searchAll(keyword);

    // 結果をキャプチャ
    await demo.captureResults();

    // 結果を表示
    await demo.showResults();

    await demo.finish();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
