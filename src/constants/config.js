/**
 * 📦 OsintConstants
 * 全定数を集約した設定ファイル
 * @version 1.0.1
 * 
 * このモジュールは、popup.js、background.js、ui-components.jsで使用される
 * 全ての定数を集約し、globalScope.OsintConstantsオブジェクトとして公開します。
 * 
 * Service Worker環境（background.js）と通常環境（popup.js）の両方に対応しています。
 * - 通常環境: window.OsintConstants
 * - Service Worker環境: self.OsintConstants
 */

/**
 * LINE相談URL
 */
const LINE_URLS = {
  IT_INFRA: 'https://lin.ee/lrjVHvH',      // @revit
  REPUTATION: 'https://lin.ee/ThvxXZR'     // @reph
};

/**
 * バージョン管理定数
 * 最新バージョンは動的に取得されます（fetchLatestVersions関数を参照）
 * フォールバック値として以下を使用します
 */
const VERSION_CONSTANTS = {
  WP_MINIMUM: 6.8,      // WordPress最低バージョン（フォールバック値）
  PHP_MINIMUM: 8.0,     // PHP最低バージョン（フォールバック値）
  CF7_MINIMUM: 6.1      // Contact Form 7最低バージョン
};

/**
 * 最新バージョンを取得する関数
 * WordPress APIとPHP公式サイトから最新バージョンを取得します
 * @returns {Promise<Object>} {wp: string, php: string} 最新バージョン情報
 */
async function fetchLatestVersions() {
  const CACHE_KEY = 'osint_latest_versions';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間キャッシュ
  
  // キャッシュをチェック
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { versions, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return versions;
      }
    }
  } catch (e) {
    // キャッシュ読み込みエラーは無視
  }
  
  const versions = {
    wp: VERSION_CONSTANTS.WP_MINIMUM,  // フォールバック値
    php: VERSION_CONSTANTS.PHP_MINIMUM  // フォールバック値
  };
  
  try {
    // WordPress最新バージョンを取得
    const wpResponse = await fetch('https://api.wordpress.org/core/version-check/1.7/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (wpResponse.ok) {
      const wpData = await wpResponse.json();
      if (wpData && wpData.offers && wpData.offers[0] && wpData.offers[0].version) {
        const wpVersion = wpData.offers[0].version;
        // メジャーバージョン.マイナーバージョン形式に変換（例: "6.8"）
        const wpMajorMinor = wpVersion.split('.').slice(0, 2).join('.');
        versions.wp = parseFloat(wpMajorMinor);
        console.log('✅ WordPress最新バージョン取得:', versions.wp);
      }
    }
  } catch (e) {
    console.warn('⚠️ WordPress最新バージョン取得失敗:', e);
  }
  
  try {
    // PHP最新バージョンを取得（phpreleases.com API使用）
    const phpResponse = await fetch('https://phpreleases.com/api/releases/latest', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (phpResponse.ok) {
      const phpData = await phpResponse.json();
      if (phpData && phpData.version) {
        const phpVersion = phpData.version;
        // メジャーバージョン.マイナーバージョン形式に変換（例: "8.3"）
        const phpMajorMinor = phpVersion.split('.').slice(0, 2).join('.');
        versions.php = parseFloat(phpMajorMinor);
        console.log('✅ PHP最新バージョン取得:', versions.php, '(元のバージョン:', phpVersion, ')');
      }
    }
  } catch (e) {
    console.warn('⚠️ PHP最新バージョン取得失敗:', e);
    // 代替方法: PHP.Watch APIを使用
    try {
      const phpAltResponse = await fetch('https://php.watch/api/versions', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (phpAltResponse.ok) {
        const phpWatchData = await phpAltResponse.json();
        // 最新の安定版を取得（supported: true かつ latest: true）
        if (phpWatchData && Array.isArray(phpWatchData)) {
          const latestStable = phpWatchData.find(v => v.latest === true && v.supported === true);
          if (latestStable && latestStable.version) {
            const phpMajorMinor = latestStable.version.split('.').slice(0, 2).join('.');
            versions.php = parseFloat(phpMajorMinor);
            console.log('✅ PHP最新バージョン取得（PHP.Watch API）:', versions.php);
          }
        }
      }
    } catch (e2) {
      console.warn('⚠️ PHP最新バージョン取得失敗（代替方法も）:', e2);
    }
  }
  
  // キャッシュに保存
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      versions,
      timestamp: Date.now()
    }));
  } catch (e) {
    // ローカルストレージエラーは無視
  }
  
  return versions;
}

/**
 * バージョン定数を最新バージョンで更新する関数
 * この関数は非同期で実行され、最新バージョンが取得できたら更新します
 */
async function updateVersionConstants() {
  try {
    const latestVersions = await fetchLatestVersions();
    if (latestVersions.wp && latestVersions.wp > VERSION_CONSTANTS.WP_MINIMUM) {
      VERSION_CONSTANTS.WP_MINIMUM = latestVersions.wp;
      console.log('✅ WordPress最低バージョンを更新:', VERSION_CONSTANTS.WP_MINIMUM);
    }
    if (latestVersions.php && latestVersions.php > VERSION_CONSTANTS.PHP_MINIMUM) {
      VERSION_CONSTANTS.PHP_MINIMUM = latestVersions.php;
      console.log('✅ PHP最低バージョンを更新:', VERSION_CONSTANTS.PHP_MINIMUM);
    }
  } catch (e) {
    console.warn('⚠️ バージョン定数の更新に失敗:', e);
  }
}

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
  HTML_SIZE_LARGE: 500       // 500KB以上が大きすぎる
  // MAX_PLUGINSは削除（全プラグインを表示）
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

/**
 * OsintConstants オブジェクト
 * Service Worker環境（self）と通常環境（window）の両方に対応
 * globalThisを使用することで、どちらの環境でも動作します
 */
const globalScope = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : globalThis);
globalScope.OsintConstants = {
  LINE_URLS,
  VERSION_CONSTANTS,
  TIMEOUT_CONSTANTS,
  PERFORMANCE_THRESHOLDS,
  GOOGLE_API_CONFIG,
  // 最新バージョン取得関数を公開
  fetchLatestVersions,
  updateVersionConstants
};

// 最新バージョンを非同期で取得して更新（バックグラウンドで実行）
// Service Worker環境では実行しない（localStorageが使えないため）
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  updateVersionConstants().catch(e => {
    console.warn('⚠️ バージョン更新の初期化に失敗:', e);
  });
}
