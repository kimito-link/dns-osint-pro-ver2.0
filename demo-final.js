/**
 * 🎆 最終版: 感謝メッセージ + 花火 + キャラクターアニメーション
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function finalDemo() {
  console.log('🎆 最終演出デモ開始！\n');
  console.log('=' .repeat(60));
  console.log('📹 録画の準備をしてください');
  console.log('💡 5秒後に開始します...');
  console.log('=' .repeat(60));
  console.log('');
  
  await new Promise(r => setTimeout(r, 5000));
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized', '--autoplay-policy=no-user-gesture-required']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // 画像をBase64に変換
  const mainImagePath = 'C:\\Users\\info\\OneDrive\\ドキュメント\\Downloads\\7ac12afdfa82e1f3a0348bc2e4232643-removebg-preview.png';
  const yukkuriImagePath = 'C:\\Users\\info\\OneDrive\\ドキュメント\\Downloads\\ゆっくりキャラ\\ゆっくりキャラ\\りんく\\yukkuri-link-tuujoui-kuchiake.png';
  
  let mainImageBase64 = '';
  let yukkuriImageBase64 = '';
  
  try {
    mainImageBase64 = fs.readFileSync(mainImagePath).toString('base64');
    yukkuriImageBase64 = fs.readFileSync(yukkuriImagePath).toString('base64');
  } catch (error) {
    console.error('⚠️  画像の読み込みに失敗しました。デフォルトの演出で続行します。');
  }
  
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
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    
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
    
    #fireworks {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    }
    
    /* メインキャラクター */
    .main-character {
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      height: auto;
      z-index: 50;
      opacity: 0;
      animation: fadeIn 2s 7s forwards;
    }
    
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    
    /* ゆっくりキャラクター */
    .yukkuri {
      position: fixed;
      width: 120px;
      height: 120px;
      z-index: 60;
      opacity: 0;
    }
    
    .yukkuri.active {
      animation: orbit 8s infinite linear;
      opacity: 1;
    }
    
    @keyframes orbit {
      0% {
        left: 50%;
        top: 20%;
        transform: translate(-50%, -50%) rotate(0deg) scale(1);
      }
      25% {
        left: 75%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(90deg) scale(1.2);
      }
      50% {
        left: 50%;
        top: 80%;
        transform: translate(-50%, -50%) rotate(180deg) scale(0.8);
      }
      75% {
        left: 25%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(270deg) scale(1.3);
      }
      100% {
        left: 50%;
        top: 20%;
        transform: translate(-50%, -50%) rotate(360deg) scale(1);
      }
    }
    
    .yukkuri:nth-child(2) {
      animation-delay: 2s;
      animation-duration: 6s;
    }
    
    .yukkuri:nth-child(3) {
      animation-delay: 4s;
      animation-duration: 10s;
    }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
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
  </div>
  
  ${mainImageBase64 ? `<img src="data:image/png;base64,${mainImageBase64}" class="main-character" alt="キャラクター">` : ''}
  
  ${yukkuriImageBase64 ? `
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" alt="ゆっくり">
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" alt="ゆっくり">
    <img src="data:image/png;base64,${yukkuriImageBase64}" class="yukkuri" alt="ゆっくり">
  ` : ''}
  
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
    
    // ゆっくりキャラアクティブ化
    setTimeout(() => {
      document.querySelectorAll('.yukkuri').forEach(yukkuri => {
        yukkuri.classList.add('active');
      });
    }, 9000);
    
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
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
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
        this.velocity.y += 0.15;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
      }
    }
    
    const particles = [];
    const colors = ['#FF6B9D', '#C06FFF', '#FFA500', '#FFD700', '#00F5FF', '#FF1493', '#7FFF00'];
    
    function createFirework(x, y) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 120; i++) {
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
    
    // 花火を定期的に打ち上げ
    setTimeout(() => {
      setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        createFirework(x, y);
      }, 500);
    }, 8000);
    
    animate();
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  </script>
</body>
</html>
  `;
  
  console.log('✨ 演出ページを読み込み中...');
  await page.setContent(html);
  
  console.log('🎬 演出を開始します...');
  console.log('');
  console.log('📺 タイムライン:');
  console.log('  0-7秒: メッセージ表示');
  console.log('  7秒: キャラクター登場');
  console.log('  8秒: 花火開始');
  console.log('  9秒: ゆっくりキャラが動き出す');
  console.log('');
  console.log('💡 約30秒の演出です');
  console.log('📹 録画中...');
  console.log('');
  
  // 30秒間演出を実行
  await new Promise(r => setTimeout(r, 30000));
  
  console.log('✅ 演出完了！');
  console.log('💡 録画を停止してください');
  console.log('💡 ブラウザは開いたままです。確認後に手動で閉じてください。');
  console.log('');
  
  await new Promise(() => {});
}

finalDemo().catch(error => {
  console.error('❌ エラー:', error.message);
  console.error(error.stack);
  process.exit(1);
});
