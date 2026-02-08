$tempDir = "temp-zip-v8.0.4"
$zipName = "dns-osint-pro-v8.0.4.zip"

if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Copy-Item -Path "manifest.json" -Destination $tempDir -Force
Copy-Item -Path "background.js" -Destination $tempDir -Force
Copy-Item -Path "popup.html" -Destination $tempDir -Force
Copy-Item -Path "popup.js" -Destination $tempDir -Force
Copy-Item -Path "styles.css" -Destination $tempDir -Force
Copy-Item -Path "utils.js" -Destination $tempDir -Force
Copy-Item -Path "ui-components.js" -Destination $tempDir -Force
Copy-Item -Path "keyword-expansion.js" -Destination $tempDir -Force
Copy-Item -Path "link-templates.js" -Destination $tempDir -Force
Copy-Item -Path "negative-keywords.js" -Destination $tempDir -Force
Copy-Item -Path "options.html" -Destination $tempDir -Force
Copy-Item -Path "options.js" -Destination $tempDir -Force

if (Test-Path "images") {
    Copy-Item -Path "images" -Destination $tempDir -Recurse -Force
}

if (Test-Path "src") {
    Copy-Item -Path "src" -Destination $tempDir -Recurse -Force
}

if (Test-Path $zipName) {
    Remove-Item -Path $zipName -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force

Remove-Item -Path $tempDir -Recurse -Force

Write-Host "ZIP file created: $zipName"
