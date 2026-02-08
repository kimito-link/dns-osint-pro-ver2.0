/**
 * ⌨️ タイピング演出デモ
 * Yahoo! JAPAN、Google、Bingで検索窓に文字を入力する様子を見せる
 */

const puppeteer = require('puppeteer');

class TypingDemo {
  constructor() {
    this.browser = null;
  }

  async start() {
    console.log('⌨️  タイピング演出デモ開始！\n');
    console.log('=' .repeat(60));
    console.log('💡 検索窓に1文字ずつゆっくり入力する様子をお見せします');
    console.log('=' .repeat(60));
    console.log('');

    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 50, // 少しゆっくり動作
      args: ['--start-maximized']
    });

    console.log('✅ Chrome起動完了\n');
  }

  async typeInYahoo() {
    console.log('🟡 Yahoo! JAPAN でタイピングデモ');
    console.log('─'.repeat(60));

    const page = await this.browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📱 Yahoo! JAPANにアクセス中...');
    await page.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
    console.log('✅ ページ読み込み完了\n');

    // 検索窓をクリック
    const selector = 'input[name="p"]';
    await page.waitForSelector(selector);
    
    console.log('🖱️  検索窓をクリック...');
    await page.click(selector);
    await new Promise(r => setTimeout(r, 1000));

    // タイピング開始
    const text = 'Chrome DevTools MCP デモ';
    console.log(`\n⌨️  タイピング開始: "${text}"\n`);
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await page.keyboard.type(char);
      
      // 現在の入力状態を表示
      const currentText = text.substring(0, i + 1);
      console.log(`   入力中: ${currentText}`);
      
      // 1文字ごとに少し待つ（見やすくするため）
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n✅ タイピング完了！');
    console.log('⏸️  3秒間表示します...\n');
    await new Promise(r => setTimeout(r, 3000));

    // スクリーンショット
    await page.screenshot({ path: 'typing-yahoo.png' });
    console.log('📸 スクリーンショット保存: typing-yahoo.png\n');

    return page;
  }

  async typeInGoogle() {
    console.log('🔵 Google でタイピングデモ');
    console.log('─'.repeat(60));

    const page = await this.browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📱 Googleにアクセス中...');
    await page.goto('https://www.google.com/', { waitUntil: 'networkidle2' });
    console.log('✅ ページ読み込み完了\n');

    // 検索窓をクリック
    const selector = 'textarea[name="q"]';
    await page.waitForSelector(selector);
    
    console.log('🖱️  検索窓をクリック...');
    await page.click(selector);
    await new Promise(r => setTimeout(r, 1000));

    // タイピング開始
    const text = 'Puppeteer 自動化';
    console.log(`\n⌨️  タイピング開始: "${text}"\n`);
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await page.keyboard.type(char);
      
      const currentText = text.substring(0, i + 1);
      console.log(`   入力中: ${currentText}`);
      
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n✅ タイピング完了！');
    console.log('⏸️  3秒間表示します...\n');
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: 'typing-google.png' });
    console.log('📸 スクリーンショット保存: typing-google.png\n');

    return page;
  }

  async typeInBing() {
    console.log('🟢 Bing でタイピングデモ');
    console.log('─'.repeat(60));

    const page = await this.browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📱 Bingにアクセス中...');
    await page.goto('https://www.bing.com/', { waitUntil: 'networkidle2' });
    console.log('✅ ページ読み込み完了\n');

    // 検索窓をクリック
    const selector = 'input[name="q"]';
    await page.waitForSelector(selector);
    
    console.log('🖱️  検索窓をクリック...');
    await page.click(selector);
    await new Promise(r => setTimeout(r, 1000));

    // タイピング開始
    const text = 'AI 開発支援ツール';
    console.log(`\n⌨️  タイピング開始: "${text}"\n`);
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      await page.keyboard.type(char);
      
      const currentText = text.substring(0, i + 1);
      console.log(`   入力中: ${currentText}`);
      
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n✅ タイピング完了！');
    console.log('⏸️  3秒間表示します...\n');
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: 'typing-bing.png' });
    console.log('📸 スクリーンショット保存: typing-bing.png\n');

    return page;
  }

  async finish() {
    console.log('=' .repeat(60));
    console.log('🎬 タイピングデモ完了！');
    console.log('=' .repeat(60));
    console.log('');
    console.log('📁 生成されたファイル:');
    console.log('   📸 typing-yahoo.png - Yahoo! JAPANでの入力');
    console.log('   📸 typing-google.png - Googleでの入力');
    console.log('   📸 typing-bing.png - Bingでの入力');
    console.log('');
    console.log('✨ 3つの検索エンジンで自動タイピングを実演しました！');
    console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
    console.log('');

    await new Promise(() => {});
  }
}

// メイン実行
async function main() {
  const demo = new TypingDemo();

  try {
    await demo.start();

    console.log('\n🎬 デモシーケンス開始\n');
    console.log('');

    // 順番に実行
    await demo.typeInYahoo();
    await demo.typeInGoogle();
    await demo.typeInBing();

    await demo.finish();

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
