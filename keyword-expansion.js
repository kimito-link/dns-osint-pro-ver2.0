// ========================================
// アルファベット拡張による関連キーワード取得機能
// ========================================

/**
 * アルファベット拡張で関連キーワードを取得
 * @param {string} domain - ドメイン名
 * @param {string} searchName - 検索名
 */
async function expandRelatedKeywords(domain, searchName) {
  console.log('🚀 アルファベット拡張開始:', domain, searchName);
  
  const expandBtn = document.getElementById('expandKeywordsBtn');
  const progressDiv = document.getElementById('expansionProgress');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const resultDiv = document.getElementById('expandedKeywordsResult');
  
  // ボタン無効化
  expandBtn.disabled = true;
  expandBtn.style.opacity = '0.6';
  expandBtn.textContent = '🔄 取得中...';
  
  // プログレスバー表示
  progressDiv.style.display = 'block';
  
  try {
    // 🔧 サイトタイトルを優先、なければドメインのコア部分を使用
    let searchQuery = searchName;
    
    // もしsearchNameが会社名などの場合、それを使う
    // 例: "株式会社光通信" → "光通信" に変換
    if (searchName.includes('株式会社')) {
      searchQuery = searchName.replace(/株式会社/g, '').trim();
    } else if (searchName.includes('有限会社')) {
      searchQuery = searchName.replace(/有限会社/g, '').trim();
    }
    
    // それでも短すぎる場合はドメインを使用
    if (searchQuery.length < 2) {
      searchQuery = extractMainDomainName(domain);
    }
    
    console.log(`🔍 検索ワード: "${searchQuery}" (元: "${searchName}")`);
    const domainCore = searchQuery;
    
    // アルファベット配列
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const allKeywords = new Map(); // Set → Map に変更（キーワード → ソース情報）
    const totalSteps = alphabet.length;
    
    // 🆕 検索エンジン別の統計
    const stats = {
      google: 0,
      bing: 0,
      youtube: 0,
      amazon: 0,
      rakuten: 0,
      tiktok: 0
    };
    
    console.log(`📊 ${totalSteps}パターンで検索開始`);
    
    // アルファベットごとに検索
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i];
      const query = `${domainCore} ${letter}`;
      
      // プログレス更新
      const progress = ((i + 1) / totalSteps) * 100;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = `取得中... ${i + 1}/${totalSteps} (${letter})`;
      
      console.log(`📡 [${i + 1}/${totalSteps}] "${query}" 取得中...`);
      
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'getSuggests',
          query: query
        });
        
        // 🆕 全プラットフォームから取得（統計＋ソース情報付き）
        const processKeywords = (keywords, source) => {
          let count = 0;
          const isDomainMode = domain.includes('.');  // キーワードモード判定
          
          (keywords || []).forEach(kw => {
            let shouldAdd = true;
            
            // ドメインモードの場合のみフィルタリング
            if (isDomainMode) {
              const fullDomainPrefix = domain.toLowerCase();
              const wwwDomainPrefix = 'www.' + domain.replace(/^www\./, '').toLowerCase();
              const lower = kw.toLowerCase();
              
              // ドメイン名で始まるものは除外
              if (lower.startsWith(fullDomainPrefix) || lower.startsWith(wwwDomainPrefix)) {
                shouldAdd = false;
              }
            }
            
            if (shouldAdd && !allKeywords.has(kw)) {
              // 新規キーワードの場合、ソース情報を保存
              allKeywords.set(kw, source);
              count++;
            }
          });
          return count;
        };
        
        stats.google += processKeywords(response?.google, 'google');
        stats.bing += processKeywords(response?.bing, 'bing');
        stats.youtube += processKeywords(response?.youtube, 'youtube');
        stats.amazon += processKeywords(response?.amazon, 'amazon');
        stats.rakuten += processKeywords(response?.rakuten, 'rakuten');
        stats.tiktok += processKeywords(response?.tiktok, 'tiktok');
        
        // レート制限対策（100ms待機）
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`⚠️ "${query}" 取得失敗:`, error);
      }
    }
    
    // 完了
    progressText.innerHTML = `
      ✅ 完了！ ${allKeywords.size}個の関連キーワードを発見<br>
      <small style="color: #666;">
        🌐 Google: ${stats.google}個 | 
        🔵 Bing: ${stats.bing}個 | 
        🎥 YouTube: ${stats.youtube}個 | 
        🛒 Amazon: ${stats.amazon}個 | 
        🛍️ 楽天: ${stats.rakuten}個 | 
        📱 TikTok: ${stats.tiktok}個
      </small>
    `;
    console.log(`✅ 拡張完了: ${allKeywords.size}個のキーワード取得`);
    console.log(`📊 内訳: Google=${stats.google}, Bing=${stats.bing}, YouTube=${stats.youtube}, Amazon=${stats.amazon}, 楽天=${stats.rakuten}, TikTok=${stats.tiktok}`);
    
    // 結果を表示（統計情報＋ソース情報も渡す）
    // Map を [{keyword, source}] の配列に変換
    const keywordsWithSource = Array.from(allKeywords.entries()).map(([keyword, source]) => ({
      keyword,
      source
    }));
    displayExpandedKeywords(keywordsWithSource, domainCore, stats);
    
    // ボタンを「再取得」に変更
    expandBtn.textContent = '🔄 再取得する';
    expandBtn.disabled = false;
    expandBtn.style.opacity = '1';
    
  } catch (error) {
    console.error('❌ アルファベット拡張エラー:', error);
    progressText.textContent = `❌ エラー: ${error.message}`;
    expandBtn.textContent = '🔄 リトライ';
    expandBtn.disabled = false;
    expandBtn.style.opacity = '1';
  }
}

/**
 * 拡張キーワードを表示
 * @param {Array} keywords - キーワード配列
 * @param {string} domainCore - ドメインコア
 * @param {Object} stats - 検索エンジン別統計 {google, yahoo, bing}
 */
function displayExpandedKeywords(keywords, domainCore, stats = {google: 0, bing: 0, youtube: 0, amazon: 0, rakuten: 0, tiktok: 0}) {
  const resultDiv = document.getElementById('expandedKeywordsResult');
  
  if (keywords.length === 0) {
    resultDiv.innerHTML = `
      <div style="padding: 15px; background: #fff3cd; border-radius: 6px; text-align: center;">
        <p style="margin: 0; color: #856404;">関連キーワードが見つかりませんでした</p>
      </div>
    `;
    return;
  }
  
  // ネガティブキーワード検出
  const negativeKeywords = [
    '詐欺', '被害', '危険', '怠しい', '最悪', 'ブラック',
    'やばい', 'トラブル', '悪質', '悪い', '悪評',
    '炎上', '問題', 'クレーム', '苦情', '評判悪い',
    '倒産', '閉鎖', 'パワハラ', 'セクハラ', '事件',
    '逮捕', '容疑', '起訴', '裁判', '有罪', '事故',
    '死亡', '怪我', '負傷', 'ケガ', '違法', '不正',
    '横領', '脱税', '粉飾', '偽装', '隠蔽', 'リコール'
  ];
  
  // キーワードを分類（ソース情報を保持）
  const categorized = {
    negative: [],
    normal: []
  };
  
  keywords.forEach(item => {
    const kw = typeof item === 'string' ? item : item.keyword;
    const source = typeof item === 'string' ? 'unknown' : item.source;
    
    const kwData = { keyword: kw, source };
    
    if (negativeKeywords.some(neg => kw.includes(neg))) {
      categorized.negative.push(kwData);
    } else {
      categorized.normal.push(kwData);
    }
  });
  
  // 統計情報
  const totalCount = keywords.length;
  const negativeCount = categorized.negative.length;
  const normalCount = categorized.normal.length;
  const negativeRatio = ((negativeCount / totalCount) * 100).toFixed(1);
  
  let html = `
    <div style="background: #fff; border: 2px solid #4caf50; border-radius: 8px; padding: 15px;">
      <!-- 統計情報 -->
      <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; color: #fff; font-size: 0.9em; text-align: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 1.5em; font-weight: bold;">${totalCount}</div>
            <div style="opacity: 0.9;">総キーワード数</div>
          </div>
          <div>
            <div style="font-size: 1.5em; font-weight: bold;">${negativeCount}</div>
            <div style="opacity: 0.9;">⚠️ ネガティブ</div>
          </div>
          <div>
            <div style="font-size: 1.5em; font-weight: bold;">${negativeRatio}%</div>
            <div style="opacity: 0.9;">ネガティブ率</div>
          </div>
        </div>
        <!-- 検索エンジン別内訳（クリック可能） -->
        <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px;">
          <div style="color: #fff; font-size: 0.85em; opacity: 0.9; margin-bottom: 6px; font-weight: 600;">📊 取得元の内訳（クリックで絞り込み）</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.8em;">
            <div data-filter="google" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">🌐 Google</div>
              <div>${stats.google}個 (${((stats.google/totalCount)*100).toFixed(1)}%)</div>
            </div>
            <div data-filter="bing" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">🔵 Bing</div>
              <div>${stats.bing}個 (${((stats.bing/totalCount)*100).toFixed(1)}%)</div>
            </div>
            <div data-filter="youtube" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">🎥 YouTube</div>
              <div>${stats.youtube}個 (${((stats.youtube/totalCount)*100).toFixed(1)}%)</div>
            </div>
            <div data-filter="amazon" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">🛒 Amazon</div>
              <div>${stats.amazon}個 (${((stats.amazon/totalCount)*100).toFixed(1)}%)</div>
            </div>
            <div data-filter="rakuten" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">🛍️ 楽天</div>
              <div>${stats.rakuten}個 (${((stats.rakuten/totalCount)*100).toFixed(1)}%)</div>
            </div>
            <div data-filter="tiktok" class="source-filter" style="background: rgba(255,255,255,0.2); padding: 6px; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
              <div style="font-weight: bold;">📱 TikTok</div>
              <div>${stats.tiktok}個 (${((stats.tiktok/totalCount)*100).toFixed(1)}%)</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- タブ切り替え -->
      <div style="display: flex; gap: 8px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
        <button id="tabAll" class="keyword-tab active" style="
          flex: 1; padding: 10px; background: #4caf50; color: #fff; border: none; 
          border-radius: 6px 6px 0 0; cursor: pointer; font-weight: bold;
        ">
          すべて (${totalCount})
        </button>
        <button id="tabNegative" class="keyword-tab" style="
          flex: 1; padding: 10px; background: #f5f5f5; color: #666; border: none;
          border-radius: 6px 6px 0 0; cursor: pointer; font-weight: bold;
        ">
          ⚠️ ネガティブ (${negativeCount})
        </button>
        <button id="tabNormal" class="keyword-tab" style="
          flex: 1; padding: 10px; background: #f5f5f5; color: #666; border: none;
          border-radius: 6px 6px 0 0; cursor: pointer; font-weight: bold;
        ">
          通常 (${normalCount})
        </button>
      </div>
      
      <!-- キーワードリスト -->
      <div id="keywordListAll" class="keyword-list" style="max-height: 400px; overflow-y: auto;">
        ${createKeywordList(keywords, negativeKeywords)}
      </div>
      
      <div id="keywordListNegative" class="keyword-list" style="max-height: 400px; overflow-y: auto; display: none;">
        ${categorized.negative.length > 0 ? createKeywordList(categorized.negative, negativeKeywords) : '<p style="text-align: center; color: #999; padding: 20px;">ネガティブキーワードはありません</p>'}
      </div>
      
      <div id="keywordListNormal" class="keyword-list" style="max-height: 400px; overflow-y: auto; display: none;">
        ${createKeywordList(categorized.normal, negativeKeywords)}
      </div>
      
      <!-- エクスポートボタン -->
      <div style="margin-top: 15px; display: flex; gap: 8px;">
        <button id="copyKeywordsBtn" style="
          flex: 1; padding: 10px; background: #2196f3; color: #fff; border: none;
          border-radius: 6px; cursor: pointer; font-weight: bold;
        ">
          📋 すべてコピー
        </button>
        <button id="exportCsvBtn" style="
          flex: 1; padding: 10px; background: #4caf50; color: #fff; border: none;
          border-radius: 6px; cursor: pointer; font-weight: bold;
        ">
          📊 CSV出力
        </button>
      </div>
    </div>
  `;
  
  resultDiv.innerHTML = html;
  
  // タブ切り替えイベント
  setupTabSwitching();
  
  // プラットフォームフィルタリング
  setupSourceFiltering(keywords, categorized, negativeKeywords, stats);
  
  // コピーボタンイベント
  document.getElementById('copyKeywordsBtn').addEventListener('click', () => {
    // オブジェクト配列からキーワードのみを抽出
    const text = keywords.map(item => {
      return typeof item === 'string' ? item : item.keyword;
    }).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ ${keywords.length}個のキーワードをコピーしました！`);
    });
  });
  
  // CSVエクスポートボタンイベント
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    exportKeywordsToCSV(keywords, negativeKeywords, domainCore);
  });
}

/**
 * キーワードリストHTML生成
 * @param {Array} keywords - キーワード配列 [{keyword, source}]
 * @param {Array} negativeKeywords - ネガティブキーワード配列
 * @returns {string} HTML
 */
function createKeywordList(keywords, negativeKeywords) {
  // ソース情報のアイコンとカラー
  const sourceInfo = {
    google: { icon: '🌐', color: '#4285f4', name: 'Google' },
    bing: { icon: '🔵', color: '#0078d4', name: 'Bing' },
    youtube: { icon: '🎥', color: '#ff0000', name: 'YouTube' },
    amazon: { icon: '🛒', color: '#ff9900', name: 'Amazon' },
    rakuten: { icon: '🛍️', color: '#bf0000', name: '楽天' },
    tiktok: { icon: '📱', color: '#000000', name: 'TikTok' },
    unknown: { icon: '❓', color: '#999', name: '不明' }
  };
  
  return keywords.map(item => {
    const kw = typeof item === 'string' ? item : item.keyword;
    const source = typeof item === 'string' ? 'unknown' : item.source;
    const isNegative = negativeKeywords.some(neg => kw.includes(neg));
    
    // 🆕 ソースに応じた検索URL（プラットフォーム対応）
    let searchUrl;
    switch(source) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(kw)}`;
        break;
      case 'youtube':
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(kw)}`;
        break;
      case 'amazon':
        searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(kw)}`;
        break;
      case 'rakuten':
        searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(kw)}`;
        break;
      case 'tiktok':
        searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(kw)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
    }
    
    const info = sourceInfo[source] || sourceInfo.unknown;
    
    return `
      <div class="keyword-list-item" style="
        padding: 10px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background 0.2s;
      ">
        <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
          <span style="
            display: inline-block;
            padding: 2px 6px;
            background: ${info.color}15;
            color: ${info.color};
            border: 1px solid ${info.color};
            border-radius: 4px;
            font-size: 0.75em;
            font-weight: bold;
            min-width: 60px;
            text-align: center;
          " title="${info.name}サジェストから取得">
            ${info.icon} ${info.name}
          </span>
          <span style="
            display: inline-block;
            padding: 2px 6px;
            background: #f3f3f3;
            color: #666;
            border-radius: 3px;
            font-size: 0.7em;
            font-weight: 500;
          ">
            サジェスト
          </span>
          <span style="color: ${isNegative ? '#d32f2f' : '#333'}; font-weight: ${isNegative ? 'bold' : 'normal'};">
            ${isNegative ? '⚠️ ' : ''}${kw}
          </span>
        </div>
        <a href="${searchUrl}" target="_blank" style="
          padding: 6px 12px;
          background: ${info.color};
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: bold;
          white-space: nowrap;
        ">
          🔍 ${info.name}検索
        </a>
      </div>
    `;
  }).join('');
}

/**
 * タブ切り替え設定
 */
function setupTabSwitching() {
  const tabs = {
    tabAll: 'keywordListAll',
    tabNegative: 'keywordListNegative',
    tabNormal: 'keywordListNormal'
  };
  
  Object.keys(tabs).forEach(tabId => {
    const tabBtn = document.getElementById(tabId);
    if (tabBtn) {
      tabBtn.addEventListener('click', () => {
        // すべてのタブを非アクティブ化
        document.querySelectorAll('.keyword-tab').forEach(btn => {
          btn.style.background = '#f5f5f5';
          btn.style.color = '#666';
        });
        
        // すべてのリストを非表示
        document.querySelectorAll('.keyword-list').forEach(list => {
          list.style.display = 'none';
        });
        
        // 選択したタブをアクティブ化
        tabBtn.style.background = '#4caf50';
        tabBtn.style.color = '#fff';
        document.getElementById(tabs[tabId]).style.display = 'block';
      });
    }
  });
}

/**
 * CSVエクスポート
 * @param {Array} keywords - キーワード配列
 * @param {Array} negativeKeywords - ネガティブキーワード配列
 * @param {string} domainCore - ドメインコア
 */
function exportKeywordsToCSV(keywords, negativeKeywords, domainCore) {
  // CSVヘッダー
  let csv = 'キーワード,タイプ,取得元,検索URL\n';
  
  // データ行
  keywords.forEach(item => {
    const kw = typeof item === 'string' ? item : item.keyword;
    const source = typeof item === 'string' ? '不明' : item.source;
    const isNegative = negativeKeywords.some(neg => kw.includes(neg));
    const type = isNegative ? 'ネガティブ' : '通常';
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
    
    // CSVエスケープ
    const escapedKw = `"${kw.replace(/"/g, '""')}"`;
    csv += `${escapedKw},${type},${source},${searchUrl}\n`;
  });
  
  // BOM付きUTF-8でダウンロード
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // ダウンロードリンク作成
  const a = document.createElement('a');
  a.href = url;
  a.download = `related-keywords_${domainCore}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ CSVエクスポート完了');
}
