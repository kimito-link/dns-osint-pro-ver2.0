<?php
/**
 * Yahoo! サジェストAPI プロキシ（Genspark推奨版）
 * CORS制限を回避してYahoo!のサジェストを取得
 * 
 * 実装方法: Gensparkディープリサーチ結果に基づく
 * @see https://www.genspark.ai/agents?id=63e29cd0-724b-4314-ae2d-32c61e45691c
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// デバッグモード
$debug = isset($_GET['debug']) ? true : false;

// クエリパラメータを取得
$query = isset($_GET['q']) ? $_GET['q'] : '';

if (empty($query)) {
    echo json_encode([
        'success' => false,
        'error' => 'クエリパラメータ "q" が必要です'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Yahoo!サジェストプロキシクラス（Genspark推奨実装）
 */
class YahooSuggestProxy {
    private $baseUrl = 'https://search.yahoo.co.jp';
    
    public function getSuggestions($query) {
        $ch = curl_init();
        
        // Genspark推奨エンドポイント: /search/suggest
        $url = $this->baseUrl . '/search/suggest?p=' . urlencode($query);
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER => [
                // Genspark推奨ヘッダー
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept: application/json, text/javascript, */*; q=0.01',
                'Accept-Language: ja,en-US;q=0.9,en;q=0.8',
                'X-Requested-With: XMLHttpRequest',
                'Referer: https://search.yahoo.co.jp/',
                'Origin: https://search.yahoo.co.jp'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);
        
        return [
            'response' => $response,
            'httpCode' => $httpCode,
            'contentType' => $contentType,
            'error' => $error,
            'url' => $url
        ];
    }
    
    public function parseSuggestions($data) {
        $suggests = [];
        
        // パターン1: 配列形式 [query, [suggestions]]（OpenSearch形式）
        if (is_array($data) && isset($data[1]) && is_array($data[1])) {
            $suggests = $data[1];
        }
        // パターン2: ResultSet形式
        elseif (isset($data['ResultSet']['Result'])) {
            foreach ($data['ResultSet']['Result'] as $item) {
                if (isset($item['key'])) {
                    $suggests[] = $item['key'];
                } elseif (is_string($item)) {
                    $suggests[] = $item;
                }
            }
        }
        // パターン3: results形式
        elseif (isset($data['results']) && is_array($data['results'])) {
            foreach ($data['results'] as $item) {
                if (is_string($item)) {
                    $suggests[] = $item;
                } elseif (isset($item['key'])) {
                    $suggests[] = $item['key'];
                }
            }
        }
        // パターン4: suggest形式
        elseif (isset($data['suggest']) && is_array($data['suggest'])) {
            $suggests = $data['suggest'];
        }
        
        return $suggests;
    }
}

// プロキシインスタンス作成
$proxy = new YahooSuggestProxy();
$result = $proxy->getSuggestions($query);

// デバッグ情報
$debugInfo = [
    'url' => $result['url'],
    'httpCode' => $result['httpCode'],
    'contentType' => $result['contentType'],
    'error' => $result['error'],
    'responseLength' => strlen($result['response']),
    'rawResponse' => $debug ? substr($result['response'], 0, 500) : null
];

// エラーチェック
if (!empty($result['error'])) {
    echo json_encode([
        'success' => false,
        'error' => 'cURLエラー: ' . $result['error'],
        'debug' => $debug ? $debugInfo : null
    ], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
    exit;
}

if ($result['httpCode'] !== 200) {
    echo json_encode([
        'success' => false,
        'error' => 'HTTPエラー: ' . $result['httpCode'],
        'debug' => $debug ? $debugInfo : null
    ], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
    exit;
}

// JSONパース
$data = json_decode($result['response'], true);

if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'error' => 'JSONパースエラー: ' . json_last_error_msg(),
        'debug' => $debug ? $debugInfo : null
    ], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
    exit;
}

// サジェスト抽出
$suggests = $proxy->parseSuggestions($data);

if (empty($suggests)) {
    echo json_encode([
        'success' => false,
        'error' => 'サジェストが見つかりませんでした',
        'debug' => $debug ? array_merge($debugInfo, ['parsedData' => $data]) : null
    ], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
    exit;
}

// 成功レスポンス
echo json_encode([
    'success' => true,
    'suggests' => $suggests,
    'count' => count($suggests),
    'endpoint' => $result['url'],
    'timestamp' => date('Y-m-d H:i:s'),
    'debug' => $debug ? $debugInfo : null
], JSON_UNESCAPED_UNICODE | ($debug ? JSON_PRETTY_PRINT : 0));
