# Chrome Web Store リリースパッケージ作成スクリプト
# v6.5.1

Write-Host "🎉 Chrome Web Store リリースパッケージ作成開始" -ForegroundColor Green
Write-Host ""

# 作業ディレクトリ
$sourceDir = $PSScriptRoot
$outputDir = Join-Path $sourceDir "release"
$zipName = "kimitolink-web-diagnosis-v6.5.1.zip"
$zipPath = Join-Path $sourceDir $zipName

# 一時ディレクトリ作成
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

Write-Host "📁 必要なファイルをコピー中..." -ForegroundColor Cyan

# 必要なファイルをコピー
$filesToInclude = @(
    "manifest.json",
    "popup.html",
    "popup.js",
    "background.js",
    "utils.js",
    "ui-components.js",
    "styles.css",
    "options.html"
)

foreach ($file in $filesToInclude) {
    $sourcePath = Join-Path $sourceDir $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination $outputDir
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $file (見つかりません)" -ForegroundColor Yellow
    }
}

# imagesフォルダをコピー
$imagesSource = Join-Path $sourceDir "images"
if (Test-Path $imagesSource) {
    Copy-Item $imagesSource -Destination $outputDir -Recurse
    Write-Host "  ✅ images/" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ images/ (見つかりません)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 ZIPファイル作成中..." -ForegroundColor Cyan

# 既存のZIPファイルを削除
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# ZIPファイル作成
Compress-Archive -Path "$outputDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# 一時ディレクトリ削除
Remove-Item $outputDir -Recurse -Force

Write-Host ""
Write-Host "✅ リリースパッケージ作成完了！" -ForegroundColor Green
Write-Host ""
Write-Host "📦 ファイル: $zipName" -ForegroundColor Cyan
Write-Host "📍 場所: $sourceDir" -ForegroundColor Cyan
Write-Host ""

# ファイルサイズ表示
$zipSize = (Get-Item $zipPath).Length
$zipSizeMB = [math]::Round($zipSize / 1MB, 2)
Write-Host "📊 サイズ: $zipSizeMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 次のステップ:" -ForegroundColor Yellow
Write-Host "  1. Chrome Developer Dashboard にログイン" -ForegroundColor White
Write-Host "     https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
Write-Host "  2. 既存アイテムを選択" -ForegroundColor White
Write-Host "  3. 「パッケージをアップロード」から $zipName を選択" -ForegroundColor White
Write-Host "  4. リリースノート（RELEASE_NOTES_v6.5.1.md）をコピー&ペースト" -ForegroundColor White
Write-Host "  5. 審査に提出" -ForegroundColor White
Write-Host ""
Write-Host "完了！" -ForegroundColor Green
