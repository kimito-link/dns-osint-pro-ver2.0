/**
 * 🎬 Chrome DevTools MCP デモンストレーション
 * 
 * Yahoo! JAPANで複数の検索を自動実行して、
 * 結果を収集・分析するデモ
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class MCPShowcase {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async start() {
    console.log('🎬 Chrome DevTools MCP デモンストレーション開始！\n');
    console.log('=' .repeat(60));
    console.log('💡 これからYahoo! JAPANで以下のことを自動実行します:');
    console.log('  1️⃣  複数のキーワードで自動検索');
    console.log('  2️⃣  検索結果のタイトルを自動収集');
    console.log('  3️⃣  スクリーンショットを自動撮影');
    console.log('  4️⃣  パフォーマンスを自動測定');
    console.log('  5️⃣  レポートを自動生成');
    console.log('=' .repeat(60));
    console.log('');
    
    // ブラウザ起動
    console.log('🚀 Chromeを起動中...');
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 80,
      args: ['--start-maximized']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    console.log('✅ Chrome起動完了\n');
  }

  async searchYahoo(keyword) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 検索キーワード: "${keyword}"`);
    console.log('='.repeat(60));
    
    // Yahoo! JAPANにアクセス
    console.log('📱 Yahoo! JAPANにアクセス中...');
    await this.page.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
    
    // 検索窓に入力
    const searchSelector = 'input[name="p"]';
    await this.page.waitForSelector(searchSelector);
    console.log('⌨️  検索キーワードを入力中...');
    
    // 既存の入力をクリア
    await this.page.click(searchSelector, { clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    
    // 新しいキーワードを入力
    await this.page.type(searchSelector, keyword, { delay: 100 });
    await new Promise(r => setTimeout(r, 1000));
    
    // 検索実行
    console.log('🚀 検索を実行中...');
    await this.page.keyboard.press('Enter');
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ 検索結果ページ読み込み完了');
    
    // 結果を収集
    const data = await this.collectResults(keyword);
    this.results.push(data);
    
    // スクリーンショット
    const filename = `screenshot-${keyword.replace(/\s+/g, '-')}.png`;
    await this.page.screenshot({ path: filename, fullPage: false });
    console.log(`📸 スクリーンショット保存: ${filename}`);
    
    return data;
  }

  async collectResults(keyword) {
    console.log('📊 検索結果を収集中...');
    
    // 検索結果のタイトルを取得
    const titles = await this.page.$$eval('.sw-Card h3', elements => 
      elements.slice(0, 5).map(el => el.textContent.trim())
    );
    
    // パフォーマンスメトリクス
    const metrics = await this.page.metrics();
    const timing = JSON.parse(
      await this.page.evaluate(() => JSON.stringify(window.performance.timing))
    );
    
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const memoryUsage = (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2);
    
    console.log(`  ✅ 検索結果: ${titles.length}件取得`);
    console.log(`  ⏱️  ページ読み込み: ${loadTime}ms`);
    console.log(`  💾 メモリ使用量: ${memoryUsage}MB`);
    
    return {
      keyword,
      titles,
      loadTime,
      memoryUsage,
      timestamp: new Date().toISOString()
    };
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 最終レポート生成中...');
    console.log('='.repeat(60) + '\n');
    
    const report = {
      title: 'Chrome DevTools MCP デモンストレーション結果',
      timestamp: new Date().toISOString(),
      totalSearches: this.results.length,
      results: this.results,
      summary: {
        averageLoadTime: (this.results.reduce((sum, r) => sum + r.loadTime, 0) / this.results.length).toFixed(0),
        totalTitles: this.results.reduce((sum, r) => sum + r.titles.length, 0),
        averageMemory: (this.results.reduce((sum, r) => sum + parseFloat(r.memoryUsage), 0) / this.results.length).toFixed(2)
      }
    };
    
    // JSONレポート保存
    fs.writeFileSync('demo-report.json', JSON.stringify(report, null, 2));
    console.log('💾 JSONレポート保存: demo-report.json');
    
    // 見やすいテキストレポート
    let textReport = '';
    textReport += '═'.repeat(60) + '\n';
    textReport += '🎬 Chrome DevTools MCP デモンストレーション結果\n';
    textReport += '═'.repeat(60) + '\n\n';
    
    textReport += '📊 サマリー:\n';
    textReport += `  総検索数: ${report.totalSearches}件\n`;
    textReport += `  収集タイトル数: ${report.summary.totalTitles}件\n`;
    textReport += `  平均読み込み時間: ${report.summary.averageLoadTime}ms\n`;
    textReport += `  平均メモリ使用量: ${report.summary.averageMemory}MB\n\n`;
    
    this.results.forEach((result, index) => {
      textReport += `${'─'.repeat(60)}\n`;
      textReport += `🔍 検索 ${index + 1}: "${result.keyword}"\n`;
      textReport += `${'─'.repeat(60)}\n`;
      textReport += `⏱️  読み込み時間: ${result.loadTime}ms\n`;
      textReport += `💾 メモリ使用量: ${result.memoryUsage}MB\n`;
      textReport += `\n📋 取得したタイトル:\n`;
      result.titles.forEach((title, i) => {
        textReport += `  ${i + 1}. ${title}\n`;
      });
      textReport += '\n';
    });
    
    fs.writeFileSync('demo-report.txt', textReport);
    console.log('💾 テキストレポート保存: demo-report.txt\n');
    
    // コンソール出力
    console.log(textReport);
    
    return report;
  }

  async finish() {
    console.log('═'.repeat(60));
    console.log('✨ デモンストレーション完了！');
    console.log('═'.repeat(60));
    console.log('\n📁 生成されたファイル:');
    console.log('  📸 スクリーンショット: screenshot-*.png');
    console.log('  📊 JSONレポート: demo-report.json');
    console.log('  📝 テキストレポート: demo-report.txt');
    console.log('\n💡 ブラウザは10秒後に自動的に閉じます...\n');
    
    await new Promise(r => setTimeout(r, 10000));
    await this.browser.close();
    console.log('✅ 完了！');
  }
}

// メイン実行
async function main() {
  const showcase = new MCPShowcase();
  
  try {
    await showcase.start();
    
    // 複数のキーワードで検索デモ
    const keywords = [
      'Chrome DevTools',
      'Puppeteer 自動化',
      '開発効率化ツール'
    ];
    
    for (const keyword of keywords) {
      await showcase.searchYahoo(keyword);
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // レポート生成
    showcase.generateReport();
    
    await showcase.finish();
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
