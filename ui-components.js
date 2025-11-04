/**
 * 🎨 OsintUIComponents
 * popup.jsで使用するUI生成関数
 * @version 1.0.0
 * 
 * このモジュールは、ポップアップ画面で表示される警告ボックスや相談導線を生成します。
 * 全ての関数はHTML文字列を返し、インラインスタイルを使用しています。
 */

// LINE相談URL（background.jsと同じ）
const LINE_URLS = {
  IT_INFRA: 'https://lin.ee/lrjVHvH',
  REPUTATION: 'https://lin.ee/X2aWSFO'
};

/**
 * OSINT UIコンポーネント
 * ポップアップで使用するUI要素を生成するモジュール
 * @namespace OsintUIComponents
 */
window.OsintUIComponents = {
  
  /**
   * サイト健康診断警告ボックス生成
   * WordPress/PHPの問題が発見された際にITインフラサポートへの相談導線を表示
   * @returns {string} HTML文字列
   */
  createSiteHealthAlert() {
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
        
        <a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <img src="images/rev.png" style="height: 40px; width: auto;">
          <div style="text-align: left;">
            <div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>
            <div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #d32f2f; font-size: 1.5em;">→</div>
        </a>
      </div>
    `;
  },
  
  /**
   * メールセキュリティ警告ボックス生成
   * SPF/DKIM/DMARCが未設定の場合にメール配信の問題を警告
   * @returns {string} HTML文字列
   */
  createEmailSecurityAlert() {
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
        
        <a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <img src="images/link.png" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #4caf50;">
          <div style="text-align: left;">
            <div style="color: #2e7d32; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>
            <div style="color: #666; font-size: 0.85em;">りんくが頼りにしている専門家 | いつでも相談OK</div>
          </div>
          <div style="color: #4caf50; font-size: 1.5em;">→</div>
        </a>
      </div>
    `;
  },
  
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
  createFullConsultationSection(options = {}) {
    const {
      type = 'itinfra',
      rinkMessage = 'この問題、りんくが頼りにしているリバースハックに相談するといいよ！',
      severity = 'warning',
      customTitle = null,
      customDescription = null
    } = options;
    
    const isReputation = type === 'reputation';
    const linkUrl = isReputation ? 'https://lin.ee/X2aWSFO' : 'https://lin.ee/lrjVHvH';
    const gradientColor = severity === 'warning' ? 
      'linear-gradient(135deg, #ff9800 0%, #ff6b00 100%)' : 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const borderColor = severity === 'warning' ? '#e65100' : '#5a67d8';
    const buttonColor = severity === 'warning' ? '#ff6b00' : '#667eea';
    
    const title = customTitle || (isReputation ? '風評対策' : 'ITインフラサポート');
    const description = customDescription || (isReputation ? 
      'サジェスト汚染対策・逆SEO対策の専門家' : 
      'WordPress・PHP・セキュリティの専門家');
    
    return `
      <div style="background: ${gradientColor}; border: 3px solid ${borderColor}; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); position: relative; overflow: hidden;">
        
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 0;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 0;"></div>
        
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 18px; position: relative; z-index: 1;">
          <img src="images/rev.png" style="height: 65px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
          <div style="flex: 1;">
            <div style="color: #fff; font-size: 1.3em; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-bottom: 5px;">${title}</div>
            <div style="color: rgba(255,255,255,0.95); font-size: 0.9em; display: flex; align-items: center; gap: 8px;">
              <span style="background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 10px; font-size: 0.85em;">✨ りんく推薦</span>
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
        
        <a href="${linkUrl}" target="_blank" class="hover-scale-border" style="display: flex; align-items: center; justify-content: center; gap: 15px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2); position: relative; z-index: 1; border: 2px solid rgba(102,126,234,0.3);">
          <img src="images/link.png" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid #4caf50; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: left; flex: 1;">
            <div style="color: ${buttonColor}; font-weight: bold; font-size: 1.15em; line-height: 1.3;">💬 LINEで無料相談する</div>
            <div style="color: #999; font-size: 0.8em; margin-top: 2px;">24時間以内にご返信 | 完全無料</div>
          </div>
          <div style="color: #4caf50; font-size: 1.8em; font-weight: bold;">→</div>
        </a>
        
        <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.15); border-radius: 8px; backdrop-filter: blur(10px); position: relative; z-index: 1;">
          <div style="color: rgba(255,255,255,0.95); font-size: 0.85em; line-height: 1.7;">
            ✅ <strong>対応可能:</strong> ${isReputation ? 
              'サジェスト削除・逆SEO・ネガティブワード対策' : 
              'WEBサイト高速化・WordPress/PHPアップデート・セキュリティ対策・メール設定（SPF/DKIM/DMARC）'}
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * メールセキュリティ警告ボックス生成（上部表示用）
   * SPF/DKIM/DMARCが欠けている場合にたぬ姉風の警告を表示
   * @param {Object} options - オプション
   * @param {boolean} options.hasSPF - SPFが設定されているか
   * @param {boolean} options.hasDKIM - DKIMが設定されているか
   * @param {boolean} options.hasDMARC - DMARCが設定されているか
   * @returns {string} HTML文字列
   */
  createEmailSecurityTopAlert(options = {}) {
    const { hasSPF = false, hasDKIM = false, hasDMARC = false, spfIssues = [], dmarcIssues = [] } = options;
    
    // 欠けている項目をリストアップ
    const missing = [];
    if (!hasSPF) missing.push('SPF');
    if (!hasDKIM) missing.push('DKIM');
    if (!hasDMARC) missing.push('DMARC');
    
    const missingText = missing.length > 0 ? missing.join('、') : '設定';
    const mainMessage = missing.length > 0 ? `${missingText}が設定されていません` : '構文エラーがあります';
    
    let issuesHtml = '';
    if (spfIssues.length > 0 || dmarcIssues.length > 0) {
      issuesHtml = '<div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.9); border-radius: 6px; border-left: 3px solid #ff6b00;">';
      issuesHtml += '<div style="font-size: 0.9em; color: #333; line-height: 1.6;">';
      issuesHtml += '<strong style="color: #e65100;">🚨 検出された問題（Gmail認証基準）</strong><br><br>';
      
      if (spfIssues.length > 0) {
        issuesHtml += '<strong style="color: #d32f2f;">SPF:</strong><br>';
        spfIssues.forEach(issue => {
          issuesHtml += `<div style="padding-left: 10px; margin-bottom: 5px;">${issue}</div>`;
        });
        issuesHtml += '<br>';
      }
      
      if (dmarcIssues.length > 0) {
        issuesHtml += '<strong style="color: #d32f2f;">DMARC:</strong><br>';
        dmarcIssues.forEach(issue => {
          issuesHtml += `<div style="padding-left: 10px; margin-bottom: 5px;">${issue}</div>`;
        });
      }
      
      issuesHtml += '</div></div>';
    }
    
    return `
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); border: 3px solid #c92a2a; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
          <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">
          <div style="flex: 1;">
            <strong style="color: #fff; font-size: 1.3em;">りんく：「メールセキュリティが危険だよ！」</strong><br>
            <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">メールが届かないリスクがあるよ</span>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <div style="color: #333; font-size: 0.95em; line-height: 1.8;">
            <strong style="color: #d32f2f; font-size: 1.05em;">⚠️ ${mainMessage}</strong><br><br>
            <div style="padding-left: 10px;">
              • メールがGmailなどに届かない<br>
              • 迷惑メールフォルダ行き<br>
              • 顧客とのやり取りができない<br>
              • ビジネスチャンスを逃す
            </div>
          </div>
        </div>
        
        ${issuesHtml}
        
        <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
          <div style="display: flex; gap: 10px; align-items: start;">
            <img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">
            <div style="flex: 1;">
              <strong style="color: #1565c0;">💎 りんくからの提案</strong><br>
              <span style="font-size: 0.9em; color: #333; line-height: 1.6;">
                「これは危険！りんくが頼りにしているリバースハックにSPF/DKIM/DMARC設定を依頼して！メール配信の専門家だよ！」
              </span>
            </div>
          </div>
        </div>
        
        <a href="${LINE_URLS.IT_INFRA}" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <img src="images/rev.png" style="height: 40px; width: auto;">
          <div style="text-align: left;">
            <div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>
            <div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #d32f2f; font-size: 1.5em;">→</div>
        </a>
        
        <div style="margin-top: 15px; padding: 12px; background: rgba(255,255,255,0.9); border-radius: 6px; border-left: 3px solid #ff9800;">
          <div style="font-size: 0.9em; color: #333; line-height: 1.6;">
            <strong style="color: #e65100;">📚 参考資料</strong><br>
            <a href="https://support.google.com/a/answer/81126" target="_blank" style="color: #1976d2; text-decoration: underline; font-size: 0.85em;">Googleメール送信者のガイドライン →</a>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * 風評被害警告ボックス生成
   * ネガティブなサジェストが発見された際に風評対策の相談導線を表示
   * @returns {string} HTML文字列
   */
  createReputationAlert() {
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
        
        <a href="https://lin.ee/X2aWSFO" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
          <img src="images/rev.png" style="height: 40px; width: auto;">
          <div style="text-align: left;">
            <div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（風評対策）</div>
            <div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #d32f2f; font-size: 1.5em;">→</div>
        </a>
      </div>
    `;
  }
};

// デバッグ用ログ
console.log('✅ ui-components.js 読み込み完了');
console.log('OsintUIComponents:', window.OsintUIComponents);
console.log('createReputationAlert:', typeof window.OsintUIComponents.createReputationAlert);
