/**
 * りんくの推薦とリバースハックへの誘導テンプレート
 * @version 1.0.0
 */

const LinkTemplates = {
  /**
   * りんくの推薦吹き出し
   * @param {string} message - りんくのメッセージ
   * @param {string} borderColor - 枠線の色（デフォルト: #4caf50）
   * @returns {string} HTML文字列
   */
  rinkuRecommendation(message, borderColor = '#4caf50') {
    return `
      <div style="display: flex; align-items: start; gap: 10px; margin-bottom: 15px;">
        <img src="icons/kimito-link.jpg" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid ${borderColor};">
        <div style="flex: 1; background: #fff; padding: 12px; border-radius: 8px; position: relative;">
          <strong style="color: #2e7d32;">りんく：</strong>「${message}」
        </div>
      </div>
    `;
  },

  /**
   * 風評対策用の相談ボックス
   * @param {string} title - タイトル（デフォルト: リバースハックに風評対策を相談）
   * @returns {string} HTML文字列
   */
  reputationConsultBox(title = 'リバースハックに風評対策を相談') {
    return `
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); border: 3px solid #c92a2a; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
          <img src="images/rev.png" style="height: 60px;">
          <div style="flex: 1;">
            <strong style="color: #fff; font-size: 1.2em;">${title}</strong><br>
            <span style="color: rgba(255,255,255,0.9); font-size: 0.9em;">りんくが頼りにしている専門家｜レスポンス◎</span>
          </div>
        </div>
        <a href="https://lin.ee/X2aWSFO" target="_blank" style="display: inline-block; padding: 12px 24px; background: #fff; color: #c92a2a; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1.05em; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'">
          📱 無料でLINE相談・診断を受ける
        </a>
        <div style="margin-top: 10px; font-size: 0.85em; color: rgba(255,255,255,0.9);">
          ※ 24時間以内にご返信いたします
        </div>
      </div>
    `;
  },

  /**
   * ITインフラサポート用の相談ボックス
   * @param {string} title - タイトル（デフォルト: リバースハックにITインフラサポートを相談）
   * @returns {string} HTML文字列
   */
  itInfraConsultBox(title = 'リバースハックにITインフラサポートを相談') {
    return `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 3px solid #5a67d8; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
          <img src="images/rev.png" style="height: 60px;">
          <div style="flex: 1;">
            <strong style="color: #fff; font-size: 1.2em;">${title}</strong><br>
            <span style="color: rgba(255,255,255,0.9); font-size: 0.9em;">りんくが頼りにしている専門家｜レスポンス◎</span>
          </div>
        </div>
        <a href="https://lin.ee/lrjVHvH" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; background: #fff; color: #5a67d8; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1.05em; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.2)'">
          💻 無料でLINE相談・診断を受ける
        </a>
        <div style="margin-top: 10px; font-size: 0.85em; color: rgba(255,255,255,0.9);">
          ※ 24時間以内にご返信いたします
        </div>
      </div>
    `;
  },

  /**
   * 風評被害警告（フル版）
   * りんくの推薦 + 相談ボックス
   * @returns {string} HTML文字列
   */
  reputationWarningFull() {
    return `
      ${this.rinkuRecommendation('風評被害が見つかったよ！りんくが頼りにしているリバースハックに相談してみて！', '#d32f2f')}
      ${this.reputationConsultBox()}
    `;
  },

  /**
   * ITインフラ問題警告（フル版）
   * りんくの推薦 + 相談ボックス
   * @returns {string} HTML文字列
   */
  itInfraWarningFull() {
    return `
      ${this.rinkuRecommendation('この問題、りんくが頼りにしているリバースハックに相談するといいかも！', '#ff9800')}
      ${this.itInfraConsultBox()}
    `;
  },

  /**
   * サービスPRセクション（風評対策）
   * @returns {string} HTML文字列
   */
  reputationServicePR() {
    return `
      <div style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="color: #fff; margin: 0 0 15px 0; font-size: 1.1em;">💡 サジェスト対策で検索結果を改善する</h3>

        <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; color: #333; font-size: 0.95em; line-height: 1.6;">
            <strong style="color: #667eea;">✅ こんなお悩みありませんか？</strong><br>
            ・「会社名 ブラック」などのネガティブな検索候補が表示される<br>
            ・採用活動で応募者が検索結果を見て辞退している<br>
            ・売上や問い合わせが検索被害で減少している<br>
            ・風評被害対策をしたいが、何から始めればいいか分からない
          </p>

          <div style="padding: 12px; background: #f0f7ff; border-left: 4px solid #667eea; margin: 10px 0;">
            <strong style="color: #667eea;">📈 私たちの実績</strong><br>
            <span style="font-size: 0.9em; color: #333;">
              ・逆SEO対策実績：<strong>285件</strong><br>
              ・医療機関の風評対策：<strong>15年連続No.1</strong><br>
              ・平均解決期間：<strong>30日</strong>でクリーン<br>
              ・成功率：<strong>95%</strong>
            </span>
          </div>

          <p style="margin: 10px 0 0 0; color: #333; font-size: 0.9em;">
            <strong style="color: #d32f2f;">⏰ 放置するほど対策費用は増加します</strong><br>
            早期対応が成功の鍵です。まずは無料診断から始めましょう。
          </p>
        </div>

        ${this.rinkuRecommendation('風評被害対策なら、りんくが頼りにしているリバースハックだよ！', '#fff')}

        <div style="text-align: center;">
          <a href="https://lin.ee/X2aWSFO" target="_blank" style="display: inline-block; padding: 15px 30px; background: #fff; color: #667eea; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1em; box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 6px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 8px rgba(0,0,0,0.2)'">
            📱 無料でLINE相談・診断を受ける
          </a>
          <div style="margin-top: 10px; font-size: 0.85em; color: rgba(255,255,255,0.9);">
            ※ 24時間以内にご返信いたします
          </div>
        </div>
      </div>
    `;
  }
};

// グローバルに公開（popup.jsとbackground.jsから使用）
window.LinkTemplates = LinkTemplates;
