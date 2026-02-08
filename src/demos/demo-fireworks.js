/**
 * 🎆 感謝のメッセージ + 花火演出 + 画面録画デモ
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function fireworksDemo() {
  console.log('🎆 感謝のメッセージ + 花火演出デモ開始！\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized', '--autoplay-policy=no-user-gesture-required']
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
  <title>感謝のメッセージ 🎆</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0a2e;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    
    /* 星空背景 */
    .stars {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      animation: twinkle 3s infinite;
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.5); }
    }
    
    /* メッセージコンテナ */
    .container {
      max-width: 900px;
      width: 90%;
      text-align: center;
      z-index: 10;
      position: relative;
    }
    
    .message {
      font-size: 2.5em;
      color: white;
      margin: 20px 0;
      opacity: 0;
      transform: translateY(30px);
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }
    
    .message.show {
      animation: fadeInUp 1s forwards;
    }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .mention {
      color: #1DA1F2;
      font-weight: bold;
      text-shadow: 0 0 20px rgba(29, 161, 242, 0.8);
    }
    
    .magic {
      font-size: 3em;
      color: #FFD700;
      font-weight: bold;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }
    
    .logo {
      font-size: 4em;
      font-weight: bold;
      background: linear-gradient(45deg, #FF6B9D, #C06FFF, #FFA500, #FFD700);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 3s ease infinite;
      margin: 40px 0;
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* 花火キャンバス */
    #fireworks {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    }
    
    /* 録画中インジケーター */
    .recording {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 1.2em;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .rec-dot {
      width: 15px;
      height: 15px;
      background: white;
      border-radius: 50%;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  
  <div class="recording">
    <div class="rec-dot"></div>
    REC
  </div>
  
  <canvas id="fireworks"></canvas>
  
  <div class="container">
    <div class="message" data-delay="0">
      <span class="mention">@c0tanpoTesh1ta</span> コタのAI紀行さんに
    </div>
    <div class="message" data-delay="1000">
      使い方教えてもらいました。
    </div>
    <div class="message" data-delay="2500">
      <span class="mention">@KoichiNishizuka</span> さんありがとう。
    </div>
    <div class="message magic" data-delay="4000">
      🪄 テクノロジーの魔法を実現させて 🪄
    </div>
    <div class="message" data-delay="5500">
      感謝です 🙏
    </div>
    <div class="message logo" data-delay="7000">
      君斗りんく
    </div>
  </div>
  
  <script>
    // 星空生成
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      starsContainer.appendChild(star);
    }
    
    // メッセージ順次表示
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => {
      const delay = parseInt(msg.dataset.delay) || 0;
      setTimeout(() => {
        msg.classList.add('show');
      }, delay);
    });
    
    // 花火アニメーション
    const canvas = document.getElementById('fireworks');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      }
      
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      update() {
        this.velocity.y += 0.1; // 重力
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
      }
    }
    
    const particles = [];
    const colors = ['#FF6B9D', '#C06FFF', '#FFA500', '#FFD700', '#00F5FF', '#FF1493'];
    
    function createFirework(x, y) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle(x, y, color));
      }
    }
    
    function animate() {
      ctx.fillStyle = 'rgba(10, 10, 46, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          particle.update();
          particle.draw();
        }
      });
      
      requestAnimationFrame(animate);
    }
    
    // 花火を定期的に打ち上げ（8秒後から開始）
    setTimeout(() => {
      setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        createFirework(x, y);
      }, 600);
    }, 8000);
    
    animate();
    
    // ウィンドウリサイズ対応
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>
  `;
  
  console.log('✨ カスタムページを読み込み中...');
  await page.setContent(html);
  
  console.log('🎬 演出を開始します...');
  console.log('');
  console.log('=' .repeat(60));
  console.log('📺 画面表示内容:');
  console.log('=' .repeat(60));
  console.log('');
  console.log('  @c0tanpoTesh1ta コタのAI紀行さんに');
  console.log('  使い方教えてもらいました。');
  console.log('');
  console.log('  @KoichiNishizuka さんありがとう。');
  console.log('');
  console.log('  🪄 テクノロジーの魔法を実現させて 🪄');
  console.log('  感謝です 🙏');
  console.log('');
  console.log('  君斗りんく');
  console.log('');
  console.log('=' .repeat(60));
  console.log('');
  console.log('🎆 8秒後に花火が打ち上がります...');
  console.log('📹 画面録画は手動で行ってください (Win + G キー)');
  console.log('💡 20秒間の演出です');
  console.log('');
  
  // 20秒間演出を実行
  await new Promise(r => setTimeout(r, 20000));
  
  console.log('✅ 演出完了！');
  console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
  console.log('');
  
  // ブラウザを開いたまま待機
  await new Promise(() => {});
}

fireworksDemo().catch(error => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
