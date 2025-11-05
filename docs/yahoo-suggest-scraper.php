<?php
/**
 * Yahoo! サジェスト HTMLスクレイピング版（緊急代替案）
 * 実際のYahoo!検索ページからサジェストをスクレイピング
 * 
 * 注意: この方法は最終手段です。正式なAPIエンドポイントが見つかるまでの暫定対策
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$query = isset($_GET['q']) ? $_GET['q'] : '';
$debug = isset($_GET['debug']) ? true : false;

if (empty($query)) {
    echo json_encode([
        'success' => false,
        'error' => 'クエリパラメータ "q" が必要です'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Yahoo!検索ページを取得
$ch = curl_init();
$url = 'https://search.yahoo.co.jp/search?p=' . urlencode($query);

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: ja,en-US;q=0.9,en;q=0.8',
        'Referer: https://search.yahoo.co.jp/'
    ]
]);

$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error || $httpCode !== 200) {
    echo json_encode([
        'success' => false,
        'error' => $error ?: "HTTP $httpCode",
        'method' => 'scraping'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// HTMLからサジェストを抽出（パターンマッチング）
$suggests = [];

// パターン1: data-suggestキーワード
if (preg_match_all('/data-suggest=["\']([^"\']+)["\']/', $html, $matches)) {
    $suggests = array_merge($suggests, $matches[1]);
}

// パターン2: サジェストリストのクラス
if (preg_match_all('/<li[^>]*class="[^"]*suggest[^"]*"[^>]*>([^<]+)<\/li>/', $html, $matches)) {
    $suggests = array_merge($suggests, $matches[1]);
}

// 重複削除
$suggests = array_unique($suggests);
$suggests = array_values($suggests);

// サニタイズ
$suggests = array_map(function($s) {
    return trim(html_entity_decode($s, ENT_QUOTES, 'UTF-8'));
}, $suggests);

// 空文字列を除外
$suggests = array_filter($suggests, function($s) {
    return !empty($s);
});

if (empty($suggests)) {
    echo json_encode([
        'success' => false,
        'error' => 'サジェストが見つかりませんでした（スクレイピング失敗）',
        'method' => 'scraping',
        'note' => '正式なAPIエンドポイントの調査が必要です',
        'debug' => $debug ? ['htmlLength' => strlen($html)] : null
    ], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
    exit;
}

echo json_encode([
    'success' => true,
    'suggests' => array_values($suggests),
    'count' => count($suggests),
    'method' => 'scraping',
    'note' => 'HTMLスクレイピングによる取得（暫定対策）',
    'timestamp' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
