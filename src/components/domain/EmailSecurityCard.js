/**
 * 🎨 EmailSecurityCard Component
 * メールセキュリティ警告カードを生成する業務コンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * メールセキュリティ警告ボックス生成
 * SPF/DKIM/DMARCが未設定の場合にメール配信の問題を警告
 * @returns {string} HTML文字列
 */
function createEmailSecurityAlert() {
  // LINE_URLSをwindow.OsintConstantsから読み込み（関数内でローカル変数として定義）
  const LINE_URLS = window.OsintConstants?.LINE_URLS || {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/ThvxXZR'
  };
  
  return `
    <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); border: 3px solid #e65100; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
      <div style="display: flex; align-items: center; margin-bottom: 15px; gap: 12px;">
        <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">
        <div style="flex: 1;">
          <strong style="color: #fff; font-size: 1.3em;">りんく：「メールセキュリティが危険だよ！」</strong><br>
          <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">メールが届かないリスクがあるよ</span>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <strong style="color: #e65100; font-size: 1.1em;">⚠️ このままだと起こる問題:</strong><br>
        <div style="color: #333; font-size: 0.95em; line-height: 1.8; margin-top: 10px;">
          ❌ <strong style="color: #d32f2f;">Gmailなどに届かない</strong><br>
          ❌ <strong>迷惑メールフォルダ行き</strong><br>
          ❌ <strong>顧客とのやり取りができない</strong><br>
          ❌ <strong>ビジネスチャンスを逃す</strong>
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
window.OsintUIComponents.createEmailSecurityAlert = createEmailSecurityAlert;
