/**
 * デモ: Yahoo! JAPANで「開発者に教えてくれてありがとう」を検索
 */

const puppeteer = require('puppeteer');

async function demoYahooSearch() {
  console.log('🚀 デモ開始: Yahoo! JAPANで検索操作\n');
  
  // ブラウザを起動
  console.log('📱 Chromeを起動中...');
  const browser = await puppeteer.launch({
    headless: false, // GUIモードで表示
    slowMo: 100 // 操作を見やすくするため少しゆっくり動作
  });
  
  const page = await browser.newPage();
  
  // Yahoo! JAPANにアクセス
  console.log('🌐 Yahoo! JAPANにアクセス中...');
  await page.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
  console.log('✅ Yahoo! JAPAN読み込み完了\n');
  
  // 検索窓を見つける
  console.log('🔍 検索窓を探しています...');
  const searchSelector = 'input[name="p"]'; // Yahoo!の検索窓
  await page.waitForSelector(searchSelector, { timeout: 5000 });
  console.log('✅ 検索窓を発見\n');
  
  // 検索窓をクリック
  console.log('🖱️  検索窓をクリック...');
  await page.click(searchSelector);
  await new Promise(r => setTimeout(r, 500));
  
  // テキストを入力
  const searchText = '開発者に教えてくれてありがとう';
  console.log(`⌨️  入力中: "${searchText}"`);
  await page.type(searchSelector, searchText, { delay: 100 }); // 1文字ずつゆっくり入力
  console.log('✅ 入力完了\n');
  
  // 少し待つ（サジェストが表示される様子を見る）
  console.log('⏳ サジェストを表示中...');
  await new Promise(r => setTimeout(r, 2000));
  
  // Enterキーを押して検索実行
  console.log('🔍 検索を実行中...');
  await page.keyboard.press('Enter');
  
  // 検索結果ページの読み込みを待つ
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('✅ 検索結果ページ読み込み完了\n');
  
  // 検索結果のタイトルを取得
  console.log('📊 検索結果を確認中...');
  const resultsCount = await page.$$eval('.sw-Card', elements => elements.length);
  console.log(`✅ 検索結果: 約${resultsCount}件の結果が表示されました\n`);
  
  // スクリーンショットを撮影
  const screenshotPath = 'yahoo-search-result.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 スクリーンショット保存: ${screenshotPath}\n`);
  
  console.log('🎉 デモ完了！');
  console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
  console.log('');
  
  // ブラウザを開いたまま待機
  await new Promise(() => {});
}

// エラーハンドリング付きで実行
demoYahooSearch().catch(error => {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
});
