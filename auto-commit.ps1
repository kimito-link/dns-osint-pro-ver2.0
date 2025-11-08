# PowerShell自動コミットスクリプト
# 使い方: .\auto-commit.ps1 "コミットメッセージ"

param(
    [string]$Message = ""
)

# カレントディレクトリをスクリプトの場所に変更
Set-Location $PSScriptRoot

# 変更があるか確認
$status = git status -s
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ 変更なし - コミット不要" -ForegroundColor Green
    exit 0
}

# デフォルトメッセージ
if ([string]::IsNullOrWhiteSpace($Message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "chore: 作業中の変更を保存 ($timestamp)"
}

# ステージング
Write-Host "📦 変更をステージング中..." -ForegroundColor Cyan
git add .

# コミット
Write-Host "💾 コミット中..." -ForegroundColor Cyan
git commit -m $Message

# 結果表示
Write-Host ""
Write-Host "✅ コミット完了！" -ForegroundColor Green
Write-Host "📝 メッセージ: $Message" -ForegroundColor Yellow
Write-Host ""
git log -1 --oneline
