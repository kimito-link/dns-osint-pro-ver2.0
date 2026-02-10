# Chrome Extension ZIP Builder (ASCII only for encoding safety)
$version = "8.0.5"
$zipName = "suggest-pollution-checker-v" + $version + ".zip"
$tempDir = ".\temp-zip-v8.0.5"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chrome Extension ZIP Build" -ForegroundColor Cyan
Write-Host "Version: $version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$files = @(
    'manifest.json', 'background.js', 'popup.html', 'popup.js', 'styles.css',
    'utils.js', 'ui-components.js', 'keyword-expansion.js', 'keyword-expansion-filter.js',
    'link-templates.js', 'negative-keywords.js', 'options.html', 'options.js', 'privacy-policy.html'
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $tempDir -Force
        Write-Host "OK: $file" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $file" -ForegroundColor Red
    }
}

if (Test-Path "images") {
    Copy-Item -Path "images" -Destination $tempDir -Recurse -Force
    Write-Host "OK: images" -ForegroundColor Green
}
if (Test-Path "src") {
    Copy-Item -Path "src" -Destination $tempDir -Recurse -Force
    Write-Host "OK: src" -ForegroundColor Green
}

if (Test-Path $zipName) { Remove-Item -Path $zipName -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force
Remove-Item -Path $tempDir -Recurse -Force

$zipFile = Get-Item $zipName
Write-Host ""
Write-Host "Done: $zipName ($([math]::Round($zipFile.Length/1KB,2)) KB)" -ForegroundColor Green
