/**
 * 🎨 SiteHealthCard Component
 * サイト健康診断警告カードを生成する業務コンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * サイト健康診断警告ボックス生成
 * @returns {string} HTML文字列
 */
function createSiteHealthAlert() {
  // LINE_URLSをwindow.OsintConstantsから読み込み（関数内でローカル変数として定義）
  const LINE_URLS = window.OsintConstants?.LINE_URLS || {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/ThvxXZR'
  };
  
  return `
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); border: 3px solid #c92a2a; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
        <span style="font-size: 2.5em;">⚠️</span>
        <div style="flex: 1;">
          <strong style="color: #fff; font-size: 1.3em;">WordPressが古くて危険です！</strong><br>
          <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">ハッキングのリスクが高い状態です</span>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="color: #333; font-size: 0.95em; line-height: 1.8;">
          <strong style="color: #d32f2f; font-size: 1.1em;">🚨 今すぐ対応が必要な理由:</strong><br><br>
          ❌ <strong style="color: #d32f2f;">WordPressが古い</strong> → セキュリティホールだらけ<br>
          ❌ <strong style="color: #d32f2f;">PHPが古い</strong> → サポート終了で脆弱性が残る<br>
          ❌ <strong>ハッカーに狙われやすい</strong><br>
          ❌ <strong>顧客情報が漏れる可能性</strong>
        </div>
      </div>
      
      <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 15px;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff; flex-shrink: 0;">
        <div style="flex: 1;">
          <div style="background: #fff; padding: 12px; border-radius: 8px; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="position: absolute; left: -10px; top: 20px; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #fff;"></div>
            <strong style="color: #667eea;">りんく:</strong><br>
            <span style="color: #333; font-size: 0.95em; line-height: 1.6;">「この状態は本当に危ないよ！りんくが頼りにしているリバースハックに相談してみて！WordPressとPHPのアップデートを安全にやってくれるよ！」</span>
          </div>
        </div>
      </div>
      
      <a href="${LINE_URLS.IT_INFRA}" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
        <img src="images/rev.png" style="height: 45px; width: auto;">
        <div style="text-align: left; flex: 1;">
          <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（ITインフラ）</div>
          <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎ | ${window.OsintUIComponents.createPremiumIdBadge ? window.OsintUIComponents.createPremiumIdBadge('@revit') : '<strong style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">@revit</strong>'}</div>
        </div>
        <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
      </a>
    </div>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createSiteHealthAlert = createSiteHealthAlert;
