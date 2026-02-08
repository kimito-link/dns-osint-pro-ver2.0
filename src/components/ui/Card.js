/**
 * 🎨 Card Component
 * カードコンポーネントを生成するコンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * カードコンポーネント
 * @param {string} content - カードの内容
 * @param {string} backgroundColor - 背景色（オプション）
 * @returns {string} HTML文字列
 */
function createCard(content, backgroundColor = '#fff') {
  return `
    <div style="background: ${backgroundColor}; padding: 18px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 10px 0;">
      ${content}
    </div>
  `;
}

/**
 * グラデーションカード
 * @param {string} content - カードの内容
 * @param {string} gradientStart - グラデーション開始色
 * @param {string} gradientEnd - グラデーション終了色
 * @returns {string} HTML文字列
 */
function createGradientCard(content, gradientStart = '#667eea', gradientEnd = '#764ba2') {
  return `
    <div style="background: linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%); padding: 20px; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); margin: 10px 0;">
      ${content}
    </div>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createCard = createCard;
window.OsintUIComponents.createGradientCard = createGradientCard;
