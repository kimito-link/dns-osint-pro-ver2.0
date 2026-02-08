/**
 * 🎨 LoadingSpinner Component
 * プログレスバー型ローディング画面を生成するコンポーネント
 * @version 2.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * プログレスバー型ローディングスピナー
 * @param {string} message - ローディングメッセージ
 * @returns {string} HTML文字列
 */
function createLoadingSpinner(message = 'まっててね') {
  const uniqueId = 'loading-progress-' + Math.random().toString(36).substr(2, 9);
  
  return `
    <style>
      @keyframes progressBar {
        0% { width: 0%; }
        20% { width: 30%; }
        40% { width: 60%; }
        60% { width: 75%; }
        80% { width: 90%; }
        95% { width: 98%; }
        100% { width: 100%; }
      }
      @keyframes progressShine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(300%); }
      }
      @keyframes messagePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      @keyframes linkBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.05); }
      }
      .loading-progress-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px 20px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        border: 2px solid rgba(255,255,255,0.2);
        width: 100%;
        box-sizing: border-box;
        margin: 0;
      }
      .loading-link-character {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0;
        gap: 20px;
        position: relative;
        width: 100%;
        padding: 20px 30px 30px 30px;
      }
      .loading-character-wrapper {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
      }
      .loading-character-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.3);
        overflow: hidden;
        background: #fff;
        animation: linkBounce 1.5s ease-in-out infinite, loadingRotate 3s linear infinite;
      }
      @keyframes loadingRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .loading-character-container::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(transparent, rgba(255,255,255,0.3), transparent 30%);
        animation: loadingRotate 2s linear infinite;
        z-index: 10;
      }
      .loading-character-part {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
      .loading-character-face {
        z-index: 1;
        position: absolute;
      }
      .loading-character-eyes {
        z-index: 2;
        position: absolute;
        transition: opacity 0.15s ease-in-out;
      }
      .loading-character-mouth {
        z-index: 3;
        position: absolute;
        transition: opacity 0.15s ease-in-out;
      }
      .loading-link-message {
        color: #fff;
        font-size: 1.4em;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: messagePulse 1.5s ease-in-out infinite;
        position: relative;
        z-index: 10;
        text-align: center;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .loading-link-message::after {
        content: '...';
        animation: loadingDots 1.5s steps(4, end) infinite;
      }
      @keyframes loadingDots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
      }
      .loading-progress-wrapper {
        width: 100%;
        margin: 0 0 25px 0;
        padding: 0 30px;
      }
      .loading-progress-bar {
        width: 100%;
        height: 12px;
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .loading-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #fff 0%, #fbbf24 50%, #fff 100%);
        border-radius: 10px;
        animation: progressBar 3s ease-in-out infinite;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(255,255,255,0.5);
      }
      .loading-progress-shine {
        position: absolute;
        top: 0;
        left: 0;
        width: 30%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
        animation: progressShine 2s ease-in-out infinite;
      }
      .loading-progress-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
        color: #fff;
        font-size: 1em;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      .loading-progress-percent {
        font-weight: bold;
        color: #fff;
        font-size: 1.2em;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .loading-steps {
        display: flex;
        justify-content: space-around;
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
        padding: 0 30px 20px 30px;
        font-size: 0.9em;
        color: #fff;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      .loading-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .loading-step-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        border: 2px solid rgba(255,255,255,0.6);
        animation: stepPulse 2s ease-in-out infinite;
      }
      .loading-step-dot.active {
        background: #fff;
        border-color: #fff;
        box-shadow: 0 0 12px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4);
        transform: scale(1.3);
      }
      @keyframes stepPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .loading-step:nth-child(1) .loading-step-dot { animation-delay: 0s; }
      .loading-step:nth-child(2) .loading-step-dot { animation-delay: 0.3s; }
      .loading-step:nth-child(3) .loading-step-dot { animation-delay: 0.6s; }
      .loading-step:nth-child(4) .loading-step-dot { animation-delay: 0.9s; }
    </style>
    <tr>
      <td colspan="2" style="padding: 0; width: 100%;">
        <div class="loading-progress-container">
      <div class="loading-link-character">
        <div class="loading-link-message">読み込み中</div>
        <div class="loading-character-wrapper">
          <div class="loading-character-container" id="${uniqueId}-rinku">
            <img src="images/partsfile/rinku/rinku-face.png" alt="りんくの顔" class="loading-character-part loading-character-face">
            <img src="images/partsfile/rinku/rinku-eyes-normal.png" alt="りんくの目" class="loading-character-part loading-character-eyes" id="${uniqueId}-rinku-eyes">
            <img src="images/partsfile/rinku/rinku-mouth-closed.png" alt="りんくの口" class="loading-character-part loading-character-mouth" id="${uniqueId}-rinku-mouth">
          </div>
        </div>
      </div>
      <div class="loading-progress-wrapper">
        <div class="loading-progress-bar">
          <div class="loading-progress-fill" id="${uniqueId}">
            <div class="loading-progress-shine"></div>
          </div>
        </div>
        <div class="loading-progress-text">
          <span>調査中...</span>
          <span class="loading-progress-percent" id="${uniqueId}-percent">0%</span>
        </div>
      </div>
      <div class="loading-steps">
        <div class="loading-step">
          <div class="loading-step-dot active"></div>
          <span>DNS</span>
        </div>
        <div class="loading-step">
          <div class="loading-step-dot"></div>
          <span>WHOIS</span>
        </div>
        <div class="loading-step">
          <div class="loading-step-dot"></div>
          <span>セキュリティ</span>
        </div>
        <div class="loading-step">
          <div class="loading-step-dot"></div>
          <span>診断</span>
        </div>
      </div>
        </div>
      </td>
    </tr>
    <script>
      (function() {
        const progressBar = document.getElementById('${uniqueId}');
        const percentText = document.getElementById('${uniqueId}-percent');
        const steps = document.querySelectorAll('.loading-step-dot');
        
        // りんくの要素を取得
        const rinkuEyes = document.getElementById('${uniqueId}-rinku-eyes');
        const rinkuMouth = document.getElementById('${uniqueId}-rinku-mouth');
        
        let currentPercent = 0;
        let currentStep = 0;
        
        // りんくの状態
        let eyeState = 'normal';
        let mouthState = 'closed';
        let lastBlinkTime = Date.now();
        let lastMouthChangeTime = Date.now();
        
        // 目の画像を切り替え
        const updateEyes = (state) => {
          if (!rinkuEyes) return;
          const eyeImages = {
            'normal': 'images/partsfile/rinku/rinku-eyes-normal.png',
            'blink': 'images/partsfile/rinku/rinku-eyes-blink.png',
            'smile': 'images/partsfile/rinku/rinku-eyes-smile.png'
          };
          const newSrc = eyeImages[state] || eyeImages.normal;
          if (rinkuEyes.src !== newSrc) {
            rinkuEyes.src = newSrc;
            eyeState = state;
          }
        };
        
        // 口の画像を切り替え
        const updateMouth = (state) => {
          if (!rinkuMouth) return;
          const mouthImages = {
            'closed': 'images/partsfile/rinku/rinku-mouth-closed.png',
            'open': 'images/partsfile/rinku/rinku-mouth-open.png'
          };
          const newSrc = mouthImages[state] || mouthImages.closed;
          if (rinkuMouth.src !== newSrc) {
            rinkuMouth.src = newSrc;
            mouthState = state;
          }
        };
        
        // りんくのアニメーション（読み込み中らしく）
        const animateCharacter = () => {
          const now = Date.now();
          
          // まばたきアニメーション（1-2秒間隔）- より頻繁に
          if (now - lastBlinkTime > 1000 + Math.random() * 1000) {
            updateEyes('blink');
            setTimeout(() => updateEyes('normal'), 100);
            lastBlinkTime = now;
          }
          
          // 口の開閉アニメーション（0.3-0.6秒間隔）- より頻繁に
          if (now - lastMouthChangeTime > 300 + Math.random() * 300) {
            updateMouth(mouthState === 'closed' ? 'open' : 'closed');
            lastMouthChangeTime = now;
          }
        };
        
        // プログレスバーのアニメーションに合わせてパーセンテージを更新
        const updateProgress = () => {
          const now = Date.now();
          const duration = 3000; // 3秒のアニメーション
          const elapsed = (now % duration) / duration;
          
          // 段階的に進捗を更新
          if (elapsed < 0.2) {
            currentPercent = Math.floor(elapsed * 150); // 0-30%
            if (currentStep < 1) {
              steps[0].classList.add('active');
              currentStep = 1;
            }
          } else if (elapsed < 0.4) {
            currentPercent = 30 + Math.floor((elapsed - 0.2) * 150); // 30-60%
            if (currentStep < 2) {
              steps[1].classList.add('active');
              currentStep = 2;
            }
          } else if (elapsed < 0.6) {
            currentPercent = 60 + Math.floor((elapsed - 0.4) * 75); // 60-75%
            if (currentStep < 3) {
              steps[2].classList.add('active');
              currentStep = 3;
            }
          } else if (elapsed < 0.8) {
            currentPercent = 75 + Math.floor((elapsed - 0.6) * 75); // 75-90%
          } else {
            currentPercent = 90 + Math.floor((elapsed - 0.8) * 50); // 90-100%
            if (currentStep < 4) {
              steps[3].classList.add('active');
              currentStep = 4;
            }
          }
          
          if (percentText) {
            percentText.textContent = currentPercent + '%';
          }
        };
        
        // アニメーションフレームごとに更新
        const animate = () => {
          updateProgress();
          animateCharacter();
          requestAnimationFrame(animate);
        };
        animate();
      })();
    </script>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createLoadingSpinner = createLoadingSpinner;
