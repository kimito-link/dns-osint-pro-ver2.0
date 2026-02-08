/**
 * 🎨 ReputationAlert Component
 * 風評被害アラートを生成する業務コンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * 風評被害アラート
 * @returns {string} HTML文字列
 */
function createReputationAlert() {
  // LINE_URLSをwindow.OsintConstantsから読み込み（関数内でローカル変数として定義）
  const LINE_URLS = window.OsintConstants?.LINE_URLS || {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/ThvxXZR'
  };
  
  return `
    <div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">
        <div style="flex: 1;">
          <strong style="color: #fff; font-size: 1.3em;">りんく：「ネガティブなサジェストが見つかったよ！」</strong><br>
          <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">風評被害のリスクがあるよ</span>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="padding: 10px; background: #ffebee; border-left: 3px solid #f44336; border-radius: 4px;">
          <strong style="color: #c62828;">⚠️ 風評被害のリスク</strong><br>
          <span style="font-size: 0.85em; color: #666;">
            ・ 検索されたときにネガティブな候補が表示される<br>
            ・ 顧客や取引先の信頼を失う<br>
            ・ ビジネス機会の損失<br>
            ・ 企業イメージの悪化
          </span>
        </div>
      </div>
      
      <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-top: 12px; margin-bottom: 12px;">
        <div style="display: flex; gap: 8px; align-items: start;">
          <img src="images/link.png" style="width: 35px; height: 35px; border-radius: 50%;">
          <div style="flex: 1;">
            <strong style="color: #1565c0;">💎 りんくからの提案</strong><br>
            <span style="font-size: 0.85em; color: #333;">
              「りんくが頼りにしているリバースハックに相談してみて！サジェスト汚染対策や逆SEOの実績がすごいんだ！」
            </span>
          </div>
        </div>
      </div>
      
      <a href="${LINE_URLS.REPUTATION}" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
        <img src="images/rev.png" style="height: 45px; width: auto;">
        <div style="text-align: left; flex: 1;">
          <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（風評対策）</div>
          <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎ | ${window.OsintUIComponents.createPremiumIdBadge ? window.OsintUIComponents.createPremiumIdBadge('@reph') : '<strong style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">@reph</strong>'}</div>
        </div>
        <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
      </a>
    </div>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createReputationAlert = createReputationAlert;
