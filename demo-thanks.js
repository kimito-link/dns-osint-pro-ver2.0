/**
 * 🎭 感謝のメッセージ演出デモ
 * トリッキーな演出でTwitter風のメッセージを表示
 */

const puppeteer = require('puppeteer');

async function thanksDemo() {
  console.log('🎭 感謝のメッセージ演出を開始します...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // カスタムHTMLページを作成
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks Message</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    
    .container {
      max-width: 600px;
      width: 90%;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      position: relative;
      opacity: 0;
      transform: scale(0.8);
      animation: fadeInScale 1s forwards;
    }
    
    @keyframes fadeInScale {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .sparkle {
      position: absolute;
      font-size: 30px;
      animation: sparkle 2s infinite;
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
    
    h1 {
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fadeIn 1s 0.5s backwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .message {
      font-size: 1.3em;
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
      animation: fadeIn 1s 1s backwards;
    }
    
    .mention {
      color: #1DA1F2;
      font-weight: bold;
      text-decoration: none;
      transition: all 0.3s;
      display: inline-block;
    }
    
    .mention:hover {
      transform: scale(1.1);
      text-shadow: 0 0 10px rgba(29, 161, 242, 0.5);
    }
    
    .tech-magic {
      font-size: 1.5em;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
      color: #764ba2;
      animation: pulse 2s infinite, fadeIn 1s 1.5s backwards;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .tweet-link {
      display: block;
      background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
      color: white;
      text-decoration: none;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      font-size: 1.2em;
      font-weight: bold;
      margin-top: 30px;
      box-shadow: 0 10px 30px rgba(29, 161, 242, 0.3);
      transition: all 0.3s;
      animation: fadeIn 1s 2s backwards;
      position: relative;
      overflow: hidden;
    }
    
    .tweet-link::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
      transform: rotate(45deg);
      animation: shine 3s infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
    
    .tweet-link:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(29, 161, 242, 0.5);
    }
    
    .emoji {
      font-size: 1.5em;
      display: inline-block;
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .stars {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    }
    
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      animation: twinkle 2s infinite;
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  
  <div class="container">
    <div class="sparkle" style="top: 10px; left: 10px;">✨</div>
    <div class="sparkle" style="top: 10px; right: 10px; animation-delay: 0.5s;">✨</div>
    <div class="sparkle" style="bottom: 10px; left: 10px; animation-delay: 1s;">✨</div>
    <div class="sparkle" style="bottom: 10px; right: 10px; animation-delay: 1.5s;">✨</div>
    
    <h1><span class="emoji">🎉</span> Thank You! <span class="emoji">🎉</span></h1>
    
    <div class="message">
      <a href="https://x.com/c0tanpoTesh1ta" class="mention" target="_blank">@c0tanpoTesh1ta</a> 
      コタのAI紀行さんに使い方教えてもらいました。
    </div>
    
    <div class="message">
      <a href="https://x.com/KoichiNishizuka" class="mention" target="_blank">@KoichiNishizuka</a> 
      さんありがとう。
    </div>
    
    <div class="tech-magic">
      <span class="emoji">🪄</span> テクノロジーの魔法を実現させて <span class="emoji">🪄</span>
      <br>
      感謝です <span class="emoji">🙏</span>
    </div>
    
    <a href="https://x.com/KoichiNishizuka/status/1982978686786908461?s=20" 
       class="tweet-link" 
       target="_blank">
      <span class="emoji">🐦</span> 元のツイートを見る <span class="emoji">✨</span>
    </a>
  </div>
  
  <script>
    // ランダムな星を生成
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 2 + 's';
      starsContainer.appendChild(star);
    }
    
    // 5秒後に自動的に元のツイートを開く
    setTimeout(() => {
      console.log('🎬 5秒後に元のツイートを自動で開きます...');
    }, 3000);
  </script>
</body>
</html>
  `;
  
  console.log('✨ カスタムページを読み込み中...');
  await page.setContent(html);
  
  console.log('🎨 演出を表示中...');
  console.log('');
  console.log('=' .repeat(60));
  console.log('💡 画面に以下のメッセージが表示されています:');
  console.log('=' .repeat(60));
  console.log('');
  console.log('  @c0tanpoTesh1ta コタのAI紀行さんに使い方教えてもらいました。');
  console.log('');
  console.log('  @KoichiNishizuka さんありがとう。');
  console.log('');
  console.log('  🪄 テクノロジーの魔法を実現させて 🪄');
  console.log('  感謝です 🙏');
  console.log('');
  console.log('=' .repeat(60));
  
  // 5秒待ってから元のツイートを別タブで開く
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('\n🐦 元のツイートを開きます...');
  const tweetPage = await browser.newPage();
  await tweetPage.goto('https://x.com/KoichiNishizuka/status/1982978686786908461?s=20');
  
  console.log('✅ 元のツイートページを開きました');
  console.log('');
  console.log('🎬 演出完了！');
  console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
  console.log('');
  
  // ブラウザを開いたまま待機
  await new Promise(() => {});
}

thanksDemo().catch(error => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
