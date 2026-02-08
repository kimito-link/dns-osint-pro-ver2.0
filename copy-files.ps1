# Negative-suggestion-checkerからファイルをコピー

$sourceDir = "C:\Users\info\OneDrive\デスクトップ\GitHub\Negative-suggestion-checker"
$targetDir = "C:\Users\info\OneDrive\デスクトップ\GitHub\dns-osint-pro-ver2.0"

$filesToCopy = @(
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

Write-Host "ファイルコピーを開始します..." -ForegroundColor Green

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $sourceDir $file
    $targetPath = Join-Path $targetDir $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $targetPath -Force
        Write-Host "✓ コピー完了: $file" -ForegroundColor Cyan
    } else {
        Write-Host "✗ ファイルが見つかりません: $file" -ForegroundColor Red
    }
}

Write-Host "`n全てのファイルコピーが完了しました！" -ForegroundColor Green
