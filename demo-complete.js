/**
 * 🎬 完全版デモ: 検索入力 → メッセージ → キャラクター → 花火
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function completeDemo() {
  console.log('🎬 完全版デモ開始！\n');
  console.log('=' .repeat(60));
  console.log('📹 録画の準備をしてください (Win + G)');
  console.log('💡 5秒後に開始します...');
  console.log('=' .repeat(60));
  console.log('');
  
  await new Promise(r => setTimeout(r, 5000));
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--start-maximized']
  });
  
  // ===== パート1: 検索入力デモ =====
  console.log('\n🎬 パート1: 検索窓入力デモ');
  console.log('=' .repeat(60));
  
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1920, height: 1080 });
  
  // Yahoo! JAPAN
  console.log('🟡 Yahoo! JAPANで検索...');
  await page1.goto('https://www.yahoo.co.jp/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page1.click('input[name="p"]');
  await new Promise(r => setTimeout(r, 1000));
  
  const text1 = 'Chrome DevTools MCP';
  for (const char of text1) {
    await page1.keyboard.type(char);
    await new Promise(r => setTimeout(r, 120));
  }
  
  console.log('✅ Yahoo! JAPAN入力完了');
  await new Promise(r => setTimeout(r, 2000));
  
  // Google
  console.log('🔵 Googleで検索...');
  await page1.goto('https://www.google.com/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page1.click('textarea[name="q"]');
  await new Promise(r => setTimeout(r, 1000));
  
  const text2 = 'Puppeteer 自動化';
  for (const char of text2) {
    await page1.keyboard.type(char);
    await new Promise(r => setTimeout(r, 120));
  }
  
  console.log('✅ Google入力完了');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('✅ パート1完了\n');
  
  // ===== パート2: メッセージ + キャラクター + 花火 =====
  console.log('🎬 パート2: メッセージと花火演出');
  console.log('=' .repeat(60));
  
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1920, height: 1080 });
  await page2.bringToFront();
  
  // 画像読み込み
  const mainImagePath = 'C:\\Users\\info\\OneDrive\\ドキュメント\\Downloads\\7ac12afdfa82e1f3a0348bc2e4232643-removebg-preview.png';
  const yukkuriImagePath = 'C:\\Users\\info\\OneDrive\\ドキュメント\\Downloads\\ゆっくりキャラ\\ゆっくりキャラ\\りんく\\yukkuri-link-tuujoui-kuchiake.png';
  
  let mainImageBase64 = '';
  let yukkuriImageBase64 = '';
  
  try {
    if (fs.existsSync(mainImagePath)) {
      mainImageBase64 = fs.readFileSync(mainImagePath).toString('base64');
      console.log('✅ メイン画像読み込み成功');
    }
    if (fs.existsSync(yukkuriImagePath)) {
      yukkuriImageBase64 = fs.readFileSync(yukkuriImagePath).toString('base64');
      console.log('✅ ゆっくり画像読み込み成功');
    }
  } catch (error) {
    console.error('⚠️  画像読み込みエラー:', error.message);
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 100%);
      min-height: 100vh;
      font-family: sans-serif;
      overflow: hidden;
      position: relative;
    }
    
    #fireworks {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      padding-top: 100px;
    }
    
    .message {
      font-size: 2.5em;
      color: white;
      margin: 20px 0;
      opacity: 0;
      text-shadow: 0 0 20px rgba(255,255,255,0.5);
    }
    
    .message.show { animation: fadeIn 1s forwards; }
    
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    
    .mention {
      color: #1DA1F2;
      font-weight: bold;
    }
    
    .magic {
      font-size: 3em;
      color: #FFD700;
      font-weight: bold;
    }
    
    .main-char {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      width: 350px;
      opacity: 0;
      z-index: 20;
    }
    
    .main-char.show {
      animation: charAppear 2s forwards;
    }
    
    @keyframes charAppear {
      to { opacity: 1; }
    }
    
    .yukkuri {
      position: fixed;
      width: 100px;
      height: 100px;
      z-index: 30;
    }
    
    .yukkuri.active {
      animation: float 5s infinite ease-in-out;
    }
    
    @keyframes float {
      0%, 100% {
        transform: translate(-50%, -50%) translateY(0) rotate(0deg) scale(1);
      }
      25% {
        transform: translate(-50%, -50%) translateY(-50px) rotate(90deg) scale(1.3);
      }
      50% {
        transform: translate(-50%, -50%) translateY(0) rotate(180deg) scale(0.9);
      }
      75% {
        transform: translate(-50%, -50%) translateY(50px) rotate(270deg) scale(1.2);
      }
    }
    
    #yukkuri1 { left: 30%; top: 30%; animation-delay: 0s; animation-duration: 4s; }
    #yukkuri2 { left: 70%; top: 40%; animation-delay: 1s; animation-duration: 6s; }
    #yukkuri3 { left: 50%; top: 20%; animation-delay: 2s; animation-duration: 5s; }
  </style>
</head>
<body>
  <canvas id="fireworks"></canvas>
  
  <div class="content">
    <div class="message" id="msg1">
      <span class="mention">@c0tanpoTesh1ta</span> コタのAI紀行さんに使い方教えてもらいました。
    </div>
    <div class="message" id="msg2">
      <span class="mention">@KoichiNishizuka</span> さんありがとう。
    </div>
    <div class="message magic" id="msg3">
      🪄 テクノロジーの魔法を実現させて 🪄
    </div>
    <div class="message" id="msg4">
      感謝です 🙏
    </div>
  </div>
  
  ${mainImageBase64 ? `<img src="data:image/png;base64,${mainImageBase64}" class="main-char" id="mainChar">` : ''}
  
  ${yukkuriImageBase64 ? `
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" id="yukkuri1">
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" id="yukkuri2">
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" id="yukkuri3">
  ` : ''}
  
  <script>
    // メッセージ表示
    setTimeout(() => document.getElementById('msg1').classList.add('show'), 500);
    setTimeout(() => document.getElementById('msg2').classList.add('show'), 2000);
    setTimeout(() => document.getElementById('msg3').classList.add('show'), 3500);
    setTimeout(() => document.getElementById('msg4').classList.add('show'), 5000);
    
    // キャラクター表示
    setTimeout(() => {
      const char = document.getElementById('mainChar');
      if (char) char.classList.add('show');
    }, 6500);
    
    // ゆっくりキャラ動作開始
    setTimeout(() => {
      ['yukkuri1', 'yukkuri2', 'yukkuri3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
      });
    }, 8000);
    
    // 花火
    const canvas = document.getElementById('fireworks');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.alpha = 1;
      }
      
      update() {
        this.vy += 0.1;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
      }
      
      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
      }
    }
    
    const particles = [];
    const colors = ['#FF6B9D', '#FFD700', '#00F5FF', '#FF1493', '#7FFF00'];
    
    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle(x, y, color));
      }
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(10,10,46,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        if (p.alpha <= 0) particles.splice(i, 1);
        else { p.update(); p.draw(); }
      });
      
      requestAnimationFrame(animate);
    }
    
    // 9秒後から花火開始
    setTimeout(() => {
      setInterval(createFirework, 600);
    }, 9000);
    
    animate();
  </script>
</body>
</html>
  `;
  
  await page2.setContent(html);
  console.log('✅ 演出ページ表示');
  console.log('');
  console.log('📺 タイムライン:');
  console.log('  0.5秒: メッセージ1');
  console.log('  2秒: メッセージ2');
  console.log('  3.5秒: メッセージ3');
  console.log('  5秒: メッセージ4');
  console.log('  6.5秒: キャラクター登場');
  console.log('  8秒: ゆっくりキャラが動き出す');
  console.log('  9秒: 花火開始');
  console.log('');
  console.log('💡 約25秒の演出です');
  
  await new Promise(r => setTimeout(r, 25000));
  
  console.log('\n✅ 全演出完了！');
  console.log('💡 録画を停止してください');
  console.log('💡 ブラウザは開いたままです');
  
  await new Promise(() => {});
}

completeDemo().catch(error => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
