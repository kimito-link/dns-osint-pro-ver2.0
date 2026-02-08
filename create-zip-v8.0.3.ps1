# Chrome拡張機能 v8.0.3 ZIP作成スクリプト
# 君斗りんくのWEBサイト健康診断 & OSINT Helper

$version = "8.0.3"
$zipName = "dns-osint-pro-v$version.zip"
$tempDir = ".\temp-zip-v$version"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chrome拡張機能 ZIPファイル作成" -ForegroundColor Cyan
Write-Host "バージョン: $version" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 一時ディレクトリを作成
Write-Host "📁 一時ディレクトリを作成中..." -ForegroundColor Yellow
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 必須ファイルをコピー
Write-Host "📋 必須ファイルをコピー中..." -ForegroundColor Yellow
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
    'options.js'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $tempDir -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (見つかりません)" -ForegroundColor Red
    }
}

# imagesフォルダをコピー
Write-Host "`n🖼️  imagesフォルダをコピー中..." -ForegroundColor Yellow
if (Test-Path "images") {
    Copy-Item -Path "images" -Destination $tempDir -Recurse -Force
    Write-Host "  ✓ imagesフォルダ" -ForegroundColor Green
} else {
    Write-Host "  ✗ imagesフォルダが見つかりません" -ForegroundColor Red
}

# srcフォルダをコピー（コンポーネントファイル）
Write-Host "`n📦 srcフォルダをコピー中..." -ForegroundColor Yellow
if (Test-Path "src") {
    Copy-Item -Path "src" -Destination $tempDir -Recurse -Force
    Write-Host "  ✓ srcフォルダ" -ForegroundColor Green
} else {
    Write-Host "  ⚠ srcフォルダが見つかりません（スキップ）" -ForegroundColor Yellow
}

# ZIPファイルを作成
Write-Host "`n📦 ZIPファイルを作成中..." -ForegroundColor Yellow
if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

# 一時ディレクトリを削除
Write-Host "🧹 一時ファイルをクリーンアップ中..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# 完了メッセージ
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ ZIPファイル作成完了！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "📦 ファイル名: $zipName" -ForegroundColor Cyan
Write-Host "📍 保存場所: $(Get-Location)\$zipName" -ForegroundColor Cyan

# ファイルサイズを表示
$zipFile = Get-Item $zipName
$sizeKB = [math]::Round($zipFile.Length / 1KB, 2)
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)
Write-Host "📊 ファイルサイズ: $sizeKB KB ($sizeMB MB)" -ForegroundColor Cyan

Write-Host "`n🚀 Chrome Web Storeへアップロード準備完了！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
