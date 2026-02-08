/**
 * ネガティブキーワード辞書
 * 
 * サジェストから風評被害・ネガティブワードを検出するための辞書
 * リスクレベル: high（高）、medium（中）、low（低）
 */

const NEGATIVE_KEYWORDS = {
  // 高リスク：深刻な風評被害
  high: [
    '詐欺',
    '騙された',
    '被害',
    '悪質',
    '危険',
    '違法',
    '訴訟',
    '裁判',
    '逮捕',
    '告訴',
    '悪徳',
    'ブラック',
    '最悪',
    'やばい',
    'ヤバい',
    'ヤバイ',
    '炎上',
    'パワハラ',
    'セクハラ',
    'エクハラ',
    '未払い',
    '給料未払い',
    '倒産',
    '破産',
    '反社',
    '暴力団',
    '詐欺師',
    '犯罪',
    '横領',
    '不正',
    '汚職',
    '賄賂',
    '事件',
    '摘発',
    '告発',
    '被告',
    '有罪',
    '脱税',
    '裏金',
    '闇',
    '悪徳商法',
    'ネズミ講',
    'ねずみ講',
    'ねずみ',
    'マルチ',
    'マルチ商法',
    'MLM',
    'mlm',
    'ポンジスキーム',
    '情報商材',
    '高額請求',
    '架空請求',
    '洗脳',
    '勧誘しつこい',
    '強引な勧誘',
    '宗教みたい',
    'コロス',
    'ころす',
    '殺す',
    '盗撮',
    '盗聴',
    '窃盗',
    '盗用',
    '盗み',
    'フィッシング',
    '不当解雇',
    'リストラ',
    'レイオフ',
    '2ちゃん',
    '2ch',
    'さぎ',
    'ゴロツキ',
    'ごろつき',
    'インサイダー',
    'インサイダー取引',
    'ヤクザ',
    'やくざ',
    'レイプ',
    'れいぷ',
    'ネグレクト',
    'ネグレ',
    '迷惑',
    '罪人',
    '裏切り',
    '裏切',
    '誤報',
    '虚偽',
    '無免許',
    'ぱっくり',
    'パックリ'
  ],
  
  // 中リスク：ネガティブな印象
  medium: [
    '評判悪い',
    '悪評',
    '最低',
    'ひどい',
    '酷い',
    'クソ',
    'くそ',
    'うざい',
    'ウザい',
    'しつこい',
    '怪しい',
    '疑問',
    '問題',
    'トラブル',
    '苦情',
    'クレーム',
    '不満',
    '不信',
    '嘘',
    'ウソ',
    'うそ',
    'うそつき',
    'デマ',
    '噂',
    '悪い',
    'ダメ',
    '駄目',
    '使えない',
    '無能',
    '無職',
    '対応悪い',
    '態度悪い',
    '遅い',
    '高い',
    'ぼったくり',
    '粗悪',
    '不良品',
    '欠陥',
    '炎上した',
    '批判',
    '非難',
    '謝罪',
    '不祥事',
    '隠蔽',
    'ごまかし',
    '言い訳',
    '逃げた',
    '閉店',
    '廃業',
    '夜逃げ',
    '音信不通',
    '宗教',
    '勧誘',
    '仕組み',
    'ネットワークビジネス',
    '会員勧誘',
    'ディストリビューター',
    '収入嘘',
    '稼げない',
    'ステマ',
    'すてま',
    'スパム',
    'すぱむ',
    'パクリ',
    'ぱくり',
    'パクり',
    'ひょっとこ',
    '5ch',
    '5ちゃんねる',
    '不幸',
    '不当',
    '不良',
    '不注意',
    '痛い',
    '解雇'
  ],
  
  // 低リスク：注意が必要
  low: [
    '口コミ',
    'レビュー',
    '評価',
    '比較',
    'デメリット',
    '欠点',
    '短所',
    '注意',
    '気をつけろ',
    'おすすめしない',
    'やめとけ',
    '後悔',
    '失敗',
    '辞めたい',
    '退会',
    '解約',
    'キャンセル',
    '返金',
    '不倫',
    '浮気',
    '離婚',
    '別れた',
    '死亡',
    '事故',
    '病気',
    '逮捕歴',
    '前科',
    '年齢',
    '年収',
    '学歴',
    '出身',
    '国籍',
    '本名',
    '住所',
    '実家',
    '芸能人',
    '現在',
    '会員',
    '登録',
    '商品一覧',
    '収入'
  ]
};

/**
 * テキストからネガティブキーワードを検出
 * @param {string} text - 検索対象のテキスト
 * @returns {Object} 検出結果 { level: 'high'|'medium'|'low'|null, keyword: string|null }
 */
function detectNegativeKeyword(text) {
  if (!text || typeof text !== 'string') {
    return { level: null, keyword: null };
  }
  
  const lowerText = text.toLowerCase();
  
  // 高リスクから順にチェック
  for (const keyword of NEGATIVE_KEYWORDS.high) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { level: 'high', keyword: keyword };
    }
  }
  
  for (const keyword of NEGATIVE_KEYWORDS.medium) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { level: 'medium', keyword: keyword };
    }
  }
  
  for (const keyword of NEGATIVE_KEYWORDS.low) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { level: 'low', keyword: keyword };
    }
  }
  
  return { level: null, keyword: null };
}

/**
 * サジェストリストからネガティブキーワードを検出
 * @param {Array<string>} suggests - サジェストの配列
 * @returns {Array<Object>} 検出結果の配列 [{ text, level, keyword }, ...]
 */
function analyzeNegativeSuggests(suggests) {
  if (!Array.isArray(suggests)) {
    return [];
  }
  
  return suggests.map(suggest => {
    const result = detectNegativeKeyword(suggest);
    return {
      text: suggest,
      level: result.level,
      keyword: result.keyword
    };
  });
}

/**
 * リスクレベルを取得
 * @param {Array<Object>} analyzedSuggests - 分析済みサジェスト
 * @returns {string} 'high'|'medium'|'low'|'safe'
 */
function getOverallRiskLevel(analyzedSuggests) {
  if (!Array.isArray(analyzedSuggests) || analyzedSuggests.length === 0) {
    return 'safe';
  }
  
  const hasHigh = analyzedSuggests.some(s => s.level === 'high');
  const hasMedium = analyzedSuggests.some(s => s.level === 'medium');
  const hasLow = analyzedSuggests.some(s => s.level === 'low');
  
  if (hasHigh) return 'high';
  if (hasMedium) return 'medium';
  if (hasLow) return 'low';
  
  return 'safe';
}

// エクスポート（Manifest V3対応）
/**
 * ネガティブサイトのドメインリスト
 * 
 * 検索結果にこれらのドメインが含まれている場合、風評被害のリスクが高まる
 */
const NEGATIVE_DOMAINS = {
  // 誹謗中傷・告発系サイト
  high: [
    'fukugyou-report.com',      // スマホ副業詐欺の闇を暴きます
    'fukugyo.blog',             // 副業情報と返金方法の解説サイト
    'secret-information.com',   // 詐欺被害の情報掲示板
    '5ch.net',                  // 5ちゃんねる
    '2ch.sc',                   // 2ちゃんねる
    'bakusai.com',              // 爆サイ
    'machi.to',                 // まちBBS
    'hostlove.com',             // ホストラブ
    'kyaba-ch.com',             // キャバチャンネル
    'detail.chiebukuro.yahoo.co.jp', // Yahoo!知恵袋
    'oshiete.goo.ne.jp',        // 教えて!goo
    'komachi.yomiuri.co.jp'     // 発言小町
  ],
  
  // 注意が必要なサイト
  medium: [
    'twitter.com',              // Twitter（炎上の可能性）
    'x.com',                    // X（旧Twitter）
    'facebook.com',             // Facebook
    'note.com',                 // note（告発記事の可能性）
    'ameblo.jp',                // アメブロ
    'hatenablog.com',           // はてなブログ
    'fc2.com'                   // FC2ブログ
  ]
};

/**
 * URLからドメインを抽出
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

/**
 * ネガティブドメインをチェック
 */
function checkNegativeDomain(url, debug = false) {
  const domain = extractDomain(url);
  
  if (debug) {
    console.log(`   [checkNegativeDomain] チェック対象ドメイン: ${domain}`);
  }
  
  // 高リスクドメイン
  for (const negativeDomain of NEGATIVE_DOMAINS.high) {
    // 完全一致または末尾一致のみを検出（部分一致は誤検知を防ぐため除外）
    const matches = domain === negativeDomain || domain.endsWith('.' + negativeDomain);
    
    if (debug && matches) {
      console.log(`   [checkNegativeDomain] ✅ 高リスクドメイン一致: ${negativeDomain}`);
    }
    
    if (matches) {
      return { level: 'high', domain: negativeDomain };
    }
  }
  
  // 中リスクドメイン
  for (const negativeDomain of NEGATIVE_DOMAINS.medium) {
    // 完全一致または末尾一致のみを検出（部分一致は誤検知を防ぐため除外）
    const matches = domain === negativeDomain || domain.endsWith('.' + negativeDomain);
    
    if (debug && matches) {
      console.log(`   [checkNegativeDomain] ⚠️ 中リスクドメイン一致: ${negativeDomain}`);
    }
    
    if (matches) {
      return { level: 'medium', domain: negativeDomain };
    }
  }
  
  if (debug) {
    console.log(`   [checkNegativeDomain] ⚪ 一致なし`);
  }
  
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NEGATIVE_KEYWORDS,
    detectNegativeKeyword,
    analyzeNegativeSuggests,
    getOverallRiskLevel,
    NEGATIVE_DOMAINS,
    checkNegativeDomain,
    extractDomain
  };
}
