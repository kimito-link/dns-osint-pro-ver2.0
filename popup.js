// デバッグモード設定 (background.jsと同じ)
const DEBUG_MODE = false;

// 外部モジュールの読み込み
const U = window.OsintUtils;

// UIコンポーネントの読み込み（詳細デバッグ付き）
console.log('=== UIコンポーネント読み込み状態チェック ===');
console.log('window.OsintUIComponents:', window.OsintUIComponents);

if (!window.OsintUIComponents) {
  console.error('❌ CRITICAL: OsintUIComponents が読み込まれていません！');
  console.error('ui-components.js の読み込みに失敗しています');
  alert('❌ UIコンポーネントの読み込みエラー。拡張機能を再読み込みしてください。');
}

// UIオブジェクトを設定
const UI = window.OsintUIComponents;

// 各メソッドの存在確認
if (UI) {
  console.log('✅ UI.createReputationAlert:', typeof UI.createReputationAlert);
  console.log('✅ UI.createFullConsultationSection:', typeof UI.createFullConsultationSection);
  console.log('✅ UI.createEmailSecurityAlert:', typeof UI.createEmailSecurityAlert);
  console.log('✅ UI.createSiteHealthAlert:', typeof UI.createSiteHealthAlert);

  // メソッドが存在しない場合は警告
  const requiredMethods = ['createReputationAlert', 'createFullConsultationSection', 'createEmailSecurityAlert', 'createSiteHealthAlert'];
  for (const method of requiredMethods) {
    if (typeof UI[method] !== 'function') {
      console.error(`❌ UI.${method} が存在しないか、関数ではありません:`, typeof UI[method]);
    }
  }
} else {
  console.error('❌ UI オブジェクトが null または undefined です');
}

// ========================================
// 定数定義（background.jsと共有）
// ========================================

/**
 * バージョン管理定数
 * @note background.jsと同じ値を使用
 */
const VERSION_CONSTANTS = {
  WP_MINIMUM: 6.8,      // WordPress最低バージョン
  PHP_MINIMUM: 8.0,     // PHP最低バージョン
  CF7_MINIMUM: 6.1      // Contact Form 7最低バージョン
};

const els = {
  domain: document.getElementById("domain"),
  go: document.getElementById("go"),
  specialSections: document.getElementById("specialSections"),
  resultBody: document.getElementById("resultBody")
};

async function getActiveTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || "";
}

async function getActiveTabTitle() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.title || "";
}

/**
 * 国コードから国旗絵文字を生成
 * @param {string} countryCode - ISO 3166-1 alpha-2 国コード（例: JP, US）
 * @returns {string} 国旗絵文字
 */
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

/**
 * ページタイトルからサイト名/ブランド名を抽出
 * 風評被害チェック用のキーワードとして使用
 * @param {string} title - ページタイトル
 * @returns {string|null} 抽出されたサイト名
 */
function extractSiteName(title) {
  if (!title) return null;

  console.log('元のタイトル:', title);

  let siteName = title;

  // 0. 全角→半角変換
  siteName = siteName.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });

  // 1. 固有名詞付き施設名を検出（最優先）
  // Phase 1: 施設名（医院、クリニック等）を最優先で検出
  const primaryFacilityPatterns = [
    // 医療機関の施設名（カタカナ2文字以上 or 漢字2文字以上 + 施設名）
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(医院|クリニック|病院|診療所|歯科医院|歯科)/,
    // 美容・サロン
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(サロン|美容室|理容室|エステ|ネイルサロン|まつげサロン|脱毛サロン)/,
    // 治療院系
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(整体院|接骨院|鍼灸院|治療院|マッサージ院|カイロプラクティック)/,
    // 飲食店
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(レストラン|カフェ|喫茶店|居酒屋|焼肉店|ラーメン店|寿司店)/,
    // 教育・スポーツ
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(塾|学習塾|予備校|教室|スクール|ジム|フィットネス)/,
    // 専門サービス
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(法律事務所|会計事務所|税理士事務所|行政書士事務所|弁護士事務所)/,
    // その他施設
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(ホテル|旅館|民宿|ペンション|ゲストハウス|動物病院|ペットサロン)/
  ];

  // まず施設名で検索（医院、クリニック等）
  for (const pattern of primaryFacilityPatterns) {
    const match = siteName.match(pattern);
    if (match) {
      const facilityName = match[1];
      const facilityType = match[2];

      // 地名や一般的な説明文を除外（例: 「京都市西京区の」「東京都の」等）
      const excludePatterns = [
        /^[都道府県市区町村]+の$/,  // 「〜市の」「〜区の」等
        /^.{1,3}[都道府県市区町村]$/,  // 短い地名
        /^の$/,  // 「の」だけ
      ];

      let isExcluded = false;
      for (const excludePattern of excludePatterns) {
        if (excludePattern.test(facilityName)) {
          isExcluded = true;
          break;
        }
      }

      if (!isExcluded && facilityName.length >= 2) {
        const extractedName = facilityName + facilityType;
        console.log('抽出したサイト名 (Phase 1):', extractedName);
        return extractedName;
      }
    }
  }

  // Phase 2: 診療科名で検索（施設名が見つからなかった場合のみ）
  const secondaryFacilityPatterns = [
    /([ァ-ヶー]{2,}|[一-龠]{2,}|[a-zA-Z]{2,})(整形外科|内科|皮膚科|心療内科|精神科|眼科|耳鼻科|小児科|外科)/
  ];

  for (const pattern of secondaryFacilityPatterns) {
    const match = siteName.match(pattern);
    if (match) {
      const facilityName = match[1];
      const facilityType = match[2];

      // 地名を除外
      if (!/[都道府県市区町村]/.test(facilityName) && facilityName.length >= 2) {
        const extractedName = facilityName + facilityType;
        console.log('抽出したサイト名 (Phase 2):', extractedName);
        return extractedName;
      }
    }
  }

  // 2. プレフィックス除去（【公式】など）
  siteName = siteName.replace(/^[【\[](公式|PR|広告|Official)[】\]]\s*/g, '');

  // 3. セパレーターで分割（優先度順）
  const separators = [
    '｜',     // 全角パイプ
    '|',      // 半角パイプ
    ' - ',    // ハイフン（前後にスペース）
    '－',     // 全角ハイフン
    '・',     // 中点
    '【',     // 開き括弧
    '】',     // 閉じ括弧
    '(',      // 半角開き括弧
    '（',     // 全角開き括弧
    '「',     // かぎ括弧開き
    '』',     // 二重かぎ括弧閉じ
  ];

  for (const sep of separators) {
    if (siteName.includes(sep)) {
      siteName = siteName.split(sep)[0].trim();
      break;
    }
  }

  // 4. 法人格を除去（「株式会社」「有限会社」など）
  siteName = siteName.replace(/^(株式会社|有限会社|合同会社|合資会社|一般社団法人|公益財団法人|学校法人)\s*/g, '');
  siteName = siteName.replace(/\s*(株式会社|有限会社|合同会社|Inc\.|Ltd\.|Co\.,Ltd\.|Corporation)$/gi, '');

  // 5. 英語の場合、「The」を除去
  siteName = siteName.replace(/^The\s+/i, '');

  // 6. 特殊文字や余分な空白を整理
  siteName = siteName.replace(/[\u3000\s]+/g, ' ').trim();
  siteName = siteName.replace(/["'`]+/g, ''); // クォートを除去

  // 7. 明らかに長すぎる場合（50文字以上）は最初の単語を抽出
  if (siteName.length > 50) {
    // カタカナ・漢字・英数字で構成される最初の単語を探す
    const match = siteName.match(/^([\u30A0-\u30FF\u3040-\u309F\u4E00-\u9FFF\u3400-\u4DBFa-zA-Z0-9]+)/);
    if (match) {
      siteName = match[1];
    } else {
      // スペースで区切って最初の単語
      siteName = siteName.split(/\s+/)[0];
    }
  }

  // 8. エイリアス対応（よく検索される別名がある場合の変換）
  const aliases = {
    'SBC湘南美容クリニック': '湘南美容外科',
    'SBC': '湘南美容外科',
    '湘南美容クリニック': '湘南美容外科'
  };

  if (aliases[siteName]) {
    siteName = aliases[siteName];
  }

  console.log('抽出したサイト名:', siteName);

  return siteName || null;
}

function normalizeDomain(input) {
  try { return new URL(input).hostname; } catch { /* noop */ }
  const m = String(input).trim().match(/[a-z0-9.-]+\.[a-z.]{2,}/i);
  return m ? m[0].toLowerCase() : "";
}

function addRow(type, value) {
  const tr = document.createElement("tr");
  const tdType = document.createElement("td");
  const tdValue = document.createElement("td");

  tdType.textContent = type;
  tdValue.innerHTML = value;
  tdValue.className = "multi-line";

  tr.appendChild(tdType);
  tr.appendChild(tdValue);
  els.resultBody.appendChild(tr);
}

// 特別なセクションを追加（1列表示）
function addSpecialSection(title, content) {
  const section = document.createElement("div");
  section.className = "special-section";
  section.innerHTML = `
    <div class="section-title">${title}</div>
    <div class="section-content">${content}</div>
  `;
  els.specialSections.appendChild(section);
}

/**
 * 結果をクリア
 */
function clearResults() {
  els.specialSections.innerHTML = '';

  // 🐫 りんくのローディング表示
  const loadingHtml = `
    <tr>
      <td colspan="2" style="padding: 0; border: none;">
        <div style="position: relative; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden; text-align: center;">
          <img src="images/link.png" class="main-loading-link" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 6px 20px rgba(102,126,234,0.5); margin-bottom: 20px;">
          <div style="color: #fff; font-weight: bold; font-size: 1.3em; margin-bottom: 10px;">
            🐫 りんく：「ちょっと待っててね調査中！」
          </div>
          <div class="main-loading-dots" style="color: rgba(255,255,255,0.9); font-size: 1em;">
            ドメインを解析しています<span class="dots"></span>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 8px; backdrop-filter: blur(10px);">
            <div style="color: #fff; font-size: 0.9em; line-height: 1.6;">
              ✨ チェック中の項目：<br>
              DNSレコード | SSL証明書 | メールセキュリティ | SEO設定
            </div>
          </div>
        </div>
      </td>
    </tr>
  `;

  els.resultBody.innerHTML = loadingHtml;

  // CSS アニメーションを追加（まだ存在しない場合）
  if (!document.getElementById('main-loading-animation-style')) {
    const style = document.createElement('style');
    style.id = 'main-loading-animation-style';
    style.textContent = `
      @keyframes mainLoadingPulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 6px 20px rgba(102,126,234,0.5);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 8px 30px rgba(102,126,234,0.8);
        }
      }
      @keyframes mainDotBounce {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
      .main-loading-link {
        animation: mainLoadingPulse 2s ease-in-out infinite;
      }
      .main-loading-dots .dots::after {
        content: '...';
        animation: mainDotBounce 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * ホスト名/NS/MXからサーバー/サービスを推定
 * ドメイン名のパターンマッチングで主要サービスを特定
 * @param {string} name - ホスト名またはMX/NSレコード
 * @returns {string|null} 推定されたサービス名
 */
function identifyServer(name) {
  if (!name) return null;
  const lower = name.toLowerCase();

  // 日本の主要ホスティング会社
  if (lower.includes('xserver') || lower.includes('エックスサーバー')) return '🟦 Xサーバー';
  if (lower.includes('lolipop') || lower.includes('ロリポップ')) return '🍭 ロリポップサーバー';
  if (lower.includes('sakura') || lower.includes('さくら')) return '🌸 さくらインターネット';
  if (lower.includes('onamae') || lower.includes('お名前')) return '🏢 お名前ドットコム';
  if (lower.includes('muumuu') || lower.includes('ムームー')) return '🐄 ムームードメイン';
  if (lower.includes('conoha')) return '🐾 ConoHa';
  if (lower.includes('colorfulbox') || lower.includes('カラフルボックス')) return '🎨 カラフルボックス';
  if (lower.includes('mixhost')) return '🔥 mixhost';
  if (lower.includes('heteml')) return '💼 heteml';
  if (lower.includes('coreserver')) return '🛠️ コアサーバー';
  if (lower.includes('kagoya')) return '🏛️ KAGOYA';

  // 海外ホスティング
  if (lower.includes('cloudflare')) return '☁️ Cloudflare';
  if (lower.includes('amazon') || lower.includes('aws')) return '🟧 Amazon Web Services (AWS)';
  if (lower.includes('google') || lower.includes('gcp')) return '🔵 Google Cloud';
  if (lower.includes('azure') || lower.includes('microsoft')) return '🔷 Microsoft Azure';
  if (lower.includes('digitalocean')) return '🌊 DigitalOean';
  if (lower.includes('linode')) return '🟫 Linode';
  if (lower.includes('vultr')) return '⚡ Vultr';

  return null;
}

/**
 * IPアドレスからサーバー/ホスティング会社を推定
 * 主要なCDNやホスティングサービスのIP範囲と照合
 * @param {string} ip - IPv4アドレス
 * @returns {string|null} 推定されたサーバー名
 */
function identifyFromIp(ip) {
  const parts = ip.split('.').map(Number);

  // IP範囲からの推定
  if (parts[0] === 160 && parts[1] === 251) return '🟦 XサーバーのIP範囲';
  if (parts[0] === 157 && parts[1] === 7) return '🌸 さくらインターネットのIP範囲';
  if (parts[0] === 160 && parts[1] === 16) return '🍭 ロリポップサーバーのIP範囲';

  // AWS
  if ([3, 13, 18, 34, 35, 52, 54, 99].includes(parts[0])) return '🟧 Amazon Web Services (AWS)のIP範囲';

  // Google Cloud
  if ([35, 104, 108, 130, 142, 146, 162, 173].includes(parts[0])) return '🔵 Google CloudのIP範囲';

  // Cloudflare
  if ([104, 108, 141, 162, 172, 173, 188, 198].includes(parts[0])) return '☁️ CloudflareのIP範囲';

  return null;
}

/**
 * TXTレコードから使用しているサービスを判定
 * @param {string} txtRecord - TXTレコードの内容
 * @returns {Object|null} {service: 'サービス名', type: 'カテゴリ', icon: '絵文字'}
 */
function identifyServiceFromTXT(txtRecord) {
  if (!txtRecord) return null;
  const lower = txtRecord.toLowerCase();

  // メール関連
  if (lower.includes('v=spf1')) {
    const services = [];
    if (lower.includes('_spf.google.com')) services.push('Google Workspace');
    if (lower.includes('outlook.com') || lower.includes('office365')) services.push('Microsoft 365');
    if (lower.includes('amazonses')) services.push('Amazon SES');
    if (lower.includes('sendgrid')) services.push('SendGrid');
    if (lower.includes('mailgun')) services.push('Mailgun');
    if (lower.includes('sendinblue')) services.push('Sendinblue');
    if (lower.includes('mailchimp')) services.push('Mailchimp');
    if (lower.includes('zendesk')) services.push('Zendesk');
    if (lower.includes('salesforce')) services.push('Salesforce');
    if (lower.includes('hubspot')) services.push('HubSpot');
    if (lower.includes('pardot')) services.push('Pardot');

    if (services.length > 0) {
      return {service: services.join(', '), type: 'mail', icon: '📧'};
    }
    return {service: 'SPF設定', type: 'mail', icon: '📧'};
  }

  // Google関連
  if (lower.includes('google-site-verification')) return {service: 'Googleサイト認証', type: 'verification', icon: '🔐'};

  // Microsoft関連
  if (lower.includes('ms=ms')) return {service: 'Microsoftドメイン認証', type: 'verification', icon: '🔐'};

  // Apple
  if (lower.includes('apple-domain-verification')) return {service: 'Appleドメイン認証', type: 'verification', icon: '🔐'};

  // Facebook/Meta
  if (lower.includes('facebook-domain-verification')) return {service: 'Facebookドメイン認証', type: 'verification', icon: '🔐'};

  // その他のサービス
  if (lower.includes('hubspot')) return {service: 'HubSpot', type: 'marketing', icon: '📊'};
  if (lower.includes('pardot')) return {service: 'Pardot (Salesforce)', type: 'marketing', icon: '📊'};
  if (lower.includes('notion')) return {service: 'Notion', type: 'service', icon: '📑'};
  if (lower.includes('globalsign')) return {service: 'GlobalSign SSL', type: 'security', icon: '🔒'};
  if (lower.includes('cloudfront')) return {service: 'Amazon CloudFront', type: 'cdn', icon: '☁️'};
  if (lower.includes('docusign')) return {service: 'DocuSign', type: 'service', icon: '📝'};
  if (lower.includes('stripe')) return {service: 'Stripe', type: 'payment', icon: '💳'};

  return null;
}

// サジェスト取得関数（サイト名自動抽出版）
async function checkSuggestPollution(domain, siteTitle) {
  console.log('サジェスト取得開始 - ドメイン:', domain, 'サイトタイトル:', siteTitle);

  const loadingDiv = document.getElementById('suggest-loading');
  if (!loadingDiv) {
    if (DEBUG_MODE) console.error('Loading div not found');
    return;
  }

  // タイトルからサイト名を抽出
  const siteName = extractSiteName(siteTitle);
  const searchName = siteName || domain;

  console.log('抽出したサイト名:', siteName);

  // 🆕 拡張版: 英語→カタカナ変換辞書
  const katakanaDict = {
    // 基本単語
    'clinic': 'クリニック', 'salon': 'サロン', 'hotel': 'ホテル', 'restaurant': 'レストラン',
    'cafe': 'カフェ', 'shop': 'ショップ', 'store': 'ストア', 'center': 'センター',
    'office': 'オフィス', 'studio': 'スタジオ', 'gym': 'ジム', 'lab': 'ラボ',

    // IT関連
    'tech': 'テック', 'soft': 'ソフト', 'system': 'システム', 'net': 'ネット',
    'web': 'ウェブ', 'link': 'リンク', 'site': 'サイト', 'app': 'アプリ',
    'data': 'データ', 'cloud': 'クラウド', 'digital': 'デジタル',

    // 医療・美容
    'medical': 'メディカル', 'beauty': 'ビューティー', 'health': 'ヘルス',
    'care': 'ケア', 'spa': 'スパ', 'nail': 'ネイル', 'eye': 'アイ',

    // ビジネス
    'service': 'サービス', 'total': 'トータル', 'support': 'サポート',
    'consulting': 'コンサルティング', 'solution': 'ソリューション',

    // 一文字
    'k': 'ケー', 'a': 'エー', 'b': 'ビー', 'c': 'シー', 'd': 'ディー',
    'e': 'イー', 'f': 'エフ', 'g': 'ジー', 'h': 'エイチ', 'i': 'アイ',
    'j': 'ジェー', 'l': 'エル', 'm': 'エム', 'n': 'エヌ', 'o': 'オー',
    'p': 'ピー', 'q': 'キュー', 'r': 'アール', 's': 'エス', 't': 'ティー',
    'u': 'ユー', 'v': 'ブイ', 'w': 'ダブリュー', 'x': 'エックス', 'y': 'ワイ', 'z': 'ゼット'
  };

  // 🆕 カタカナ→ひらがな変換関数
  const katakanaToHiragana = (str) => {
    return str.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  };

  // 🆕 数字の表記ゆれパターン
  const numberVariations = {
    '1': ['1', '１', '一', 'いち', 'ワン'],
    '2': ['2', '２', '二', 'に', 'ツー'],
    '3': ['3', '３', '三', 'さん', 'スリー'],
    '4': ['4', '４', '四', 'よん', 'フォー'],
    '5': ['5', '５', '五', 'ご', 'ファイブ'],
    '6': ['6', '６', '六', 'ろく', 'シックス'],
    '7': ['7', '７', '七', 'なな', 'セブン'],
    '8': ['8', '８', '八', 'はち', 'エイト'],
    '9': ['9', '９', '九', 'きゅう', 'ナイン'],
    '0': ['0', '０', '零', 'ゼロ', 'れい']
  };

  // 🆕 よくある略称・愛称パターン辞書
  const nicknamePatterns = {
    // 医療系
    '湘南美容外科': ['湘南美容クリニック', 'SBC', 'しょうなん', '湘美'],
    '湘南美容クリニック': ['湘南美容外科', 'SBC', 'しょうなん', '湘美'],
    'SBC': ['湘南美容外科', '湘南美容クリニック'],

    // 飲食系
    'マクドナルド': ['マック', 'マクド', 'McDonald', 'McDonalds', 'まっく'],
    'スターバックス': ['スタバ', 'Starbucks', 'すたば'],
    'ケンタッキーフライドチキン': ['ケンタッキー', 'KFC', 'けんたっきー'],
    'サイゼリヤ': ['サイゼリア', 'サイゼ', 'Saizeriya'],

    // コンビニ
    'セブンイレブン': ['セブン', '7-11', 'セブンイレブン', 'seven'],
    'ファミリーマート': ['ファミマ', 'FamilyMart', 'ふぁみま'],
    'ローソン': ['LAWSON', 'ろーそん'],

    // IT・サービス
    'アマゾン': ['Amazon', 'あまぞん', 'アマゾンジャパン'],
    '楽天': ['Rakuten', 'らくてん'],
    'ヤフー': ['Yahoo', 'Yahoo!', 'YAHOO', 'やふー']
  };

  // 🆕 施設名・業種の類義語辞書（汎用的な言い換え）
  const synonymPatterns = {
    // 医療施設
    'クリニック': ['医院', '病院', '診療所', 'clinic'],
    '医院': ['クリニック', '病院', '診療所'],
    '病院': ['クリニック', '医院', '診療所', 'ホスピタル'],
    '診療所': ['クリニック', '医院', '病院'],
    '歯科医院': ['歯科', 'デンタルクリニック', '歯医者'],
    '歯科': ['歯科医院', 'デンタルクリニック', '歯医者'],
    '整形外科': ['整形', 'せいけい'],
    '皮膚科': ['皮フ科', 'ひふ科', 'スキンクリニック'],

    // 美容・サロン
    'サロン': ['店', 'ショップ', '美容室', 'スタジオ', 'salon'],
    '美容室': ['サロン', 'ヘアサロン', '美容院', '理容室'],
    '美容院': ['美容室', 'サロン', 'ヘアサロン'],
    'ヘアサロン': ['美容室', 'サロン', '美容院'],
    'エステ': ['エステサロン', 'エステティック', 'エステティックサロン'],
    'エステサロン': ['エステ', 'エステティック'],
    'ネイルサロン': ['ネイル', 'ネイル店'],

    // 治療院系
    '整体院': ['整体', '整骨院', '接骨院', 'せいたい'],
    '接骨院': ['整体院', '整骨院', '鍼灸院'],
    '整骨院': ['整体院', '接骨院', 'せいこつ'],
    '鍼灸院': ['鍼灸', 'しんきゅう', 'はり'],

    // 飲食店
    'レストラン': ['飲食店', 'お店', '店舗', 'restaurant', 'レストラン'],
    '飲食店': ['レストラン', 'お店', '店'],
    'カフェ': ['喫茶店', 'コーヒー店', 'cafe', 'カフェー'],
    '喫茶店': ['カフェ', '珈琲店', 'きっさてん'],
    '居酒屋': ['いざかや', '居酒屋さん', 'バル'],
    'ラーメン店': ['ラーメン屋', 'らーめん', 'ラーメン'],

    // 教育・スクール
    '塾': ['学習塾', 'じゅく', 'スクール', '学習教室'],
    '学習塾': ['塾', 'スクール', '学習教室'],
    '予備校': ['塾', 'よびこう', 'スクール'],
    '教室': ['スクール', 'クラス', 'きょうしつ'],
    'スクール': ['教室', '塾', 'school'],

    // スポーツ・フィットネス
    'ジム': ['フィットネス', 'フィットネスジム', 'スポーツジム', 'gym', 'トレーニングジム'],
    'フィットネス': ['ジム', 'フィットネスジム', 'フィットネスクラブ'],
    'ヨガ': ['ヨガスタジオ', 'ヨガ教室'],

    // 専門サービス
    '法律事務所': ['法律事務所', '弁護士事務所', '弁護士'],
    '弁護士事務所': ['法律事務所', '弁護士'],
    '税理士事務所': ['税理士', '会計事務所'],
    '会計事務所': ['税理士事務所', '税理士'],

    // 宿泊施設
    'ホテル': ['宿', '宿泊施設', 'hotel', 'ほてる'],
    '旅館': ['宿', '旅館', 'りょかん', '温泉旅館'],
    '民宿': ['宿', 'みんしゅく', '民宿'],

    // その他
    '動物病院': ['動物クリニック', '獣医', 'ペットクリニック'],
    'ペットサロン': ['ペット美容室', 'トリミングサロン', 'トリミング']
  };

  // 🆕 表記ゆれ生成関数
  const generateNotationVariations = (text) => {
    const variations = new Set([text]);

    // 1. 全角↔半角
    const toHalfWidth = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    variations.add(toHalfWidth);

    // 2. カタカナ→ひらがな
    if (/[ァ-ヶー]/.test(text)) {
      variations.add(katakanaToHiragana(text));
    }

    // 3. 大文字小文字
    variations.add(text.toLowerCase());
    variations.add(text.toUpperCase());

    // 4. スペース除去
    variations.add(text.replace(/\s+/g, ''));

    return Array.from(variations);
  };

  // 🆕 検索パターンを生成
  const searchVariations = [searchName];

  // === 1. 表記ゆれパターンを追加 ===
  const notationVars = generateNotationVariations(searchName);
  searchVariations.push(...notationVars);
  console.log('📝 表記ゆれパターン:', notationVars);

  // === 2. 略称・愛称パターンを追加 ===
  for (const [fullName, nicknames] of Object.entries(nicknamePatterns)) {
    if (searchName.includes(fullName)) {
      searchVariations.push(...nicknames);
      console.log(`🏷️ 略称検出: "${fullName}" → [${nicknames.join(', ')}]`);
      break;
    }
    // 逆方向（略称から正式名称）
    if (nicknames.some(nick => searchName.includes(nick))) {
      searchVariations.push(fullName);
      searchVariations.push(...nicknames.filter(n => !searchName.includes(n)));
      console.log(`🏷️ 正式名称検出: "${searchName}" → ${fullName}`);
      break;
    }
  }

  // === 3. 英語部分を抽出してカタカナ変換 ===
  const englishParts = searchName.match(/[a-zA-Z0-9\-]+/g);
  if (englishParts) {
    for (const part of englishParts) {
      const lower = part.toLowerCase();

      // 辞書に完全一致があればそれを使用
      if (katakanaDict[lower]) {
        const katakana = katakanaDict[lower];
        searchVariations.push(katakana);
        searchVariations.push(katakana + '株式会社');
        searchVariations.push(katakana + '株');
        // ひらがな版も追加
        searchVariations.push(katakanaToHiragana(katakana));
        console.log(`🔤 カタカナ変換(辞書): "${part}" → "${katakana}"`);
        continue;
      }

      // ハイフンで分割して変換（例: "k-net" → "ケーネット"）
      let katakana = '';
      const subParts = lower.split('-');
      for (const sub of subParts) {
        if (katakanaDict[sub]) {
          katakana += katakanaDict[sub];
        } else {
          // 文字単位で変換
          for (const char of sub) {
            katakana += katakanaDict[char] || '';
          }
        }
      }

      if (katakana) {
        searchVariations.push(katakana);
        searchVariations.push(katakana + '株式会社');
        searchVariations.push(katakana + '株');
        searchVariations.push(katakanaToHiragana(katakana));
        console.log(`🔤 カタカナ変換(分解): "${part}" → "${katakana}"`);
      }
    }
  }

  // === 4. 数字の表記ゆれを追加 ===
  const numberMatch = searchName.match(/[0-9０-９一二三四五六七八九十]/g);
  if (numberMatch) {
    for (const num of numberMatch) {
      // 半角数字に正規化
      const normalized = num.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
      if (numberVariations[normalized]) {
        numberVariations[normalized].forEach(variant => {
          const newVariation = searchName.replace(num, variant);
          if (newVariation !== searchName) {
            searchVariations.push(newVariation);
          }
        });
        console.log(`🔢 数字の表記ゆれ: "${num}" → [${numberVariations[normalized].join(', ')}]`);
      }
    }
  }

  // === 5. 施設名・業種の類義語変換（汎用的な言い換え） ===
  for (const [word, synonyms] of Object.entries(synonymPatterns)) {
    if (searchName.includes(word)) {
      // 元のワードを類義語に置き換えたパターンを生成
      for (const synonym of synonyms) {
        const newVariation = searchName.replace(word, synonym);
        if (newVariation !== searchName) {
          searchVariations.push(newVariation);
        }
      }
      console.log(`🔄 類義語変換: "${word}" → [${synonyms.slice(0, 3).join(', ')}...]`);
    }
  }

  // === 6. 業界特化型の略称（施設名がある場合） ===
  if (/医院|クリニック|歯科/.test(searchName)) {
    // 「〇〇医院」→「〇〇」のみでも検索
    const baseNameMatch = searchName.match(/(.+?)(医院|クリニック|歯科医院|歯科)/);
    if (baseNameMatch) {
      const baseName = baseNameMatch[1];
      searchVariations.push(baseName);
      searchVariations.push(baseName + '先生');
      console.log(`🏥 医療機関略称: "${baseName}"`);
    }
  }

  if (/サロン|美容室/.test(searchName)) {
    const baseNameMatch = searchName.match(/(.+?)(サロン|美容室|ヘアサロン)/);
    if (baseNameMatch) {
      const baseName = baseNameMatch[1];
      searchVariations.push(baseName);
      console.log(`💇 美容系略称: "${baseName}"`);
    }
  }

  // 重複除去（最大15パターンに拡張）
  const uniqueVariations = [...new Set(searchVariations)]
    .filter(v => v && v.length >= 2) // 1文字の検索は除外
    .slice(0, 15);
  console.log('🔍 検索パターン:', uniqueVariations);
  let html = '<div style="background: #fff; border: 2px solid #4caf50; padding: 15px; border-radius: 4px;">';
  html += `<h3 style="margin: 0 0 15px 0; color: #2e7d32;">🔍 "${searchName}" のサジェスト</h3>`;

  if (siteName) {
    html += '<div style="padding: 10px; background: #e8f5e9; border-left: 4px solid #4caf50; margin-bottom: 15px;">';
    html += `<strong>🎯 タイトルから抽出:</strong> ${siteName}`;
    html += '</div>';
  }

    try {
    // 🆕 複数パターンでサジェストを取得
    const allResponses = [];
    for (const query of uniqueVariations) {
      console.log(`📡 "${query}" でサジェスト取得中...`);
      const response = await chrome.runtime.sendMessage({
        type: 'getSuggests',
        query: query
      });
      if (response?.success) {
        allResponses.push({ query, response });
        console.log(`✅ "${query}" 取得完了`);
      }
    }

    if (allResponses.length === 0) {
      throw new Error('サジェスト取得失敗');
    }

    // 風評被害キーワードのチェック
    const negativeKeywords = [
      '詐欺', '被害', '危険', '怠しい', '最悪', 'ブラック',
      'やばい', 'トラブル', '悪質', '悪い', '悪評',
      '炎上', '問題', 'クレーム', '苦情', '評判悪い',
      '倒産', '閉鎖', 'パワハラ', 'セクハラ', '事件'
    ];

    // ✅ ポジティブ検出は不要（業種別推奨のみ）

    let hasNegativeSuggest = false;
    const allSuggests = [];
    let negativeQuery = null;

    // 🆕 各パターンのサジェストをチェック
    for (const { query, response } of allResponses) {
      const google = response.google || [];
      const yahoo = response.yahoo || [];
      const bing = response.bing || [];

      const querySuggests = [...google, ...yahoo, ...bing];
      allSuggests.push(...querySuggests);

      console.log(`🔍 "${query}" のサジェスト数: ${querySuggests.length}`);

      if (!hasNegativeSuggest) {
        for (const suggest of querySuggests) {
          if (negativeKeywords.some(keyword => suggest.includes(keyword))) {
            hasNegativeSuggest = true;
            negativeQuery = query;
            console.log(`⚠️ ネガティブ検出: "${query}" -> "${suggest}"`);
            break;
          }
        }
      }
    }

    // HTMLを構築開始
    let html = '';

    // 🚨 風評被害の警告を最上部に表示
    if (hasNegativeSuggest) {
        html += UI.createReputationAlert();

        // 検出されたパターンを表示
        if (negativeQuery && negativeQuery !== searchName) {
          html += '<div style="padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; margin-bottom: 15px;">';
          html += `<strong>⚠️ 検出された表記:</strong> "${negativeQuery}" でネガティブサジェストが見つかりました`;
          html += '</div>';
        }
      }


      // 🆕 ネガティブ検出時はそのサジェストだけをフィルタ
      let google = [];
      let yahoo = [];
      let bing = [];
      let allGoogleTotal = 0;
      let allYahooTotal = 0;
      let allBingTotal = 0;

      if (hasNegativeSuggest && negativeQuery) {
        // ネガティブが見つかったクエリのレスポンスを取得
        const negativeResponse = allResponses.find(r => r.query === negativeQuery);
        if (negativeResponse) {
          const allGoogle = negativeResponse.response.google || [];
          const allYahoo = negativeResponse.response.yahoo || [];
          const allBing = negativeResponse.response.bing || [];

          allGoogleTotal = allGoogle.length;
          allYahooTotal = allYahoo.length;
          allBingTotal = allBing.length;

          // ネガティブキーワードを含むサジェストだけをフィルタ
          google = allGoogle.filter(item => {
            return negativeKeywords.some(keyword => item.includes(keyword));
          });
          yahoo = allYahoo.filter(item => {
            return negativeKeywords.some(keyword => item.includes(keyword));
          });
          bing = allBing.filter(item => {
            return negativeKeywords.some(keyword => item.includes(keyword));
          });
        }
      } else {
        // ネガティブがない場合は通常通り全サジェストを表示
        const displayResponse = allResponses[0];
        google = displayResponse.response.google || [];
        yahoo = displayResponse.response.yahoo || [];
        bing = displayResponse.response.bing || [];

        allGoogleTotal = google.length;
        allYahooTotal = yahoo.length;
        allBingTotal = bing.length;
      }

      // 🎯 風評健全度スコアを表示
      const totalNegatives = google.length + yahoo.length + bing.length;
      const totalSuggests = allGoogleTotal + allYahooTotal + allBingTotal;

      if (totalSuggests > 0 && hasNegativeSuggest) {
        // スコア計算（100点満点）
        const negativeRatio = totalNegatives / totalSuggests;
        let score = 100;

        // ネガティブの割合による減点
        if (negativeRatio > 0) {
          score = Math.max(0, 100 - (negativeRatio * 200)); // 50%以上ネガティブでス0点
        }

        // ネガティブ絶対数による追加減点
        if (totalNegatives >= 10) score -= 20;
        else if (totalNegatives >= 5) score -= 10;
        else if (totalNegatives >= 3) score -= 5;

        score = Math.max(0, Math.round(score));

        // 危険度レベル判定
        let level, levelColor, levelBg, levelIcon, levelText, advice;
        if (score >= 80) {
          level = '安全';
          levelColor = '#2e7d32';
          levelBg = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
          levelIcon = '💚';
          levelText = '優秀な状態です！';
          advice = '現在の良好な状態を維持しましょう。定期的な監視をおすすめします。';
        } else if (score >= 60) {
          level = '注意';
          levelColor = '#f57c00';
          levelBg = 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
          levelIcon = '⚠️';
          levelText = 'ややネガティブが見られます';
          advice = 'ネガティブサジェストへの対策を検討してください。';
        } else if (score >= 40) {
          level = '警告';
          levelColor = '#d84315';
          levelBg = 'linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)';
          levelIcon = '🚨';
          levelText = '風評被害のリスクがあります';
          advice = '早急な対策が必要です。専門家への相談をおすすめします。';
        } else {
          level = '危険';
          levelColor = '#c62828';
          levelBg = 'linear-gradient(135deg, #ffebee 0%, #ef9a9a 100%)';
          levelIcon = '❌';
          levelText = '深刻な風評被害状態です';
          advice = '直ちに対策が必要です！専門家に相談してください。';
        }

        // 星評価
        const stars = Math.round(score / 20); // 5段階評価
        const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

        html += `<div style="background: ${levelBg}; border: 3px solid ${levelColor}; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`;
        html += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
        html += `<div style="font-size: 3em;">${levelIcon}</div>`;
        html += '<div style="flex: 1;">';
        html += `<div style="font-size: 1.4em; font-weight: bold; color: ${levelColor}; margin-bottom: 5px;">風評健全度スコア</div>`;
        html += `<div style="font-size: 0.9em; color: #666;">${levelText}</div>`;
        html += '</div>';
        html += '</div>';

        // スコア表示
        html += '<div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; margin-bottom: 12px;">';
        html += `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">`;
        html += `<div style="font-size: 3em; font-weight: bold; color: ${levelColor};">${score}</div>`;
        html += `<div style="text-align: right;">`;
        html += `<div style="font-size: 1.2em; color: ${levelColor}; font-weight: bold;">${starDisplay}</div>`;
        html += `<div style="font-size: 0.85em; color: #666; margin-top: 3px;">危険度: ${level}</div>`;
        html += `</div>`;
        html += '</div>';

        // プログレスバー
        const barColor = score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : score >= 40 ? '#ff5722' : '#f44336';
        html += `<div style="background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">`;
        html += `<div style="width: ${score}%; height: 100%; background: ${barColor}; transition: width 0.5s ease;"></div>`;
        html += '</div>';
        html += '</div>';

        // 詳細情報
        html += '<div style="background: rgba(255,255,255,0.7); padding: 12px; border-radius: 8px; margin-bottom: 12px;">';
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">';
        html += `<div><strong>🚨 ネガティブ:</strong> ${totalNegatives}個</div>`;
        html += `<div><strong>📊 全サジェスト:</strong> ${totalSuggests}個</div>`;
        html += `<div><strong>📈 ネガ率:</strong> ${(negativeRatio * 100).toFixed(1)}%</div>`;
        html += `<div><strong>🎯 健全率:</strong> ${(100 - negativeRatio * 100).toFixed(1)}%</div>`;
        html += '</div>';
        html += '</div>';

        // アドバイス
        html += `<div style="background: rgba(255,255,255,0.7); padding: 12px; border-radius: 8px; border-left: 4px solid ${levelColor};">`;
        html += `<strong style="color: ${levelColor};">💡 アドバイス:</strong><br>`;
        html += `<span style="font-size: 0.9em; color: #333;">${advice}</span>`;
        html += '</div>';

        html += '</div>';
      }

      // 🌟 業種別推奨キーワードの提案（常に表示）
      console.log('🔍 業種別推奨キーワード表示:', {
        hasNegativeSuggest,
        searchName
      });

      // 👉 常に業種別の推奨キーワードを表示
      if (true) {
        // 🎯 業種判定（サイト名から推定）
        let industry = 'general';
        const name = searchName.toLowerCase();

        if (name.includes('クリニック') || name.includes('医院') || name.includes('歯科') ||
            name.includes('整形外科') || name.includes('皮膚科') || name.includes('clinic') || name.includes('hospital')) {
          industry = 'medical';
        }
        else if (name.includes('サロン') || name.includes('美容') || name.includes('エステ') ||
                 name.includes('ネイル') || name.includes('salon') || name.includes('beauty')) {
          industry = 'beauty';
        }
        else if (name.includes('整体') || name.includes('接骨') || name.includes('鴼灸') ||
                 name.includes('カイロ') || name.includes('マッサージ')) {
          industry = 'therapy';
        }
        else if (name.includes('レストラン') || name.includes('カフェ') || name.includes('居酒屋') ||
                 name.includes('ラーメン') || name.includes('restaurant') || name.includes('cafe')) {
          industry = 'restaurant';
        }
        else if (name.includes('塑') || name.includes('スクール') || name.includes('予備校') ||
                 name.includes('教室') || name.includes('school')) {
          industry = 'education';
        }
        else if (name.includes('ジム') || name.includes('フィットネス') || name.includes('ヨガ') || name.includes('gym')) {
          industry = 'fitness';
        }
        else if (name.includes('法律事務所') || name.includes('弁護士') || name.includes('税理士') ||
                 name.includes('会計士') || name.includes('行政書士')) {
          industry = 'legal';
        }
        else if (name.includes('IT') || name.includes('システム') || name.includes('ウェブ') ||
                 name.includes('アプリ') || name.includes('tech') || name.includes('digital')) {
          industry = 'it';
        }

        // 🎨 業種別の推奨キーワード
        const recommendedKeywords = {
          'medical': {
            title: '医療・クリニック',
            keywords: [
              { category: '信頼・実績', items: ['経験豊富', '勤続年数が長い', '実績多数', '信頼できる医師'] },
              { category: '専門性', items: ['専門医', '認定医', '技術力が高い', '最新治療'] },
              { category: '対応・サービス', items: ['丁寧な説明', '親身な対応', '安心できる', '予約が取りやすい'] }
            ]
          },
          'beauty': {
            title: '美容・サロン',
            keywords: [
              { category: '技術・品質', items: ['技術力が高い', '上手', 'センスが良い', '仕上がりが綺麗'] },
              { category: '信頼・実績', items: ['リピーターが多い', '口コミが良い', '人気サロン', '信頼できる'] },
              { category: '対応・雰囲気', items: ['丁寧なカウンセリング', '親切な対応', '落ち着いた空間', 'リラックスできる'] }
            ]
          },
          'therapy': {
            title: '整体・治療院',
            keywords: [
              { category: '技術・効果', items: ['技術力が高い', '効果が実感できる', '改善例が多い', '症状が軽くなる'] },
              { category: '信頼・実績', items: ['経験豊富', '勤続年数が長い', '実績多数', '信頼できる'] },
              { category: '対応', items: ['丁寧なカウンセリング', '親身な対応', '安心できる', '説明がわかりやすい'] }
            ]
          },
          'restaurant': {
            title: '飲食店',
            keywords: [
              { category: '味・品質', items: ['美味しい', '本格的', 'こだわり', '新鮮'] },
              { category: '人気・評価', items: ['人気店', '口コミが良い', '行列ができる', 'おすすめ'] },
              { category: 'サービス・価格', items: ['コスパが良い', 'ボリューム満点', 'サービスが良い', '雰囲気が良い'] }
            ]
          },
          'education': {
            title: '教育・スクール',
            keywords: [
              { category: '実績・効果', items: ['合格実績が高い', '成績が上がる', '実績豊富', '効果が出る'] },
              { category: '指導・サポート', items: ['丁寧な指導', '個別対応', 'フォローが手厚い', 'わかりやすい'] },
              { category: '信頼', items: ['経験豊富な講師', '信頼できる', '安心できる', '評判が良い'] }
            ]
          },
          'fitness': {
            title: 'ジム・フィットネス',
            keywords: [
              { category: '効果・実績', items: ['効果が出る', '結果が出る', '続けやすい', 'ダイエット成功'] },
              { category: '指導・サポート', items: ['プロが指導', '個別サポート', '親身なアドバイス', '初心者歓迎'] },
              { category: '設備・環境', items: ['設備が充実', '清潔感がある', '通いやすい', '便利な場所'] }
            ]
          },
          'legal': {
            title: '法律・士業',
            keywords: [
              { category: '信頼・実績', items: ['実績豊富', '経験豊富', '信頼できる', '安心できる'] },
              { category: '専門性', items: ['専門知識が豊富', '専門分野に強い', '確かなノウハウ', '詳しい'] },
              { category: '対応', items: ['丁寧な説明', '親身な対応', 'レスポンスが早い', '相談しやすい'] }
            ]
          },
          'it': {
            title: 'IT・システム',
            keywords: [
              { category: '技術・品質', items: ['技術力が高い', '最新技術', '品質が高い', '安定している'] },
              { category: '実績・信頼', items: ['実績豊富', '導入例多数', '信頼できる', '安心できる'] },
              { category: 'サポート', items: ['サポートが充実', 'レスポンスが早い', '丁寧な対応', 'アフターフォロー'] }
            ]
          },
          'general': {
            title: '一般',
            keywords: [
              { category: '信頼・実績', items: ['信頼できる', '実績豊富', '経験豊富', '勤続年数が長い'] },
              { category: '評価・口コミ', items: ['評判が良い', '口コミが良い', '人気がある', 'おすすめ'] },
              { category: 'サービス・対応', items: ['丁寧な対応', '親切', 'サポートが良い', '安心できる'] }
            ]
          }
        };

        const recommended = recommendedKeywords[industry];
        console.log('🎨 業種:', industry, recommended.title);

        html += '<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #4caf50; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">';
        html += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
        html += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #4caf50;">';
        html += '<div style="flex: 1;">';
        if (hasNegativeSuggest) {
          html += '<strong style="color: #2e7d32; font-size: 1.3em;">りんく：「風評対策と並行して、こういうキーワードを育てよう！」</strong><br>';
        } else {
          html += '<strong style="color: #2e7d32; font-size: 1.3em;">りんく：「この業種なら、こういうキーワードがあるとイメージが上がるよ！」</strong><br>';
        }
        html += '<span style="color: #1b5e20; font-size: 0.95em;">ブランドイメージにプラスになるキーワードがあるわ</span>';
        html += '</div>';
        html += '</div>';

        html += '<div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
        html += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
        html += '<strong style="color: #2e7d32; font-size: 1.05em;">✨ 一般的に、こういったキーワードがあると：</strong><br><br>';
        html += '<div style="padding-left: 10px;">';
        html += '• <strong>企業やサービスの信頼感が高まります</strong><br>';
        html += '• <strong>新規顧客の獲得につながりやすい</strong>です<br>';
        html += '• <strong>ブランドイメージの向上に寄与</strong>します<br>';
        html += '• <strong>検索ユーザーがポジティブな情報を求めている証拠</strong>です';
        html += '</div>';

        // 🎨 業種別の推奨キーワードを表示
        html += `<br><strong style="color: #2e7d32;">💡 ${recommended.title}業界でイメージが上がるキーワード例：</strong><br>`;
        html += '<div style="padding: 10px; background: #f1f8f4; border-radius: 4px; margin-top: 8px; font-size: 0.9em;">';

        recommended.keywords.forEach(cat => {
          html += `<div style="margin-bottom: 10px;"><strong style="color: #2e7d32;">✔️ ${cat.category}:</strong><br>`;
          cat.items.forEach(item => {
            html += `<span style="color: #666; font-size: 0.9em;">・ ${item}</span><br>`;
          });
          html += '</div>';
        });

        html += '</div>';
        html += '</div>';
        html += '</div>';

        // 💡 たぬ姉のアドバイス
        html += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
        html += '<div style="display: flex; gap: 10px; align-items: start;">';
        html += '<img src="images/tanu-nee.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
        html += '<div style="flex: 1;">';
        html += '<strong style="color: #1565c0;">💡 たぬ姉の豆知識</strong><br>';
        html += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
        html += '「ユーザーが『信頼できる』や『実績』というキーワードで検索するのは、情報収集段階だから、このタイミングで良い情報が出てくることが重要よ。特に『勤続年数が長い』や『経験豊富』というキーワードは信頼性の証明になるわ。」';
        html += '</span>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
      }

      // Googleサジェスト
      if (google.length > 0) {
        html += `<div style="margin: 15px 0; padding: 12px; background: #f1f3f4; border-left: 4px solid #4285f4; border-radius: 4px;">`;
        html += `<strong style="color: #1a73e8; font-size: 1em;">🌐 Google サジェスト</strong>`;
        html += `<div style="margin: 8px 0 12px 0; padding: 6px 10px; background: #e8f0fe; border-radius: 4px; font-size: 0.8em; color: #1967d2;">`;
        html += `📍 検索した地点での表示です`;
        html += `</div>`;
        google.slice(0, 10).forEach((item, index) => {
          // ネガティブキーワードを赤くハイライト
          let displayItem = item;
          for (const keyword of negativeKeywords) {
            if (item.includes(keyword)) {
              displayItem = item.replace(keyword, `<span style="color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 4px; border-radius: 3px;">${keyword}</span>`);
            }
          }
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(item)}`;
          html += `<div style="padding: 4px 0; font-size: 0.9em;">`;
          html += `${index + 1}. <a href="${googleSearchUrl}" target="_blank" class="suggest-link google" style="color: #1a73e8; text-decoration: none; border-bottom: 1px dotted #1a73e8;">${displayItem}</a>`;
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">';
        html += '<strong>🌐 Google:</strong> サジェストなし';
        html += '</div>';
      }

      // Yahoo!サジェスト
      if (yahoo.length > 0) {
        html += `<div style="margin: 15px 0; padding: 12px; background: #fff0f5; border-left: 4px solid #ff0033; border-radius: 4px;">`;
        html += `<strong style="color: #ff0033; font-size: 1em;">🟣 Yahoo! サジェスト</strong><br><br>`;
        yahoo.slice(0, 10).forEach((item, index) => {
          let displayItem = item;
          for (const keyword of negativeKeywords) {
            if (item.includes(keyword)) {
              displayItem = item.replace(keyword, `<span style="color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 4px; border-radius: 3px;">${keyword}</span>`);
            }
          }
          const yahooSearchUrl = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(item)}`;
          html += `<div style="padding: 4px 0; font-size: 0.9em;">`;
          html += `${index + 1}. <a href="${yahooSearchUrl}" target="_blank" class="suggest-link yahoo" style="color: #c00; text-decoration: none; border-bottom: 1px dotted #c00;">${displayItem}</a>`;
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">';
        html += '<strong>🟣 Yahoo!:</strong> サジェストなし（CORS制限の可能性）';
        html += '</div>';
      }

      // Bingサジェスト
      if (bing.length > 0) {
        html += `<div style="margin: 15px 0; padding: 12px; background: #e7f3ff; border-left: 4px solid #0078d4; border-radius: 4px;">`;
        html += `<strong style="color: #0078d4; font-size: 1em;">🔵 Bing サジェスト</strong><br><br>`;
        bing.slice(0, 10).forEach((item, index) => {
          let displayItem = item;
          for (const keyword of negativeKeywords) {
            if (item.includes(keyword)) {
              displayItem = item.replace(keyword, `<span style="color: #d32f2f; font-weight: bold; background: #ffebee; padding: 2px 4px; border-radius: 3px;">${keyword}</span>`);
            }
          }
          const bingSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(item)}`;
          html += `<div style="padding: 4px 0; font-size: 0.9em;">`;
          html += `${index + 1}. <a href="${bingSearchUrl}" target="_blank" class="suggest-link bing" style="color: #0078d4; text-decoration: none; border-bottom: 1px dotted #0078d4;">${displayItem}</a>`;
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">';
        html += '<strong>🔵 Bing:</strong> サジェストなし';
        html += '</div>';
            }

    html += '<div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-left: 4px solid #2196f3;">';
    html += '<div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-left: 4px solid #2196f3;">';
    html += '<strong style="color: #1976d2;">📊 サジェストとは?</strong><br>';
    html += '<span style="font-size: 0.9em;">検索バーに入力したときに表示される予測候補です。<br>';
    html += '実際に検索してページ下部の「他の人はこちらも検索」で関連ワードを確認できます。</span>';
    html += '</div>';

    // 🌟 口コミサイトリンク
    html += '<div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ff9800; border-radius: 8px;">';
    html += '<div style="display: flex; align-items: center; margin-bottom: 12px;">';
    html += '<span style="font-size: 1.3em; margin-right: 8px;">🌟</span>';
    html += '<strong style="color: #e65100; font-size: 1.05em;">口コミサイトで評判を確認:</strong>';
    html += '</div>';

    // 総合口コミ
    html += '<div style="margin-bottom: 12px;">';
    html += '<div style="font-size: 0.85em; color: #666; margin-bottom: 6px; font-weight: 600;">💬 総合口コミ:</div>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';

    // Googleマップ
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchName + ' 口コミ')}`;
    html += `<a href="${googleMapsUrl}" target="_blank" class="review-btn google-maps" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #4285f4; border-radius: 4px; text-decoration: none; color: #1a73e8; font-size: 0.85em; font-weight: 500;">`;
    html += '🗺️ Googleマップ';
    html += '</a>';

    // Yahoo!知恵袋
    const yahooChiebukuroUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:detail.chiebukuro.yahoo.co.jp')}`;
    html += `<a href="${yahooChiebukuroUrl}" target="_blank" class="review-btn yahoo-chiebukuro" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #ff0033; border-radius: 4px; text-decoration: none; color: #c00; font-size: 0.85em; font-weight: 500;">`;
    html += '❓ Yahoo!知恵袋';
    html += '</a>';

    // みん評
    const minhyoUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:minhyo.jp')}`;
    html += `<a href="${minhyoUrl}" target="_blank" class="review-btn minhyo" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #ff9800; border-radius: 4px; text-decoration: none; color: #e65100; font-size: 0.85em; font-weight: 500;">`;
    html += '⭐ みん評';
    html += '</a>';

    html += '</div></div>';

    // 企業評判
    html += '<div>';
    html += '<div style="font-size: 0.85em; color: #666; margin-bottom: 6px; font-weight: 600;">💼 企業評判:</div>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';

    // 転職会議
    const jobtalkUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:jobtalk.jp')}`;
    html += `<a href="${jobtalkUrl}" target="_blank" class="review-btn jobtalk" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #00a95f; border-radius: 4px; text-decoration: none; color: #00a95f; font-size: 0.85em; font-weight: 500;">`;
    html += '💼 転職会議';
    html += '</a>';

    // OpenWork
    const openworkUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:openwork.jp')}`;
    html += `<a href="${openworkUrl}" target="_blank" class="review-btn openwork" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #00a8e1; border-radius: 4px; text-decoration: none; color: #0288d1; font-size: 0.85em; font-weight: 500;">`;
    html += '💼 OpenWork';
    html += '</a>';

    // エン ライトハウス
    const enlighthouseUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:en-hyouban.com')}`;
    html += `<a href="${enlighthouseUrl}" target="_blank" class="review-btn enlighthouse" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #ff6b35; border-radius: 4px; text-decoration: none; color: #d84315; font-size: 0.85em; font-weight: 500;">`;
    html += '💼 エン ライトハウス';
    html += '</a>';

    // Indeed
    const indeedUrl = `https://www.google.com/search?q=${encodeURIComponent(searchName + ' site:indeed.com 口コミ')}`;
    html += `<a href="${indeedUrl}" target="_blank" class="review-btn indeed" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #fff; border: 1.5px solid #2164f3; border-radius: 4px; text-decoration: none; color: #2164f3; font-size: 0.85em; font-weight: 500;">`;
    html += '💼 Indeed';
    html += '</a>';

    html += '</div></div>';

    // ヒント
    html += '<div style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 4px; border-left: 3px solid #ff9800;">';
    html += '<div style="font-size: 0.85em; color: #333; line-height: 1.6;">';
    html += '💡 <strong>ヒント:</strong><br>';
    html += '・ネガティブな口コミが多い場合は早急な対策が必要<br>';
    html += '・複数のサイトで同じ内容がある場合は注意<br>';
    html += '・口コミ対策も風評被害対策の一環です';
    html += '</div>';
    html += '</div>';

    html += '</div>';

    // 🎯 サービスPRセクション（ネガティブがない場合のみ表示）
    if (!hasNegativeSuggest) {
      html += '<div style="margin-top: 20px;">';
      html += UI.createFullConsultationSection({
        type: 'reputation',
        rinkMessage: 'サジェスト対策で検索結果を改善できるよ！',
        severity: 'success',
        customTitle: '風評対策',
        customDescription: 'サジェスト汚染対策・逆SEO対策の専門家'
      });
      html += '</div>';
    }

    html += '</div>';

    loadingDiv.innerHTML = html;

  } catch (error) {
    if (DEBUG_MODE) console.error('サジェスト取得エラー:', error);
    loadingDiv.innerHTML = `
      <div style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 4px;">
        <strong style="color: #c62828;">⚠️ エラーが発生しました</strong><br>
        <span style="font-size: 0.9em;">${error.message}</span><br><br>
        <small>詳細はブラウザのコンソールを確認してください(F12キー)</small>
      </div>
    `;
  }
}

/**
 * 日本WHOISテキストをパース
 * @param {string} whoisText - WHOIS生データ
 * @returns {Object} パースされたデータ
 */
function parseJpWhois(whoisText) {
  const parsed = {};
  const lines = whoisText.split('\n');

  lines.forEach(line => {
    line = line.trim();

    // [Domain Name] ARC-HD.CO.JP 形式
    const domainMatch = line.match(/^\[Domain Name\]\s+(.+)$/i);
    if (domainMatch) {
      parsed['Domain Name'] = domainMatch[1].trim();
      return;
    }

    // [Registrant] 登録者名
    const registrantMatch = line.match(/^\[Registrant\]\s+(.+)$/i);
    if (registrantMatch) {
      parsed['Organization'] = registrantMatch[1].trim();
      return;
    }

    // [Organization Type] 組織種別
    const orgTypeMatch = line.match(/^\[Organization Type\]\s+(.+)$/i);
    if (orgTypeMatch) {
      parsed['Organization Type'] = orgTypeMatch[1].trim();
      return;
    }

    // [Created on] 作成日（新形式）
    const createdMatch = line.match(/^\[Created on\]\s+(.+)$/i);
    if (createdMatch) {
      parsed['Created Date'] = createdMatch[1].trim();
      return;
    }

    // [Registered Date] 登録日（旧形式）
    const regDateMatch = line.match(/^\[Registered Date\]\s+(.+)$/i);
    if (regDateMatch) {
      parsed['Registered Date'] = regDateMatch[1].trim();
      return;
    }

    // [Connected Date] 接続日
    const connDateMatch = line.match(/^\[Connected Date\]\s+(.+)$/i);
    if (connDateMatch) {
      parsed['Connected Date'] = connDateMatch[1].trim();
      return;
    }

    // [Expires on] 有効期限
    const expiresMatch = line.match(/^\[Expires on\]\s+(.+)$/i);
    if (expiresMatch) {
      parsed['Expires on'] = expiresMatch[1].trim();
      return;
    }

    // [Last Update] 最終更新
    const updateMatch = line.match(/^\[Last Update\]\s+(.+)$/i);
    if (updateMatch) {
      parsed['Last Update'] = updateMatch[1].trim();
      return;
    }

    // [Last Updated] 最終更新（別形式）
    const lastUpdatedMatch = line.match(/^\[Last Updated\]\s+(.+)$/i);
    if (lastUpdatedMatch) {
      parsed['Last Update'] = lastUpdatedMatch[1].trim();
      return;
    }

    // [State] ステータス
    const stateMatch = line.match(/^\[State\]\s+(.+)$/i);
    if (stateMatch) {
      parsed['State'] = stateMatch[1].trim();
      return;
    }

    // [Status] ステータス（別形式）
    const statusMatch = line.match(/^\[Status\]\s+(.+)$/i);
    if (statusMatch) {
      parsed['State'] = statusMatch[1].trim();
      return;
    }

    // [Administrative Contact] 管理者連絡先
    const adminMatch = line.match(/^\[Administrative Contact\]\s+(.+)$/i);
    if (adminMatch) {
      parsed['Administrative Contact'] = adminMatch[1].trim();
      return;
    }

    // [Technical Contact] 技術担当者連絡先
    const techMatch = line.match(/^\[Technical Contact\]\s+(.+)$/i);
    if (techMatch) {
      parsed['Technical Contact'] = techMatch[1].trim();
      return;
    }

    // [Name] 登録者名/担当者名
    const nameMatch = line.match(/^\[Name\]\s+(.+)$/i);
    if (nameMatch) {
      parsed['Name'] = nameMatch[1].trim();
      return;
    }

    // [Email] メールアドレス
    const emailMatch = line.match(/^\[Email\]\s+(.+)$/i);
    if (emailMatch) {
      parsed['Email'] = emailMatch[1].trim();
      return;
    }

    // [Web Page] ウェブページ
    const webMatch = line.match(/^\[Web Page\]\s+(.+)$/i);
    if (webMatch) {
      parsed['Web Page'] = webMatch[1].trim();
      return;
    }

    // [Postal Code] 郵便番号
    const postalMatch = line.match(/^\[Postal Code\]\s+(.+)$/i);
    if (postalMatch) {
      parsed['Postal Code'] = postalMatch[1].trim();
      return;
    }

    // [Address] 住所
    const addressMatch = line.match(/^\[Address\]\s+(.+)$/i);
    if (addressMatch) {
      if (!parsed['Address']) {
        parsed['Address'] = [];
      }
      parsed['Address'].push(addressMatch[1].trim());
      return;
    }

    // [Phone] 電話番号
    const phoneMatch = line.match(/^\[Phone\]\s+(.+)$/i);
    if (phoneMatch) {
      parsed['Phone'] = phoneMatch[1].trim();
      return;
    }

    // [Fax] FAX番号
    const faxMatch = line.match(/^\[Fax\]\s+(.+)$/i);
    if (faxMatch) {
      parsed['Fax'] = faxMatch[1].trim();
      return;
    }

    // [Notify] 通知先
    const notifyMatch = line.match(/^\[Notify\]\s+(.+)$/i);
    if (notifyMatch) {
      parsed['Notify'] = notifyMatch[1].trim();
      return;
    }

    // [Changed] 変更日
    const changedMatch = line.match(/^\[Changed\]\s+(.+)$/i);
    if (changedMatch) {
      parsed['Changed'] = changedMatch[1].trim();
      return;
    }

    // [Sign] 署名 (DNSSEC)
    const signMatch = line.match(/^\[Sign\]\s+(.+)$/i);
    if (signMatch) {
      parsed['Sign'] = signMatch[1].trim();
      return;
    }

    // [Name Server] ネームサーバー
    const nsMatch = line.match(/^\[Name Server\]\s+(.+)$/i);
    if (nsMatch) {
      if (!parsed['Name Server']) {
        parsed['Name Server'] = [];
      }
      parsed['Name Server'].push(nsMatch[1].trim());
      return;
    }
  });

  return parsed;
}

async function fetchAll(domain) {
  console.log('🚀 fetchAll開始 - ドメイン:', domain);

  if (!domain) return;
  
  // Googleインデックスボタンを表示（SEO関連機能）
  const googleIndexSection = document.getElementById('googleIndexSection');
  if (googleIndexSection) {
    googleIndexSection.style.display = 'block';
    console.log('✅ Googleインデックスボタンを表示しました');
  }

  clearResults();

  // 👀 ブラウザがローディングを描画する時間を与える（重要！）
  await new Promise(resolve => setTimeout(resolve, 100));

  // ========================================
  // 🌐 wwwあり・nashiの301リダイレクトチェック
  // ========================================
  const baseDomain = domain.replace(/^www\./, '');
  const wwwDomain = 'www.' + baseDomain;

  console.log('入力ドメイン:', domain);
  console.log('ベースドメイン:', baseDomain);
  console.log('wwwドメイン:', wwwDomain);

  let baseHasRecords = false;
  let wwwHasRecords = false;

  try {
    const baseA = await U.dohQuery(baseDomain, "A");
    baseHasRecords = baseA.Answer && baseA.Answer.length > 0;
    console.log('ベースドメインにAレコードあり:', baseHasRecords);
  } catch (e) {
    console.log('ベースドメインDNSエラー:', e);
  }

  try {
    const wwwA = await U.dohQuery(wwwDomain, "A");
    wwwHasRecords = wwwA.Answer && wwwA.Answer.length > 0;
    console.log('wwwドメインにAレコードあり:', wwwHasRecords);
  } catch (e) {
    console.log('wwwドメインDNSエラー:', e);
  }

  let redirectTarget = baseDomain; // メールセキュリティは常にベースドメインでチェック
  let seoIssues = [];

  try {
    const redirectCheck = await chrome.runtime.sendMessage({
      type: 'checkRedirect',
      baseDomain: baseDomain,
      wwwDomain: wwwDomain
    });

    console.log('301リダイレクトチェック結果:', redirectCheck);
    console.log('redirectCheck.success:', redirectCheck?.success);
    console.log('redirectCheck.baseToWww:', redirectCheck?.baseToWww);
    console.log('redirectCheck.wwwToBase:', redirectCheck?.wwwToBase);

    if (redirectCheck && redirectCheck.success) {
      // 片方でもリダイレクトが検出されればOK
      const hasRedirect = redirectCheck.baseToWww || redirectCheck.wwwToBase;
      
      if (redirectCheck.baseToWww) {
        console.log('✅ 301リダイレクト検出: base -> www (統一OK)');
      } else if (redirectCheck.wwwToBase) {
        console.log('✅ 301リダイレクト検出: www -> base (統一OK)');
      } else if (baseHasRecords && !wwwHasRecords) {
        // wwwなしに統一済み（wwwにDNSレコードなし）
        console.log('✅ wwwなしに統一済み（DNSレコードが片方のみ）');
      } else if (!baseHasRecords && wwwHasRecords) {
        // wwwありに統一済み（baseにDNSレコードなし）
        console.log('✅ wwwありに統一済み（DNSレコードが片方のみ）');
      } else if (baseHasRecords && wwwHasRecords) {
        // 両方にDNSレコードがあるが、リダイレクトチェックが両方失敗
        // → CORSやアクセス制限で正確な判定ができないため、警告を出さない
        console.log('✅ リダイレクトチェックが失敗（アクセス制限の可能性）、警告をスキップ');
        console.log('baseToWww:', redirectCheck.baseToWww, '| wwwToBase:', redirectCheck.wwwToBase);
      } else {
        console.log('✅ DNSレコードが片方のみ、または判定不能');
      }
    }
  } catch (e) {
    console.log('301リダイレクトチェックエラー:', e);
  }

  if (seoIssues.length > 0) {
    let seoAlertHtml = '<div style="background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%); border: 3px solid #e65100; padding: 20px; border-radius: 12px; margin-bottom: 20px;">';
    seoAlertHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;"><img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;"><div style="flex: 1;">';
    seoAlertHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「SEO評価が分散してるよ！」</strong><br><span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">wwwあり、wwwなしの統一設定がされてないよ</span></div></div>';
    seoAlertHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;"><div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
    seoAlertHtml += '<strong style="color: #e65100; font-size: 1.05em;">⚠️ wwwあり、wwwなしが統一されていません</strong><br><br>❌ SEO評価が2つに分散<br>❌ 検索順位が上がりにくい<br>❌ Googleが迷う<br>❌ 被リンクが分散</div></div>';
    seoAlertHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;"><div style="display: flex; gap: 10px; align-items: start;"><img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%;"><div style="flex: 1;">';
    seoAlertHtml += '<strong style="color: #1565c0;">💡 りんくからの提案</strong><br><span style="font-size: 0.9em; color: #333;">「301リダイレクトでwww統一しよう！りんくが頑りにしているリバースハックに相談すればSEO対策もバッチリ！」</span></div></div></div>';
    seoAlertHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
    seoAlertHtml += '<img src="images/rev.png" style="height: 40px;"><div style="text-align: left;"><div style="color: #e65100; font-weight: bold; font-size: 1.15em;">リバースハックに相談（SEO対策）</div>';
    seoAlertHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頑りにしているSEO専門家</div></div><div style="color: #e65100; font-size: 1.5em;">→</div></a></div>';
    addSpecialSection("🚨 SEO警告", seoAlertHtml);
  }

  console.log('使用するメールセキュリティドメイン:', redirectTarget);

  // ========================================
  // 🔒 Mixed Content（混在コンテンツ）チェック
  // ========================================
  console.log('=== Mixed Contentチェック開始 ===');
  try {
    const mixedContentCheck = await chrome.runtime.sendMessage({
      type: 'checkMixedContent',
      url: `https://${domain}`
    });

    console.log('Mixed Contentチェック結果:', mixedContentCheck);

    if (mixedContentCheck && mixedContentCheck.success && mixedContentCheck.hasMixedContent) {
      console.log('⚠️ Mixed Content検出:', mixedContentCheck.count, '件');
      
      let mixedContentHtml = '<div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; margin-bottom: 20px;">';
      mixedContentHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;"><img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;"><div style="flex: 1;">';
      mixedContentHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「セキュリティが危険だよ！」</strong><br><span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">Mixed Content（混在コンテンツ）が見つかったよ</span></div></div>';
      mixedContentHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;"><div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
      mixedContentHtml += `<strong style="color: #b71c1c; font-size: 1.05em;">⚠️ Mixed Contentが${mixedContentCheck.count}件検出されました</strong><br><br>`;
      mixedContentHtml += '❌ HTTPSページ内でHTTPリソースを使用<br>❌ ブラウザに警告が表示される<br>❌ セキュリティリスクがある<br>❌ SEO評価が下がる</div></div>';
      mixedContentHtml += '<div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; border-radius: 4px; margin-bottom: 15px;"><div style="display: flex; gap: 10px; align-items: start;"><img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%;"><div style="flex: 1;">';
      mixedContentHtml += '<strong style="color: #ff6f00;">💡 りんくからの提案</strong><br><span style="font-size: 0.9em; color: #333;">「すべてのリソースをHTTPSに変更しよう！りんくが頃りにしているリバースハックに相談すればセキュリティ対策もバッチリ！」</span></div></div></div>';
      mixedContentHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
      mixedContentHtml += '<img src="images/rev.png" style="height: 40px;"><div style="text-align: left;"><div style="color: #b71c1c; font-weight: bold; font-size: 1.15em;">リバースハックに相談（セキュリティ対策）</div>';
      mixedContentHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頃りにしているセキュリティ専門家</div></div><div style="color: #b71c1c; font-size: 1.5em;">→</div></a></div>';
      addSpecialSection("🚨 セキュリティ警告", mixedContentHtml);
    }
  } catch (e) {
    console.log('Mixed Contentチェックエラー:', e);
  }

  // ========================================
  // 📊 Googleインデックス状況チェック（一時的に無効化）
  // ========================================
  // TODO: ボタン式のオプション機能として実装
  /*
  console.log('=== Googleインデックスチェック開始 ===');
  try {
    // 並列でインデックス数とサイトマップを取得
    const [indexResult, sitemapResult] = await Promise.all([
      chrome.runtime.sendMessage({
        type: 'getGoogleIndexCount',
        domain: domain
      }),
      chrome.runtime.sendMessage({
        type: 'getSitemapPageCount',
        domain: domain
      })
    ]);

    console.log('Googleインデックス結果:', indexResult);
    console.log('サイトマップ結果:', sitemapResult);

    if (indexResult && indexResult.success) {
      const indexCount = indexResult.indexCount;
      const formattedCount = indexResult.formattedCount;
      const isCached = indexResult.cached;

      let indexHtml = '<div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border: 3px solid #2e7d32; padding: 20px; border-radius: 12px; margin-bottom: 20px;">';
      indexHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;"><img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;"><div style="flex: 1;">';
      indexHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「Googleインデックス状況を調べたよ！」</strong><br><span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">あなたのサイトはGoogleにどれくらい登録されてるの？</span></div></div>';
      
      indexHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;"><div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
      indexHtml += `<strong style="color: #2e7d32; font-size: 1.2em;">🔍 Googleインデックス数: ${formattedCount}件</strong><br>`;
      
      if (isCached) {
        indexHtml += '<span style="color: #ff9800; font-size: 0.85em;">💾 キャッシュデータ（24時間以内）</span><br>';
      }
      
      // サイトマップ情報（参考情報として表示）
      if (sitemapResult && sitemapResult.success) {
        const sitemapCount = sitemapResult.pageCount;
        
        indexHtml += '<br><div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;"></div>';
        indexHtml += '<div style="background: #f5f5f5; padding: 12px; border-radius: 6px; border-left: 3px solid #2196F3;">';
        indexHtml += '<strong style="color: #1976d2;">🗺️ サイトマップ情報（参考）</strong><br>';
        indexHtml += `<span style="font-size: 0.9em; color: #666;">サイトマップ登録ページ数: ${sitemapCount.toLocaleString('ja-JP')}ページ<br>`;
        indexHtml += `URL: <a href="${sitemapResult.sitemapUrl}" target="_blank" style="color: #1976d2;">${sitemapResult.sitemapUrl}</a></span>`;
        indexHtml += '<br><br><span style="font-size: 0.85em; color: #ff6f00;">⚠️ 注意：サイトマップにエラーがある可能性や、登録漏れのページがある可能性があります。<br>正確な情報はGoogle Search Consoleで確認してください。</span>';
        indexHtml += '</div>';
      } else {
        // サイトマップがない場合の評価
        indexHtml += '<br><div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;"></div>';
        indexHtml += '<strong style="color: #1976d2;">📊 インデックス数の評価</strong><br>';
        
        let sizeCategory = '';
        let sizeColor = '';
        let advice = '';
        
        if (indexCount < 10) {
          sizeCategory = '👼 超小規模サイト';
          sizeColor = '#ff9800';
          advice = 'ページ数が非常に少ないです。コンテンツを充実させるとSEO効果が高まります。';
        } else if (indexCount < 50) {
          sizeCategory = '🏠 小規模サイト';
          sizeColor = '#4CAF50';
          advice = '個人サイトや小規模企業サイトとしては適切な規模です。';
        } else if (indexCount < 200) {
          sizeCategory = '🏪 中規模サイト';
          sizeColor = '#4CAF50';
          advice = '企業サイトとしては標準的な規模です。良いバランスですね！';
        } else if (indexCount < 1000) {
          sizeCategory = '🏬 大規模サイト';
          sizeColor = '#2196F3';
          advice = 'コンテンツが豊富なサイトです。サイトマップを設置するとさらに効果的です。';
        } else {
          sizeCategory = '🏛️ 超大規模サイト';
          sizeColor = '#7b1fa2';
          advice = 'ECサイトや大型メディアサイトクラスですね！サイトマップの設置を強く推奨します。';
        }
        
        indexHtml += `<span style="color: ${sizeColor}; font-weight: bold; font-size: 1.1em;">${sizeCategory} (${formattedCount}ページ)</span><br>`;
        indexHtml += `<span style="font-size: 0.9em; color: #333; margin-top: 5px; display: inline-block;">${advice}</span><br>`;
        
        // 一般的な目安を追加
        indexHtml += '<br><div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 0.85em;">';
        indexHtml += '<strong style="color: #666;">📊 一般的な目安：</strong><br>';
        indexHtml += '<span style="color: #666;">';
        indexHtml += '・ 個人ブログ：10-100ページ<br>';
        indexHtml += '・ 企業サイト：50-200ページ<br>';
        indexHtml += '・ ECサイト：数百～数千ページ';
        indexHtml += '</span>';
        indexHtml += '</div>';
        
        indexHtml += '<br><div style="background: #fff3e0; padding: 10px; border-left: 3px solid #ff9800; border-radius: 4px;">';
        indexHtml += '<span style="color: #e65100; font-size: 0.9em;">🗺️ <strong>サイトマップが見つかりませんでした</strong><br>';
        indexHtml += 'サイトマップを設置すると、Googleにページを正しくインデックスさせられます。</span>';
        indexHtml += '</div>';
      }
      
      indexHtml += '</div></div>';
      
      // API使用状況を表示
      const quotaResult = await chrome.runtime.sendMessage({ type: 'getGoogleApiQuota' });
      if (quotaResult && quotaResult.success) {
        indexHtml += '<div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 8px; margin-bottom: 15px;">';
        indexHtml += `<span style="font-size: 0.85em; color: #666;">📊 今日のAPI使用状況: ${quotaResult.used}/${quotaResult.used + quotaResult.remaining}回</span>`;
        
        if (quotaResult.remaining < 10) {
          indexHtml += ` <span style="color: #f44336; font-weight: bold;">（残り${quotaResult.remaining}回）</span>`;
        }
        indexHtml += '</div>';
      }
      
      indexHtml += '<div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; border-radius: 4px; margin-bottom: 15px;"><div style="display: flex; gap: 10px; align-items: start;"><img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%;"><div style="flex: 1;">';
      indexHtml += '<strong style="color: #ff6f00;">💡 りんくからのアドバイス</strong><br><span style="font-size: 0.9em; color: #333;">「Google Search Consoleでさらに詳しい情報を確認できるよ！インデックスに問題があれば、りんくが頼りにしているSEO専門家に相談しよう！」</span></div></div></div>';
      
      indexHtml += '<a href="https://lin.ee/X2aWSFO" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
      indexHtml += '<img src="images/rev.png" style="height: 40px;"><div style="text-align: left;"><div style="color: #2e7d32; font-weight: bold; font-size: 1.15em;">リバースハックに相談（SEO対策）</div>';
      indexHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頼りにしているSEO専門家</div></div><div style="color: #2e7d32; font-size: 1.5em;">→</div></a></div>';
      
      addSpecialSection("📊 Googleインデックス状況", indexHtml);
    } else if (indexResult && !indexResult.success) {
      // エラー表示
      if (indexResult.quotaExceeded) {
        console.log('⚠️ API使用上限に達しました');
      } else {
        console.log('⚠️ Googleインデックス取得エラー:', indexResult.error);
      }
    }
  } catch (e) {
    console.log('Googleインデックスチェックエラー:', e);
  }
  */

  // ========================================
  // 🚨 メールセキュリティチェック（最優先表示）
  // ========================================
  console.log('=== メールセキュリティチェック開始 ===');
  let hasSPF = false;
  let hasDKIM = false;
  let hasDMARC = false;
  let spfRecord = '';
  let dmarcRecord = '';

  // SPFチェック（Gmail認証基準で厳密に）
  let spfIssues = [];
  try {
    const txt = await U.dohQuery(redirectTarget, "TXT");
    const txtRecords = (txt.Answer || []).map(r => r.data.replaceAll('"',''));
    console.log('TXTレコード:', txtRecords);

    // SPFレコードをすべて抽出
    const spfRecords = txtRecords.filter(r => r.toLowerCase().startsWith('v=spf1'));

    if (spfRecords.length === 0) {
      console.log('SPFが見つかりませんでした');
    } else if (spfRecords.length > 1) {
      // ⚠️ 複数のSPFレコード（RFC 7208違反、すべて無効）
      hasSPF = false;
      spfIssues.push(`⚠️ SPFレコードが${spfRecords.length}個存在します。RFC 7208違反ですべて無効になります。`);
      console.error('⚠️ 複数SPF検出:', spfRecords);
    } else {
      // 1つだけの場合、構文チェック
      spfRecord = spfRecords[0];
      hasSPF = true;
      console.log('SPF検出:', spfRecord);

      // 基本的な構文チェック
      if (!spfRecord.toLowerCase().startsWith('v=spf1 ')) {
        spfIssues.push('⚠️ SPFが"v=spf1 "で始まっていません。');
      }

      // 終端メカニズムのチェック (-all, ~all, ?all, +all)
      const hasValidEnd = /[\s][-~?+]all$/i.test(spfRecord);
      if (!hasValidEnd) {
        spfIssues.push('⚠️ SPFが-all/~all/+all/?のいずれかで終わっていません。メール認証が機能しない可能性があります。');
      }

      // include/ip4/ip6などのメカニズムがあるか
      const hasMechanisms = /include:|ip4:|ip6:|a:|mx:|ptr:|exists:/i.test(spfRecord);
      if (!hasMechanisms) {
        spfIssues.push('⚠️ SPFに送信許可の設定がありません。include:やip4:などを追加してください。');
      }
    }
  } catch (e) {
    if (DEBUG_MODE) console.error('SPFチェックエラー:', e);
  }

  // DMARCチェック（Gmail認証基準で厳密に）
  let dmarcIssues = [];
  try {
    const dmarcDomain = `_dmarc.${redirectTarget}`;
    console.log('DMARCドメイン:', dmarcDomain);
    const dmarcResult = await U.dohQuery(dmarcDomain, "TXT");
    const dmarcRecords = (dmarcResult.Answer || []).map(r => r.data.replaceAll('"',''));
    console.log('DMARCレコード:', dmarcRecords);

    for (const record of dmarcRecords) {
      if (record.toLowerCase().startsWith('v=dmarc1')) {
        hasDMARC = true;
        dmarcRecord = record;
        console.log('DMARC検出:', dmarcRecord);

        // p= (ポリシー)のチェック
        const policyMatch = record.match(/p=(none|quarantine|reject)/i);
        if (!policyMatch) {
          dmarcIssues.push('⚠️ DMARCのp=(ポリシー)が不正です。p=none, p=quarantine, p=rejectのいずれかを設定してください。');
          hasDMARC = false;
        }

        // rua= (レポート送信先)の確認
        if (!record.includes('rua=')) {
          dmarcIssues.push('ℹ️ DMARCにrua=(レポート送信先)が設定されていません。認証失敗の通知を受け取るために追加を推奨します。');
        }

        break;
      }
    }
    if (!hasDMARC) console.log('DMARCが見つかりませんでした');
  } catch (e) {
    if (DEBUG_MODE) console.error('DMARCチェックエラー:', e);
  }

  // DKIMチェック
  console.log('DKIMチェック開始...');
  const commonDkimSelectors = ['default', 'google', 'k1', 'selector1', 'selector2', 'dkim', 'mail'];
  for (const selector of commonDkimSelectors) {
    try {
      const dkimDomain = `${selector}._domainkey.${redirectTarget}`;
      const dkimResult = await U.dohQuery(dkimDomain, "TXT");
      if (dkimResult.Answer && dkimResult.Answer.length > 0) {
        hasDKIM = true;
        console.log(`DKIM検出 (セレクタ: ${selector}):`, dkimResult.Answer);
        break;
      }
    } catch {}
  }
  if (!hasDKIM) console.log('DKIMが見つかりませんでした');

  // メールセキュリティ問題判定（構文エラーも含む）
  const hasMailSecurityIssue = !hasSPF || !hasDKIM || !hasDMARC || spfIssues.length > 0 || dmarcIssues.length > 0;
  console.log('メールセキュリティ問題:', hasMailSecurityIssue ? '✅ あり（警告表示）' : '❌ なし');
  console.log('hasSPF:', hasSPF, '| hasDKIM:', hasDKIM, '| hasDMARC:', hasDMARC);
  console.log('SPF問題:', spfIssues);
  console.log('DMARC問題:', dmarcIssues);

  // 🎯 サイト健康診断 - 特別セクション
  let healthSectionHtml = '';

  // メールセキュリティ警告を含める（見出しなし）
  if (hasMailSecurityIssue) {
    healthSectionHtml += UI.createEmailSecurityTopAlert({
      hasSPF: hasSPF,
      hasDKIM: hasDKIM,
      hasDMARC: hasDMARC,
      spfIssues: spfIssues,
      dmarcIssues: dmarcIssues
    });
  }

  healthSectionHtml += `
    <div id="health-loading" style="position: relative; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%); border-radius: 8px; border: 2px solid #667eea; overflow: hidden; min-height: 100px;">
      <img src="images/link.png" class="loading-link-bounce" style="width: 60px; height: auto; position: absolute; left: -80px; top: 50%; margin-top: -30px; box-shadow: 0 4px 12px rgba(102,126,234,0.4); z-index: 2;">
      <div style="text-align: center;">
        <div style="color: #667eea; font-weight: bold; font-size: 1.2em; margin-bottom: 8px;">� りんく：「ちょっと待っててね！」</div>
        <div class="loading-dots" style="color: #667eea; font-size: 0.95em;">リバースハックの技術で診断中<span class="dots"></span></div>
      </div>
    </div>
  `;

  addSpecialSection("🐫 サイト健康診断", healthSectionHtml);

  // CSS アニメーションを追加
  if (!document.getElementById('link-animation-style')) {
    const style = document.createElement('style');
    style.id = 'link-animation-style';
    style.textContent = `
      @keyframes linkBounce {
        0% {
          left: -80px;
          top: 50%;
        }
        25% {
          left: calc(25% - 30px);
          top: calc(50% - 10px);
        }
        50% {
          left: calc(50% - 30px);
          top: 50%;
        }
        75% {
          left: calc(75% - 30px);
          top: calc(50% - 10px);
        }
        100% {
          left: calc(100% + 80px);
          top: 50%;
        }
      }
      @keyframes dotBounce {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
      .loading-link-bounce {
        animation: linkBounce 4s ease-in-out infinite;
      }
      .loading-dots .dots::after {
        content: '...';
        animation: dotBounce 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
  }

  // 🔹 DOMの描画を待ってからローディングアニメーションを表示
  await new Promise(resolve => setTimeout(resolve, 300));

  // 🔹 ローディング開始時刻を記録（最低500ms表示するため）
  const loadingStartTime = Date.now();

  // 🔹 メールセキュリティチェック用の変数（後でMXレコード取得後に実行）
  let mailSecurityResult = null;

  // サイト健康診断を実行
  try {
    const healthResult = await chrome.runtime.sendMessage({
      type: 'analyzeSiteHealth',
      domain: domain
    });

    console.log('サイト健康診断結果:', healthResult);

    if (healthResult && healthResult.success) {
      let healthHtml = '';

      // ========================================
      // 🚨 SSLエラーの場合のみ警告表示（ビジネス導線）
      // ========================================
      if (healthResult.hasHttpsError) {
        let sslErrorHtml = '<div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">';
        sslErrorHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
        sslErrorHtml += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">';
        sslErrorHtml += '<div style="flex: 1;">';
        sslErrorHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「SSLが設定されていないよ！」</strong><br>';
        sslErrorHtml += '<span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">個人情報が漏洩するリスクがあるわ</span>';
        sslErrorHtml += '</div>';
        sslErrorHtml += '</div>';

        sslErrorHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
        sslErrorHtml += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
        sslErrorHtml += '<strong style="color: #d32f2f; font-size: 1.05em;">⚠️ SSL/HTTPSが設定されていません</strong><br><br>';
        sslErrorHtml += '<div style="padding-left: 10px;">';
        sslErrorHtml += '• 個人情報が暗号化されず、第三者に盗まれるリスク<br>';
        sslErrorHtml += '• Googleの検索順位が大幅に下がる<br>';
        sslErrorHtml += '• ブラウザが「保護されていない通信」と警告を表示<br>';
        sslErrorHtml += '• 顧客の信頼を失い、売上が減少';
        sslErrorHtml += '</div>';
        sslErrorHtml += '</div>';
        sslErrorHtml += '</div>';

        // 💼 ビジネス導線
        sslErrorHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
        sslErrorHtml += '<div style="display: flex; gap: 10px; align-items: start;">';
        sslErrorHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
        sslErrorHtml += '<div style="flex: 1;">';
        sslErrorHtml += '<strong style="color: #1565c0;">💎 りんくからの提案</strong><br>';
        sslErrorHtml += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
        sslErrorHtml += '「リバースリバースハック」ならSSL証明書の導入・設定を<strong>無料</strong>でサポート！<br>';
        sslErrorHtml += '⚡ Let\'s Encryptを使った無料SSLの設定<br>';
        sslErrorHtml += '🔒 HTTPS化の完全サポート<br>';
        sslErrorHtml += '📊 SEO対策とセキュリティ対策を同時に実現';
        sslErrorHtml += '</span>';
        sslErrorHtml += '</div>';
        sslErrorHtml += '</div>';
        sslErrorHtml += '<div style="margin-top: 10px; text-align: center;">';
        sslErrorHtml += '<a href="https://t.co/3DiN1zx5ju" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">';
        sslErrorHtml += '💬 LINEで無料相談する';
        sslErrorHtml += '</a>';
        sslErrorHtml += '</div>';
        sslErrorHtml += '</div>';

        healthHtml += sslErrorHtml;
      }

      // ========================================
      // 🚨 WordPress/PHPバージョンチェック & プラグイン脆弱性
      // ========================================
      if (healthResult.isWordPress) {
        const wpVersionStr = String(healthResult.wpVersion || '');
        const phpVersionStr = String(healthResult.phpVersion || '');

        let isWpOld = false;
        let isPhpOld = false;

        if (wpVersionStr.match(/^[0-9.]+$/)) {
          const wpVersionNum = parseFloat(wpVersionStr);
          isWpOld = wpVersionNum < VERSION_CONSTANTS.WP_MINIMUM;
        }

        if (phpVersionStr.match(/^[0-9.]+$/)) {
          const phpVersionNum = parseFloat(phpVersionStr);
          isPhpOld = phpVersionNum < VERSION_CONSTANTS.PHP_MINIMUM;
        }

        if (isWpOld || isPhpOld) {
          // 🚨 WordPress/PHPのバージョンが古い場合の警告（ビジネス導線付き）
          let wpPhpAlertHtml = '<div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">';
          wpPhpAlertHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
          wpPhpAlertHtml += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">';
          wpPhpAlertHtml += '<div style="flex: 1;">';
          wpPhpAlertHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「バージョンが古すぎるよ！」</strong><br>';
          wpPhpAlertHtml += '<span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">セキュリティリスクがとても高いよ</span>';
          wpPhpAlertHtml += '</div>';
          wpPhpAlertHtml += '</div>';

          wpPhpAlertHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
          wpPhpAlertHtml += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';

          if (isWpOld) {
            wpPhpAlertHtml += `<strong style="color: #d32f2f; font-size: 1.05em;">⚠️ WordPressが古いです (${wpVersionStr})</strong><br><br>`;
            wpPhpAlertHtml += '<div style="padding-left: 10px;">';
            wpPhpAlertHtml += `• 最新メジャーバージョン（${VERSION_CONSTANTS.WP_MINIMUM}系統以上）への更新を推奨<br>`;
            wpPhpAlertHtml += '• セキュリティリスクがあります<br>';
            wpPhpAlertHtml += '• WordPress管理画面から確認できます';
            wpPhpAlertHtml += '</div>';
            if (isPhpOld) wpPhpAlertHtml += '<br>';
          }

          if (isPhpOld) {
            wpPhpAlertHtml += `<strong style="color: #d32f2f; font-size: 1.05em;">⚠️ PHPが古いです (${phpVersionStr})</strong><br><br>`;
            wpPhpAlertHtml += '<div style="padding-left: 10px;">';
            wpPhpAlertHtml += '• PHP 8.0以上へのアップデートを推奨<br>';
            wpPhpAlertHtml += '• 定期的なアップデートが必要です<br>';
            wpPhpAlertHtml += '• パフォーマンスとセキュリティが向上します';
            wpPhpAlertHtml += '</div>';
          }

          wpPhpAlertHtml += '</div>';
          wpPhpAlertHtml += '</div>';

          // 💎 りんくのメッセージ
          wpPhpAlertHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
          wpPhpAlertHtml += '<div style="display: flex; gap: 10px; align-items: start;">';
          wpPhpAlertHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
          wpPhpAlertHtml += '<div style="flex: 1;">';
          wpPhpAlertHtml += '<strong style="color: #1565c0;">💎 りんくからの提案</strong><br>';
          wpPhpAlertHtml += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
          wpPhpAlertHtml += '「りんくが頼りにしているリバースハックに相談してみて！WordPress/PHPのアップデートを安全にやってくれるよ！」';
          wpPhpAlertHtml += '</span>';
          wpPhpAlertHtml += '</div>';
          wpPhpAlertHtml += '</div>';
          wpPhpAlertHtml += '</div>';

          // 🎯 ビジネス導線：LINE相談ボタン
          wpPhpAlertHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
          wpPhpAlertHtml += '<img src="images/rev.png" style="height: 40px; width: auto;">';
          wpPhpAlertHtml += '<div style="text-align: left;">';
          wpPhpAlertHtml += '<div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>';
          wpPhpAlertHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>';
          wpPhpAlertHtml += '</div>';
          wpPhpAlertHtml += '<div style="color: #d32f2f; font-size: 1.5em;">→</div>';
          wpPhpAlertHtml += '</a>';

          wpPhpAlertHtml += '</div>';

          healthHtml += wpPhpAlertHtml;
        }

        // 🆕 Contact Form 7バージョンチェック
        if (healthResult.hasContactForm7 && healthResult.cf7Vulnerable) {
          let cf7AlertHtml = '<div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">';
          cf7AlertHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
          cf7AlertHtml += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">';
          cf7AlertHtml += '<div style="flex: 1;">';
          cf7AlertHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「プラグインが古いよ！」</strong><br>';
          cf7AlertHtml += '<span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">セキュリティリスクがあるよ</span>';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '</div>';

          cf7AlertHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
          cf7AlertHtml += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
          cf7AlertHtml += `<strong style="color: #d32f2f; font-size: 1.05em;">⚠️ Contact Form 7が古いです (${healthResult.cf7Version})</strong><br><br>`;
          cf7AlertHtml += '<div style="padding-left: 10px;">';
          cf7AlertHtml += '• 最新メジャーバージョン（６．１系統）への更新を推奨<br>';
          cf7AlertHtml += '• セキュリティとバグ修正が含まれています<br>';
          cf7AlertHtml += '• WordPress管理画面から更新できます';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '</div>';

          // 💎 りんくのメッセージ
          cf7AlertHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
          cf7AlertHtml += '<div style="display: flex; gap: 10px; align-items: start;">';
          cf7AlertHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
          cf7AlertHtml += '<div style="flex: 1;">';
          cf7AlertHtml += '<strong style="color: #1565c0;">💎 りんくからの提案</strong><br>';
          cf7AlertHtml += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
          cf7AlertHtml += '「りんくが頼りにしているリバースハックに相談してみて！プラグインの安全な更新をサポートしてくれるよ！」';
          cf7AlertHtml += '</span>';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '</div>';

          // 🎯 ビジネス導線：LINE相談ボタン
          cf7AlertHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
          cf7AlertHtml += '<img src="images/rev.png" style="height: 40px; width: auto;">';
          cf7AlertHtml += '<div style="text-align: left;">';
          cf7AlertHtml += '<div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>';
          cf7AlertHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>';
          cf7AlertHtml += '</div>';
          cf7AlertHtml += '<div style="color: #d32f2f; font-size: 1.5em;">→</div>';
          cf7AlertHtml += '</a>';

          cf7AlertHtml += '</div>';

          healthHtml += cf7AlertHtml;
        }

        // 🆕 WordPressプラグイン脆弱性チェック
        if (healthResult.wpPlugins && healthResult.wpPlugins.length > 0) {
          try {
            const vulnResult = await chrome.runtime.sendMessage({
              type: 'checkWPPluginVulnerabilities',
              plugins: healthResult.wpPlugins
            });

            if (vulnResult && vulnResult.success && vulnResult.vulnerabilities && vulnResult.vulnerabilities.length > 0) {
              let vulnHtml = '<div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">';
              vulnHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
              vulnHtml += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">';
              vulnHtml += '<div style="flex: 1;">';
              vulnHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「脆弱性が見つかったよ！」</strong><br>';
              vulnHtml += '<span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">ハッキングのリスクがとても高いよ</span>';
              vulnHtml += '</div>';
              vulnHtml += '</div>';

              vulnHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
              vulnHtml += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';

              vulnResult.vulnerabilities.forEach((vuln, index) => {
                if (index > 0) vulnHtml += '<br>';
                vulnHtml += `<strong style="color: #d32f2f; font-size: 1.05em;">⚠️ ${vuln.plugin}</strong><br><br>`;
                vulnHtml += '<div style="padding-left: 10px;">';
                vulnHtml += `• ${vuln.description || '脆弱性の詳細は確認してください'}`;
                if (vuln.severity) {
                  const severityColor = vuln.severity === 'high' ? '#d32f2f' : vuln.severity === 'medium' ? '#ff9800' : '#ff6f00';
                  vulnHtml += `<br>• <span style="color: ${severityColor}; font-weight: 600;">深刻度: ${vuln.severity.toUpperCase()}</span>`;
                }
                vulnHtml += '</div>';
              });

              vulnHtml += '</div>';
              vulnHtml += '</div>';

              // 💎 りんくのメッセージ
              vulnHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
              vulnHtml += '<div style="display: flex; gap: 10px; align-items: start;">';
              vulnHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
              vulnHtml += '<div style="flex: 1;">';
              vulnHtml += '<strong style="color: #1565c0;">💎 りんくからの提案</strong><br>';
              vulnHtml += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
              vulnHtml += '「りんくが頼りにしているリバースハックに相談してみて！脆弱性のあるプラグインを安全に修正・更新してくれるよ！」';
              vulnHtml += '</span>';
              vulnHtml += '</div>';
              vulnHtml += '</div>';
              vulnHtml += '</div>';

              vulnHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
              vulnHtml += '<img src="images/rev.png" style="height: 40px; width: auto;">';
              vulnHtml += '<div style="text-align: left;">';
              vulnHtml += '<div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（ITインフラ）</div>';
              vulnHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頼りにしている専門家 | レスポンス◎</div>';
              vulnHtml += '</div>';
              vulnHtml += '<div style="color: #d32f2f; font-size: 1.5em;">→</div>';
              vulnHtml += '</a>';

              vulnHtml += '</div>';
              healthHtml += vulnHtml;
            }
          } catch (e) {
            console.log('プラグイン脆弱性チェックスキップ:', e.message);
          }
        }
      }

      // ========================================
      // 🔴 深刻な問題（issues）→ りんくの赤い警告
      // ========================================
      const hasIssues = healthResult.issues && healthResult.issues.length > 0;
      
      if (hasIssues) {
        healthHtml += '<div style="background: linear-gradient(135deg, #f44336 0%, #e53935 100%); border: 3px solid #c62828; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">';
        healthHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">';
        healthHtml += '<img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">';
        healthHtml += '<div style="flex: 1;">';
        healthHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「深刻な問題が見つかったよ！」</strong><br>';
        healthHtml += '<span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">すぐに対応が必要です</span>';
        healthHtml += '</div>';
        healthHtml += '</div>';
        
        healthHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
        healthHtml += '<div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
        healthResult.issues.forEach(issue => {
          healthHtml += `⚠️ ${issue}<br>`;
        });
        healthHtml += '</div>';
        healthHtml += '</div>';
        
        healthHtml += '<div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">';
        healthHtml += '<div style="display: flex; gap: 10px; align-items: start;">';
        healthHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">';
        healthHtml += '<div style="flex: 1;">';
        healthHtml += '<strong style="color: #1565c0;">💎 りんくからの提案</strong><br>';
        healthHtml += '<span style="font-size: 0.9em; color: #333; line-height: 1.6;">';
        healthHtml += 'サーバー会社やエンジニアに相談して、早急に改善してもらいましょう！リバースハックでも対応できます。';
        healthHtml += '</span>';
        healthHtml += '</div>';
        healthHtml += '</div>';
        healthHtml += '</div>';
        
        healthHtml += '</div>';
      }

      // ========================================
      // ⚠️ 注意点（warnings）→ こん太のオレンジ警告
      // ========================================
      const hasWarnings = healthResult.warnings && healthResult.warnings.length > 0;
      
      if (hasWarnings) {
        healthHtml += '<div style="background: #fff3e0; border: 2px solid #ff9800; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
        healthHtml += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">';
        healthHtml += '<img src="images/konta.png" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ff9800;">';
        healthHtml += '<strong style="color: #e65100;">🦝 こん太:「改善したほうが良い点があるぜ！」</strong>';
        healthHtml += '</div>';
        
        healthHtml += '<div style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 0.85em;">';
        healthHtml += '<strong style="color: #1565c0;">💡 どうすればいい？</strong><br>';
        healthHtml += 'サーバー会社やエンジニアに相談して改善してもらうことをおすすめします。';
        healthHtml += '</div>';

        healthHtml += '<div style="color: #333; font-size: 0.9em; line-height: 1.8;">';
        healthResult.warnings.forEach(warning => {
          healthHtml += `⚠️ ${warning}<br>`;
        });
        healthHtml += '</div>';
        healthHtml += '</div>';
      }

      // === ✅ 良好な点 ===
      if (healthResult.goodPoints && healthResult.goodPoints.length > 0) {
        healthHtml += '<div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 12px; border-radius: 6px; margin-bottom: 15px;">';
        healthHtml += '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">';
        healthHtml += '<img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #4caf50;">';
        healthHtml += '<strong style="color: #2e7d32;">りんく:「このサイトはこんなところが良いよ!」</strong>';
        healthHtml += '</div>';
        healthHtml += '<div style="color: #333; font-size: 0.9em; line-height: 1.8;">';
        healthResult.goodPoints.forEach(point => {
          healthHtml += `✅ ${point}<br>`;
        });
        healthHtml += '</div>';
        healthHtml += '</div>';
      }

      // === 💻 WordPress情報 ===
      if (healthResult.isWordPress) {
        const wpVersionStr = String(healthResult.wpVersion || '');
        const isWpLatest = wpVersionStr.match(/^[0-9.]+$/) && parseFloat(wpVersionStr) >= 6.4;

        if (isWpLatest) {
          healthHtml += '<div style="background: #e1f5fe; border: 2px solid #0288d1; padding: 12px; border-radius: 6px;">';
          healthHtml += '<div style="display: flex; align-items: start; gap: 8px;">';
          healthHtml += '<img src="images/rev.png" style="width: 35px; height: 35px; border-radius: 50%; border: 2px solid #0288d1;">';
          healthHtml += '<div style="flex: 1;">';
          healthHtml += '<strong style="color: #01579b;">💻 WordPressサイトだね!</strong><br>';
          healthHtml += '<span style="color: #333; font-size: 0.9em;">';
          if (healthResult.wpVersion) {
            healthHtml += `バージョン: <strong>${healthResult.wpVersion}</strong><br>`;
          }
          healthHtml += '<br><div style="display: flex; gap: 8px; align-items: start; margin-top: 8px;">';
          healthHtml += '<img src="images/konta.png" style="width: 25px; height: 25px; border-radius: 50%;">';
          healthHtml += '<div>';
          healthHtml += 'こん太:「定期的なアップデートを忘れないでね!」<br>';
          healthHtml += '</div>';
          healthHtml += '</div>';
          healthHtml += '<div style="display: flex; gap: 8px; align-items: start; margin-top: 8px;">';
          healthHtml += '<img src="images/tanu-nee.png" style="width: 25px; height: 25px; border-radius: 50%;">';
          healthHtml += '<div>';
          healthHtml += 'たぬ姉:「プラグインの管理とバックアップが重要よ」';
          healthHtml += '</div>';
          healthHtml += '</div>';
          healthHtml += '</span>';
          healthHtml += '</div>';
          healthHtml += '</div>';
          healthHtml += '</div>';
        }
      }

      // 🎯 パフォーマンス情報セクション
      if (healthResult.responseTime && healthResult.htmlSizeKB) {
        healthHtml += '<div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border: 2px solid #1976d2; padding: 15px; border-radius: 8px; margin-top: 15px;">';
        healthHtml += '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">';
        healthHtml += '<img src="images/konta.png" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #1976d2;">';
        healthHtml += '<strong style="color: #0d47a1; font-size: 1.1em;">こん太:「サイトのパフォーマンスをチェックしたぜ!」</strong>';
        healthHtml += '</div>';

        // パフォーマンススコア
        const scoreColor = healthResult.performanceScore >= 80 ? '#4caf50' :
                           healthResult.performanceScore >= 60 ? '#ff9800' : '#f44336';
        const scoreEmoji = healthResult.performanceScore >= 80 ? '🟢' :
                           healthResult.performanceScore >= 60 ? '🟡' : '🔴';

        healthHtml += '<div style="text-align: center; margin-bottom: 15px;">';
        healthHtml += `<div style="display: inline-block; padding: 12px 24px; background: ${scoreColor}; border-radius: 50px; box-shadow: 0 3px 6px rgba(0,0,0,0.15);">`;
        healthHtml += `<span style="color: #fff; font-size: 1.8em; font-weight: bold;">${scoreEmoji} ${healthResult.performanceScore}点</span>`;
        healthHtml += '</div>';
        healthHtml += '</div>';

        // 詳細情報
        healthHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 6px;">';
        healthHtml += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.9em;">';

        // レスポンスタイム
        const responseTimeColor = healthResult.responseTime < 800 ? '#4caf50' :
                                  healthResult.responseTime < 1500 ? '#ff9800' : '#f44336';
        healthHtml += '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid ' + responseTimeColor + ';">';
        healthHtml += '<div style="color: #666; font-size: 0.85em; margin-bottom: 4px;">⚡ 応答速度</div>';
        healthHtml += `<div style="color: ${responseTimeColor}; font-weight: bold; font-size: 1.1em;">${healthResult.responseTime}ms</div>`;
        if (healthResult.responseTime < 800) {
          healthHtml += '<div style="color: #4caf50; font-size: 0.75em; margin-top: 2px;">✅ 高速</div>';
        } else if (healthResult.responseTime < 1500) {
          healthHtml += '<div style="color: #ff9800; font-size: 0.75em; margin-top: 2px;">⚠️ 普通</div>';
        } else {
          healthHtml += '<div style="color: #f44336; font-size: 0.75em; margin-top: 2px;">❌ 遅い</div>';
        }
        healthHtml += '</div>';

        // HTMLサイズ
        const sizeColor = parseFloat(healthResult.htmlSizeKB) < 200 ? '#4caf50' :
                          parseFloat(healthResult.htmlSizeKB) < 500 ? '#ff9800' : '#f44336';
        healthHtml += '<div style="padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid ' + sizeColor + ';">';
        healthHtml += '<div style="color: #666; font-size: 0.85em; margin-bottom: 4px;">📦 ページサイズ</div>';
        healthHtml += `<div style="color: ${sizeColor}; font-weight: bold; font-size: 1.1em;">${healthResult.htmlSizeKB}KB</div>`;
        if (parseFloat(healthResult.htmlSizeKB) < 200) {
          healthHtml += '<div style="color: #4caf50; font-size: 0.75em; margin-top: 2px;">✅ 最適</div>';
        } else if (parseFloat(healthResult.htmlSizeKB) < 500) {
          healthHtml += '<div style="color: #ff9800; font-size: 0.75em; margin-top: 2px;">⚠️ 標準</div>';
        } else {
          healthHtml += '<div style="color: #f44336; font-size: 0.75em; margin-top: 2px;">❌ 重い</div>';
        }
        healthHtml += '</div>';

        healthHtml += '</div>'; // grid end

        // WordPress詳細情報
        if (healthResult.isWordPress) {
          healthHtml += '<div style="margin-top: 15px; padding: 12px; background: #fff3e0; border-left: 3px solid #ff9800; border-radius: 4px;">';
          healthHtml += '<div style="color: #e65100; font-weight: bold; margin-bottom: 8px;">💻 WordPress 詳細情報</div>';
          healthHtml += '<div style="display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; font-size: 0.85em;">';

          if (healthResult.wpVersion) {
            const wpVersionStr = String(healthResult.wpVersion);
            let wpColor = '#333';
            if (wpVersionStr.match(/^[0-9.]+$/)) {
              const wpVersionNum = parseFloat(wpVersionStr);
              wpColor = wpVersionNum >= 6.4 ? '#4caf50' : wpVersionNum >= 6.0 ? '#ff9800' : '#f44336';
            }
            healthHtml += '<div style="color: #666;">WPバージョン:</div>';
            healthHtml += `<div style="color: ${wpColor}; font-weight: 600;">${healthResult.wpVersion}</div>`;
          }

          if (healthResult.phpVersion) {
            const phpVersionStr = String(healthResult.phpVersion);
            let phpColor = '#333';
            if (phpVersionStr.match(/^[0-9.]+$/)) {
              const phpVersionNum = parseFloat(phpVersionStr);
              phpColor = phpVersionNum >= 8.0 ? '#4caf50' : phpVersionNum >= 7.4 ? '#ff9800' : '#f44336';
            }
            healthHtml += '<div style="color: #666;">PHPバージョン:</div>';
            healthHtml += `<div style="color: ${phpColor}; font-weight: 600;">${healthResult.phpVersion}</div>`;
          }

          if (healthResult.wpTheme) {
            healthHtml += '<div style="color: #666;">テーマ:</div>';
            healthHtml += `<div style="color: #333; font-weight: 600;">${healthResult.wpTheme}</div>`;
          }

          if (healthResult.wpPlugins && healthResult.wpPlugins.length > 0) {
            healthHtml += '<div style="color: #666; vertical-align: top;">プラグイン:</div>';
            healthHtml += '<div style="color: #333;">';
            healthHtml += healthResult.wpPlugins.slice(0, 10).join(', ');
            if (healthResult.wpPlugins.length > 10) {
              healthHtml += ` 他${healthResult.wpPlugins.length - 10}個`;
            }
            healthHtml += '</div>';
          }

          healthHtml += '</div>'; // grid end
          healthHtml += '</div>'; // box end
        }

        healthHtml += '</div>'; // white box end

        // アドバイスセクション
        healthHtml += '<div style="margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.8); border-radius: 6px; border-left: 3px solid #1976d2;">';
        healthHtml += '<div style="display: flex; gap: 8px; align-items: start;">';
        healthHtml += '<img src="images/konta.png" style="width: 28px; height: 28px; border-radius: 50%;">';
        healthHtml += '<div style="flex: 1; font-size: 0.85em; color: #333; line-height: 1.6;">';
        healthHtml += '<strong style="color: #1976d2;">こん太のアドバイス:</strong><br>';

        if (healthResult.responseTime > 1500) {
          healthHtml += '⚡ サイトの応答が遅いぜ。サーバーの見直しやキャッシュ設定を確認だ!<br>';
        }
        if (parseFloat(healthResult.htmlSizeKB) > 500) {
          healthHtml += '📦 ページが重いな。画像の最適化やコード圧縮を検討しよう!<br>';
        }
        if (healthResult.phpVersion && parseFloat(healthResult.phpVersion) < 8.0) {
          healthHtml += `🔧 PHP ${healthResult.phpVersion}は古いぞ。PHP 8.1以上にアップグレードで高速化できるぜ!<br>`;
        }
        if (healthResult.responseTime < 800 && parseFloat(healthResult.htmlSizeKB) < 200) {
          healthHtml += '✅ サイトの速度は良好だぜ!このまま維持しよう!';
        }

        healthHtml += '</div>';
        healthHtml += '</div>';

        healthHtml += '</div>'; // main container end
      }

      // 🔹 ローディング画面を最低500ms表示
      const elapsedTime = Date.now() - loadingStartTime;
      const minimumLoadingTime = 500;
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime));
      }

      document.getElementById('health-loading').innerHTML = healthHtml || '<div style="background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); border: 3px solid #2e7d32; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><div style="display: flex; align-items: center; gap: 10px;"><img src="images/link.png" style="width: 50px; height: 50px; border-radius: 50%; border: 3px solid #fff;"><div style="flex: 1;"><strong style="color: #fff; font-size: 1.15em;">りんく:「完璧だね!リバースハックの技術で診断したよ!」</strong></div></div></div>';
    }
  } catch (error) {
    if (DEBUG_MODE) console.error('サイト健康診断エラー:', error);

    // ビジネス導線を含むエラーメッセージに修正
    let catchErrorHtml = '<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%); border: 3px solid #c92a2a; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">';

    // たぬ姉のメッセージ
    catchErrorHtml += '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">';
    catchErrorHtml += '<img src="images/tanu-nee.png" style="width: 50px; height: 50px; border-radius: 50%; border: 3px solid #fff;">';
    catchErrorHtml += '<strong style="color: #fff; font-size: 1.15em;">たぬ姉:「ごめんなさい、予期せぬエラーが発生しちゃった...」</strong>';
    catchErrorHtml += '</div>';

    // エラー詳細
    catchErrorHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 6px; margin-bottom: 15px;">';
    catchErrorHtml += '<strong style="color: #c92a2a;">🚨 エラー内容:</strong><br>';
    catchErrorHtml += '<span style="color: #333; font-size: 0.9em;">' + (error.message || '不明なエラー') + '</span><br><br>';
    catchErrorHtml += '<strong style="color: #1976d2;">💡 対処方法:</strong><br>';
    catchErrorHtml += '<span style="color: #333; font-size: 0.9em;">';
    catchErrorHtml += 'ブラウザのセキュリティ設定が原因の可能性があります。<br>';
    catchErrorHtml += 'DNS情報やサジェスト情報は正常に表示されますので、<br>';
    catchErrorHtml += 'サイト健康診断以外の機能をご利用ください。';
    catchErrorHtml += '</span>';
    catchErrorHtml += '</div>';

    // 🎯 重要:ビジネス導線を追加
    catchErrorHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 6px; margin-bottom: 15px;">';
    catchErrorHtml += '<strong style="color: #667eea;">💡 サイト診断が必要な方へ</strong><br>';
    catchErrorHtml += '<span style="color: #333; font-size: 0.9em; line-height: 1.6;">';
    catchErrorHtml += 'より詳細な診断や、セキュリティ・SEO対策をご希望の場合は、<br>';
    catchErrorHtml += '無料でLINE相談を承っております。<br><br>';
    catchErrorHtml += '✅ Webサイトの総合診断<br>';
    catchErrorHtml += '✅ セキュリティ対策のアドバイス<br>';
    catchErrorHtml += '✅ 風評被害対策のご相談';
    catchErrorHtml += '</span>';
    catchErrorHtml += '</div>';

    // LINE相談ボタン（目立つデザイン）
    catchErrorHtml += '<div style="text-align: center;">';
    catchErrorHtml += '<a href="https://lin.ee/lrjVHvH" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1em; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: all 0.3s;" onmouseover="this.style.transform=\'scale(1.05)\';this.style.boxShadow=\'0 6px 12px rgba(0,0,0,0.4)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.boxShadow=\'0 4px 8px rgba(0,0,0,0.3)\'">';
    catchErrorHtml += '<img src="icons/kimito-link.jpg" style="width: 35px; height: 35px; border-radius: 50%;">';
    catchErrorHtml += '<div style="text-align: left;"><div>📱 リバースハックに相談</div><div style="font-size: 0.7em; opacity: 0.9;">りんくが頼りにしている専門家</div></div>'
    catchErrorHtml += '</a>';
    catchErrorHtml += '<div style="margin-top: 12px; font-size: 0.85em; color: #fff;">';
    catchErrorHtml += '※ 24時間以内にご返信いたします';
    catchErrorHtml += '</div>';
    catchErrorHtml += '</div>';

    // 🔹 ローディング画面を最低500ms表示
    const elapsedTime = Date.now() - loadingStartTime;
    const minimumLoadingTime = 500;
    if (elapsedTime < minimumLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minimumLoadingTime - elapsedTime));
    }

    document.getElementById('health-loading').innerHTML = catchErrorHtml;
  }

  // ========================================
  // 👤 個人名ネガティブチェック（オプション）
  // ユーザーがチェックボックスを有効にした場合のみ実行
  // ========================================
  const checkPersonNamesEnabled = document.getElementById('checkPersonNames')?.checked;

  if (checkPersonNamesEnabled) {
    addSpecialSection("👤 個人名ネガティブチェック", `
    <div id="person-loading" style="position: relative; padding: 20px; background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 8px; border: 2px solid #ff9800; overflow: hidden; min-height: 100px;">
      <img src="images/konta.png" class="loading-link-bounce" style="width: 60px; height: auto; position: absolute; left: -80px; top: 50%; margin-top: -30px; box-shadow: 0 4px 12px rgba(255,152,0,0.4); z-index: 2; border-radius: 50%;">
      <div style="text-align: center;">
        <div style="color: #e65100; font-weight: bold; font-size: 1.2em; margin-bottom: 8px;">🦝 こん太：「個人名をチェック中だぜ！」</div>
        <div class="loading-dots" style="color: #e65100; font-size: 0.95em;">役員・スタッフの風評を調査中<span class="dots"></span></div>
      </div>
    </div>
  `);

  // 個人名チェックを実行
  try {
    const personResult = await chrome.runtime.sendMessage({
      type: 'checkPersonReputations',
      domain: domain,
      url: `https://${domain}`
    });

    const personDiv = document.getElementById('person-loading');
    if (!personDiv) {
      console.error('person-loading div not found');
    } else if (!personResult.success) {
      personDiv.innerHTML = `
        <div style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px;">
          <strong style="color: #c62828;">⚠️ エラーが発生しました</strong><br>
          <span style="font-size: 0.9em;">${personResult.error}</span>
        </div>
      `;
    } else {
      let personHtml = '';

      if (personResult.persons.length === 0) {
        personHtml = `
          <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="images/tanu-nee.png" style="width: 45px; height: 45px; border-radius: 50%;">
              <div>
                <strong style="color: #1565c0;">たぬ姉：「個人名が検出されなかったわ」</strong><br>
                <span style="font-size: 0.9em; color: #333;">サイトから役職付きの個人名を検出できませんでした。</span>
              </div>
            </div>
          </div>
        `;
      } else if (!personResult.hasNegative) {
        // ネガティブなし
        personHtml = `
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 3px solid #4caf50; padding: 20px; border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
              <img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #4caf50;">
              <div style="flex: 1;">
                <strong style="color: #2e7d32; font-size: 1.3em;">りんく：「個人名に問題は見つからなかったよ！」</strong><br>
                <span style="color: #1b5e20; font-size: 0.95em;">${personResult.totalChecked}名の人物をチェックしました</span>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px;">
              <strong style="color: #2e7d32;">✅ チェック完了</strong><br>
              <div style="margin-top: 10px; font-size: 0.9em; color: #333; line-height: 1.6;">
        `;

        // チェックした人物一覧
        personResult.persons.forEach(person => {
          personHtml += `• ${person.title}：<strong>${person.name}</strong> → 問題なし<br>`;
        });

        personHtml += `
              </div>
            </div>
          </div>
        `;
      } else {
        // ⚠️ ネガティブ検出
        personHtml = `
          <div style="background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%); border: 3px solid #b71c1c; padding: 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
              <img src="images/konta.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;">
              <div style="flex: 1;">
                <strong style="color: #fff; font-size: 1.3em;">こん太：「個人名にネガティブ情報が見つかったぜ！」</strong><br>
                <span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">${personResult.negativeCount}名の人物に問題が検出されました</span>
              </div>
            </div>
        `;

        // ネガティブが見つかった人物の詳細
        const negativePersons = personResult.persons.filter(p => p.hasNegative);
        for (const person of negativePersons) {
          personHtml += `
            <div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <div style="color: #333; font-size: 0.95em; line-height: 1.8;">
                <strong style="color: #d32f2f; font-size: 1.1em;">⚠️ ${person.title}：${person.name}</strong><br><br>
                <div style="padding-left: 10px;">
          `;

          person.negativeSuggests.forEach(neg => {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(neg.suggest)}`;
            personHtml += `
              • <strong style="color: #d32f2f;">${neg.keyword}</strong> →
              <a href="${searchUrl}" target="_blank" style="color: #1976d2; text-decoration: none; border-bottom: 1px dotted #1976d2;">
                ${neg.suggest}
              </a><br>
            `;
          });

          personHtml += `
                </div>
              </div>
            </div>
          `;
        }

        // りんくのアドバイス
        personHtml += `
            <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
              <div style="display: flex; gap: 10px; align-items: start;">
                <img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">
                <div style="flex: 1;">
                  <strong style="color: #1565c0;">💎 りんくからの提案</strong><br>
                  <span style="font-size: 0.9em; color: #333; line-height: 1.6;">
                    「個人名のネガティブサジェストは早急な対策が必要よ！リバースハックに相談してみて！」
                  </span>
                </div>
              </div>
            </div>

            <a href="https://lin.ee/X2aWSFO" target="_blank" class="hover-scale" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
              <img src="images/rev.png" style="height: 40px; width: auto;">
              <div style="text-align: left;">
                <div style="color: #d32f2f; font-weight: bold; font-size: 1.15em;">リバースハックに相談（風評対策）</div>
                <div style="font-size: 0.8em; color: #999;">個人名の風評被害対策専門</div>
              </div>
              <div style="color: #d32f2f; font-size: 1.5em;">→</div>
            </a>
          </div>
        `;
      }

      personDiv.innerHTML = personHtml;
    }
  } catch (error) {
    console.error('個人名チェックエラー:', error);
    const personDiv = document.getElementById('person-loading');
    if (personDiv) {
      personDiv.innerHTML = `
        <div style="background: #fff3e0; border: 2px solid #ff9800; padding: 15px; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="images/tanu-nee.png" style="width: 40px; height: 40px; border-radius: 50%;">
            <strong style="color: #e65100;">たぬ姉：「個人名チェックができなかったわ」</strong>
          </div>
          <div style="margin-top: 10px; font-size: 0.9em; color: #333;">
            サイトへのアクセス制限により個人名を取得できませんでした。<br>
            他の機能は正常に動作します。
          </div>
        </div>
      `;
    }
  }
  } // if (checkPersonNamesEnabled)

  // ========================================
  // 🔍 風評被害チェック（サジェスト汚染）
  // ========================================
  const siteTitle = await getActiveTabTitle();

  addSpecialSection("🔍 風評被害チェック", `
    <div id="suggest-loading" style="padding: 20px; background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%); border-radius: 8px; border: 2px solid #fbc02d;">
      <div style="text-align: center;">
        <div style="color: #f57f17; font-weight: bold; font-size: 1.1em; margin-bottom: 8px;">🔍 風評被害のチェック中...</div>
        <div class="loading-dots" style="color: #f57f17; font-size: 0.9em;">サジェストを取得しています<span class="dots"></span></div>
      </div>
    </div>
  `);

  // サジェストチェックを実行（エラーが発生しても続行）
  try {
    await checkSuggestPollution(domain, siteTitle);
  } catch (error) {
    console.error('サジェストチェックエラー:', error);
    // エラー表示
    const loadingDiv = document.getElementById('suggest-loading');
    if (loadingDiv) {
      loadingDiv.innerHTML = `
        <div style="padding: 15px; background: #fff3e0; border: 2px solid #ff9800; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <img src="images/konta.png" style="width: 40px; height: 40px; border-radius: 50%;">
            <strong style="color: #e65100;">こん太：「サジェストが取得できなかったぜ！」</strong>
          </div>
          <div style="font-size: 0.9em; color: #333;">
            ブラウザの制限でサジェスト情報を取得できませんでした。<br>
            DNS情報やその他の機能は正常に動作します。
          </div>
        </div>
      `;
    }
  }

  // ========================================
  // 📡 DNS情報セクション（ITインフラの最後）
  // ========================================
  addSpecialSection("📡 DNS情報", `
    <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
      <strong style="color: #1976d2;">ドメインのDNS設定情報</strong><br>
      <span style="font-size: 0.9em; color: #333;">IPアドレス、メールサーバー、ネームサーバーなどを表示します。</span>
    </div>
  `);

  // 👀 ローディングをクリアして結果表示用のテーブルに切り替え
  els.resultBody.innerHTML = '';

  // IPv4 (A) - wwwあり/なし両方から取得
  let aSet = [];
  let aRecords = { base: [], www: [] };

  // ベースドメインのAレコード
  try {
    aRecords.base = U.uniq(((await U.dohQuery(baseDomain, "A")).Answer || []).map(r => r.data));
  } catch {}

  // wwwドメインのAレコード
  try {
    aRecords.www = U.uniq(((await U.dohQuery(wwwDomain, "A")).Answer || []).map(r => r.data));
  } catch {}

  // 両方のAレコードを表示
  if (aRecords.base.length > 0) {
    addRow(`A (IPv4) - ${baseDomain}`, aRecords.base.join("<br>"));
    aSet = aSet.concat(aRecords.base);
  }
  if (aRecords.www.length > 0) {
    addRow(`A (IPv4) - ${wwwDomain}`, aRecords.www.join("<br>"));
    aSet = aSet.concat(aRecords.www);
  }
  aSet = U.uniq(aSet);

  if (aSet.length > 0) {

    // 🆕 ASN情報による詳細なサーバー会社判定
    for (const ip of aSet) {
      try {
        const ipInfo = await chrome.runtime.sendMessage({
          type: 'getIPInfo',
          ip: ip
        });

        if (ipInfo && ipInfo.success && ipInfo.data) {
          const data = ipInfo.data;
          let serverInfoLines = [];

          // 🌍 IPアドレス
          serverInfoLines.push(`<strong>IPアドレス:</strong> ${data.ip || ip}`);

          // 🔄 リモートホスト（逆引き）
          try {
            const ptrResult = await U.dohQuery(ip.split('.').reverse().join('.') + '.in-addr.arpa', 'PTR');
            if (ptrResult.Answer && ptrResult.Answer.length > 0) {
              const hostname = ptrResult.Answer[0].data;
              serverInfoLines.push(`<strong>リモートホスト（逆引き）:</strong> ${hostname}`);
            }
          } catch (e) {
            if (DEBUG_MODE) console.log('PTRレコード取得エラー:', e);
          }

          // 🏴 国・地域
          if (data.country) {
            const flag = data.countryCode ? getFlagEmoji(data.countryCode) : '';
            serverInfoLines.push(`<strong>国:</strong> ${flag} ${data.country}${data.countryCode ? ' (' + data.countryCode + ')' : ''}`);
          }
          if (data.city) {
            serverInfoLines.push(`<strong>都市:</strong> ${data.city}`);
          }
          if (data.region) {
            serverInfoLines.push(`<strong>地域:</strong> ${data.region}`);
          }

          // 📍 緯度・経度
          if (data.latitude && data.longitude) {
            serverInfoLines.push(`<strong>緯度・経度:</strong> ${data.latitude}, ${data.longitude}`);
            serverInfoLines.push(`<a href="https://www.google.com/maps?q=${data.latitude},${data.longitude}" target="_blank" style="color: #1976d2; text-decoration: none; border-bottom: 1px dotted #1976d2;">📍 Google Mapsで開く</a>`);
            
            // 地図の埋め込み
            serverInfoLines.push(`
              <div style="margin-top: 10px; border-radius: 8px; overflow: hidden;">
                <iframe 
                  width="100%" 
                  height="200" 
                  frameborder="0" 
                  style="border:0" 
                  referrerpolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${data.latitude},${data.longitude}&zoom=10"
                  allowfullscreen>
                </iframe>
              </div>
            `);
          }

          // 🏢 サーバー会社 (ASN)
          if (data.asn) {
            serverInfoLines.push(`<strong>サーバー会社:</strong> ${data.org || data.asn}`);
          }
          if (data.isp) {
            serverInfoLines.push(`<strong>ISP:</strong> ${data.isp}`);
          }

          if (serverInfoLines.length > 0) {
            addRow(`🔍 IP情報 (${ip})`, serverInfoLines.join("<br>"));
          }
        }
      } catch (e) {
        if (DEBUG_MODE) console.error(`IP情報取得エラー (${ip}):`, e);
      }
    }
  }

  // 以下、MX・NS等のその他のDNS情報が続きますが、省略します

  // MX - wwwあり/なし両方から取得
  let allMxRecords = [];

  // ベースドメインのMXレコード
  try {
    const mx = await U.dohQuery(baseDomain, "MX");
    const mxRecords = (mx.Answer || []).map(r => r.data);
    if (mxRecords.length > 0) {
      addRow(`MX (メールサーバー) - ${baseDomain}`, mxRecords.sort().join("<br>"));
      allMxRecords = allMxRecords.concat(mxRecords);
    }
  } catch {}

  // wwwドメインのMXレコード
  try {
    const mx = await U.dohQuery(wwwDomain, "MX");
    const mxRecords = (mx.Answer || []).map(r => r.data);
    if (mxRecords.length > 0) {
      addRow(`MX (メールサーバー) - ${wwwDomain}`, mxRecords.sort().join("<br>"));
      allMxRecords = allMxRecords.concat(mxRecords);
    }
  } catch {}

  // メールサーバー推定（重複削除）
  if (allMxRecords.length > 0) {
    const uniqueMx = U.uniq(allMxRecords);

    const mxEstimates = [];
    for (const mxRecord of uniqueMx) {
      const estimate = identifyServer(mxRecord);
      if (estimate) mxEstimates.push(estimate);
    }
    if (mxEstimates.length > 0) {
      addRow("🔎 推定メールサーバー (MX)", [...new Set(mxEstimates)].join("<br>"));
    }
  }

  // TXT - 重複を防ぐため、両方から取得して同じ場合は1つだけ表示
  let baseTxtRecords = [];
  let wwwTxtRecords = [];

  try {
    const txt = await U.dohQuery(baseDomain, "TXT");
    baseTxtRecords = (txt.Answer || []).map(r => r.data.replaceAll('"','')).sort();
  } catch {}

  try {
    const txt = await U.dohQuery(wwwDomain, "TXT");
    wwwTxtRecords = (txt.Answer || []).map(r => r.data.replaceAll('"','')).sort();
  } catch {}

  // 両方のレコードを比較（重要なレコードが同じかをチェック）
  const filterImportantRecords = (records) => {
    return records.filter(r => {
      // 重要なレコードのみを抽出（ドメイン名だけの行などは除外）
      const lower = r.toLowerCase();
      return lower.includes('v=spf') ||
             lower.includes('verification') ||
             lower.includes('domain') ||
             lower.includes('ms=') ||
             lower.includes('pardot') ||
             lower.includes('hubspot') ||
             lower.includes('sending_domain') ||
             lower.includes('notion');
    });
  };

  const baseImportant = filterImportantRecords(baseTxtRecords);
  const wwwImportant = filterImportantRecords(wwwTxtRecords);

  const baseTxtStr = baseImportant.join('|');
  const wwwTxtStr = wwwImportant.join('|');

  // 重要なレコードが同じかを比較
  const areSimilar = baseTxtStr === wwwTxtStr && baseImportant.length > 0;

  if (baseTxtRecords.length > 0 && wwwTxtRecords.length > 0 && areSimilar) {
    // 重要な内容が同じ場合はベースドメインだけ表示
    addRow(`TXT - ${baseDomain}`, baseTxtRecords.join("<br>"));
  } else {
    // 異なる場合、または重要なレコードがない場合は両方表示
    if (baseTxtRecords.length > 0) {
      addRow(`TXT - ${baseDomain}`, baseTxtRecords.join("<br>"));
    }
    if (wwwTxtRecords.length > 0) {
      addRow(`TXT - ${wwwDomain}`, wwwTxtRecords.join("<br>"));
    }
  }

  // CNAME - wwwあり/なし両方から取得
  // ベースドメインのCNAMEレコード
  try {
    const cname = await U.dohQuery(baseDomain, "CNAME");
    const cnameRecords = (cname.Answer || []).map(r => r.data);
    if (cnameRecords.length > 0) {
      addRow(`CNAME - ${baseDomain}`, cnameRecords.join("<br>"));
    }
  } catch {}

  // wwwドメインのCNAMEレコード
  try {
    const cname = await U.dohQuery(wwwDomain, "CNAME");
    const cnameRecords = (cname.Answer || []).map(r => r.data);
    if (cnameRecords.length > 0) {
      addRow(`CNAME - ${wwwDomain}`, cnameRecords.join("<br>"));
    }
  } catch {}

  // NS - ベースドメインのみ（通常wwwにはNSレコードはない）
  try {
    const ns = await U.dohQuery(baseDomain, "NS");
    const nsRecords = (ns.Answer || []).map(r => r.data).sort();
    if (nsRecords.length > 0) {
      addRow(`NS (ネームサーバー) - ${baseDomain}`, nsRecords.join("<br>"));
    }
  } catch {}

  // SOA - ベースドメインのみ（通常wwwにはSOAレコードはない）
  try {
    const soa = await U.dohQuery(baseDomain, "SOA");
    const soaRecords = (soa.Answer || []).map(r => r.data);
    if (soaRecords.length > 0) {
      addRow(`SOA - ${baseDomain}`, soaRecords.join("<br>"));
    }
  } catch {}

  // 📊 WHOIS / RDAP (ドメイン) - 詳細情報表示
  try {
    console.log('RDAP Domain 取得開始:', domain);

    // 🇯🇵 日本ドメインかどうかをチェック
    const isJpDomain = domain.endsWith('.jp') || domain.includes('.co.jp') || domain.includes('.ne.jp') ||
                       domain.includes('.or.jp') || domain.includes('.ac.jp') || domain.includes('.go.jp');

    let rdapResult;

    if (isJpDomain) {
      // 🆕 日本ドメインは自前APIを使用
      console.log('🇯🇵 日本ドメインを検出しました。自前APIを使用します。');

      // 👉 www.を削除（JPRSはwwwなしのドメインしか登録されていない）
      let cleanDomain = domain.replace(/^www\./i, '');
      if (cleanDomain !== domain) {
        console.log('🛠️ www.を削除しました:', domain, '->', cleanDomain);
      }

      rdapResult = await chrome.runtime.sendMessage({
        type: 'getJpWhois',
        domain: cleanDomain
      });

      if (rdapResult && rdapResult.success) {
        console.log('✅ 日本ドメインWHOIS取得成功:', rdapResult.parsed);
        console.log('🔍 rdapResult全体:', rdapResult);
        console.log('🔍 typeof parsed:', typeof rdapResult.parsed);
        console.log('🔍 parsed keys:', Object.keys(rdapResult.parsed || {}));

        // 🔍 デバッグ: 生のWHOISテキストを確認
        if (rdapResult.whois) {
          console.log('📝 生のWHOISテキスト:');
          console.log(rdapResult.whois);
        } else {
          console.warn('⚠️ rdapResult.whoisが存在しません');
        }

        // parsedデータを表示用に整形
        const whoisLines = [];
        let parsed = rdapResult.parsed || {}; // サーバー側のパース結果をベースにする

        // 👉 クライアント側で追加のフィールドを補完（サーバー側でパースされていない情報を追加）
        if (rdapResult.whois) {
          console.log('🛠️ クライアント側で追加フィールドを補完します');
          const clientParsed = parseJpWhois(rdapResult.whois);
          console.log('🔍 クライアント側パース結果:', clientParsed);

          // サーバー側にないフィールドを補完
          parsed = { ...parsed, ...clientParsed }; // クライアント側の結果で上書き
          console.log('🔍 統合後のパース結果:', parsed);
          console.log('🔍 統合後のキー:', Object.keys(parsed));
        }

        // parsedオブジェクトが有効かチェック
        if (parsed && Object.keys(parsed).length > 0) {
          // 基本情報（わかりやすい説明付き）
          whoisLines.push('<div style="background: #e3f2fd; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 0.9em;">');
          whoisLines.push('<strong style="color: #1565c0;">💡 WHOIS情報とは？</strong><br>');
          whoisLines.push('ドメインの登録者情報や管理状態を確認できる公開情報です。誰がこのドメインを所有・管理しているかがわかります。');
          whoisLines.push('</div>');

          if (parsed['Domain Name']) {
            whoisLines.push(`<strong>🌐 ドメイン名:</strong> ${parsed['Domain Name']}`);
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 8px;">→ このウェブサイトの住所（アドレス）です</span>`);
          }
          
          if (parsed['Organization']) {
            whoisLines.push(`<strong>🏢 組織名:</strong> ${parsed['Organization']}`);
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 8px;">→ このドメインを所有している会社・団体の名前です</span>`);
          }
          
          if (parsed['Organization Type']) {
            whoisLines.push(`<strong>📋 組織種別:</strong> ${parsed['Organization Type']}`);
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 8px;">→ 法人か個人か、どのような組織かを示しています</span>`);
          }

          // 日付情報
          if (parsed['Created Date'] || parsed['Registered Date'] || parsed['Connected Date'] || parsed['Expires on'] || parsed['Last Update']) {
            whoisLines.push('<br><strong style="color: #1976d2;">📅 日付情報:</strong>');
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 5px;">→ ドメインがいつ登録され、いつまで有効かがわかります</span>`);
            if (parsed['Created Date']) whoisLines.push(`　・ 作成日: ${parsed['Created Date']} <span style="color: #666; font-size: 0.85em;">(ドメインが最初に作られた日)</span>`);
            if (parsed['Registered Date']) whoisLines.push(`　・ 登録日: ${parsed['Registered Date']} <span style="color: #666; font-size: 0.85em;">(正式に登録された日)</span>`);
            if (parsed['Connected Date']) whoisLines.push(`　・ 接続日: ${parsed['Connected Date']} <span style="color: #666; font-size: 0.85em;">(ネットワークに接続された日)</span>`);
            if (parsed['Expires on']) whoisLines.push(`　・ 有効期限: ${parsed['Expires on']} <span style="color: #666; font-size: 0.85em;">(この日までに更新しないと使えなくなります)</span>`);
            if (parsed['Last Update']) whoisLines.push(`　・ 最終更新: ${parsed['Last Update']} <span style="color: #666; font-size: 0.85em;">(情報が最後に更新された日)</span>`);
          }

          if (parsed['State']) {
            whoisLines.push(`<br><strong>🛡️ ステータス:</strong> ${parsed['State']}`);
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 8px;">→ ドメインの現在の状態です。「Active」なら正常に使用できます</span>`);
          }

          // 連絡先情報
          if (parsed['Administrative Contact'] || parsed['Technical Contact']) {
            whoisLines.push('<br><strong style="color: #1976d2;">💼 連絡先情報:</strong>');
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 5px;">→ ドメインの管理者や技術担当者の連絡先です</span>`);
            if (parsed['Administrative Contact']) whoisLines.push(`　・ 管理者: ${parsed['Administrative Contact']} <span style="color: #666; font-size: 0.85em;">(ドメインの責任者)</span>`);
            if (parsed['Technical Contact']) whoisLines.push(`　・ 技術担当者: ${parsed['Technical Contact']} <span style="color: #666; font-size: 0.85em;">(技術的な問題の連絡先)</span>`);
          }

          // 登録者詳細情報
          if (parsed['Name'] || parsed['Email'] || parsed['Web Page'] || parsed['Phone'] || parsed['Fax'] || parsed['Postal Code'] || parsed['Address']) {
            whoisLines.push('<br><strong style="color: #1976d2;">👤 登録者詳細情報:</strong>');
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 5px;">→ ドメイン登録者の詳しい情報です</span>`);
            if (parsed['Name']) whoisLines.push(`　・ 氏名: ${parsed['Name']}`);
            if (parsed['Email']) whoisLines.push(`　・ メール: ${parsed['Email']}`);
            if (parsed['Web Page']) whoisLines.push(`　・ ウェブページ: <a href="${parsed['Web Page']}" target="_blank">${parsed['Web Page']}</a>`);
            if (parsed['Phone']) whoisLines.push(`　・ 電話: ${parsed['Phone']}`);
            if (parsed['Fax']) whoisLines.push(`　・ FAX: ${parsed['Fax']}`);
            if (parsed['Postal Code']) whoisLines.push(`　・ 郵便番号: ${parsed['Postal Code']}`);
            if (parsed['Address']) {
              const addr = Array.isArray(parsed['Address']) ? parsed['Address'].join(' ') : parsed['Address'];
              whoisLines.push(`　・ 住所: ${addr}`);
            }
          }

          // ネームサーバー
          if (parsed['Name Server']) {
            const ns = Array.isArray(parsed['Name Server']) ? parsed['Name Server'] : [parsed['Name Server']];
            whoisLines.push(`<br><strong style="color: #1976d2;">📡 ネームサーバー:</strong>`);
            whoisLines.push(`<span style="font-size: 0.85em; color: #666; display: block; margin-left: 20px; margin-bottom: 5px;">→ ドメインをIPアドレスに変換するサーバーです。どこのサービスを使っているかがわかります</span>`);
            ns.forEach(server => {
              whoisLines.push(`　・ ${server}`);
            });
          }

          // その他の情報
          if (parsed['Notify'] || parsed['Changed'] || parsed['Sign']) {
            whoisLines.push('<br><strong style="color: #1976d2;">📝 その他の情報:</strong>');
            if (parsed['Notify']) whoisLines.push(`　・ 通知先: ${parsed['Notify']}`);
            if (parsed['Changed']) whoisLines.push(`　・ 変更日: ${parsed['Changed']}`);
            if (parsed['Sign']) whoisLines.push(`　・ DNSSEC署名: ${parsed['Sign']} <span style="color: #666; font-size: 0.85em;">(ドメインのセキュリティ強化技術)</span>`);
          }
        }

        if (whoisLines.length > 0) {
          addRow("🇯🇵 WHOIS情報 (.jpドメイン)", whoisLines.join("<br>"));
        } else if (rdapResult.whois) {
          // parsedが空の場合は、重要な情報を抽出して表示
          console.warn('⚠️ parsedデータが空のため、WHOISテキストから情報を抽出します');
          const rawWhois = rdapResult.whois;
          
          // JPRSのヘルプテキストを除外
          const lines = rawWhois.split('\n').filter(line => {
            const trimmed = line.trim();
            // コメント行とヘルプテキストを除外
            return trimmed && 
                   !trimmed.startsWith('[') && 
                   !trimmed.startsWith('%') &&
                   !trimmed.startsWith('#') &&
                   !trimmed.toLowerCase().includes('jprs') &&
                   !trimmed.toLowerCase().includes('database');
          });
          
          if (lines.length > 0) {
            whoisLines.push('<div style="background: #fff3e0; padding: 10px; border-radius: 4px; margin-bottom: 10px;">');
            whoisLines.push('<strong style="color: #e65100;">⚠️ 情報の解析に失敗しました</strong><br>');
            whoisLines.push('WHOIS情報は取得できましたが、自動解析できませんでした。以下は生データです：');
            whoisLines.push('</div>');
            whoisLines.push(`<pre style="white-space: pre-wrap; font-size: 0.85em; line-height: 1.6; background: #f5f5f5; padding: 10px; border-radius: 4px;">${lines.join('\n')}</pre>`);
            addRow("🇯🇵 WHOIS情報 (.jpドメイン)", whoisLines.join("<br>"));
          }
        }

        // 次の処理をスキップ（catchに飛ばない）
        throw new Error('JP_WHOIS_PROCESSED');
      } else {
        console.log('🇯🇵 日本ドメインWHOIS取得失敗:', rdapResult?.error);
        throw new Error(rdapResult?.error || 'JP WHOIS取得失敗');
      }
    } else {
      // 🌐 その他のドメインは通常のRDAPを使用
      rdapResult = await chrome.runtime.sendMessage({
        type: 'getRdapDomain',
        domain: domain
      });

      console.log('📊 RDAPレスポンス:', rdapResult);

      if (!rdapResult) {
        throw new Error('RDAPレスポンスが空です');
      }

      if (!rdapResult.success) {
        console.log('📊 WHOIS情報が取得できませんでした:', rdapResult.error);
        throw new Error(rdapResult.error || 'RDAP取得失敗');
      }
    }

    const info = rdapResult.detailedInfo;
    const dr = rdapResult.data;
    console.log('📄 detailedInfo:', info);
    console.log('📄 data:', dr);

    const whoisLines = [];

    // 📊 detailedInfoがない場合は元のデータを使用（フォールバック）
    if (!info) {
      console.warn('⚠️ detailedInfoがないため、元のデータを使用します');

      if (!dr) {
        throw new Error('元のデータ(data)も空です');
      }

      // 🔍 デバッグ: RDAPデータ構造を確認
      console.log('🔍 RDAPデータ構造:', dr);
      console.log('🔍 entities:', dr.entities);
      if (dr.entities && dr.entities.length > 0) {
        dr.entities.forEach((entity, index) => {
          console.log(`🔍 entity[${index}]:`, entity);
          console.log(`  - roles:`, entity.roles);
          console.log(`  - vcardArray:`, entity.vcardArray);
        });
      }

      // フォールバック：元の形式で表示
      if (dr && dr.ldhName) whoisLines.push(`<strong style="color: #1976d2;">🌐 ドメイン:</strong> ${dr.ldhName}`);

      // ステータス
      if (dr && dr.status && dr.status.length > 0) {
        whoisLines.push('<br><strong style="color: #1976d2;">🛡️ ステータス:</strong>');
        const statusTranslations = {
          'client transfer prohibited': '転送禁止',
          'client delete prohibited': '削除禁止',
          'client update prohibited': '更新禁止'
        };
        dr.status.forEach(s => {
          const translated = statusTranslations[s.toLowerCase()] || s;
          whoisLines.push(`　・ ${translated}`);
        });
      }

      // 日付情報
      if (dr.events) {
        whoisLines.push('<br><strong style="color: #1976d2;">📅 日付情報:</strong>');
        for (const event of dr.events) {
          if (event.eventAction === "registration") {
            whoisLines.push(`　・ 登録日: ${new Date(event.eventDate).toLocaleDateString('ja-JP')}`);
          }
          if (event.eventAction === "last changed") {
            whoisLines.push(`　・ 最終更新: ${new Date(event.eventDate).toLocaleDateString('ja-JP')}`);
          }
          if (event.eventAction === "expiration") {
            whoisLines.push(`　・ 有効期限: ${new Date(event.eventDate).toLocaleDateString('ja-JP')}`);
          }
        }
      }

      // 🔍 エンティティ情報をロール別に抽出
      const extractEntityInfo = (entity) => {
        const info = {};
        if (!entity || !entity.vcardArray) {
          console.warn('⚠️ vcardArrayが存在しません:', entity);
          return info;
        }

        const vcard = entity.vcardArray[1] || [];
        vcard.forEach(item => {
          if (item[0] === 'fn') info.name = item[3];
          if (item[0] === 'org') info.organization = item[3];
          if (item[0] === 'email') info.email = item[3];
          if (item[0] === 'tel') info.phone = item[3];
          if (item[0] === 'adr') {
            const addr = item[3];
            info.address = [addr[2], addr[3], addr[4], addr[5], addr[6]].filter(Boolean).join(', ');
          }
        });
        return info;
      };

      // ロール別にエンティティを分類
      let registrant = null, admin = null, tech = null, registrar = null;

      if (dr.entities && dr.entities.length > 0) {
        dr.entities.forEach(entity => {
          const roles = entity.roles || [];

          if (roles.includes('registrant')) {
            registrant = extractEntityInfo(entity);
          }
          if (roles.includes('administrative')) {
            admin = extractEntityInfo(entity);
          }
          if (roles.includes('technical')) {
            tech = extractEntityInfo(entity);
          }
          if (roles.includes('registrar')) {
            registrar = {
              name: entity.handle || entity.publicIds?.[0]?.identifier,
              organization: entity.vcardArray?.[1]?.find(i => i[0] === 'fn')?.[3]
            };
          }
        });
      }

      // 💼 登録者情報
      if (registrant && (registrant.name || registrant.organization)) {
        whoisLines.push('<br><strong style="color: #1976d2;">💼 登録者:</strong>');
        if (registrant.name) whoisLines.push(`　・ 名前: ${registrant.name}`);
        if (registrant.organization) whoisLines.push(`　・ 組織: ${registrant.organization}`);
        if (registrant.email) whoisLines.push(`　・ メール: ${registrant.email}`);
        if (registrant.phone) whoisLines.push(`　・ 電話: ${registrant.phone}`);
        if (registrant.address) whoisLines.push(`　・ 住所: ${registrant.address}`);
      }

      // 🛠️ 管理者情報
      if (admin && (admin.name || admin.organization)) {
        whoisLines.push('<br><strong style="color: #1976d2;">🛠️ 管理者:</strong>');
        if (admin.name) whoisLines.push(`　・ 名前: ${admin.name}`);
        if (admin.organization) whoisLines.push(`　・ 組織: ${admin.organization}`);
        if (admin.email) whoisLines.push(`　・ メール: ${admin.email}`);
        if (admin.phone) whoisLines.push(`　・ 電話: ${admin.phone}`);
      }

      // 🔧 技術担当者情報
      if (tech && (tech.name || tech.organization)) {
        whoisLines.push('<br><strong style="color: #1976d2;">🔧 技術担当者:</strong>');
        if (tech.name) whoisLines.push(`　・ 名前: ${tech.name}`);
        if (tech.organization) whoisLines.push(`　・ 組織: ${tech.organization}`);
        if (tech.email) whoisLines.push(`　・ メール: ${tech.email}`);
      }

      // 🏢 レジストラ情報
      if (registrar && (registrar.name || registrar.organization)) {
        whoisLines.push('<br><strong style="color: #1976d2;">🏢 レジストラ:</strong>');
        if (registrar.name) whoisLines.push(`　・ 名前: ${registrar.name}`);
        if (registrar.organization) whoisLines.push(`　・ 組織: ${registrar.organization}`);
      }

      // 📡 ネームサーバー
      if (dr.nameservers && dr.nameservers.length > 0) {
        whoisLines.push('<br><strong style="color: #1976d2;">📡 ネームサーバー:</strong>');
        dr.nameservers.forEach(ns => {
          const nsName = ns.ldhName || ns.unicodeName || ns;
          whoisLines.push(`　・ ${nsName}`);
        });
      }

      if (whoisLines.length > 0) {
        addRow("📊 WHOIS / RDAP 情報", whoisLines.join("<br>"));
      }
      return; // フォールバック処理を終了
    }

    // 🎯 ドメイン名
    if (info.domain) {
      whoisLines.push(`<strong style="color: #1976d2;">🌐 ドメイン:</strong> ${info.domain}`);
    }

    // 📅 日付情報
    if (Object.keys(info.dates).length > 0) {
      whoisLines.push('<br><strong style="color: #1976d2;">📅 日付情報:</strong>');

      if (info.dates.registration) {
        const regDate = new Date(info.dates.registration).toLocaleDateString('ja-JP', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        whoisLines.push(`　・ 登録日: ${regDate}`);
      }
      if (info.dates['last changed']) {
        const updateDate = new Date(info.dates['last changed']).toLocaleDateString('ja-JP', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        whoisLines.push(`　・ 最終更新: ${updateDate}`);
      }
      if (info.dates.expiration) {
        const expDate = new Date(info.dates.expiration).toLocaleDateString('ja-JP', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        whoisLines.push(`　・ 有効期限: ${expDate}`);
      }
    }

    // 🛡️ ステータス
    if (info.status && info.status.length > 0) {
      whoisLines.push('<br><strong style="color: #1976d2;">🛡️ ステータス:</strong>');
      const statusTranslations = {
        'client transfer prohibited': '転送禁止',
        'client delete prohibited': '削除禁止',
        'client update prohibited': '更新禁止',
        'server transfer prohibited': 'サーバー転送禁止',
        'server delete prohibited': 'サーバー削除禁止',
        'server update prohibited': 'サーバー更新禁止',
        'active': 'アクティブ'
      };
      info.status.forEach(s => {
        const translated = statusTranslations[s.toLowerCase()] || s;
        whoisLines.push(`　・ ${translated}`);
      });
    }

    // 💼 登録者情報
    if (info.registrant && (info.registrant.name || info.registrant.organization)) {
      whoisLines.push('<br><strong style="color: #1976d2;">💼 登録者:</strong>');
      if (info.registrant.name) whoisLines.push(`　・ 名前: ${info.registrant.name}`);
      if (info.registrant.organization) whoisLines.push(`　・ 組織: ${info.registrant.organization}`);
      if (info.registrant.email) whoisLines.push(`　・ メール: ${info.registrant.email}`);
      if (info.registrant.phone) whoisLines.push(`　・ 電話: ${info.registrant.phone}`);
      if (info.registrant.address) whoisLines.push(`　・ 住所: ${info.registrant.address}`);
    } else {
      // 登録者情報が取得できない場合（代理公開またはGDPR対応）
      whoisLines.push('<br><strong style="color: #1976d2;">💼 登録者:</strong>');
      whoisLines.push(`　・ <span style="color: #e65100;">🔒 代理公開（Privacy Protection）</span>`);
    }

    // 🛠️ 管理者情報
    if (info.admin && (info.admin.name || info.admin.organization)) {
      whoisLines.push('<br><strong style="color: #1976d2;">🛠️ 管理者:</strong>');
      if (info.admin.name) whoisLines.push(`　・ 名前: ${info.admin.name}`);
      if (info.admin.organization) whoisLines.push(`　・ 組織: ${info.admin.organization}`);
      if (info.admin.email) whoisLines.push(`　・ メール: ${info.admin.email}`);
      if (info.admin.phone) whoisLines.push(`　・ 電話: ${info.admin.phone}`);
    }

    // 🔧 技術担当者情報
    if (info.tech && (info.tech.name || info.tech.organization)) {
      whoisLines.push('<br><strong style="color: #1976d2;">🔧 技術担当者:</strong>');
      if (info.tech.name) whoisLines.push(`　・ 名前: ${info.tech.name}`);
      if (info.tech.organization) whoisLines.push(`　・ 組織: ${info.tech.organization}`);
      if (info.tech.email) whoisLines.push(`　・ メール: ${info.tech.email}`);
    }

    // 🏢 レジストラ情報
    if (info.registrar && (info.registrar.name || info.registrar.organization)) {
      whoisLines.push('<br><strong style="color: #1976d2;">🏢 レジストラ:</strong>');
      if (info.registrar.name) whoisLines.push(`　・ 名前: ${info.registrar.name}`);
      if (info.registrar.organization) whoisLines.push(`　・ 組織: ${info.registrar.organization}`);
    }

    // 📡 ネームサーバー
    if (info.nameservers && info.nameservers.length > 0) {
      whoisLines.push('<br><strong style="color: #1976d2;">📡 ネームサーバー:</strong>');
      info.nameservers.forEach(ns => {
        whoisLines.push(`　・ ${ns}`);
      });
    }

    // 🔒 DNSSEC
    if (info.dnssec) {
      whoisLines.push('<br><strong style="color: #1976d2;">🔒 DNSSEC:</strong>');
      const signed = info.dnssec.delegationSigned ? '✅ 有効' : '❌ 無効';
      whoisLines.push(`　・ ${signed}`);
    }

    // 📝 注釈情報
    if (info.remarks && info.remarks.length > 0) {
      whoisLines.push('<br><strong style="color: #1976d2;">📝 注釈:</strong>');
      info.remarks.forEach(remark => {
        if (remark.title) whoisLines.push(`　・ <strong>${remark.title}</strong>`);
        if (remark.description) whoisLines.push(`　　${remark.description}`);
      });
    }

    if (whoisLines.length > 0) {
      addRow("📊 WHOIS / RDAP 詳細情報", whoisLines.join("<br>"));
    } else {
      console.warn('⚠️ WHOIS情報が空です');
    }
  } catch (e) {
    // 👉 JP_WHOIS_PROCESSEDは正常処理完了のマーカー（エラー表示をスキップ）
    if (e.message === 'JP_WHOIS_PROCESSED') {
      console.log('✅ 日本ドメインのWHOIS情報を正常に表示しました');
      // エラー表示をスキップして続行
    } else {
      // === 以下、JP_WHOIS_PROCESSED以外のエラーの場合のみ表示 ===

    // 👉 日本のドメインかどうかをチェック
    const isJpDomain = domain.endsWith('.jp') || domain.includes('.co.jp') || domain.includes('.ne.jp') ||
                       domain.includes('.or.jp') || domain.includes('.ac.jp') || domain.includes('.go.jp');

    if (isJpDomain) {
      console.log('🇯🇵 日本のドメイン: WHOIS情報は取得できません（想定内）');
    } else {
      console.log('📊 WHOIS情報が取得できませんでした:', e.message);
    }

    if (DEBUG_MODE) {
      console.error('詳細エラー:', e.stack);
    }

    let errorHtml = '<div style="padding: 15px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid #1976d2; border-radius: 6px;">';
    errorHtml += '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">';
    errorHtml += '<img src="images/tanu-nee.png" style="width: 40px; height: 40px; border-radius: 50%;">';
    errorHtml += '<strong style="color: #1565c0; font-size: 1.05em;">たぬ姉：「WHOIS情報について説明するわ」</strong>';
    errorHtml += '</div>';
    errorHtml += '<div style="font-size: 0.9em; color: #333; line-height: 1.8; background: rgba(255,255,255,0.7); padding: 12px; border-radius: 4px;">';

    if (isJpDomain) {
      errorHtml += '<div style="margin-bottom: 12px;">';
      errorHtml += '🇯🇵 <strong style="color: #1976d2;">日本のドメインについて：</strong><br>';
      errorHtml += '・ ブラウザ拡張機能の<strong>技術的制限</strong>により取得できません<br>';
      errorHtml += '・ CORSエラーやRDAP未対応が原因です<br>';
      errorHtml += '・ 多くの日本のドメインはWHOIS情報を非公開にしています';
      errorHtml += '</div>';

      // 👉 外部WHOISサービスへのリンクを追加
      errorHtml += '<div style="background: #fff3e0; padding: 12px; border-left: 3px solid #ff9800; border-radius: 3px; margin-top: 10px; margin-bottom: 10px;">';
      errorHtml += '🔍 <strong style="color: #e65100;">WHOIS情報を確認したい場合：</strong><br>';
      errorHtml += '<div style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">';

      // さくらのドメインWHOIS
      const sakuraUrl = `https://domain.sakura.ad.jp/domain-lookup/?domain=${encodeURIComponent(domain)}`;
      errorHtml += `<a href="${sakuraUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #fff; border: 2px solid #ff9800; border-radius: 6px; text-decoration: none; color: #e65100; font-weight: 600; font-size: 0.9em;">`;
      errorHtml += '🌸 さくらのドメインWHOIS検索';
      errorHtml += '</a>';

      // JPRS WHOIS
      const jprsUrl = `https://whois.jprs.jp/`;
      errorHtml += `<a href="${jprsUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: #fff; border: 2px solid #1976d2; border-radius: 6px; text-decoration: none; color: #1565c0; font-weight: 600; font-size: 0.9em;">`;
      errorHtml += '🇯🇵 JPRS WHOIS検索';
      errorHtml += '</a>';

      errorHtml += '</div>';
      errorHtml += '</div>';

      errorHtml += '<div style="background: #e8f5e9; padding: 12px; border-left: 3px solid #4caf50; border-radius: 3px; margin-top: 10px;">';
      errorHtml += '✅ <strong style="color: #2e7d32;">DNS情報は正常に取得できています！</strong><br>';
      errorHtml += '<span style="font-size: 0.85em; color: #555;">上記のAレコード、MXレコード、TXTレコードなどは正常に表示されています。</span>';
      errorHtml += '</div>';
    } else {
      errorHtml += `<strong>エラー内容:</strong> ${e.message}<br><br>`;
      errorHtml += '<strong>原因の可能性:</strong><br>';
      errorHtml += '・ <strong>WHOIS情報が非公開</strong>に設定されている<br>';
      errorHtml += '・ ドメインが登録されていない<br>';
      errorHtml += '・ WHOISプライバシー保護サービスを利用中<br><br>';

      errorHtml += '<div style="background: #fff3e0; padding: 10px; border-left: 3px solid #ff9800; border-radius: 4px; margin-bottom: 10px;">';
      errorHtml += '💡 <strong style="color: #e65100;">ヒント：</strong><br>';
      errorHtml += '<span style="font-size: 0.85em; color: #333;">';
      errorHtml += '「google.com」や「microsoft.com」などの大手サイトで試すと<br>拡張機能が正常に動作しているか確認できます。';
      errorHtml += '</span>';
      errorHtml += '</div>';

      errorHtml += '<div style="background: #e8f5e9; padding: 10px; border-radius: 4px; margin-top: 10px;">';
      errorHtml += '<span style="color: #2e7d32;">✅ DNS情報は正常に表示されています。</span>';
      errorHtml += '</div>';
    }

    errorHtml += '</div>';
    errorHtml += '</div>';

    addRow(isJpDomain ? "🇯🇵 WHOIS情報" : "⚠️ WHOIS / RDAP", errorHtml);
    } // elseブロックの終わり (JP_WHOIS_PROCESSED以外のエラー)
  } // catchブロックの終わり

  // IP RDAP (最初のAレコードのみ)
  if (aSet.length > 0) {
    try {
      const firstIp = aSet[0];
      console.log('RDAP IP 取得開始:', firstIp);
      const ipRdapResult = await chrome.runtime.sendMessage({
        type: 'getRdapIP',
        ip: firstIp
      });

      if (!ipRdapResult.success) {
        throw new Error(ipRdapResult.error || 'IP RDAP取得失敗');
      }

      const ipr = ipRdapResult.data;
      const ipRdapLines = [];

      if (ipr.name) ipRdapLines.push(`ネットワーク名: ${ipr.name}`);
      if (ipr.country) ipRdapLines.push(`国: ${ipr.country}`);

      // 組織情報
      if (ipr.entities && ipr.entities.length > 0) {
        ipr.entities.forEach(entity => {
          if (entity.vcard && entity.vcard.length > 1) {
            const vcardData = entity.vcard[1];
            const fn = vcardData.find(item => item[0] === 'fn');
            const email = vcardData.find(item => item[0] === 'email');

            if (fn && email) {
              ipRdapLines.push(`連絡先: ${fn[3]} (${email[3]})`);
            }
          }
        });
      }

      if (ipRdapLines.length > 0) {
        addRow(`IP RDAP (${firstIp})`, ipRdapLines.join("<br>"));
      }
    } catch (e) {
      if (DEBUG_MODE) {
        console.error('RDAP IP エラー:', e);
        console.log('IP RDAPはオプショナル情報のため、エラーを表示しません');
      }
    }
  }

  // 💻 クライアント情報（ブラウザ、OS、UA、言語）
  try {
    const clientInfoLines = [];
    
    // ブラウザ名とバージョン
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';
    
    if (ua.indexOf('Edg') > -1) {
      browserName = 'Microsoft Edge';
      browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Chrome') > -1) {
      browserName = 'Google Chrome';
      browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Firefox') > -1) {
      browserName = 'Mozilla Firefox';
      browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Apple Safari';
      browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
    }
    
    clientInfoLines.push(`<strong>ブラウザ名:</strong> ${browserName}${browserVersion ? ' ' + browserVersion : ''}`);
    
    // OS判定
    let osName = 'Unknown';
    if (ua.indexOf('Win') > -1) {
      osName = 'Windows';
      if (ua.indexOf('Windows NT 10.0') > -1) osName += ' 10/11';
      else if (ua.indexOf('Windows NT 6.3') > -1) osName += ' 8.1';
      else if (ua.indexOf('Windows NT 6.2') > -1) osName += ' 8';
      else if (ua.indexOf('Windows NT 6.1') > -1) osName += ' 7';
    } else if (ua.indexOf('Mac') > -1) {
      osName = 'macOS';
    } else if (ua.indexOf('Linux') > -1) {
      osName = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
      osName = 'Android';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
      osName = 'iOS';
    }
    
    clientInfoLines.push(`<strong>OS:</strong> ${osName}`);
    
    // ブラウザ対応言語コード
    const languages = navigator.languages || [navigator.language];
    clientInfoLines.push(`<strong>ブラウザ対応言語:</strong> ${languages.join(', ')}`);
    
    // ユーザーエージェント（折りたたみ可能）
    clientInfoLines.push(`
      <details style="margin-top: 10px;">
        <summary style="cursor: pointer; color: #1976d2;"><strong>ユーザーエージェント（詳細）</strong></summary>
        <div style="margin-top: 5px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 0.85em; word-break: break-all; line-height: 1.6;">
          ${ua}
        </div>
      </details>
    `);
    
    addRow('💻 クライアント情報', clientInfoLines.join('<br>'));
  } catch (e) {
    if (DEBUG_MODE) console.error('クライアント情報取得エラー:', e);
  }

  // 結果がない場合
  if (els.resultBody.children.length === 0) {
    els.resultBody.innerHTML = '<tr><td colspan="2" class="loading">結果が見つかりませんでした</td></tr>';
  }
}

async function init() {
  const sp = new URLSearchParams(location.search);
  const q = sp.get("q");
  if (q) {
    const d = normalizeDomain(q);
    els.domain.value = d || q;
  } else {
    const url = await getActiveTabUrl();
    els.domain.value = U.hostnameFromUrl(url) || "";
  }

  const run = () => fetchAll(normalizeDomain(els.domain.value));
  els.go.addEventListener("click", run);
  els.domain.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });

  if (els.domain.value) run();
}

document.addEventListener("DOMContentLoaded", init);

// ========================================
// 📊 レポート出力機能
// ========================================

// 診断結果データを保存するグローバル変数
let reportData = {
  domain: '',
  timestamp: '',
  dnsRecords: {},
  whoisInfo: {},
  siteHealth: {},
  suggests: {},
  personCheck: {}
};

/**
 * 診断結果を収集する関数
 * fetchAllの最後に呼び出す
 */
function collectReportData(domain) {
  console.log('🔍 collectReportDataが呼び出されました - ドメイン:', domain);

  reportData.domain = domain;
  reportData.timestamp = new Date().toLocaleString('ja-JP');

  // DNSレコードを収集
  const rows = document.querySelectorAll('#resultBody tr');
  console.log('📊 収集したDNSレコード数:', rows.length);
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 2) {
      const type = cells[0].textContent.trim();
      const value = cells[1].textContent.trim();
      reportData.dnsRecords[type] = value;
    }
  });

  // 特別なセクションからデータを抽出
  const specialSections = document.querySelectorAll('#specialSections .special-section');
  specialSections.forEach(section => {
    const title = section.querySelector('.section-title')?.textContent.trim();
    const content = section.querySelector('.section-content')?.textContent.trim();

    if (title && content) {
      if (title.includes('WHOIS')) {
        reportData.whoisInfo[title] = content;
      } else if (title.includes('風評')) {
        reportData.suggests[title] = content;
      } else if (title.includes('個人名')) {
        reportData.personCheck[title] = content;
      } else if (title.includes('健康診断')) {
        reportData.siteHealth[title] = content;
      }
    }
  });

  // レポートボタンを表示
  const reportButtonsEl = document.getElementById('reportButtons');
  console.log('🔵 reportButtons要素:', reportButtonsEl);

  if (reportButtonsEl) {
    reportButtonsEl.style.display = 'block';
    console.log('✅ レポートボタンを表示しました');
  } else {
    console.error('❌ reportButtons要素が見つかりません！');
  }

  console.log('📊 レポートデータ収集完了:', reportData);
}

/**
 * ファイルダウンロード用ヘルパー関数
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * HTMLレポートを生成
 */
function exportHTML() {
  let dnsTable = '';
  Object.entries(reportData.dnsRecords).forEach(([type, value]) => {
    const cleanValue = value.replace(/\n/g, '<br>');
    dnsTable += `<tr><td>${type}</td><td>${cleanValue}</td></tr>`;
  });

  let whoisSection = '';
  if (Object.keys(reportData.whoisInfo).length > 0) {
    whoisSection = '<div class="section"><div class="section-title">📊 WHOIS情報</div>';
    Object.entries(reportData.whoisInfo).forEach(([title, content]) => {
      const cleanContent = content.replace(/\n/g, '<br>');
      whoisSection += `<div class="info-box"><strong>${title}</strong><br>${cleanContent}</div>`;
    });
    whoisSection += '</div>';
  }

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WEBサイト健康診断レポート - ${reportData.domain}</title>
  <style>
    body { font-family: 'Segoe UI', Meiryo, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 2em; }
    .header p { margin: 5px 0; opacity: 0.9; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 1.5em; font-weight: bold; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #667eea; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f0f0; font-weight: 600; }
    tr:hover { background: #f9f9f9; }
    .info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #1976d2; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💙 君斗りんくのWEBサイト健康診断レポート</h1>
      <p>🌐 ドメイン: <strong>${reportData.domain}</strong></p>
      <p>📅 診断日時: ${reportData.timestamp}</p>
    </div>
    <div class="section">
      <div class="section-title">📡 DNS情報</div>
      <table>
        <thead><tr><th>タイプ</th><th>値</th></tr></thead>
        <tbody>${dnsTable}</tbody>
      </table>
    </div>
    ${whoisSection}
    <div class="footer">
      <p>💙 Powered by 君斗りんくのWEBサイト健康診断</p>
      <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
  </div>
</body>
</html>`;

  const filename = `report_${reportData.domain}_${new Date().getTime()}.html`;
  downloadFile(html, filename, 'text/html');
  console.log('✅ HTMLレポートをエクスポートしました');
}

/**
 * CSVレポートを生成
 */
function exportCSV() {
  let csv = '\ufeff';
  csv += '"君斗りんくのWEBサイト健康診断レポート"\n';
  csv += `"ドメイン","${reportData.domain}"\n`;
  csv += `"診断日時","${reportData.timestamp}"\n\n`;
  csv += '"DNS情報"\n';
  csv += '"タイプ","値"\n';
  Object.entries(reportData.dnsRecords).forEach(([type, value]) => {
    const cleanValue = value.replace(/"/g, '""').replace(/\n/g, ' ');
    csv += `"${type}","${cleanValue}"\n`;
  });

  const filename = `report_${reportData.domain}_${new Date().getTime()}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
  console.log('✅ CSVレポートをエクスポートしました');
}

/**
 * Excelレポートを生成
 */
function exportExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Excelエクスポート用ライブラリの読み込みに失敗しました');
    return;
  }

  const wb = XLSX.utils.book_new();
  const summaryData = [
    ['君斗りんくのWEBサイト健康診断レポート'],
    [],
    ['ドメイン', reportData.domain],
    ['診断日時', reportData.timestamp],
    []
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, '概要');

  const dnsData = [['DNS情報'], [], ['タイプ', '値']];
  Object.entries(reportData.dnsRecords).forEach(([type, value]) => {
    dnsData.push([type, value.replace(/\n/g, ' / ')]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(dnsData);
  XLSX.utils.book_append_sheet(wb, ws2, 'DNS情報');

  const filename = `report_${reportData.domain}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
  console.log('✅ Excelレポートをエクスポートしました');
}

/**
 * テキストレポートを生成
 */
function exportText() {
  const eq = '='.repeat(60);
  const dash = '-'.repeat(60);
  let text = eq + '\n';
  text += '君斗りんくのWEBサイト健康診断レポート\n';
  text += eq + '\n\n';
  text += `ドメイン: ${reportData.domain}\n`;
  text += `診断日時: ${reportData.timestamp}\n\n`;
  text += dash + '\n';
  text += 'DNS情報\n';
  text += dash + '\n';
  Object.entries(reportData.dnsRecords).forEach(([type, value]) => {
    text += `[${type}]\n${value}\n\n`;
  });
  text += '\n' + eq + '\n';
  text += `生成日時: ${new Date().toLocaleString('ja-JP')}\n`;

  const filename = `report_${reportData.domain}_${new Date().getTime()}.txt`;
  downloadFile(text, filename, 'text/plain;charset=utf-8');
  console.log('✅ テキストレポートをエクスポートしました');
}

/**
 * JSONレポートを生成
 */
function exportJSON() {
  const json = JSON.stringify(reportData, null, 2);
  const filename = `report_${reportData.domain}_${new Date().getTime()}.json`;
  downloadFile(json, filename, 'application/json');
  console.log('✅ JSONレポートをエクスポートしました');
}

/**
 * Markdownレポートを生成
 */
function exportMarkdown() {
  let md = `# 💙 WEBサイト健康診断レポート\n\n`;
  md += `**ドメイン:** ${reportData.domain}  \n`;
  md += `**診断日時:** ${reportData.timestamp}\n\n`;
  md += `---\n\n## 📡 DNS情報\n\n`;
  md += `| タイプ | 値 |\n`;
  md += `|------|------|\n`;
  Object.entries(reportData.dnsRecords).forEach(([type, value]) => {
    const cleanValue = value.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
    md += `| ${type} | ${cleanValue} |\n`;
  });
  md += `\n---\n\n`;
  md += `*Powered by 君斗りんくのWEBサイト健康診断*  \n`;
  md += `*生成日時: ${new Date().toLocaleString('ja-JP')}*\n`;

  const filename = `report_${reportData.domain}_${new Date().getTime()}.md`;
  downloadFile(md, filename, 'text/markdown;charset=utf-8');
  console.log('✅ Markdownレポートをエクスポートしました');
}

/**
 * Googleインデックス状況を確認
 */
async function checkGoogleIndexStatus() {
  const domainInput = document.getElementById('domain');
  const domain = domainInput.value.trim();
  
  if (!domain) {
    alert('ドメイン名を入力してください。');
    return;
  }
  
  const button = document.getElementById('checkGoogleIndex');
  const resultDiv = document.getElementById('googleIndexResult');
  
  // ローディング表示
  button.disabled = true;
  button.innerHTML = '🔄 調査中...';
  button.style.background = '#ccc';
  button.style.cursor = 'not-allowed';
  
  resultDiv.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">🔍 Googleインデックス情報を取得中...</div>';
  
  try {
    // 並列でインデックス数とサイトマップを取得
    const [indexResult, sitemapResult] = await Promise.all([
      chrome.runtime.sendMessage({
        type: 'getGoogleIndexCount',
        domain: domain
      }),
      chrome.runtime.sendMessage({
        type: 'getSitemapPageCount',
        domain: domain
      })
    ]);
    
    console.log('Googleインデックス結果:', indexResult);
    console.log('サイトマップ結果:', sitemapResult);
    
    if (indexResult && indexResult.success) {
      const indexCount = indexResult.indexCount;
      const formattedCount = indexResult.formattedCount;
      const isCached = indexResult.cached;
      
      let indexHtml = '<div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); border: 3px solid #2e7d32; padding: 20px; border-radius: 12px;">';
      indexHtml += '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;"><img src="images/link.png" style="width: 55px; height: 55px; border-radius: 50%; border: 3px solid #fff;"><div style="flex: 1;">';
      indexHtml += '<strong style="color: #fff; font-size: 1.3em;">りんく：「Googleインデックス状況を調べたよ！」</strong><br><span style="color: rgba(255,255,255,0.9); font-size: 0.95em;">あなたのサイトはGoogleにどれくらい登録されてるの？</span></div></div>';
      
      indexHtml += '<div style="background: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px; margin-bottom: 15px;"><div style="color: #333; font-size: 0.95em; line-height: 1.8;">';
      indexHtml += `<strong style="color: #2e7d32; font-size: 1.2em;">🔍 Googleインデックス数: ${formattedCount}件</strong><br>`;
      
      if (isCached) {
        indexHtml += '<span style="color: #ff9800; font-size: 0.85em;">💾 キャッシュデータ（24時間以内）</span><br>';
      }
      
      // サイトマップ情報（参考情報として表示）
      if (sitemapResult && sitemapResult.success) {
        const sitemapCount = sitemapResult.pageCount;
        
        indexHtml += '<br><div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;"></div>';
        indexHtml += '<div style="background: #f5f5f5; padding: 12px; border-radius: 6px; border-left: 3px solid #2196F3;">';
        indexHtml += '<strong style="color: #1976d2;">🗺️ サイトマップ情報（参考）</strong><br>';
        indexHtml += `<span style="font-size: 0.9em; color: #666;">サイトマップ登録ページ数: ${sitemapCount.toLocaleString('ja-JP')}ページ<br>`;
        indexHtml += `URL: <a href="${sitemapResult.sitemapUrl}" target="_blank" style="color: #1976d2;">${sitemapResult.sitemapUrl}</a></span>`;
        indexHtml += '<br><br><span style="font-size: 0.85em; color: #ff6f00;">⚠️ 注意：サイトマップにエラーがある可能性や、登録漏れのページがある可能性があります。<br>正確な情報はGoogle Search Consoleで確認してください。</span>';
        indexHtml += '</div>';
      } else {
        // サイトマップがない場合の評価
        indexHtml += '<br><div style="border-top: 1px solid #ddd; margin: 10px 0; padding-top: 10px;"></div>';
        indexHtml += '<strong style="color: #1976d2;">📊 インデックス数の評価</strong><br>';
        
        let sizeCategory = '';
        let sizeColor = '';
        let advice = '';
        
        if (indexCount < 10) {
          sizeCategory = '👼 超小規模サイト';
          sizeColor = '#ff9800';
          advice = 'ページ数が非常に少ないです。コンテンツを充実させるとSEO効果が高まります。';
        } else if (indexCount < 50) {
          sizeCategory = '🏠 小規模サイト';
          sizeColor = '#4CAF50';
          advice = '個人サイトや小規模企業サイトとしては適切な規模です。';
        } else if (indexCount < 200) {
          sizeCategory = '🏪 中規模サイト';
          sizeColor = '#4CAF50';
          advice = '企業サイトとしては標準的な規模です。良いバランスですね！';
        } else if (indexCount < 1000) {
          sizeCategory = '🏬 大規模サイト';
          sizeColor = '#2196F3';
          advice = 'コンテンツが豊富なサイトです。サイトマップを設置するとさらに効果的です。';
        } else {
          sizeCategory = '🏛️ 超大規模サイト';
          sizeColor = '#7b1fa2';
          advice = 'ECサイトや大型メディアサイトクラスですね！サイトマップの設置を強く推奨します。';
        }
        
        indexHtml += `<span style="color: ${sizeColor}; font-weight: bold; font-size: 1.1em;">${sizeCategory} (${formattedCount}ページ)</span><br>`;
        indexHtml += `<span style="font-size: 0.9em; color: #333; margin-top: 5px; display: inline-block;">${advice}</span><br>`;
        
        // 一般的な目安を追加
        indexHtml += '<br><div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 0.85em;">';
        indexHtml += '<strong style="color: #666;">📊 一般的な目安：</strong><br>';
        indexHtml += '<span style="color: #666;">';
        indexHtml += '・ 個人ブログ：10-100ページ<br>';
        indexHtml += '・ 企業サイト：50-200ページ<br>';
        indexHtml += '・ ECサイト：数百～数千ページ';
        indexHtml += '</span>';
        indexHtml += '</div>';
        
        indexHtml += '<br><div style="background: #fff3e0; padding: 10px; border-left: 3px solid #ff9800; border-radius: 4px;">';
        indexHtml += '<span style="color: #e65100; font-size: 0.9em;">🗺️ <strong>サイトマップが見つかりませんでした</strong><br>';
        indexHtml += 'サイトマップを設置すると、Googleにページを正しくインデックスさせられます。</span>';
        indexHtml += '</div>';
      }
      
      indexHtml += '</div></div>';
      
      // API使用状況を表示
      const quotaResult = await chrome.runtime.sendMessage({ type: 'getGoogleApiQuota' });
      if (quotaResult && quotaResult.success) {
        indexHtml += '<div style="background: rgba(255,255,255,0.95); padding: 10px; border-radius: 8px; margin-bottom: 15px;">';
        indexHtml += `<span style="font-size: 0.85em; color: #666;">📊 今日のAPI使用状況: ${quotaResult.used}/${quotaResult.used + quotaResult.remaining}回</span>`;
        
        if (quotaResult.remaining < 10) {
          indexHtml += ` <span style="color: #f44336; font-weight: bold;">（残り${quotaResult.remaining}回）</span>`;
        }
        indexHtml += '</div>';
      }
      
      indexHtml += '<div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; border-radius: 4px; margin-bottom: 15px;"><div style="display: flex; gap: 10px; align-items: start;"><img src="images/link.png" style="width: 40px; height: 40px; border-radius: 50%;"><div style="flex: 1;">';
      indexHtml += '<strong style="color: #ff6f00;">💡 りんくからのアドバイス</strong><br><span style="font-size: 0.9em; color: #333;">「Google Search Consoleでさらに詳しい情報を確認できるよ！インデックスに問題があれば、りんくが頼りにしているSEO専門家に相談しよう！」</span></div></div></div>';
      
      indexHtml += '<a href="https://lin.ee/X2aWSFO" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #fff; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">';
      indexHtml += '<img src="images/rev.png" style="height: 40px;"><div style="text-align: left;"><div style="color: #2e7d32; font-weight: bold; font-size: 1.15em;">リバースハックに相談（SEO対策）</div>';
      indexHtml += '<div style="font-size: 0.8em; color: #999;">りんくが頼りにしているSEO専門家</div></div><div style="color: #2e7d32; font-size: 1.5em;">→</div></a></div>';
      
      resultDiv.innerHTML = indexHtml;
    } else if (indexResult && !indexResult.success) {
      // エラー表示
      let errorHtml = '<div style="background: #ffebee; border: 2px solid #f44336; padding: 20px; border-radius: 8px;">';
      errorHtml += '<strong style="color: #c62828;">❌ エラー</strong><br><br>';
      errorHtml += `<span style="color: #333;">${indexResult.error}</span>`;
      errorHtml += '</div>';
      resultDiv.innerHTML = errorHtml;
    }
  } catch (e) {
    console.error('Googleインデックスチェックエラー:', e);
    resultDiv.innerHTML = '<div style="background: #ffebee; border: 2px solid #f44336; padding: 20px; border-radius: 8px;"><strong style="color: #c62828;">❌ エラーが発生しました</strong><br><br><span style="color: #333;">' + e.message + '</span></div>';
  } finally {
    // ボタンを復元
    button.disabled = false;
    button.innerHTML = '🔄 再調査';
    button.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    button.style.cursor = 'pointer';
  }
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exportHTML')?.addEventListener('click', exportHTML);
  document.getElementById('exportExcel')?.addEventListener('click', exportExcel);
  document.getElementById('exportCSV')?.addEventListener('click', exportCSV);
  document.getElementById('exportText')?.addEventListener('click', exportText);
  document.getElementById('exportJSON')?.addEventListener('click', exportJSON);
  document.getElementById('exportMarkdown')?.addEventListener('click', exportMarkdown);
  
  // Googleインデックスボタンのイベントリスナー
  document.getElementById('checkGoogleIndex')?.addEventListener('click', checkGoogleIndexStatus);
});
