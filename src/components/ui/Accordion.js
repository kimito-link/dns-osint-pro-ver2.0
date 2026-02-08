/**
 * 🎨 Accordion Component
 * アコーディオンボタンを生成するコンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * アコーディオンボタン
 * @param {string} id - ボタンのID
 * @param {string} text - ボタンのテキスト
 * @param {boolean} expanded - 初期状態（展開/折りたたみ）
 * @returns {string} HTML文字列
 */
function createAccordionButton(id, text, expanded = false) {
  const icon = expanded ? '▲' : '▼';
  return `
    <button id="${id}" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 6px; font-size: 0.95em; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
      <span>${icon}</span>
      <span>${text}</span>
    </button>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createAccordionButton = createAccordionButton;
