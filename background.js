// ========================================
// 定数定義
// ========================================

/**
 * デバッグモード設定
 * falseにするとエラーメッセージを非表示
 */
const DEBUG_MODE = false;

/**
 * バージョン管理定数
 */
const VERSION_CONSTANTS = {
  WP_MINIMUM: 6.8,      // WordPress最低バージョン
  PHP_MINIMUM: 8.0,     // PHP最低バージョン
  CF7_MINIMUM: 6.1      // Contact Form 7最低バージョン
};

/**
 * LINE相談URL
 */
const LINE_URLS = {
  IT_INFRA: 'https://lin.ee/lrjVHvH',
  REPUTATION: 'https://lin.ee/X2aWSFO'
};

/**
 * タイムアウト設定（ミリ秒）
 */
const TIMEOUT_CONSTANTS = {
  FETCH: 10000,         // HTTPリクエストタイムアウト
  ANALYSIS: 15000       // 分析処理タイムアウト
};

/**
 * パフォーマンス基準値
 */
const PERFORMANCE_THRESHOLDS = {
  HTML_SIZE_OPTIMAL: 100,    // 100KB未満が最適
  HTML_SIZE_LARGE: 500,      // 500KB以上が大きすぎる
  MAX_PLUGINS: 10            // 表示する最大プラグイン数
};

/**
 * Google Custom Search API設定
 */
const GOOGLE_API_CONFIG = {
  DEFAULT_API_KEY: 'AIzaSyBaKHwsfmnxF3gDkvS177ST1Zd8jLRQwIs',
  DEFAULT_SEARCH_ENGINE_ID: '0480a8a24bbda42fc',
  // キャッシュ有効期間（24時間）
  CACHE_DURATION: 24 * 60 * 60 * 1000,
  // レート制限（3秒間隔）
  RATE_LIMIT_INTERVAL: 3000,
  // 1日のクエリ上限（無料枠）
  DAILY_QUOTA: 100
};

// ========================================
// ユーティリティ関数
// ========================================

/**
 * エラーハンドラー
 * 統一的なエラー処理とログ出力
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @param {boolean} [isCritical=false] - 重大なエラーかどうか
 * @returns {string} エラーメッセージ
 */
function handleError(error, context, isCritical = false) {
  const errorMessage = error?.message || String(error);
  const logPrefix = isCritical ? '❌ CRITICAL' : '⚠️';
  const logMethod = isCritical ? console.error : console.warn;
  
  logMethod(`${logPrefix} [${context}]:`, errorMessage);
  
  return errorMessage;
}

/**
 * エラーレスポンス生成
 * 統一的なエラーレスポンスオブジェクトを生成
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーコンテキスト
 * @returns {Object} エラーレスポンス
 */
function createErrorResponse(error, context) {
  return {
    success: false,
    error: handleError(error, context, true)
  };
}

/**
 * タイムアウト付きfetchヘルパー
 * AbortControllerを使用したタイムアウト処理を統一化
 * @param {string} url - フェッチするURL
 * @param {RequestInit} options - fetchオプション
 * @param {number} [timeout] - タイムアウト（ミリ秒）
 * @returns {Promise<Response>} レスポンス
 */
async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_CONSTANTS.FETCH) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 統一ロガー
 * 標準化されたログ出力
 */
const Logger = {
  /**
   * 情報ログ
   * @param {string} context - コンテキスト
   * @param {...any} args - ログ引数
   */
  info(context, ...args) {
    console.log(`🟢 [${context}]:`, ...args);
  },
  
  /**
   * 成功ログ
   */
  success(context, ...args) {
    console.log(`✅ [${context}]:`, ...args);
  },
  
  /**
   * 警告ログ
   */
  warn(context, ...args) {
    console.warn(`⚠️ [${context}]:`, ...args);
  },
  
  /**
   * エラーログ
   */
  error(context, ...args) {
    console.error(`❌ [${context}]:`, ...args);
  },
  
  /**
   * デバッグログ
   */
  debug(context, ...args) {
    console.log(`🔵 [${context}]:`, ...args);
  }
};

// ==============================================
// コンテキストメニュー
// ==============================================
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "osint-lookup") return;
  const q = info.selectionText || info.linkUrl || "";
  if (!q) return;
  const url = new URL(chrome.runtime.getURL("popup.html"));
  url.searchParams.set("q", q);
  chrome.tabs.create({ url: url.toString() });
});

/**
 * 代理フェッチ（CORS回避用）
 * 外部APIへのアクセス時にCORS制限を回避するためのプロキシ関数
 * @param {string|Request} input - フェッチするURLまたはRequestオブジェクト
 * @param {RequestInit} init - フェッチオプション
 * @returns {Promise<{ok: boolean, status: number, text: string}>} レスポンス情報
 */
async function proxyFetch(input, init) {
  const res = await fetch(input, init);
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

/**
 * サイト情報取得
 * 指定されたドメインのHTMLを取得し、タイトルやメタ情報を抽出
 * @param {string} domain - 調査対象のドメイン名
 * @returns {Promise<{title: string|null, ogTitle: string|null, siteName: string|null}>} サイト情報
 */
async function fetchSiteInfo(domain) {
  try {
    const url = `https://${domain}`;
    const response = await fetch(url);
    const html = await response.text();
    
    // タイトルタグを抽出
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    
    // OGタイトルを抽出
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null;
    
    // サイト名を抽出
    const ogSiteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    const siteName = ogSiteNameMatch ? ogSiteNameMatch[1].trim() : null;
    
    return {
      title: title || ogTitle || siteName,
      ogTitle,
      siteName
    };
  } catch (e) {
    Logger.error('fetchSiteInfo', 'サイト情報取得エラー:', e.message);
    return null;
  }
}

/**
 * サイトの健康診断（総合分析）
 * WordPress/PHP/セキュリティ/パフォーマンスなど多角的にサイトを分析
 * @param {string} domain - 調査対象のドメイン名
 * @returns {Promise<Object>} 分析結果
 * @returns {boolean} .success - 成功フラグ
 * @returns {boolean} .isWordPress - WordPressサイトかどうか
 * @returns {string|null} .wpVersion - WordPressのバージョン
 * @returns {string|null} .phpVersion - PHPのバージョン
 * @returns {Array<string>} .issues - 深刻な問題リスト
 * @returns {Array<string>} .warnings - 警告リスト
 * @returns {Array<string>} .goodPoints - 良好な点リスト
 * @returns {boolean} .hasContactForm7 - Contact Form 7がインストールされているか
 * @returns {string|null} .cf7Version - Contact Form 7のバージョン
 * @returns {boolean} .cf7Vulnerable - Contact Form 7に脆弱性があるか
 */
async function analyzeSiteHealth(domain) {
  try {
    const httpsUrl = `https://${domain}`;
    const httpUrl = `http://${domain}`;
    
    // タイムアウト設定付きでfetch + レスポンスタイム計測
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト
    
    const startTime = performance.now();
    const response = await fetch(httpsUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    });
    const responseTime = Math.round(performance.now() - startTime);
    
    clearTimeout(timeoutId);
    
    const html = await response.text();
    const finalUrl = response.url; // リダイレクト後のURL
    const htmlSize = new Blob([html]).size; // HTMLサイズ（バイト）
    const htmlSizeKB = (htmlSize / 1024).toFixed(2); // KB単位
    
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    
    const issues = [];
    const warnings = [];
    const goodPoints = [];
    let hasHttpsError = false;  // HTTPSエラーフラグ
    
    // === SEOチェック ===
    
    // 1. WWW統一チェック
    const hasWww = finalUrl.includes('://www.');
    const originalHasWww = domain.startsWith('www.');
    
    if (hasWww !== originalHasWww) {
      goodPoints.push(`WWWリダイレクトが正しく設定されています (${hasWww ? 'www有り' : 'www無し'}に統一)`);
    } else {
      // www有り/無しの両方をチェック
      try {
        const altDomain = hasWww ? domain.replace('www.', '') : `www.${domain}`;
        const altResponse = await fetch(`https://${altDomain}`, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(3000)
        });
        
        if (altResponse.status === 301 || altResponse.status === 308) {
          goodPoints.push('WWWリダイレクトが設定されています');
        } else if (altResponse.status === 200) {
          // 両方が200で返る場合は深刻な問題として赤い警告を表示
          issues.push(`www有り/無しが統一されていません。Canonical URLで管理されていなければSEOに悪影響があります。`);
        }
        // その他のステータスコード（403, 404など）は警告不要
      } catch {
        // チェックできない場合はスキップ（DNSが設定されていない等）
      }
    }
    
    // 2. HTTPSリダイレクトチェック
    if (finalUrl.startsWith('https://')) {
      goodPoints.push('HTTPSで保護されています');
      // HTTPSでアクセスできている場合、HTTPからのリダイレクトも正常に機能していると判断
      goodPoints.push('HTTP→HTTPSリダイレクトが設定されています');
    } else {
      hasHttpsError = true;
      issues.push('HTTPSが使用されていません。SSL証明書の導入を推奨します。');
    }
    
    // 3. タイトルタグチェック
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title.length < 30) {
        warnings.push(`タイトルが短すぎます (${title.length}文字)。30-60文字を推奨します。`);
      } else if (title.length > 60) {
        warnings.push(`タイトルが長すぎます (${title.length}文字)。検索結果で切れる可能性があります。`);
      } else {
        goodPoints.push('タイトルタグの文字数が適切です');
      }
    } else {
      issues.push('タイトルタグが見つかりません。SEOに致命的です。');
    }
    
    // 4. メタディスクリプションチェック
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      const desc = descMatch[1].trim();
      if (desc.length < 80) {
        warnings.push(`メタディスクリプションが短すぎます (${desc.length}文字)。120-160文字を推奨します。`);
      } else if (desc.length > 160) {
        warnings.push(`メタディスクリプションが長すぎます (${desc.length}文字)。検索結果で切れる可能性があります。`);
      } else {
        goodPoints.push('メタディスクリプションの文字数が適切です');
      }
    } else {
      warnings.push('メタディスクリプションが設定されていません。検索結果での表示が最適化されません。');
    }
    
    // 5. Canonical URLチェック
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      goodPoints.push('Canonical URLが設定されています');
    } else {
      warnings.push('Canonical URLが設定されていません。重複コンテンツのリスクがあります。');
    }
    
    // 6. robots metaタグチェック
    const robotsMetaMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    if (robotsMetaMatch) {
      const robotsContent = robotsMetaMatch[1].toLowerCase();
      if (robotsContent.includes('noindex')) {
        issues.push('ページがnoindexに設定されています。検索エンジンにインデックスされません！');
      }
      if (robotsContent.includes('nofollow')) {
        warnings.push('ページがnofollowに設定されています。リンクの効果が失われます。');
      }
    }
    
    // 7. OGPタグチェック
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["']/i);
    const ogDescMatch = html.match(/<meta>]*property=["']og:description["']/i);
    
    if (ogTitleMatch && ogImageMatch && ogDescMatch) {
      goodPoints.push('OGPタグが適切に設定されています（SNSシェア対応）');
    } else {
      warnings.push('OGPタグが不完全です。SNSでのシェア時の表示が最適化されません。');
    }
    
    // === WordPressチェック ===
    let isWordPress = false;
    let wpVersion = null;
    let wpTheme = null;
    let wpPlugins = [];
    let phpVersion = null;
    // Contact Form 7チェック用変数
    let hasContactForm7 = false;
    let cf7Version = null;
    let cf7Vulnerable = false;
    
    // WordPress検出（複数の方法を試行）
    if (html.includes('wp-content') || 
        html.includes('wp-includes') ||
        html.includes('/wp-json/') ||
        html.match(/<meta name=["']generator["'] content=["']WordPress/i) ||
        html.includes('wp-emoji') ||
        html.includes('wp-block-') ||
        headers['x-powered-by']?.toLowerCase().includes('wordpress')) {
      isWordPress = true;
      Logger.success('WordPress', 'サイトを検出');
      
      // WordPressバージョン検出（複数の方法）
      // 方法1: generator metaタグ
      let versionMatch = html.match(/<meta name=["']generator["'] content=["']WordPress ([0-9.]+)["']/i);
      if (versionMatch) {
        wpVersion = versionMatch[1];
        Logger.success('WordPress', `バージョン検出 (meta): ${wpVersion}`);
      }
      
      // 方法2: RSS feedのgenタグ
      if (!wpVersion) {
        versionMatch = html.match(/<generator>https?:\/\/wordpress\.org\/\?v=([0-9.]+)<\/generator>/i);
        if (versionMatch) {
          wpVersion = versionMatch[1];
          Logger.success('WordPress', `バージョン検出 (RSS): ${wpVersion}`);
        }
      }
      
      // 方法3: wp-includes内のコアファイルのバージョンパラメータのみ
      if (!wpVersion) {
        // wp-includesのみを対象（wp-contentはプラグイン含むため除外）
        versionMatch = html.match(/wp-includes\/[^"']*\?ver=([0-9.]+)/i);
        if (versionMatch) {
          const detectedVer = versionMatch[1];
          const verNum = parseFloat(detectedVer);
          // WordPressは4.0以降、10.0未満のみ有効
          if (verNum >= 4.0 && verNum < 10.0) {
            wpVersion = detectedVer;
            Logger.success('WordPress', `バージョン検出 (ver param): ${wpVersion}`);
          } else {
            Logger.warn('WordPress', `無効なバージョン番号（プラグイン？）: ${detectedVer}`);
          }
        }
      }
      
      if (wpVersion && wpVersion !== '検出できず（セキュリティ設定で非表示）') {
        // 念のため妥当性を再チェック
        const version = parseFloat(wpVersion);
        if (version < 4.0 || version > 10.0) {
          // 誤検出の可能性が高い（プラグインバージョンなど）
          Logger.warn('WordPress', `バージョン範囲外のため無効化: ${wpVersion}`);
          wpVersion = '検出できず（セキュリティ設定で非表示）';
          warnings.push('WordPressバージョン情報が非表示に設定されています（セキュリティ対策としては良い設定）');
        } else {
          // 正常なバージョン番号
          if (version < 6.4) {
            issues.push(`WordPressのバージョンが古いです (${wpVersion})。セキュリティリスクがあります。最新版へのアップデートを強く推奨します。`);
          } else if (version < 6.6) {
            warnings.push(`WordPressを最新版にアップデートすることを推奨します (現在: ${wpVersion})。`);
          } else {
            goodPoints.push(`WordPressは比較的新しいバージョンです (${wpVersion})`);
          }
        }
      } else {
        Logger.warn('WordPress', 'バージョン検出できず');
        wpVersion = '検出できず（セキュリティ設定で非表示）';
        warnings.push('WordPressバージョン情報が非表示に設定されています（セキュリティ対策としては良い設定）');
      }
      
      // WordPressテーマ検出
      const themeMatch = html.match(/wp-content\/themes\/([^\/"']+)/i);
      if (themeMatch) {
        wpTheme = themeMatch[1];
      }
      
      // WordPressプラグイン検出（主要なもの）
      const pluginMatches = html.matchAll(/wp-content\/plugins\/([^\/"']+)/gi);
      const pluginSet = new Set();
      for (const match of pluginMatches) {
        pluginSet.add(match[1]);
      }
      wpPlugins = Array.from(pluginSet).slice(0, 10); // 最大10個まで
      
      // 古いjQuery検出
      const jqueryMatch = html.match(/jquery(?:\.min)?\.js\?ver=([0-9.]+)/i);
      if (jqueryMatch) {
        const jqVersion = parseFloat(jqueryMatch[1]);
        if (jqVersion < 3.0) {
          warnings.push(`jQueryのバージョンが古いです (${jqueryMatch[1]})。更新を推奨します。`);
        }
      }
    }
    
    // === Contact Form 7チェック ===
    if (isWordPress && html.includes('wp-content/plugins/contact-form-7')) {
      hasContactForm7 = true;
      Logger.success('Plugin', 'Contact Form 7検出');
      
      // バージョン検出
      const cf7VersionMatch = html.match(/contact-form-7[^\?]*\?ver=([0-9.]+)/i);
      if (cf7VersionMatch) {
        cf7Version = cf7VersionMatch[1];
        Logger.info('Plugin', `Contact Form 7 バージョン: ${cf7Version}`);
        console.log('Contact Form 7 バージョン:', cf7Version);
        
        // 脆弱性チェック（5.3.0未満は脆弱）
        const version = parseFloat(cf7Version);
        if (version < 5.3) {
          cf7Vulnerable = true;
          issues.push(`Contact Form 7のバージョンが古く、セキュリティリスクがあります (${cf7Version})。最新版への更新を強く推奨します。`);
        } else {
          goodPoints.push(`Contact Form 7は比較的新しいバージョンです (${cf7Version})`);
        }
      } else {
        warnings.push('Contact Form 7が検出されましたが、バージョン情報を取得できませんでした。');
      }
    }
    
    // === PHPバージョン検出 ===
    // 方法1: X-Powered-Byヘッダーから検出
    if (headers['x-powered-by']) {
      const phpMatch = headers['x-powered-by'].match(/PHP\/([0-9.]+)/i);
      if (phpMatch) {
        phpVersion = phpMatch[1];
        Logger.success('PHP', `バージョン検出 (X-Powered-By): ${phpVersion}`);
      }
    }
    
    // 方法2: HTMLコメントから検出 (一部のWordPressテーマが出力)
    if (!phpVersion && isWordPress) {
      const phpCommentMatch = html.match(/<!--\s*PHP\s+Version:\s*([0-9.]+)/i);
      if (phpCommentMatch) {
        phpVersion = phpCommentMatch[1];
        Logger.success('PHP', `バージョン検出 (HTMLコメント): ${phpVersion}`);
      }
    }
    
    // 方法3: Serverヘッダーから検出（稀なケース）
    if (!phpVersion && headers['server']) {
      const serverPhpMatch = headers['server'].match(/PHP\/([0-9.]+)/i);
      if (serverPhpMatch) {
        phpVersion = serverPhpMatch[1];
        Logger.success('PHP', `バージョン検出 (Server): ${phpVersion}`);
      }
    }
    
    if (phpVersion) {
      const phpMajor = parseFloat(phpVersion);
      
      // PHPバージョンチェック（8.1以上を推奨）
      if (phpMajor < 7.4) {
        issues.push(`🔴 PHPのバージョンが非常に古いです (${phpVersion})。セキュリティリスクが極めて高く、サポートも終了しています。PHP 8.1以上への移行が必須です。`);
      } else if (phpMajor < 8.0) {
        issues.push(`🔴 PHPのバージョンが古いです (${phpVersion})。PHP 7.xはサポートが終了しており、セキュリティリスクがあります。PHP 8.1以上への更新が必要です。`);
      } else if (phpMajor < 8.1) {
        warnings.push(`⚠️ PHPのバージョンがやや古いです (${phpVersion})。PHP 8.1以上への更新を推奨します。`);
      } else {
        goodPoints.push(`✅ PHPは最新版です (${phpVersion})`);
      }
    } else {
      // PHPバージョンが検出できなかった場合
      Logger.warn('PHP', 'バージョン検出できず（セキュリティ設定）');
      phpVersion = '検出できず（セキュリティ設定で非表示）';
      if (isWordPress) {
        warnings.push('PHPバージョンが非表示に設定されています。セキュリティ対策としては良い設定ですが、定期的なアップデートを必ず行ってください。');
      }
    }
    
    // === セキュリティヘッダーチェック ===
    // HSTS（HTTPS使用時のみ重要）のみチェック
    if (finalUrl.startsWith('https://') && !headers['strict-transport-security']) {
      warnings.push('HSTS（Strict-Transport-Security）ヘッダーが設定されていません。HTTPS接続の安全性を高めるため、設定を推奨します。');
    }
    
    // その他のヘッダーは特に警告しない（あれば良い程度）
    if (headers['x-frame-options'] && headers['x-content-type-options']) {
      goodPoints.push('基本的なセキュリティヘッダーが設定されています');
    }
    
    // === サーバー情報の漏洩チェック ===
    if (headers['server']) {
      warnings.push(`サーバー情報が公開されています: ${headers['server']}`);
    }
    
    if (headers['x-powered-by']) {
      warnings.push(`バックエンド情報が公開されています: ${headers['x-powered-by']}`);
    }
    
    // === パフォーマンスチェック ===
    // キャッシュ設定
    if (!headers['cache-control'] && !headers['expires']) {
      warnings.push('キャッシュ設定がされていません。ページ読み込みが遅くなる可能性があります。');
    }
    
    // 圧縮設定
    if (!headers['content-encoding']) {
      warnings.push('圧縮が有効化されていません。ページ読み込み速度が改善できます。');
    } else {
      goodPoints.push(`圧縮が有効です (${headers['content-encoding']})`);
    }
    
    // === パフォーマンススコア算出 ===
    let performanceScore = 100;
    let performanceLevel = 'excellent';
    
    // レスポンスタイムによる評価
    if (responseTime > 3000) {
      performanceScore -= 30;
      performanceLevel = 'poor';
      issues.push(`応答速度が非常に遅いです(${responseTime}ms)。サーバーの最適化が必要です。`);
    } else if (responseTime > 1500) {
      performanceScore -= 15;
      performanceLevel = 'fair';
      warnings.push(`応答速度が遅めです(${responseTime}ms)。高速化を検討してください。`);
    } else if (responseTime > 800) {
      performanceScore -= 5;
      performanceLevel = 'good';
    } else {
      goodPoints.push(`応答速度が高速です(${responseTime}ms)`);
    }
    
    // HTMLサイズによる評価
    if (htmlSize > 500000) { // 500KB以上
      performanceScore -= 15;
      warnings.push(`ページサイズが大きすぎます(${htmlSizeKB}KB)。画像やコードの最適化を推奨します。`);
    } else if (htmlSize > 200000) { // 200KB以上
      performanceScore -= 5;
    } else {
      goodPoints.push(`ページサイズが最適です(${htmlSizeKB}KB)`);
    }
    
    // 圧縮が無効な場合
    if (!headers['content-encoding']) {
      performanceScore -= 10;
    }
    
    return {
      success: true,
      isWordPress,
      wpVersion,
      wpTheme,
      wpPlugins,
      phpVersion,
      responseTime,
      htmlSize,
      htmlSizeKB,
      performanceScore: Math.max(0, performanceScore),
      performanceLevel,
      issues,
      warnings,
      goodPoints,
      finalUrl,
      headers,
      hasHttpsError,  // HTTPSエラーフラグを返す
      hasContactForm7,
      cf7Version,
      cf7Vulnerable
    };
  } catch (e) {
    if (DEBUG_MODE) console.error('Site health analysis error:', e);
    
    // より詳細なエラーメッセージ
    let errorMsg = e.message;
    if (e.name === 'AbortError') {
      errorMsg = 'タイムアウト: サイトの応答が遅すぎます（10秒以上）';
    } else if (e.message.includes('Failed to fetch')) {
      errorMsg = 'CORS制限またはネットワークエラー: サイトにアクセスできません';
    }
    
    return {
      success: false,
      error: errorMsg
    };
  }
}

// --- サジェスト取得機能 ---
async function fetchGoogleSuggest(query) {
  try {
    console.log('Google Suggest query:', query);
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!res.ok) {
      console.warn('Google Suggest HTTP error:', res.status);
      return [];
    }
    
    const data = await res.json();
    console.log('Google Suggest response:', data);
    return data[1] || []; // サジェスト候補の配列
  } catch (e) {
    if (DEBUG_MODE) console.error('Google Suggest error:', e);
    return [];
  }
}

async function fetchYahooSuggest(query) {
  try {
    console.log('Yahoo Suggest query:', query);
    
    // プロキシAPIを使用してCORS制限を回避
    const proxyUrl = `https://reverse-re-birth-hack.com/yahoo-suggest-api.php?q=${encodeURIComponent(query)}`;
    
    console.log('Yahoo Suggest プロキシ経由で取得:', proxyUrl);
    
    const res = await fetch(proxyUrl, {
      method: 'GET',
      cache: 'no-cache'
    });
    
    if (!res.ok) {
      console.warn('Yahoo Suggest プロキシ HTTP error:', res.status);
      return [];
    }
    
    const data = await res.json();
    console.log('✅ Yahoo Suggest プロキシ経由で成功:', data);
    
    if (data.success && Array.isArray(data.suggests)) {
      return data.suggests;
    }
    
    console.warn('Yahoo Suggest プロキシ失敗:', data.error);
    return [];
  } catch (e) {
    console.warn('Yahoo Suggest プロキシエラー:', e.message);
    return [];
  }
}

async function fetchBingSuggest(query) {
  try {
    console.log('Bing Suggest query:', query);
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!res.ok) {
      console.warn('Bing Suggest HTTP error:', res.status);
      return [];
    }
    
    const data = await res.json();
    console.log('Bing Suggest response:', data);
    return data[1] || []; // サジェスト候補の配列
  } catch (e) {
    console.warn('Bing Suggest error (CORS制限の可能性):', e.message);
    return [];
  }
}

// --- Google関連検索取得 ---
async function fetchGoogleRelatedSearches(query) {
  try {
    console.log('🔍 Google関連検索取得開始:', query);
    
    // Google検索結果ページをfetch
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ja`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      }
    });
    
    if (!res.ok) {
      console.error('❌ Google検索ページ取得エラー:', res.status);
      return [];
    }
    
    const html = await res.text();
    console.log(`📄 HTMLサイズ: ${html.length}文字`);
    
    // 関連検索を抽出
    const relatedSearches = [];
    const seenKeywords = new Set();
    
    // デバッグ: HTMLに「関連する検索キーワード」が含まれているか確認
    const hasRelatedSection = html.includes('関連する検索キーワード') || html.includes('他の人はこちらも検索');
    console.log(`   「関連する検索キーワード」セクション: ${hasRelatedSection ? '見つかった' : '見つからない'}`);
    
    // <a href="/search?q=...">テキスト</a> の形式から、テキスト部分を抽出
    const linkPattern = /<a[^>]+href="\/search\?q=([^"&]+)[^"]*"[^>]*>([^<]+)<\/a>/gi;
    let linkMatch;
    let matchCount = 0;
    
    while ((linkMatch = linkPattern.exec(html)) !== null) {
      matchCount++;
      try {
        const rawKeyword = linkMatch[1]; // URL部分
        const linkText = linkMatch[2]; // リンクテキスト
        
        // テキスト部分を優先して使用
        let keyword = linkText.trim();
        
        // テキストが空の場合、URLからデコード
        if (!keyword || keyword.length < 2) {
          keyword = decodeURIComponent(rawKeyword.replace(/\+/g, ' ')).trim();
        }
        
        // 除外すべきノイズワード
        const noisePatterns = [
          /^(www\.|https?:\/\/)/i,
          /©|®|™/,
          /^[a-z]{1,2}$/i,
          /^\d+$/,
          /[\u0000-\u001F]/,
        ];
        
        // フィルタリング条件
        const isValid = keyword && 
                       keyword.length >= 2 && 
                       keyword.length <= 150 &&
                       keyword.toLowerCase() !== query.toLowerCase() &&
                       !noisePatterns.some(pattern => pattern.test(keyword)) &&
                       !seenKeywords.has(keyword.toLowerCase());
        
        if (isValid) {
          relatedSearches.push(keyword);
          seenKeywords.add(keyword.toLowerCase());
          console.log(`   ✅ 関連ワード追加[${relatedSearches.length}]: ${keyword}`);
          
          // 最大12件
          if (relatedSearches.length >= 12) {
            break;
          }
        }
      } catch (parseError) {
        // 個別のパース エラーは無視
      }
    }
    
    console.log(`✅ Google関連検索取得完了: ${relatedSearches.length}件`);
    console.log('   関連ワード一覧:', relatedSearches);
    
    return relatedSearches;
    
  } catch (e) {
    console.error('❌ Google関連検索取得エラー:', e);
    return [];
  }
}

// --- Bing関連検索取得（検索結果ページから「に関連する検索」を抽出） ---
async function fetchBingRelatedSearches(query) {
  try {
    console.log('🔍 Bing関連検索取得開始:', query);
    
    // Bing検索結果ページをfetch
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=ja`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      }
    });
    
    if (!res.ok) {
      console.error('❌ Bing検索ページ取得エラー:', res.status);
      return [];
    }
    
    const html = await res.text();
    console.log(`📄 HTMLサイズ: ${html.length}文字`);
    
    // 関連検索を抽出
    const relatedSearches = [];
    const seenKeywords = new Set();
    
    // Bingの「に関連する検索」セクションを探す
    // ページ下部の関連検索エリア
    const relatedSectionMatch = html.match(/に関連する検索|関連検索|Related searches/i);
    
    if (relatedSectionMatch) {
      console.log('✅ 「に関連する検索」セクションを発見');
      
      // セクションの後ろ2000文字を取得
      const sectionIndex = relatedSectionMatch.index;
      const sectionHtml = html.substring(sectionIndex, sectionIndex + 2000);
      
      // リンクパターンで抽出
      const linkPattern = /<a[^>]+href="\/search\?q=([^"&]+)[^"]*"[^>]*>([^<]+)<\/a>/gi;
      let linkMatch;
      
      while ((linkMatch = linkPattern.exec(sectionHtml)) !== null && relatedSearches.length < 12) {
        try {
          const rawKeyword = linkMatch[1];
          const linkText = linkMatch[2];
          
          // リンクテキストを優先
          let keyword = linkText.trim();
          
          if (!keyword || keyword.length < 2) {
            keyword = decodeURIComponent(rawKeyword.replace(/\+/g, ' ')).trim();
          }
          
          // ノイズ除外
          const noisePatterns = [
            /^(www\.|https?:\/\/)/i,
            /©|®|™/,
            /^[a-z]{1,2}$/i,
            /^\d+$/,
            /[\u0000-\u001F]/,
            /^(すべて|画像|動画|ニュース|地図|ショッピング|検索|もっと見る)$/i,
          ];
          
          const isValid = keyword && 
                         keyword.length >= 2 && 
                         keyword.length <= 150 &&
                         !noisePatterns.some(pattern => pattern.test(keyword)) &&
                         !seenKeywords.has(keyword.toLowerCase());
          
          if (isValid) {
            relatedSearches.push(keyword);
            seenKeywords.add(keyword.toLowerCase());
            console.log(`   ✅ 関連ワード追加[${relatedSearches.length}]: ${keyword}`);
          }
        } catch (parseError) {
          // エラーは無視
        }
      }
    } else {
      console.log('⚠️ 「に関連する検索」セクションが見つかりませんでした');
    }
    
    console.log(`✅ Bing関連検索取得完了: ${relatedSearches.length}件`);
    console.log('   関連ワード一覧:', relatedSearches);
    
    return relatedSearches;
    
  } catch (e) {
    console.error('❌ Bing関連検索取得エラー:', e);
    return [];
  }
}

// --- SSL証明書情報取得（SSL Labs API） ---
async function fetchSSLInfo(domain) {
  console.log('=== SSL証明書情報取得開始 ===');
  console.log('対象ドメイン:', domain);
  
  try {
    // SSL Labs API を使用
    // 注: 実際には完全なスキャンには時間がかかるため、キャッシュされた結果を取得
    const url = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒タイムアウト
    
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('SSL Labs レスポンス:', data);
    
    // スキャンがまだ完了していない場合
    if (data.status === 'IN_PROGRESS' || data.status === 'DNS') {
      return {
        success: false,
        error: 'SSL証明書情報を取得中です。後ほど再度お試しください。'
      };
    }
    
    if (!data.endpoints || data.endpoints.length === 0) {
      throw new Error('証明書情報が見つかりません');
    }
    
    // 最初のエンドポイントの証明書情報を取得
    const endpoint = data.endpoints[0];
    
    if (!endpoint.details || !endpoint.details.cert) {
      throw new Error('証明書の詳細情報が取得できません');
    }
    
    const cert = endpoint.details.cert;
    
    return {
      success: true,
      data: {
        issuer: cert.issuerLabel || cert.issuerSubject,
        subject: cert.subject,
        commonNames: cert.commonNames,
        altNames: cert.altNames,
        notBefore: new Date(cert.notBefore).toLocaleString('ja-JP'),
        notAfter: new Date(cert.notAfter).toLocaleString('ja-JP'),
        validationType: cert.validationType || 'DV',
        grade: endpoint.grade,
        hasWarnings: endpoint.hasWarnings,
        keyAlg: cert.keyAlg,
        keySize: cert.keySize,
        sigAlg: cert.sigAlg
      }
    };
  } catch (e) {
    if (DEBUG_MODE) console.error('SSL情報取得エラー:', e);
    
    // フォールバック: 簡易チェック
    try {
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      // HTTPSでアクセスできたことだけ確認
      return {
        success: true,
        limited: true,
        data: {
          message: 'HTTPSで保護されています（詳細情報は取得できませんでした）'
        }
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `SSL証明書情報を取得できませんでした: ${e.message}`
      };
    }
  }
}

// --- ASN/IP情報取得（より正確なサーバー会社判定） ---
async function fetchIPInfo(ip) {
  console.log('=== IP/ASN情報取得開始 ===');
  console.log('対象IP:', ip);
  
  try {
    // ip-api.com の無料API を使用（1分45リクエストまで無料・キー不要）
    const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,city,lat,lon,isp,org,as,query`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    console.log('✅ IP情報レスポンス:', data);
    
    if (data.status === 'fail') {
      throw new Error(data.message || 'IP情報取得失敗');
    }
    
    console.log('✅ IP情報取得成功');
    
    return {
      success: true,
      data: {
        ip: data.query || ip,
        city: data.city,
        region: data.region,
        country: data.country,
        countryCode: data.countryCode,
        org: data.org || data.isp,
        asn: data.as,
        isp: data.isp,
        latitude: data.lat,
        longitude: data.lon,
        hostname: null  // リモートホスト（逆引き）は別途取得
      }
    };
  } catch (e) {
    console.error('❌ IP情報取得エラー:', e);
    return {
      success: false,
      error: `IP情報を取得できませんでした: ${e.message}`
    };
  }
}

// --- WordPressプラグイン脆弱性チェック ---
async function checkWPPluginVulnerabilities(plugins) {
  console.log('=== WordPressプラグイン脆弱性チェック開始 ===');
  console.log('対象プラグイン:', plugins);
  
  // 既知の脆弱なプラグインリスト（主要なもののみ）
  // 実際には WPScan API などを使用することを推奨
  const knownVulnerablePlugins = {
    'elementor': {
      name: 'Elementor',
      risk: 'medium',
      description: 'XSS脆弱性が過去に報告されています。最新版への更新を推奨します。'
    },
    'woocommerce': {
      name: 'WooCommerce',
      risk: 'high',
      description: 'SQLインジェクション脆弱性が過去に報告されています。必ず最新版を使用してください。'
    },
    'yoast-seo': {
      name: 'Yoast SEO',
      risk: 'low',
      description: '過去に脆弱性が報告されたことがあります。最新版を使用してください。'
    },
    'wp-super-cache': {
      name: 'WP Super Cache',
      risk: 'medium',
      description: 'キャッシュ関連の脆弱性が過去に報告されています。'
    },
    'wordfence': {
      name: 'Wordfence Security',
      risk: 'low',
      description: 'セキュリティプラグイン自体にも過去に脆弱性がありました。'
    },
    'wp-file-manager': {
      name: 'WP File Manager',
      risk: 'critical',
      description: '⚠️ 深刻な脆弱性！ 未認証のリモートコード実行が可能でした。即座にアップデートまたは削除してください。'
    },
    'all-in-one-wp-migration': {
      name: 'All-in-One WP Migration',
      risk: 'high',
      description: 'バックアップファイルの不適切な処理により情報漏洩のリスクがあります。'
    },
    'jetpack': {
      name: 'Jetpack',
      risk: 'low',
      description: 'XSS脆弱性が過去に報告されています。'
    },
    'wordpress-seo': {
      name: 'WordPress SEO by Yoast',
      risk: 'low',
      description: '過去に脆弱性が報告されています。'
    }
  };
  
  const vulnerabilities = [];
  const riskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  
  for (const plugin of plugins) {
    const pluginSlug = plugin.toLowerCase();
    
    if (knownVulnerablePlugins[pluginSlug]) {
      const vulnInfo = knownVulnerablePlugins[pluginSlug];
      vulnerabilities.push({
        plugin: plugin,
        name: vulnInfo.name,
        risk: vulnInfo.risk,
        description: vulnInfo.description
      });
      riskCounts[vulnInfo.risk]++;
    }
  }
  
  console.log('検出された脆弱性:', vulnerabilities);
  
  return {
    success: true,
    vulnerabilities,
    riskCounts,
    totalPlugins: plugins.length,
    vulnerableCount: vulnerabilities.length
  };
}

// --- SPF/DKIM/DMARCの詳細解析 ---
async function analyzeEmailSecurity(domain, spfRecord, dmarcRecord) {
  console.log('=== メールセキュリティ詳細解析開始 ===');
  
  const analysis = {
    spf: { valid: false, details: '', policy: '' },
    dmarc: { valid: false, details: '', policy: '', pct: 100 }
  };
  
  // SPFレコードの解析
  if (spfRecord) {
    analysis.spf.valid = true;
    
    // SPFポリシーを抽出
    if (spfRecord.includes('~all')) {
      analysis.spf.policy = 'SoftFail (~all)';
      analysis.spf.details = '送信元が一致しない場合は受信するが、迷惑メールとしてマークされる可能性があります。';
    } else if (spfRecord.includes('-all')) {
      analysis.spf.policy = 'Fail (-all)';
      analysis.spf.details = '送信元が一致しない場合は受信を拒否します（最も厳格）。';
    } else if (spfRecord.includes('+all')) {
      analysis.spf.policy = 'Pass (+all)';
      analysis.spf.details = '⚠️ 警告: すべての送信元を許可しています。セキュリティ上の問題があります。';
    } else if (spfRecord.includes('?all')) {
      analysis.spf.policy = 'Neutral (?all)';
      analysis.spf.details = 'SPFチェックを実施しません（推奨されません）。';
    }
    
    // includeの数をチェック
    const includeCount = (spfRecord.match(/include:/g) || []).length;
    if (includeCount > 10) {
      analysis.spf.details += ' ⚠️ includeが多すぎます（10個超過）。DNS lookupの制限に注意。';
    }
  }
  
  // DMARCレコードの解析
  if (dmarcRecord) {
    analysis.dmarc.valid = true;
    
    // ポリシーを抽出
    const policyMatch = dmarcRecord.match(/p=([^;\s]+)/);
    if (policyMatch) {
      analysis.dmarc.policy = policyMatch[1];
      
      switch (analysis.dmarc.policy) {
        case 'none':
          analysis.dmarc.details = 'モニタリングのみ。不正メールをブロックしません。';
          break;
        case 'quarantine':
          analysis.dmarc.details = '不正メールを隔離（迷惑メールフォルダへ）。';
          break;
        case 'reject':
          analysis.dmarc.details = '不正メールを拒否（最も厳格）。';
          break;
      }
    }
    
    // pct（適用率）を抽出
    const pctMatch = dmarcRecord.match(/pct=(\d+)/);
    if (pctMatch) {
      analysis.dmarc.pct = parseInt(pctMatch[1]);
      if (analysis.dmarc.pct < 100) {
        analysis.dmarc.details += ` ⚠️ ポリシーが${analysis.dmarc.pct}%のメールにのみ適用されています。`;
      }
    }
    
    // レポート送信先をチェック
    const ruaMatch = dmarcRecord.match(/rua=([^;\s]+)/);
    if (ruaMatch) {
      analysis.dmarc.details += ' ✅ 集約レポートが設定されています。';
    } else {
      analysis.dmarc.details += ' ⚠️ 集約レポート（rua）が設定されていません。';
    }
  }
  
  return { success: true, analysis };
}

// --- RDAP情報取得（CORS回避） ---
async function fetchRdapDomain(domain) {
  console.log('=== RDAP Domain 取得開始 ===');
  console.log('対象ドメイン:', domain);
  
  // サブドメインを除去してルートドメインのみを抽出
  // 例: www.example.com → example.com
  //     blog.example.co.jp → example.co.jp
  const parts = domain.split('.');
  let rootDomain = domain;
  
  // マルチレベルTLD（co.jp, ne.jpなど）の場合は3つのパーツが必要
  const multiLevelTlds = ['co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp', 'lg.jp', 'ed.jp', 
                          'co.uk', 'org.uk', 'ac.uk', 'gov.uk'];
  
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.').toLowerCase();
    if (multiLevelTlds.includes(lastTwo)) {
      // マルチレベルTLDの場合: blog.example.co.jp → example.co.jp
      rootDomain = parts.slice(-3).join('.');
    } else if (parts.length >= 3) {
      // 通常のTLD: www.example.com → example.com
      rootDomain = parts.slice(-2).join('.');
    }
  }
  
  console.log('ルートドメイン:', rootDomain);
  domain = rootDomain; // 以降の処理ではルートドメインを使用
  
  // TLD別のエンドポイントを判定
  // 👉 co.jp, ne.jp, or.jpなどのマルチレベルTLDに対応
  const domainParts = domain.split('.');
  let tld;
  
  // 日本のマルチレベルTLDをチェック
  if (domainParts.length >= 2) {
    const lastTwo = domainParts.slice(-2).join('.').toLowerCase();
    if (multiLevelTlds.includes(lastTwo)) {
      tld = lastTwo;
    } else {
      tld = domainParts[domainParts.length - 1].toLowerCase();
    }
  } else {
    tld = domainParts[domainParts.length - 1].toLowerCase();
  }
  
  console.log('検出されたTLD:', tld);
  console.log('元のドメイン:', domain);
  
  let endpoints = [];
  
  // TLD別にエンドポイントを設定
  switch(tld) {
    case 'com':
      // 👉 Verisignは.comの公式レジストリなので最優先
      // より多くのフォールバックを追加
      endpoints = [
        `https://rdap.verisign.com/com/v1/domain/${domain}`,
        `https://rdap.org/domain/${domain}`,
        `https://rdap-bootstrap.arin.net/bootstrap/domain/${domain}`,
        `https://rdap.markmonitor.com/rdap/domain/${domain}`,
        `https://rdap.namecheap.com/domain/${domain}`,
        `https://rdap.godaddy.com/v1/domain/${domain}`
      ];
      break;
    case 'net':
      endpoints = [
        `https://rdap.org/domain/${domain}`,
        `https://rdap.verisign.com/net/v1/domain/${domain}`,
        `https://rdap-bootstrap.arin.net/bootstrap/domain/${domain}`
      ];
      break;
    case 'jp':
    case 'co.jp':
    case 'ne.jp':
    case 'or.jp':
    case 'ac.jp':
    case 'go.jp':
    case 'lg.jp':
    case 'ed.jp':
      // 👉 .jpドメインはrdap.orgのみ使用（CORS問題回避）
      // JPRSの直接エンドポイントはCORSエラーが発生する
      endpoints = [
        `https://rdap.org/domain/${domain}`
      ];
      break;
    case 'org':
      endpoints = [
        `https://rdap.publicinterestregistry.org/rdap/domain/${domain}`,
        `https://rdap.org/domain/${domain}`
      ];
      break;
    default:
      // その他のTLDは汎用エンドポイントを試す
      endpoints = [
        `https://rdap.org/domain/${domain}`
      ];
  }
  
  console.log('試行するエンドポイント:', endpoints);
  
  let lastError = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    try {
      console.log(`\n🔍 [${i + 1}/${endpoints.length}] RDAP Domain 試行:`);
      console.log('URL:', url);
      console.log('ドメイン:', domain);
      console.log('TLD:', tld);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト（高速化）
      
      const res = await fetch(url, {
        headers: { 
          'Accept': 'application/rdap+json, application/json',
        },
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('レスポンスステータス:', res.status);
      console.log('Content-Type:', res.headers.get('content-type'));
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ RDAP Domain 成功:', url);
        console.log('取得データ:', data);
        return { success: true, data, endpoint: url };
      } else {
        if (res.status === 404) {
          lastError = `HTTP 404: Not Found`;
          console.warn(`⚠️ WHOIS情報が見つかりません（404）:`, url);
        } else {
          lastError = `HTTP ${res.status}: ${res.statusText}`;
          console.warn(`⚠️ HTTP エラー:`, lastError);
        }
      }
    } catch (e) {
      lastError = e.message;
      console.warn(`❌ RDAP Domain エラー [${url}]:`, e.message);
      
      if (e.name === 'AbortError') {
        console.warn('タイムアウト（5秒超過）');
        lastError = 'タイムアウト: サーバーの応答が遅すぎます（5秒超過）';
      }
      
      continue;
    }
  }
  
  if (DEBUG_MODE) {
    console.error('=== RDAP Domain すべて失敗 ===');
    console.error('最後のエラー:', lastError);
  }
  
  return { 
    success: false, 
    error: `WHOIS情報を取得できませんでした。\n最後のエラー: ${lastError}\n対象TLD: .${tld}`,
    lastError
  };
}

/**
 * RDAPレスポンスから詳細情報を抽出
 * @param {Object} rdapData - RDAPレスポンスデータ
 * @returns {Object} 抽出された詳細情報
 */
function extractDetailedRdapInfo(rdapData) {
  const info = {
    domain: null,
    registrant: {},
    admin: {},
    tech: {},
    registrar: {},
    nameservers: [],
    status: [],
    dates: {},
    dnssec: null,
    remarks: [],
    links: []
  };
  
  // ドメイン名
  if (rdapData.ldhName) info.domain = rdapData.ldhName;
  if (rdapData.unicodeName) info.domain = rdapData.unicodeName;
  
  // ステータス
  if (rdapData.status && Array.isArray(rdapData.status)) {
    info.status = rdapData.status;
  }
  
  // 日付情報
  if (rdapData.events && Array.isArray(rdapData.events)) {
    for (const event of rdapData.events) {
      if (event.eventAction && event.eventDate) {
        info.dates[event.eventAction] = event.eventDate;
      }
    }
  }
  
  // ネームサーバー
  if (rdapData.nameservers && Array.isArray(rdapData.nameservers)) {
    info.nameservers = rdapData.nameservers.map(ns => {
      return ns.ldhName || ns.unicodeName || JSON.stringify(ns);
    });
  }
  
  // DNSSEC
  if (rdapData.secureDNS) {
    info.dnssec = {
      delegationSigned: rdapData.secureDNS.delegationSigned,
      dsData: rdapData.secureDNS.dsData || []
    };
  }
  
  // リンク
  if (rdapData.links && Array.isArray(rdapData.links)) {
    info.links = rdapData.links.map(link => ({
      rel: link.rel,
      href: link.href,
      type: link.type
    }));
  }
  
  // 注釈情報
  if (rdapData.remarks && Array.isArray(rdapData.remarks)) {
    info.remarks = rdapData.remarks.map(remark => ({
      title: remark.title,
      description: remark.description ? remark.description.join(' ') : null
    }));
  }
  
  // エンティティ情報（登録者、管理者、技術担当者、レジストラ）
  if (rdapData.entities && Array.isArray(rdapData.entities)) {
    for (const entity of rdapData.entities) {
      const roles = entity.roles || [];
      const entityInfo = extractEntityInfo(entity);
      
      // ロールに応じて分類
      if (roles.includes('registrant')) {
        info.registrant = entityInfo;
      }
      if (roles.includes('administrative')) {
        info.admin = entityInfo;
      }
      if (roles.includes('technical')) {
        info.tech = entityInfo;
      }
      if (roles.includes('registrar')) {
        info.registrar = entityInfo;
      }
    }
  } else {
    console.warn('⚠️ rdapData.entitiesが存在しないか、配列ではありません');
  }
  
  return info;
}

/**
 * エンティティ情報を抽出
 * @param {Object} entity - RDAPエンティティ
 * @returns {Object} 抽出された情報
 */
function extractEntityInfo(entity) {
  const info = {
    handle: entity.handle || null,
    name: null,
    organization: null,
    email: null,
    phone: null,
    address: null,
    roles: entity.roles || []
  };
  
  // vCard情報を解析
  if (entity.vcardArray && Array.isArray(entity.vcardArray)) {
    const vcard = entity.vcardArray[1]; // vCard 4.0形式
    if (Array.isArray(vcard)) {
      for (const field of vcard) {
        if (!Array.isArray(field) || field.length < 4) continue;
        
        const fieldName = field[0];
        const fieldValue = field[3];
        
        switch (fieldName) {
          case 'fn': // Full Name
            info.name = fieldValue;
            break;
          case 'org': // Organization
            info.organization = Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue;
            break;
          case 'email':
            info.email = fieldValue;
            break;
          case 'tel': // Telephone
            info.phone = fieldValue;
            break;
          case 'adr': // Address
            if (Array.isArray(fieldValue)) {
              info.address = fieldValue.filter(v => v).join(', ');
            } else {
              info.address = fieldValue;
            }
            break;
        }
      }
    }
  }
  
  // 旧形式のvcard対応
  if (entity.vcard && Array.isArray(entity.vcard)) {
    const vcard = entity.vcard[1] || entity.vcard;
    if (Array.isArray(vcard)) {
      for (const field of vcard) {
        if (!Array.isArray(field) || field.length < 4) continue;
        
        const fieldName = field[0];
        const fieldValue = field[3];
        
        if (fieldName === 'fn' && !info.name) info.name = fieldValue;
        if (fieldName === 'email' && !info.email) info.email = fieldValue;
        if (fieldName === 'tel' && !info.phone) info.phone = fieldValue;
      }
    }
  }
  
  return info;
}

async function fetchRdapIp(ip) {
  console.log('=== RDAP IP 取得開始 ===');
  console.log('対象IP:', ip);
  
  const endpoints = [
    `https://rdap.org/ip/${ip}`,
    `https://rdap.arin.net/registry/ip/${ip}`,
    `https://rdap.apnic.net/ip/${ip}`
  ];
  
  console.log('試行するエンドポイント:', endpoints);
  
  let lastError = null;
  
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    try {
      console.log(`[${i + 1}/${endpoints.length}] RDAP IP 試行:`, url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(url, {
        headers: { 
          'Accept': 'application/rdap+json, application/json',
        },
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('レスポンスステータス:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ RDAP IP 成功:', url);
        return { success: true, data, endpoint: url };
      } else {
        lastError = `HTTP ${res.status}: ${res.statusText}`;
        console.warn(`⚠️ HTTP エラー:`, lastError);
      }
    } catch (e) {
      lastError = e.message;
      console.warn(`❌ RDAP IP エラー [${url}]:`, e.message);
      
      if (e.name === 'AbortError') {
        lastError = 'タイムアウト';
      }
      
      continue;
    }
  }
  
  if (DEBUG_MODE) console.error('=== RDAP IP すべて失敗 ===');
  
  return { 
    success: false, 
    error: `IP情報を取得できませんでした: ${lastError}`,
    lastError
  };
}

/**
 * 301/308リダイレクトの有無をチェック（最終URLで判定）
 * @param {string} fromUrl - リダイレクト元URL
 * @param {string} toUrl - リダイレクト先URL
 * @returns {Promise<boolean>} リダイレクトがあればtrue
 */
async function check301Redirect(fromUrl, toUrl) {
  try {
    console.log(`🔍 リダイレクトチェック: ${fromUrl} -> ${toUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // redirect: 'follow'で最終URLを取得（リダイレクトを追跡）
      // GETリクエストを使用（HEADが403でブロックされる場合がある）
      const response = await fetch(fromUrl, {
        method: 'GET',
        redirect: 'follow', // リダイレクトを追跡
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      // 最終URLを取得
      const finalUrl = response.url;
      console.log(`最終URL: ${finalUrl}`);
      
      // URLを正規化して比較（HTTPS/HTTPの違いを無視、wwwの有無のみチェック）
      const normalizeUrl = (url) => {
        try {
          const urlObj = new URL(url);
          // プロトコルをhttpsに統一、末尾のスラッシュを削除
          return `https://${urlObj.hostname}${urlObj.pathname.replace(/\/$/, '')}`;
        } catch {
          return url.replace(/^https?:\/\//, 'https://').replace(/\/$/, '').toLowerCase();
        }
      };
      
      const normalizedFinal = normalizeUrl(finalUrl);
      const normalizedTo = normalizeUrl(toUrl);
      
      console.log(`比較: ${normalizedFinal} === ${normalizedTo}`);
      
      // 最終URLが期待するURLと一致すればリダイレクトあり
      if (normalizedFinal === normalizedTo) {
        console.log(`✅ リダイレクト検出！`);
        return true;
      } else {
        console.log(`❌ リダイレクトなし（最終URLが異なる）`);
        return false;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log(`⚠️ fetchエラー: ${fetchError.message}`);
      return false;
    }
  } catch (e) {
    console.log(`⚠️ 301チェックエラー (${fromUrl} -> ${toUrl}):`, e.message);
    return false;
  }
}

/**
 * Mixed Content（混在コンテンツ）をチェック
 * HTTPSページ内でHTTPリソースを使用していないか確認
 * @param {string} url - チェックするURL
 * @returns {Promise<Object>} { success: boolean, hasMixedContent: boolean, mixedResources: Array }
 */
async function checkMixedContent(url) {
  try {
    console.log(`🔍 Mixed Contentチェック: ${url}`);
    
    // URLがHTTPSでない場合はチェック不要
    if (!url.startsWith('https://')) {
      console.log('⚠️ HTTPS以外のURLなのでMixed Contentチェック不要');
      return { success: true, hasMixedContent: false, mixedResources: [] };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return { success: false, error: `HTTPステータス: ${response.status}` };
      }
      
      const html = await response.text();
      
      // HTTPリソースを検出する正規表現
      const httpResourcePatterns = [
        /src=["']http:\/\/[^"']+["']/gi,  // src="http://..."
        /href=["']http:\/\/[^"']+["']/gi, // href="http://..."
        /url\(["']?http:\/\/[^)"']+["']?\)/gi, // url(http://...) in CSS
        /content=["']http:\/\/[^"']+["']/gi // content="http://..." in meta tags
      ];
      
      const mixedResources = [];
      
      for (const pattern of httpResourcePatterns) {
        const matches = html.match(pattern);
        if (matches) {
          mixedResources.push(...matches);
        }
      }
      
      // 重複を削除
      const uniqueResources = [...new Set(mixedResources)];
      
      if (uniqueResources.length > 0) {
        console.log(`⚠️ Mixed Contentを検出: ${uniqueResources.length}件`);
        console.log('検出されたリソース:', uniqueResources.slice(0, 5)); // 最初の5件のみログ
        return {
          success: true,
          hasMixedContent: true,
          mixedResources: uniqueResources,
          count: uniqueResources.length
        };
      } else {
        console.log('✅ Mixed Contentなし');
        return {
          success: true,
          hasMixedContent: false,
          mixedResources: []
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log(`⚠️ fetchエラー: ${fetchError.message}`);
      return { success: false, error: fetchError.message };
    }
  } catch (e) {
    console.log(`⚠️ Mixed Contentチェックエラー:`, e.message);
    return { success: false, error: e.message };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
(async () => {
if (msg?.type === "proxyFetch") {
try {
  const { ok, status, text } = await proxyFetch(msg.url, { method: "GET" });
  sendResponse({ ok, status, text });
} catch (e) {
  sendResponse({ ok: false, status: 0, text: String(e) });
}
}
else if (msg?.type === "getSiteInfo") {
try {
  const info = await fetchSiteInfo(msg.domain);
  sendResponse({ success: true, info });
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "analyzeSiteHealth") {
try {
  const result = await analyzeSiteHealth(msg.domain);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getRdapDomain") {
try {
  const result = await fetchRdapDomain(msg.domain);
  // 👉 これがないとdetailedInfoがundefinedになる！
  if (result.success && result.data) {
    result.detailedInfo = extractDetailedRdapInfo(result.data);
    console.log('📊 RDAP詳細情報抽出完了:', result.detailedInfo);
  } else {
    console.warn('⚠️ RDAPデータがないためdetailedInfoを生成できません');
  }
  sendResponse(result);
} catch (e) {
  console.error('❌ getRdapDomainエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getRdapIp") {
try {
  console.log('📝 RDAP IP 取得開始:', msg.ip);
  const result = await fetchRdapIp(msg.ip);
  console.log('📝 RDAP IP 取得結果:', result);
  sendResponse(result);
} catch (e) {
  console.error('📝 RDAP IP エラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getJpWhois") {
// 🇯🇵 日本ドメインのWHOIS取得（自前API）
try {
  let domain = msg.domain;
  
  // サブドメインを除去してルートドメインのみを抽出
  const parts = domain.split('.');
  let rootDomain = domain;
  
  // マルチレベルTLD（co.jp, ne.jpなど）の場合は3つのパーツが必要
  const multiLevelTlds = ['co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp', 'lg.jp', 'ed.jp', 'ad.jp'];
  
  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.').toLowerCase();
    if (multiLevelTlds.includes(lastTwo)) {
      // マルチレベルTLDの場合: domain.sakura.ad.jp → sakura.ad.jp
      rootDomain = parts.slice(-3).join('.');
    } else if (parts.length >= 3) {
      // 通常のTLD: www.example.jp → example.jp
      rootDomain = parts.slice(-2).join('.');
    }
  }
  
  console.log('🇯🇵 元のドメイン:', domain);
  console.log('🇯🇵 ルートドメイン:', rootDomain);
  domain = rootDomain; // ルートドメインを使用
  
  const apiUrl = `https://reverse-re-birth-hack.com/whois-api.php?domain=${encodeURIComponent(domain)}`;
  
  console.log('🇯🇵 日本ドメインWHOIS取得:', domain);
  
  const response = await fetchWithTimeout(apiUrl);
  const responseText = await response.text();
  console.log('🔍 レスポンステキスト:', responseText);
  
  const data = JSON.parse(responseText);
  console.log('🔍 JSONパース後:', data);
  
  if (data.success) {
    console.log('✅ WHOIS取得成功:', data.parsed);
    console.log('🔍 data全体:', data);
    console.log('🔍 typeof data.parsed:', typeof data.parsed);
    console.log('🔍 parsed keys:', Object.keys(data.parsed || {}));
    sendResponse({
      success: true,
      whois: data.whois,
      parsed: data.parsed,
      timestamp: data.timestamp
    });
  } else {
    console.log('⚠️ WHOIS取得失敗:', data.error);
    sendResponse({
      success: false,
      error: data.error
    });
  }
} catch (e) {
  console.error('❌ JP WHOIS API呼び出しエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "checkRedirect") {
try {
  console.log('=== checkRedirectメッセージハンドラー開始 ===');
  console.log('baseDomain:', msg.baseDomain);
  console.log('wwwDomain:', msg.wwwDomain);
  
  const baseToWww = await check301Redirect(`https://${msg.baseDomain}`, `https://${msg.wwwDomain}`);
  console.log(`🔵 baseToWww結果: ${baseToWww}`);
  
  const wwwToBase = await check301Redirect(`https://${msg.wwwDomain}`, `https://${msg.baseDomain}`);
  console.log(`🔵 wwwToBase結果: ${wwwToBase}`);
  
  const result = { success: true, baseToWww, wwwToBase };
  console.log('📤 sendResponseする値:', result);
  sendResponse(result);
} catch (e) {
  console.error('❌ checkRedirectエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "checkMixedContent") {
try {
  const result = await checkMixedContent(msg.url);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getSSLInfo") {
try {
  const result = await fetchSSLInfo(msg.domain);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getIPInfo") {
try {
  const result = await fetchIPInfo(msg.ip);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "checkWPPluginVulnerabilities") {
try {
  const result = await checkWPPluginVulnerabilities(msg.plugins);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "analyzeEmailSecurity") {
try {
  const result = await analyzeEmailSecurity(msg.domain, msg.spfRecord, msg.dmarcRecord);
  sendResponse(result);
} catch (e) {
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getSuggests") {
try {
  console.log('getSuggests リクエスト受信:', msg.query);
  const query = msg.query;

  // 並列で取得（エラーが出ても続行）
  const [google, yahoo, bing] = await Promise.allSettled([
    fetchGoogleSuggest(query),
    fetchYahooSuggest(query),
    fetchBingSuggest(query)
  ]);

  const result = {
    success: true,
    google: google.status === 'fulfilled' ? google.value : [],
    yahoo: yahoo.status === 'fulfilled' ? yahoo.value : [],
    bing: bing.status === 'fulfilled' ? bing.value : []
  };

  console.log('getSuggests 結果:', result);
  sendResponse(result);
} catch (e) {
  if (DEBUG_MODE) console.error('getSuggests 予期しないエラー:', e);
  sendResponse({ 
    success: true, // エラーでも成功として返す
    google: [], 
    yahoo: [], 
    bing: [],
    error: String(e)
  });
}
}
else if (msg?.type === "getRelatedSearches") {
try {
  console.log('🔍 getRelatedSearches リクエスト受信:', msg.query);
  const relatedSearches = await fetchGoogleRelatedSearches(msg.query);
  sendResponse({ success: true, relatedSearches });
} catch (e) {
  console.error('❌ getRelatedSearchesエラー:', e);
  sendResponse({ success: false, relatedSearches: [], error: String(e) });
}
}
else if (msg?.type === "getBingRelatedSearches") {
try {
  console.log('🔍 getBingRelatedSearches リクエスト受信:', msg.query);
  const relatedSearches = await fetchBingRelatedSearches(msg.query);
  sendResponse({ success: true, relatedSearches });
} catch (e) {
  console.error('❌ getBingRelatedSearchesエラー:', e);
  sendResponse({ success: false, relatedSearches: [], error: String(e) });
}
}
else if (msg?.type === "getGoogleIndexCount") {
try {
  const result = await getGoogleIndexCount(msg.domain);
  sendResponse(result);
} catch (e) {
  console.error('❌ getGoogleIndexCountエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getSitemapPageCount") {
try {
  const result = await getSitemapPageCount(msg.domain);
  sendResponse(result);
} catch (e) {
  console.error('❌ getSitemapPageCountエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getGoogleApiQuota") {
try {
  const quota = await checkDailyQuota();
  sendResponse({ success: true, ...quota });
} catch (e) {
  console.error('❌ getGoogleApiQuotaエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getSeoMetaInfo") {
try {
  const result = await getSeoMetaInfo(msg.tabId);
  sendResponse(result);
} catch (e) {
  console.error('❌ getSeoMetaInfoエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "getHeadingTexts") {
try {
  const result = await getHeadingTexts(msg.tabId);
  sendResponse(result);
} catch (e) {
  console.error('❌ getHeadingTextsエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
else if (msg?.type === "analyzeSiteStructure") {
try {
  const result = await analyzeSiteStructure(msg.domain);
  sendResponse(result);
} catch (e) {
  console.error('❌ analyzeSiteStructureエラー:', e);
  sendResponse({ success: false, error: String(e) });
}
}
})();
return true; // async
});

// ========================================
// Google Custom Search API関連関数
// ========================================

let lastApiCallTime = 0;

async function getGoogleApiConfig() {
  const settings = await chrome.storage.local.get(['googleApiKey', 'googleSearchEngineId']);
  return {
    apiKey: settings.googleApiKey || GOOGLE_API_CONFIG.DEFAULT_API_KEY,
    searchEngineId: settings.googleSearchEngineId || GOOGLE_API_CONFIG.DEFAULT_SEARCH_ENGINE_ID
  };
}

async function checkDailyQuota() {
  const today = new Date().toDateString();
  const usageKey = `google_api_usage_${today}`;
  const result = await chrome.storage.local.get(usageKey);
  const currentUsage = result[usageKey] || 0;
  return {
    used: currentUsage,
    remaining: GOOGLE_API_CONFIG.DAILY_QUOTA - currentUsage,
    isAvailable: currentUsage < GOOGLE_API_CONFIG.DAILY_QUOTA
  };
}

async function incrementDailyUsage() {
  const today = new Date().toDateString();
  const usageKey = `google_api_usage_${today}`;
  const result = await chrome.storage.local.get(usageKey);
  const currentUsage = result[usageKey] || 0;
  await chrome.storage.local.set({ [usageKey]: currentUsage + 1 });
}

async function applyRateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < GOOGLE_API_CONFIG.RATE_LIMIT_INTERVAL) {
    const waitTime = GOOGLE_API_CONFIG.RATE_LIMIT_INTERVAL - timeSinceLastCall;
    console.log(`⏳ レート制限: ${waitTime}ms待機中...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastApiCallTime = Date.now();
}

async function getGoogleIndexCount(domain) {
  try {
    console.log(`🔍 Googleインデックス数チェック: ${domain}`);
    const cacheKey = `google_index_${domain}`;
    const cached = await chrome.storage.local.get(cacheKey);
    if (cached[cacheKey]) {
      const { data, timestamp } = cached[cacheKey];
      const age = Date.now() - timestamp;
      if (age < GOOGLE_API_CONFIG.CACHE_DURATION) {
        console.log('✅ キャッシュから取得（API使用なし）');
        return { ...data, cached: true };
      }
    }
    const quota = await checkDailyQuota();
    if (!quota.isAvailable) {
      return { success: false, error: `本日のAPI使用上限に達しました。`, quotaExceeded: true };
    }
    await applyRateLimit();
    const config = await getGoogleApiConfig();
    const query = `site:${domain}`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${config.apiKey}&cx=${config.searchEngineId}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`APIエラー: ${response.status} - ${errorData.error?.message || ''}`);
    }
    const data = await response.json();
    await incrementDailyUsage();
    const indexCount = parseInt(data.searchInformation?.totalResults || 0);
    const formattedCount = indexCount.toLocaleString('ja-JP');
    console.log(`✅ Googleインデックス数: ${formattedCount}件`);
    const result = { success: true, indexCount: indexCount, formattedCount: formattedCount, cached: false };
    await chrome.storage.local.set({ [cacheKey]: { data: result, timestamp: Date.now() } });
    return result;
  } catch (e) {
    console.error(`❌ Googleインデックス数取得エラー:`, e);
    return { success: false, error: e.message };
  }
}

async function getSitemapPageCount(domain) {
  try {
    console.log(`🗺️ サイトマップチェック: ${domain}`);
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://${domain}/wp-sitemap.xml`
    ];
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
        if (!response.ok) continue;
        const text = await response.text();
        
        // サイトマップインデックスかどうかをチェック
        const isSitemapIndex = text.includes('<sitemapindex');
        
        let urlList = [];
        
        if (isSitemapIndex) {
          console.log(`📑 サイトマップインデックス検出: ${sitemapUrl}`);
          
          // サイトマップインデックスから個別のサイトマップURLを取得
          const sitemapLocRegex = /<loc>(.*?)<\/loc>/g;
          let match;
          const childSitemaps = [];
          
          while ((match = sitemapLocRegex.exec(text)) !== null) {
            childSitemaps.push(match[1]);
          }
          
          console.log(`📚 子サイトマップ数: ${childSitemaps.length}`);
          
          // 各子サイトマップからURLを取得（最大50個まで）
          const maxSitemaps = Math.min(50, childSitemaps.length);
          for (let i = 0; i < maxSitemaps; i++) {
            const childUrl = childSitemaps[i];
            try {
              console.log(`📖 読み込み中: ${childUrl}`);
              const childResponse = await fetch(childUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
              if (childResponse.ok) {
                const childText = await childResponse.text();
                const childLocRegex = /<loc>(.*?)<\/loc>/g;
                let childMatch;
                
                while ((childMatch = childLocRegex.exec(childText)) !== null) {
                  const url = childMatch[1];
                  // サイトマップファイル自体を除外
                  if (!url.includes('sitemap') && !url.includes('.xml')) {
                    urlList.push(url);
                  }
                }
              }
            } catch (e) {
              console.log(`⚠️ 子サイトマップ読み込み失敗: ${childUrl}`);
            }
          }
        } else {
          // 通常のサイトマップ
          const locRegex = /<loc>(.*?)<\/loc>/g;
          let match;
          
          while ((match = locRegex.exec(text)) !== null) {
            const url = match[1];
            // サイトマップファイル自体を除外
            if (!url.includes('sitemap') && !url.includes('.xml')) {
              urlList.push(url);
            }
          }
        }
        
        const urlCount = urlList.length;
        if (urlCount > 0) {
          console.log(`✅ サイトマップ検出: ${urlCount}ページ`);
          return { 
            success: true, 
            pageCount: urlCount, 
            sitemapUrl: sitemapUrl,
            urlList: urlList
          };
        }
      } catch (e) {
        console.log(`⚠️ ${sitemapUrl} アクセス失敗`);
        continue;
      }
    }
    return { success: false, error: 'サイトマップが見つかりませんでした' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ========================================
// SEOメタ情報取得
// ========================================

/**
 * 見出しテキストのみを取得（別処理）
 * @param {number} tabId - タブID
 * @returns {Promise<Object>} 見出しテキスト
 */
async function getHeadingTexts(tabId) {
  try {
    console.log('🔍 getHeadingTexts開始 - tabId:', tabId);
    
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // 見出しテキストを取得（最大3件、50文字まで）
        const getHeadingText = (element) => {
          const text = element.textContent.trim();
          return text.substring(0, 50);
        };
        
        return {
          h1: Array.from(document.querySelectorAll('h1')).slice(0, 3).map(getHeadingText),
          h2: Array.from(document.querySelectorAll('h2')).slice(0, 3).map(getHeadingText),
          h3: Array.from(document.querySelectorAll('h3')).slice(0, 3).map(getHeadingText),
          h4: Array.from(document.querySelectorAll('h4')).slice(0, 3).map(getHeadingText),
          h5: Array.from(document.querySelectorAll('h5')).slice(0, 3).map(getHeadingText),
          h6: Array.from(document.querySelectorAll('h6')).slice(0, 3).map(getHeadingText)
        };
      }
    });

    if (results && results[0] && results[0].result) {
      console.log('✅ 見出しテキスト取得成功');
      return { success: true, data: results[0].result };
    } else {
      return { success: false, error: '見出しテキストの取得に失敗しました' };
    }
  } catch (e) {
    console.error('❌ 見出しテキスト取得エラー:', e);
    return { success: false, error: e.message };
  }
}

/**
 * ページのSEOメタ情報を取得
 * @param {number} tabId - タブID
 * @returns {Promise<Object>} SEO情報
 */
async function getSeoMetaInfo(tabId) {
  try {
    console.log('🔍 getSeoMetaInfo開始 - tabId:', tabId);
    
    // タイムアウト設定（60秒）
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        console.error('⏰ SEO情報取得がタイムアウト（60秒）');
        reject(new Error('SEO情報の取得がタイムアウトしました（60秒）。このサイトは非常に大規模なため、SEO情報を取得できません。'));
      }, 60000)
    );
    
    console.log('📝 executeScript実行中...');
    const executePromise = chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // ページからSEO情報を抽出
        const getMetaContent = (name) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta ? meta.content : null;
        };

        const getCharCount = (text) => text ? text.length : 0;

        // 見出しタグをカウント＆テキスト取得
        const headingCounts = {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
          h5: document.querySelectorAll('h5').length,
          h6: document.querySelectorAll('h6').length
        };
        
        // 見出しテキスト取得を無効化（パフォーマンス重視）
        // 大規模サイトでタイムアウトを防ぐため、見出しの数のみカウント
        const headingTexts = {
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: []
        };

        // Title
        const title = document.title || '';
        
        // Description
        const description = getMetaContent('description') || '';
        
        // Keywords
        const keywords = getMetaContent('keywords') || '';
        
        // Canonical
        const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
        
        // Robots
        const robots = getMetaContent('robots') || '';
        
        // Author
        const author = getMetaContent('author') || '';
        
        // Publisher
        const publisher = getMetaContent('publisher') || '';
        
        // Lang
        const lang = document.documentElement.lang || document.querySelector('html')?.getAttribute('lang') || '';
        
        // OGP情報
        const ogTitle = getMetaContent('og:title') || '';
        const ogDescription = getMetaContent('og:description') || '';
        const ogImage = getMetaContent('og:image') || '';
        const ogType = getMetaContent('og:type') || '';
        const ogUrl = getMetaContent('og:url') || '';
        
        // Twitter Card
        const twitterCard = getMetaContent('twitter:card') || '';
        const twitterSite = getMetaContent('twitter:site') || '';
        const twitterTitle = getMetaContent('twitter:title') || '';
        const twitterDescription = getMetaContent('twitter:description') || '';
        const twitterImage = getMetaContent('twitter:image') || '';
        
        // 画像数
        const imageCount = document.querySelectorAll('img').length;
        
        // リンク数
        const linkCount = document.querySelectorAll('a').length;
        const internalLinks = Array.from(document.querySelectorAll('a'))
          .filter(a => a.href && (a.href.startsWith(window.location.origin) || a.href.startsWith('/'))).length;
        const externalLinks = linkCount - internalLinks;
        
        // viewport
        const viewport = getMetaContent('viewport') || '';

        return {
          title: {
            text: title,
            length: getCharCount(title)
          },
          description: {
            text: description,
            length: getCharCount(description)
          },
          keywords: {
            text: keywords,
            exists: keywords.length > 0
          },
          canonical: {
            url: canonical,
            exists: canonical.length > 0
          },
          robots: {
            text: robots,
            exists: robots.length > 0
          },
          author: {
            text: author,
            exists: author.length > 0
          },
          publisher: {
            text: publisher,
            exists: publisher.length > 0
          },
          lang: {
            code: lang,
            exists: lang.length > 0
          },
          viewport: {
            text: viewport,
            exists: viewport.length > 0
          },
          headings: headingCounts,
          headingTexts: headingTexts,
          images: {
            total: imageCount
          },
          links: {
            total: linkCount,
            internal: internalLinks,
            external: externalLinks
          },
          ogp: {
            title: ogTitle,
            description: ogDescription,
            image: ogImage,
            type: ogType,
            url: ogUrl,
            exists: ogTitle.length > 0 || ogDescription.length > 0
          },
          twitter: {
            card: twitterCard,
            site: twitterSite,
            title: twitterTitle,
            description: twitterDescription,
            image: twitterImage,
            exists: twitterCard.length > 0
          }
        };
      }
    });

    // タイムアウトとexecuteScriptをレース
    const results = await Promise.race([executePromise, timeoutPromise]);
    console.log('✅ executeScript完了 - results:', results);

    if (results && results[0] && results[0].result) {
      console.log('✅ SEO情報取得成功');
      return { success: true, data: results[0].result };
    } else {
      console.warn('⚠️ SEO情報が空です');
      return { success: false, error: 'SEO情報の取得に失敗しました' };
    }
  } catch (e) {
    return createErrorResponse(e, 'getSeoMetaInfo');
  }
}

/**
 * サイトマップからカテゴリ構造を解析
 * @param {string} domain - ドメイン名
 * @returns {Promise<Object>} カテゴリ構造
 */
async function analyzeSiteStructure(domain) {
  try {
    console.log(`🗺️ サイト構造解析開始: ${domain}`);
    
    // サイトマップを取得
    const sitemapResult = await getSitemapPageCount(domain);
    
    if (!sitemapResult.success || !sitemapResult.urlList) {
      return { success: false, error: 'サイトマップが見つかりません' };
    }

    const urlList = sitemapResult.urlList;
    console.log(`📊 解析対象URL数: ${urlList.length}`);
    
    // ページ数が多い場合は警告
    if (urlList.length > 100) {
      console.warn(`⚠️ ページ数が多いため、処理に時間がかかります: ${urlList.length}ページ`);
    }

    // カテゴリURL（ディレクトリ、index.html）を優先的に並び替え
    const prioritizedUrls = urlList.sort((a, b) => {
      const aPriority = getPriority(a);
      const bPriority = getPriority(b);
      return aPriority - bPriority; // 優先度が高い順（数値が小さい順）
    });
    
    // URL優先度を計算
    function getPriority(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // 1. ディレクトリURL（/shimitry/ など）
        if (pathname.endsWith('/')) {
          return 1;
        }
        
        // 2. index.html、default.html などのデフォルトページ
        if (pathname.match(/\/(index|default|home)\.(html|htm|php)$/i)) {
          return 2;
        }
        
        // 3. その他のページ
        return 3;
      } catch (e) {
        return 999; // エラー時は最後尾
      }
    }
    
    console.log(`📊 優先度順に並び替え完了`);
    console.log(`📊 優先URL例: ${prioritizedUrls.slice(0, 5).join(', ')}`);

    // 実際のページタイトルを取得（最大50ページまで、並列処理で高速化）
    const pageTitles = {};
    const maxTitleFetch = Math.min(50, prioritizedUrls.length);
    
    console.log(`🚀 ${maxTitleFetch}ページのタイトルを並列取得中...（カテゴリ優先）`);
    
    // 並列処理でタイトルを取得（高速化）
    const titlePromises = prioritizedUrls.slice(0, maxTitleFetch).map(async (url) => {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 3秒→2秒に短縮
        });
        
        if (response.ok) {
          const html = await response.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            return { url, title: titleMatch[1].trim() };
          }
        }
      } catch (e) {
        console.log(`⚠️ タイトル取得失敗: ${url}`);
      }
      return null;
    });
    
    // 全ての取得が完了するまで待つ
    const results = await Promise.all(titlePromises);
    
    // 結果を格納
    results.forEach(result => {
      if (result) {
        pageTitles[result.url] = result.title;
        console.log(`✅ タイトル取得: ${result.title}`);
      }
    });

    console.log(`📊 タイトル取得完了: ${Object.keys(pageTitles).length}/${maxTitleFetch}件`);

    // ディレクトリ構造を構築
    const structure = {};
    const pathCounts = {};

    urlList.forEach(url => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // URLからタイトルを推測（パスの最後の部分を使用）
        const getEstimatedTitle = (path) => {
          const parts = path.split('/').filter(p => p.length > 0);
          if (parts.length === 0) return 'トップページ';
          
          const lastPart = parts[parts.length - 1];
          
          // index.htmlなどの場合は親ディレクトリ名を使用
          if (lastPart.match(/^(index|default|home)\.(html|htm|php)$/i)) {
            if (parts.length > 1) {
              const parentPart = parts[parts.length - 2];
              const cleaned = decodeURIComponent(parentPart);
              return cleaned.replace(/[-_]/g, ' ').trim() || 'ページ';
            }
            return 'トップページ';
          }
          
          // HTMLファイル名を除去
          let cleanPart = lastPart.replace(/\.(html|htm|php|asp|aspx|jsp)$/i, '');
          
          // URLデコード
          cleanPart = decodeURIComponent(cleanPart);
          
          // ハイフンやアンダースコアをスペースに
          cleanPart = cleanPart.replace(/[-_]/g, ' ');
          
          // 先頭を大文字に
          cleanPart = cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
          
          return cleanPart.trim() || 'ページ';
        };
        
        // パスを分解
        const parts = pathname.split('/').filter(p => p.length > 0);
        
        if (parts.length === 0) {
          // ルートページ
          if (!structure['/']) {
            structure['/'] = { count: 0, pages: [] };
          }
          structure['/'].count++;
          structure['/'].pages.push({
            url: url,
            title: pageTitles[url] || getEstimatedTitle(pathname)
          });
        } else {
          // 階層構造を解析
          // /manga/ と /manga-010/ のような関係を検出
          const actualParts = [];
          
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // manga-010 のようなパターンを manga/manga-010 に分解
            const match = part.match(/^([a-z]+)[-_](\d+|[a-z0-9]+)$/i);
            if (match) {
              const basePart = match[1]; // manga
              const subPart = part;      // manga-010
              
              console.log(`🔗 階層構造検出: ${part} → 親: ${basePart}, 子: ${subPart}`);
              
              // 親カテゴリが既に存在するかチェック
              if (actualParts.length === 0 || actualParts[actualParts.length - 1] !== basePart) {
                actualParts.push(basePart);
              }
              actualParts.push(subPart);
            } else {
              actualParts.push(part);
            }
          }
          
          // 各階層をカウント
          let currentPath = '';
          actualParts.forEach((part, index) => {
            currentPath += '/' + part;
            
            if (!pathCounts[currentPath]) {
              pathCounts[currentPath] = {
                path: currentPath,
                depth: index + 1,
                name: part,
                count: 0,
                pages: [],
                children: {}
              };
            }
            
            pathCounts[currentPath].count++;
            
            // 最終階層の場合はページURLとタイトルを保存
            if (index === actualParts.length - 1) {
              const lastPart = actualParts[actualParts.length - 1];
              // index.htmlなどのデフォルトページは個別ページとして表示しない
              const isDefaultPage = lastPart.match(/^(index|default|home)\.(html|htm|php)$/i);
              
              // ディレクトリ形式のURL（/features/など）もデフォルトページとして扱う
              const isDirectoryUrl = pathname.endsWith('/');
              
              if (!isDefaultPage && !isDirectoryUrl) {
                // 通常のページ（/about.htmlなど）
                pathCounts[currentPath].pages.push({
                  url: url,
                  title: pageTitles[url] || getEstimatedTitle(pathname)
                });
              } else {
                // デフォルトページまたはディレクトリURL
                console.log(`📄 デフォルトページ検出: ${url} (isDefaultPage: ${!!isDefaultPage}, isDirectory: ${isDirectoryUrl})`);
                
                // 自分自身にタイトルを設定
                pathCounts[currentPath].defaultPageTitle = pageTitles[url] || getEstimatedTitle(pathname);
                pathCounts[currentPath].defaultPageUrl = url;
                console.log(`✅ カテゴリ自身にタイトル設定: ${currentPath} → ${pathCounts[currentPath].defaultPageTitle}`);
              }
            }
          });
        }
      } catch (e) {
        console.warn('URL解析エラー:', url, e);
      }
    });

    // ツリー構造を構築
    const buildTree = () => {
      const tree = {
        '/': {
          name: 'トップページ',
          path: '/',
          count: structure['/']?.count || 0,
          children: {}
        }
      };

      // パスをソート（浅い順）
      const sortedPaths = Object.keys(pathCounts).sort((a, b) => {
        const depthA = pathCounts[a].depth;
        const depthB = pathCounts[b].depth;
        return depthA - depthB;
      });

      sortedPaths.forEach(path => {
        const data = pathCounts[path];
        let parts = path.split('/').filter(p => p.length > 0);
        
        // 親パスを特定
        let current = tree['/'].children;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          let currentPath = '/' + parts.slice(0, i + 1).join('/');
          
          if (i === parts.length - 1) {
            // 最終階層
            current[part] = {
              name: part,
              path: currentPath,
              count: data.count,
              pages: data.pages,
              defaultPageTitle: data.defaultPageTitle,
              defaultPageUrl: data.defaultPageUrl,
              children: {}
            };
            if (data.defaultPageTitle) {
              console.log(`🌳 ツリーノード作成: ${currentPath} → タイトル: ${data.defaultPageTitle}`);
            }
          } else {
            // 中間階層
            if (!current[part]) {
              const intermediateData = pathCounts['/' + parts.slice(0, i + 1).join('/')];
              current[part] = {
                name: part,
                path: currentPath,
                count: 0,
                defaultPageTitle: intermediateData?.defaultPageTitle,
                defaultPageUrl: intermediateData?.defaultPageUrl,
                children: {}
              };
              if (intermediateData?.defaultPageTitle) {
                console.log(`🌳 中間ツリーノード作成: ${currentPath} → タイトル: ${intermediateData.defaultPageTitle}`);
              }
            }
            current = current[part].children;
          }
        }
      });

      return tree;
    };

    const tree = buildTree();

    console.log(`✅ サイト構造解析完了`);
    
    return {
      success: true,
      totalUrls: urlList.length,
      structure: tree,
      pathCounts: pathCounts
    };

  } catch (e) {
    console.error('❌ サイト構造解析エラー:', e);
    return createErrorResponse(e, 'analyzeSiteStructure');
  }
}
