/**
 * 🎨 AlertBox Component
 * エラー/成功/警告/情報ボックスを生成するコンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * エラーメッセージボックス
 * @param {string} message - エラーメッセージ
 * @param {string} title - タイトル（オプション）
 * @returns {string} HTML文字列
 */
function createErrorBox(message, title = '⚠️ エラーが発生しました') {
  return `
    <div style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: #c62828; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}

/**
 * 成功メッセージボックス
 * @param {string} message - 成功メッセージ
 * @param {string} title - タイトル（オプション）
 * @returns {string} HTML文字列
 */
function createSuccessBox(message, title = '✅ 成功') {
  return `
    <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: #2e7d32; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}

/**
 * 警告メッセージボックス
 * @param {string} message - 警告メッセージ
 * @param {string} title - タイトル（オプション）
 * @returns {string} HTML文字列
 */
function createWarningBox(message, title = '⚠️ 注意') {
  return `
    <div style="background: #fff3e0; border: 2px solid #ff9800; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: #e65100; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}

/**
 * 情報メッセージボックス
 * @param {string} message - 情報メッセージ
 * @param {string} title - タイトル（オプション）
 * @returns {string} HTML文字列
 */
function createInfoBox(message, title = 'ℹ️ 情報') {
  return `
    <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: #0d47a1; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createErrorBox = createErrorBox;
window.OsintUIComponents.createSuccessBox = createSuccessBox;
window.OsintUIComponents.createWarningBox = createWarningBox;
window.OsintUIComponents.createInfoBox = createInfoBox;
