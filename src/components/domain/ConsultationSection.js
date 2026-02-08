/**
 * 🎨 ConsultationSection Component
 * 相談セクションを生成する業務コンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * 相談セクション生成（フルバージョン）
 * りんくのメッセージ、リバースハックの情報、LINE相談ボタンを含む豪華なボックス
 * @param {Object} options - オプション
 * @param {string} options.type - 'reputation'(風評対策) or 'itinfra'(ITインフラ)
 * @param {string} [options.rinkMessage] - りんくのメッセージ
 * @param {string} [options.severity='warning'] - 警告レベル
 * @param {string} [options.customTitle] - カスタムタイトル
 * @param {string} [options.customDescription] - カスタム説明文
 * @returns {string} HTML文字列
 */
function createFullConsultationSection(options = {}) {
  // LINE_URLSをwindow.OsintConstantsから読み込み（関数内でローカル変数として定義）
  const LINE_URLS = window.OsintConstants?.LINE_URLS || {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/ThvxXZR'
  };
  
  const {
    type = 'itinfra',
    rinkMessage = 'この問題、りんくが頼りにしているリバースハックに相談するといいよ！',
    severity = 'warning',
    customTitle = null,
    customDescription = null
  } = options;
  
  const isReputation = type === 'reputation';
  const linkUrl = isReputation ? LINE_URLS.REPUTATION : LINE_URLS.IT_INFRA;
  const gradientColor = severity === 'warning' ? 
    'linear-gradient(135deg, #ff9800 0%, #ff6b00 100%)' : 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const borderColor = severity === 'warning' ? '#e65100' : '#5a67d8';
  const buttonColor = severity === 'warning' ? '#ff6b00' : '#667eea';
  
  const title = customTitle || (isReputation ? '風評対策' : 'ITインフラサポート');
  const description = customDescription || (isReputation ? 
    'サジェスト汚染対策・逆SEO対策の専門家' : 
    'WordPress・PHP・SEO・セキュリティの専門家');
  
  return `
    <div style="background: ${gradientColor}; border: 3px solid ${borderColor}; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
      
      <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 0;"></div>
      <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 0;"></div>
      
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 18px; position: relative; z-index: 1;">
        <img src="images/rev.png" style="height: 65px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
        <div style="flex: 1;">
          <div style="color: #fff; font-size: 1.3em; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-bottom: 5px;">${title}</div>
          <div style="color: rgba(255,255,255,0.95); font-size: 0.9em; display: flex; align-items: center; gap: 8px;">
            <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; font-size: 0.85em;">りんく推薦</span>
            <span>${description}</span>
          </div>
        </div>
      </div>
      
      <div style="display: flex; align-items: start; gap: 10px; margin-bottom: 15px; position: relative; z-index: 1;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff; flex-shrink: 0;">
        <div style="flex: 1;">
          <div style="background: #fff; padding: 12px; border-radius: 8px; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="position: absolute; left: -10px; top: 20px; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #fff;"></div>
            <strong style="color: #667eea;">りんく:</strong><br>
            <span style="color: #333; font-size: 0.95em; line-height: 1.6;">「${rinkMessage}」</span>
          </div>
        </div>
      </div>
      
      <a href="${linkUrl}" target="_blank" class="hover-scale-border" style="display: flex; align-items: center; justify-content: center; gap: 15px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(6,199,85,0.3); position: relative; z-index: 1; border: none;">
        <img src="images/rev.png" style="height: 48px; width: auto;">
        <div style="text-align: left; flex: 1;">
          <div style="color: #fff; font-weight: bold; font-size: 1.2em; line-height: 1.3;">${isReputation ? 'リバースハックに相談（風評対策）' : 'リバースハックに相談（ITインフラ）'}</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 0.85em; margin-top: 2px;">りんくが頼りにしている専門家 | レスポンス◎ | ${window.OsintUIComponents.createPremiumIdBadge ? window.OsintUIComponents.createPremiumIdBadge(isReputation ? '@reph' : '@revit') : `<strong style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">${isReputation ? '@reph' : '@revit'}</strong>`}</div>
        </div>
        <div style="color: #fff; font-size: 1.8em; font-weight: bold;">→</div>
      </a>
      
      <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.15); border-radius: 8px; backdrop-filter: blur(10px); position: relative; z-index: 1;">
        <div style="color: rgba(255,255,255,0.95); font-size: 0.85em; line-height: 1.7;">
          ✅ <strong>対応可能:</strong> ${isReputation ? 
            'サジェスト削除・逆SEO・ネガティブワード対策' : 
            'WEBサイト高速化・WordPress/PHPアップデート・SEO対策・セキュリティ対策・メール設定（SPF/DKIM/DMARC）'}
        </div>
      </div>
    </div>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createFullConsultationSection = createFullConsultationSection;
