# Chrome拡張機能 v8.0.5 ZIP作成スクリプト
# サジェスト汚染チェッカー

$version = "8.0.5"
$zipName = "suggest-pollution-checker-v8.0.5.zip"
$tempDir = ".\temp-zip-v$version"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chrome拡張機能 ZIPファイル作成" -ForegroundColor Cyan
Write-Host "サジェスト汚染チェッカー v$version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 一時ディレクトリを作成
Write-Host "一時ディレクトリを作成中..." -ForegroundColor Yellow
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 必須ファイルをコピー
Write-Host "必須ファイルをコピー中..." -ForegroundColor Yellow
$files = @(
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'styles.css',
    'utils.js',
    'ui-components.js',
    'keyword-expansion.js',
    'link-templates.js',
    'negative-keywords.js',
    'options.html',
    'options.js',
    'privacy-policy.html'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $tempDir -Force
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  NG: $file (見つかりません)" -ForegroundColor Red
    }
}

# keyword-expansion-filter.js は存在する場合のみ
if (Test-Path "keyword-expansion-filter.js") {
    Copy-Item -Path "keyword-expansion-filter.js" -Destination $tempDir -Force
    Write-Host "  OK: keyword-expansion-filter.js" -ForegroundColor Green
}

# imagesフォルダをコピー
Write-Host ""
Write-Host "imagesフォルダをコピー中..." -ForegroundColor Yellow
if (Test-Path "images") {
    Copy-Item -Path "images" -Destination $tempDir -Recurse -Force
    Write-Host "  OK: imagesフォルダ" -ForegroundColor Green
} else {
    Write-Host "  NG: imagesフォルダが見つかりません" -ForegroundColor Red
}

# srcフォルダをコピー（コンポーネントファイル）
Write-Host ""
Write-Host "srcフォルダをコピー中..." -ForegroundColor Yellow
if (Test-Path "src") {
    Copy-Item -Path "src" -Destination $tempDir -Recurse -Force
    Write-Host "  OK: srcフォルダ" -ForegroundColor Green
} else {
    Write-Host "  警告: srcフォルダが見つかりません（スキップ）" -ForegroundColor Yellow
}

# ZIPファイルを作成
Write-Host ""
Write-Host "ZIPファイルを作成中..." -ForegroundColor Yellow
if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# 一時ディレクトリを削除
Write-Host "一時ファイルをクリーンアップ中..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# 完了メッセージ
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZIPファイル作成完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "ファイル名: $zipName" -ForegroundColor Cyan
Write-Host "保存場所: $(Get-Location)\$zipName" -ForegroundColor Cyan

# ファイルサイズを表示
$zipFile = Get-Item $zipName
$sizeKB = [math]::Round($zipFile.Length / 1KB, 2)
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)
Write-Host "ファイルサイズ: $sizeKB KB ($sizeMB MB)" -ForegroundColor Cyan

Write-Host ""
Write-Host "Chrome Web Storeへアップロード準備完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
