/**
 * 🎨 PremiumIdBadge Component
 * プレミアムIDバッジを生成するコンポーネント
 * @version 1.0.0
 */

// window.OsintUIComponentsが存在しない場合は初期化
if (!window.OsintUIComponents) {
  window.OsintUIComponents = {};
}

/**
 * プレミアムIDバッジを生成
 * @param {string} premiumId - プレミアムID（@revit または @reph）
 * @returns {string} HTML文字列
 */
function createPremiumIdBadge(premiumId) {
  const isRevit = premiumId === '@revit';
  const badgeColor = isRevit 
    ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'  // オレンジ系
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';  // 紫系
  
  const badgeId = `premium-badge-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <style>
      @keyframes premiumPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 0 0 8px rgba(255, 107, 53, 0);
        }
      }
      @keyframes premiumPulsePurple {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 0 0 8px rgba(102, 126, 234, 0);
        }
      }
      .premium-id-badge {
        display: inline-block;
        background: ${badgeColor};
        color: #fff;
        font-weight: bold;
        font-size: 0.95em;
        padding: 6px 12px;
        border-radius: 20px;
        border: 2px solid rgba(255,255,255,0.5);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.3);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        letter-spacing: 0.5px;
        position: relative;
        animation: ${isRevit ? 'premiumPulse' : 'premiumPulsePurple'} 2s ease-in-out infinite;
      }
      .premium-id-badge::before {
        content: '⭐';
        margin-right: 4px;
        font-size: 0.9em;
      }
    </style>
    <strong class="premium-id-badge" id="${badgeId}">${premiumId}</strong>
  `;
}

// window.OsintUIComponentsに追加
window.OsintUIComponents.createPremiumIdBadge = createPremiumIdBadge;
