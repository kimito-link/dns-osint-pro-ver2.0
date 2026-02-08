/**
 * 🎨 SSLCertificateExpiryAlert Component
 * SSL証明書有効期限切れ警告カードを生成する業務コンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * SSL証明書有効期限切れ警告ボックス生成
 * @param {number} daysUntilExpiry - 有効期限までの日数（負の値は既に切れている）
 * @param {string} notAfter - 有効期限の日付文字列
 * @returns {string} HTML文字列
 */
function createSSLCertificateExpiryAlert(daysUntilExpiry, notAfter) {
  // LINE_URLSをwindow.OsintConstantsから読み込み（関数内でローカル変数として定義）
  const LINE_URLS = window.OsintConstants?.LINE_URLS || {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/ThvxXZR'
  };
  
  // 有効期限の日付をフォーマット
  const expiryDate = notAfter ? new Date(notAfter).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  // メッセージを決定
  let message = '';
  let urgencyMessage = '';
  if (daysUntilExpiry < 0) {
    message = 'SSL証明書が既に切れています！';
    urgencyMessage = 'サイトが使えなくなる可能性があります';
  } else if (daysUntilExpiry === 0) {
    message = 'SSL証明書が今日切れます！';
    urgencyMessage = '今すぐ更新が必要です';
  } else if (daysUntilExpiry === 1) {
    message = 'SSL証明書が明日切れます！';
    urgencyMessage = '今すぐ更新が必要です';
  } else {
    message = `SSL証明書が${daysUntilExpiry}日後に切れます！`;
    urgencyMessage = '早急な更新が必要です';
  }
  
  return `
    <div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">
        <div style="flex: 1;">
          <strong style="color: #fff; font-size: 1.3em;">りんく：「${message}」</strong><br>
          <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">${urgencyMessage}</span>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <strong style="color: #d32f2f; font-size: 1.1em;">⚠️ このままだと起こる問題:</strong><br>
        <div style="color: #333; font-size: 0.95em; line-height: 1.8; margin-top: 10px;">
          ❌ <strong style="color: #d32f2f;">サイトが使えなくなる</strong><br>
          ${daysUntilExpiry < 0 ? '❌ <strong>既に証明書が切れています</strong><br>' : ''}
          ❌ <strong>ブラウザが警告を表示</strong><br>
          ❌ <strong>顧客がアクセスできなくなる</strong><br>
          ❌ <strong>ビジネスに致命的な影響</strong>
        </div>
        ${expiryDate ? `<div style="margin-top: 10px; padding: 8px; background: #ffebee; border-left: 3px solid #f44336; border-radius: 4px;"><strong>有効期限:</strong> ${expiryDate}</div>` : ''}
      </div>
      
      <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 15px;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff; flex-shrink: 0;">
        <div style="flex: 1;">
          <div style="background: #fff; padding: 12px; border-radius: 8px; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="position: absolute; left: -10px; top: 20px; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #fff;"></div>
            <strong style="color: #667eea;">りんく:</strong><br>
            <span style="color: #333; font-size: 0.95em; line-height: 1.6;">「この状態は本当に危ないよ！りんくが頼りにしているリバースハックに相談してみて！SSL証明書の更新を安全にやってくれるよ！」</span>
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
window.OsintUIComponents.createSSLCertificateExpiryAlert = createSSLCertificateExpiryAlert;
