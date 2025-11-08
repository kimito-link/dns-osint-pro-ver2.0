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
        
        <a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
          <img src="images/rev.png" style="height: 45px; width: auto;">
          <div style="text-align: left; flex: 1;">
            <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（ITインフラ）</div>
            <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
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
        
        <a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
          <img src="images/rev.png" style="height: 45px; width: auto;">
          <div style="text-align: left; flex: 1;">
            <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（ITインフラ）</div>
            <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
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
            <div style="color: rgba(255,255,255,0.9); font-size: 0.85em; margin-top: 2px;">りんくが頼りにしている専門家 | レスポンス◎</div>
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
      <div style="background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
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
        
        <a href="${LINE_URLS.IT_INFRA}" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
          <img src="images/rev.png" style="height: 45px; width: auto;">
          <div style="text-align: left; flex: 1;">
            <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（ITインフラ）</div>
            <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
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
        
        <a href="https://lin.ee/X2aWSFO" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #06C755; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 12px rgba(6,199,85,0.3); border: none;">
          <img src="images/rev.png" style="height: 45px; width: auto;">
          <div style="text-align: left; flex: 1;">
            <div style="color: #fff; font-weight: bold; font-size: 1.2em;">リバースハックに相談（風評対策）</div>
            <div style="font-size: 0.85em; color: rgba(255,255,255,0.9);">りんくが頼りにしている専門家 | レスポンス◎</div>
          </div>
          <div style="color: #fff; font-size: 1.5em; font-weight: bold;">→</div>
        </a>
      </div>
    `;
  },

  /**
   * SEOメタ情報表示セクション生成
   * @param {Object} seoData - SEO情報オブジェクト
   * @returns {string} HTML文字列
   */
  createSeoMetaSection(seoData) {
    if (!seoData || !seoData.success) {
      return '';
    }

    const data = seoData.data;
    const issues = [];

    // SEO問題のチェック
    if (data.title.length === 0) {
      issues.push({ type: 'error', text: 'Titleタグがありません' });
    } else if (data.title.length < 30) {
      issues.push({ type: 'warning', text: 'Titleが短すぎます（30文字以上推奨）' });
    } else if (data.title.length > 60) {
      issues.push({ type: 'warning', text: 'Titleが長すぎます（60文字以下推奨）' });
    }

    if (data.description.length === 0) {
      issues.push({ type: 'error', text: 'Descriptionが設定されていません' });
    } else if (data.description.length < 80) {
      issues.push({ type: 'warning', text: 'Descriptionが短すぎます（80-160文字推奨）' });
    } else if (data.description.length > 160) {
      issues.push({ type: 'warning', text: 'Descriptionが長すぎます（80-160文字推奨）' });
    }

    if (data.headings.h1 === 0) {
      issues.push({ type: 'error', text: 'H1タグがありません' });
    } else if (data.headings.h1 > 1) {
      issues.push({ type: 'warning', text: 'H1タグが複数あります（1つが推奨）' });
    }

    if (!data.canonical.exists) {
      issues.push({ type: 'info', text: 'Canonical URLが設定されていません' });
    }

    if (!data.ogp.exists) {
      issues.push({ type: 'info', text: 'OGP（SNSシェア用）が設定されていません' });
    }

    if (!data.viewport.exists) {
      issues.push({ type: 'warning', text: 'Viewportが設定されていません（モバイル対応）' });
    }

    // 問題の色分け
    const getIssueColor = (type) => {
      switch(type) {
        case 'error': return { bg: '#ffebee', border: '#f44336', icon: '❌' };
        case 'warning': return { bg: '#fff3e0', border: '#ff9800', icon: '⚠️' };
        case 'info': return { bg: '#e3f2fd', border: '#2196f3', icon: 'ℹ️' };
        default: return { bg: '#f5f5f5', border: '#9e9e9e', icon: '•' };
      }
    };

    let html = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
          <span style="font-size: 2em;">📊</span>
          <div>
            <h3 style="margin: 0; color: #fff; font-size: 1.4em;">SEO メタ情報</h3>
            <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 0.9em;">ページのSEO状態を診断</p>
          </div>
        </div>
    `;

    // 問題がある場合は警告表示
    if (issues.length > 0) {
      html += `<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">`;
      html += `<strong style="color: #d32f2f; font-size: 1.1em;">🚨 検出された問題 (${issues.length}件)</strong><br><br>`;
      
      issues.forEach(issue => {
        const color = getIssueColor(issue.type);
        html += `
          <div style="padding: 8px 12px; margin: 8px 0; background: ${color.bg}; border-left: 3px solid ${color.border}; border-radius: 4px;">
            <span style="font-size: 0.9em;">${color.icon} ${issue.text}</span>
          </div>
        `;
      });
      html += `</div>`;
    } else {
      html += `
        <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <strong style="color: #4caf50; font-size: 1.1em;">✅ SEOの基本設定は良好です！</strong>
        </div>
      `;
    }

    // メタ情報の詳細表示
    html += `
      <div style="background: rgba(255,255,255,0.98); padding: 18px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: grid; gap: 12px;">
    `;

    // Title
    const titleColor = data.title.length === 0 ? '#f44336' : (data.title.length >= 30 && data.title.length <= 60) ? '#4caf50' : '#ff9800';
    html += `
      <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${titleColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #333; font-size: 1.1em;">📝 Title</strong>
          <span style="background: ${titleColor}; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">${data.title.length}文字</span>
        </div>
        <div style="color: #333; font-size: 1.05em; line-height: 1.6; word-break: break-word; font-weight: 500;">${data.title.text || '<span style="color: #999;">未設定</span>'}</div>
      </div>
    `;

    // Description
    const descColor = data.description.length === 0 ? '#f44336' : (data.description.length >= 80 && data.description.length <= 160) ? '#4caf50' : '#ff9800';
    html += `
      <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${descColor};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: #333; font-size: 1.1em;">📄 Description</strong>
          <span style="background: ${descColor}; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 0.9em; font-weight: bold;">${data.description.length}文字</span>
        </div>
        <div style="color: #333; font-size: 1.05em; line-height: 1.6; word-break: break-word;">${data.description.text || '<span style="color: #999;">未設定</span>'}</div>
      </div>
    `;

    // 見出しタグ
    const h1Color = data.headings.h1 === 1 ? '#4caf50' : (data.headings.h1 === 0 ? '#f44336' : '#ff9800');
    html += `
      <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
        <strong style="color: #333; margin-bottom: 8px; display: block;">🏷️ 見出しタグ構造</strong>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 8px;">
          <div style="text-align: center; padding: 8px; background: ${h1Color}; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H1</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h1}</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #90caf9; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H2</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h2}</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #64b5f6; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H3</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h3}</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #42a5f5; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H4</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h4}</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #2196f3; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H5</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h5}</div>
          </div>
          <div style="text-align: center; padding: 8px; background: #1976d2; color: #fff; border-radius: 6px;">
            <div style="font-size: 0.8em;">H6</div>
            <div style="font-size: 1.3em; font-weight: bold;">${data.headings.h6}</div>
          </div>
        </div>
        
        <!-- 見出しテキスト表示 -->
        ${data.headingTexts && Object.keys(data.headingTexts).some(key => data.headingTexts[key].length > 0) ? `
          <div style="margin-top: 12px;">
            ${['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => {
              const texts = data.headingTexts[tag];
              if (!texts || texts.length === 0) return '';
              
              return `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #666; font-size: 0.85em; text-transform: uppercase;">${tag}:</strong>
                  <div style="margin-left: 12px; margin-top: 4px;">
                    ${texts.map((text, idx) => `
                      <div style="padding: 4px 8px; margin: 2px 0; background: #f5f5f5; border-left: 3px solid #2196f3; font-size: 0.85em; color: #333; border-radius: 2px;">
                        ${idx + 1}. ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}
                      </div>
                    `).join('')}
                    ${data.headings[tag] > texts.length ? `<div style="font-size: 0.75em; color: #999; margin-top: 4px;">他 ${data.headings[tag] - texts.length} 件</div>` : ''}
                  </div>
                </div>
              `;
            }).filter(Boolean).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // その他の情報
    html += `
      <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
        <strong style="color: #333; margin-bottom: 8px; display: block;">🔍 その他のSEO要素</strong>
        <div style="display: grid; gap: 6px; font-size: 0.9em;">
          <div style="display: flex; justify-content: space-between;">
            <span>🔗 Canonical URL</span>
            <span style="color: ${data.canonical.exists ? '#4caf50' : '#999'};">${data.canonical.exists ? '✓ あり' : '✗ なし'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🤖 Robots</span>
            <span style="color: ${data.robots.exists ? '#4caf50' : '#999'};">${data.robots.exists ? data.robots.text : '✗ なし'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🌐 Lang</span>
            <span style="color: ${data.lang.exists ? '#4caf50' : '#999'};">${data.lang.exists ? data.lang.code : '✗ なし'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>📱 Viewport</span>
            <span style="color: ${data.viewport.exists ? '#4caf50' : '#f44336'};">${data.viewport.exists ? '✓ あり' : '✗ なし'}</span>
          </div>
        </div>
      </div>
    `;

    // 画像・リンク統計
    html += `
      <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
        <strong style="color: #333; margin-bottom: 8px; display: block;">📊 コンテンツ統計</strong>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px;">
          <div style="text-align: center; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-radius: 8px;">
            <div style="font-size: 0.85em; opacity: 0.9;">画像</div>
            <div style="font-size: 1.5em; font-weight: bold;">${data.images.total}</div>
          </div>
          <div style="text-align: center; padding: 10px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; border-radius: 8px;">
            <div style="font-size: 0.85em; opacity: 0.9;">内部リンク</div>
            <div style="font-size: 1.5em; font-weight: bold;">${data.links.internal}</div>
          </div>
          <div style="text-align: center; padding: 10px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; border-radius: 8px;">
            <div style="font-size: 0.85em; opacity: 0.9;">外部リンク</div>
            <div style="font-size: 1.5em; font-weight: bold;">${data.links.external}</div>
          </div>
        </div>
      </div>
    `;

    // OGP・Twitter Card
    if (data.ogp.exists || data.twitter.exists) {
      html += `
        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px;">
          <strong style="color: #333; margin-bottom: 8px; display: block;">🌐 SNSシェア設定</strong>
          <div style="display: grid; gap: 6px; font-size: 0.9em; margin-top: 8px;">
      `;
      
      if (data.ogp.exists) {
        html += `
          <div style="padding: 8px; background: #e8f5e9; border-left: 3px solid #4caf50; border-radius: 4px;">
            ✓ OGP（Facebook等）設定済み
          </div>
        `;
      }
      
      if (data.twitter.exists) {
        html += `
          <div style="padding: 8px; background: #e1f5fe; border-left: 3px solid #03a9f4; border-radius: 4px;">
            ✓ Twitter Card設定済み
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    </div>
    `;

    return html;
  },

  /**
   * サイトカテゴリ構造表示（マインドマップ風）
   * @param {Object} structureData - サイト構造データ
   * @returns {string} HTML文字列
   */
  createSiteStructureSection(structureData) {
    if (!structureData || !structureData.success) {
      return '';
    }

    const { structure, totalUrls } = structureData;

    // ツリーノードを再帰的にレンダリング（折りたたみ可能）
    const renderTree = (node, depth = 0, isLast = false, nodeId = '') => {
      const indent = depth * 25;
      const hasChildren = Object.keys(node.children || {}).length > 0;
      const hasPages = node.pages && node.pages.length > 0;
      
      // index.htmlだけのカテゴリは、ページとして表示（カテゴリとして扱わない）
      // 条件: 子カテゴリなし AND (ページなし OR ページが1個だけでdefaultPageTitleと同じ)
      const isIndexOnlyCategory = !hasChildren && node.defaultPageTitle && 
        (!hasPages || (node.pages && node.pages.length === 1 && node.pages[0].title === node.defaultPageTitle));
      
      if (isIndexOnlyCategory) {
        console.log('✅ index.htmlのみのカテゴリをページとして表示:', node.path, node.defaultPageTitle);
      }
      
      console.log(`🔍 判定: ${node.path} - hasChildren: ${hasChildren}, hasPages: ${hasPages}, defaultPageTitle: ${node.defaultPageTitle}, isIndexOnly: ${isIndexOnlyCategory}`);
      
      // 色を階層ごとに変える
      const colors = [
        '#667eea', // 紫
        '#f093fb', // ピンク
        '#4facfe', // 青
        '#43e97b', // 緑
        '#fa709a', // 赤
        '#feca57'  // 黄
      ];
      const color = colors[depth % colors.length];
      
      // ユニークIDを生成
      const uniqueId = nodeId || 'node-' + Math.random().toString(36).substr(2, 9);
      
      // index.htmlだけのカテゴリは単独ページとして表示
      if (isIndexOnlyCategory) {
        return `
          <div style="
            margin-left: ${indent}px;
            margin-bottom: 6px;
            padding: 10px 12px;
            background: rgba(255,255,255,0.7);
            border-left: 3px solid ${color}80;
            border-radius: 6px;
            transition: all 0.2s;
          " class="page-item">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 1em;">📄</span>
              <a href="${node.defaultPageUrl}" target="_blank" style="color: #333; text-decoration: none; flex: 1; font-size: 0.95em; font-weight: 500; word-break: break-word;" class="page-link">
                ${node.defaultPageTitle}
              </a>
            </div>
            <div style="color: #999; font-size: 0.7em; margin-left: 26px; word-break: break-all; max-width: 100%;">
              ${node.defaultPageUrl}
            </div>
          </div>
        `;
      }
      
      let html = `
        <div class="tree-node" style="margin-left: ${indent}px; margin-bottom: 6px;" data-node-id="${uniqueId}">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            background: linear-gradient(135deg, ${color}25 0%, ${color}12 100%);
            border-left: 4px solid ${color};
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            user-select: none;
          " class="category-header" data-toggle-id="${uniqueId}" data-color="${color}">
            ${hasChildren || hasPages ? 
              '<span class="toggle-icon" style="font-size: 0.9em; transition: transform 0.3s;">▶</span>' : 
              '<span style="width: 14px; display: inline-block;"></span>'}
            ${hasChildren ? '<span style="font-size: 1.1em;">📁</span>' : '<span style="font-size: 1.1em;">📄</span>'}
            <div style="flex: 1; overflow: hidden;">
              <strong style="color: #333; font-size: 0.95em; word-break: break-all;">${node.path}</strong>
              ${node.defaultPageTitle ? `<div style="color: #666; font-size: 0.8em; margin-top: 2px; word-break: break-word;">${node.defaultPageTitle}</div>` : ''}
            </div>
            <div style="
              background: ${color};
              color: #fff;
              padding: 3px 10px;
              border-radius: 10px;
              font-size: 0.75em;
              font-weight: bold;
            ">
              ${node.count || 0}
            </div>
          </div>
      `;

      // 折りたたみ可能なコンテナ
      html += `<div class="tree-content" style="display: none; margin-top: 6px;">`;

      // 個別ページを表示（ただしindex.htmlだけのページは除外）
      if (hasPages && !isIndexOnlyCategory) {
        node.pages.forEach((page, index) => {
          const pageTitle = page.title || 'Untitled';
          const pageUrl = page.url || page;
          html += `
            <div style="
              margin-left: ${indent + 35}px;
              margin-bottom: 6px;
              padding: 10px 12px;
              background: rgba(255,255,255,0.7);
              border-left: 3px solid ${color}80;
              border-radius: 6px;
              transition: all 0.2s;
            " class="page-item">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1em;">📄</span>
                <a href="${pageUrl}" target="_blank" style="color: #333; text-decoration: none; flex: 1; font-size: 0.95em; font-weight: 500;" class="page-link">
                  ${pageTitle}
                </a>
              </div>
              <div style="color: #999; font-size: 0.7em; margin-left: 26px; word-break: break-all; max-width: 100%;">
                ${pageUrl}
              </div>
            </div>
          `;
        });
      }

      // 子カテゴリを再帰的にレンダリング
      if (hasChildren) {
        const childKeys = Object.keys(node.children);
        childKeys.forEach((key, index) => {
          const child = node.children[key];
          const childId = `${uniqueId}-${index}`;
          html += renderTree(child, depth + 1, index === childKeys.length - 1, childId);
        });
      }

      html += '</div>'; // tree-content終了
      html += '</div>'; // tree-node終了
      return html;
    };

    let html = `
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); overflow-x: hidden; max-width: 100%;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
          <span style="font-size: 2em;">🗺️</span>
          <div style="overflow: hidden;">
            <h3 style="margin: 0; color: #fff; font-size: 1.4em;">サイトカテゴリ構造</h3>
            <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 0.9em;">
              全 ${totalUrls}ページの階層構造
            </p>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.98); padding: 18px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow-x: hidden;">
          <div class="site-structure-tree" style="max-width: 100%; overflow-x: hidden;">
    `;

    // ルートからツリーを展開
    if (structure['/']) {
      html += renderTree(structure['/'], 0);
    }

    html += `
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.95); padding: 12px; border-radius: 8px; margin-top: 15px;">
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="expandAllBtn" style="
              flex: 1;
              padding: 8px 16px;
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: #fff;
              border: none;
              border-radius: 6px;
              font-size: 0.85em;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ⬇ 全て展開
            </button>
            <button id="collapseAllBtn" style="
              flex: 1;
              padding: 8px 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #fff;
              border: none;
              border-radius: 6px;
              font-size: 0.85em;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ⬆ 全て折りたたむ
            </button>
          </div>
          <div style="color: #666; font-size: 0.85em; line-height: 1.6;">
            💡 <strong>ヒント:</strong> カテゴリをクリックして展開/折りたたみできます。<br>
            各ページのタイトルとURLも表示されます。
          </div>
        </div>
      </div>
    `;

    return html;
  }
};

// デバッグ用ログ
console.log('✅ ui-components.js 読み込み完了');
console.log('OsintUIComponents:', window.OsintUIComponents);
console.log('createReputationAlert:', typeof window.OsintUIComponents.createReputationAlert);
