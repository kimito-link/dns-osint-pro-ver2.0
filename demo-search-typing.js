/**
 * 🎬 検索窓タイピングシーン（録画用）
 * Yahoo! JAPAN → Google → Bing の順に検索窓に入力
 */

const puppeteer = require('puppeteer');

async function searchTypingDemo() {
  console.log('🎬 検索窓タイピングシーン開始！\n');
  console.log('=' .repeat(60));
  console.log('📹 録画の準備をしてください (Win + G)');
  console.log('💡 3秒後に開始します...');
  console.log('=' .repeat(60));
  console.log('');
  
  await new Promise(r => setTimeout(r, 3000));
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // ===== シーン1: Yahoo! JAPAN =====
  console.log('🟡 シーン1: Yahoo! JAPAN');
  console.log('─'.repeat(60));
  
  await page.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const yahooSelector = 'input[name="p"]';
  await page.waitForSelector(yahooSelector);
  await page.click(yahooSelector);
  await new Promise(r => setTimeout(r, 1000));
  
  const text1 = 'Chrome DevTools MCP';
  console.log(`⌨️  入力: "${text1}"`);
  
  for (const char of text1) {
    await page.keyboard.type(char);
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log('✅ Yahoo! JAPAN 入力完了\n');
  await new Promise(r => setTimeout(r, 3000));
  
  // ===== シーン2: Google =====
  console.log('🔵 シーン2: Google');
  console.log('─'.repeat(60));
  
  await page.goto('https://www.google.com/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const googleSelector = 'textarea[name="q"]';
  await page.waitForSelector(googleSelector);
  await page.click(googleSelector);
  await new Promise(r => setTimeout(r, 1000));
  
  const text2 = 'Puppeteer 自動化';
  console.log(`⌨️  入力: "${text2}"`);
  
  for (const char of text2) {
    await page.keyboard.type(char);
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log('✅ Google 入力完了\n');
  await new Promise(r => setTimeout(r, 3000));
  
  // ===== シーン3: Bing =====
  console.log('🟢 シーン3: Bing');
  console.log('─'.repeat(60));
  
  await page.goto('https://www.bing.com/?cc=jp', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Bingは複数の検索窓があるので、メインのものを選択
  try {
    await page.waitForSelector('#sb_form_q', { timeout: 5000 });
    await page.click('#sb_form_q');
  } catch {
    // フォールバック
    const bingSelector = 'input[name="q"]';
    await page.waitForSelector(bingSelector);
    await page.click(bingSelector);
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  const text3 = 'AI 開発支援';
  console.log(`⌨️  入力: "${text3}"`);
  
  for (const char of text3) {
    await page.keyboard.type(char);
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log('✅ Bing 入力完了\n');
  await new Promise(r => setTimeout(r, 3000));
  
  // ===== フィナーレ =====
  console.log('=' .repeat(60));
  console.log('🎉 全シーン完了！');
  console.log('=' .repeat(60));
  console.log('');
  console.log('💡 録画を停止してください (Win + Alt + R)');
  console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
  console.log('');
  
  // ブラウザを開いたまま待機
  await new Promise(() => {});
}

searchTypingDemo().catch(error => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
