#!/bin/bash
# scripts/diff-check.sh
# Gate 1: Chrome拡張機能向けの危険な変更を自動検知

set -e

echo "🔍 Gate 1: Chrome拡張機能の危険な変更を検知中..."

# 前回のコミットとの差分を取得
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo "⚠️  変更が検出されませんでした（初回コミットの可能性があります）"
  exit 0
fi

# 危険な変更を検知
MANIFEST_CHANGED=false
BACKGROUND_CHANGED=false
PERMISSIONS_CHANGED=false
VERSION_CHANGED=false
HOST_PERMISSIONS_CHANGED=false
POPUP_CHANGED=false

# ファイル変更の検知
for file in $CHANGED_FILES; do
  case $file in
    manifest.json)
      MANIFEST_CHANGED=true
      # manifest.jsonの内容を確認
      if git diff HEAD~1 HEAD -- manifest.json 2>/dev/null | grep -qE "(permissions|host_permissions|version)" || git diff HEAD -- manifest.json 2>/dev/null | grep -qE "(permissions|host_permissions|version)"; then
        PERMISSIONS_CHANGED=true
        VERSION_CHANGED=true
      fi
      ;;
    background.js)
      BACKGROUND_CHANGED=true
      ;;
    popup.js|popup.html)
      POPUP_CHANGED=true
      ;;
  esac
done

# manifest.jsonの詳細な差分を確認
if [ "$MANIFEST_CHANGED" = true ]; then
  MANIFEST_DIFF=$(git diff HEAD~1 HEAD -- manifest.json 2>/dev/null || git diff HEAD -- manifest.json 2>/dev/null || echo "")
  
  if echo "$MANIFEST_DIFF" | grep -qE '"permissions"'; then
    PERMISSIONS_CHANGED=true
  fi
  
  if echo "$MANIFEST_DIFF" | grep -qE '"host_permissions"'; then
    HOST_PERMISSIONS_CHANGED=true
  fi
  
  if echo "$MANIFEST_DIFF" | grep -qE '"version"'; then
    VERSION_CHANGED=true
  fi
fi

# 警告を表示
HAS_WARNING=false

if [ "$MANIFEST_CHANGED" = true ]; then
  echo "⚠️  manifest.json が変更されました"
  echo "   影響範囲: 拡張機能の設定、権限、バージョン"
  echo "   必須アクション:"
  echo "   - Chrome拡張機能として再読み込みして動作確認"
  echo "   - 権限の変更を確認（ユーザーへの影響を評価）"
  echo "   - バージョン番号が正しく更新されているか確認"
  echo ""
  HAS_WARNING=true
fi

if [ "$PERMISSIONS_CHANGED" = true ]; then
  echo "⚠️  権限（permissions）が変更されました"
  echo "   影響範囲: 拡張機能の権限、ユーザーへの権限要求"
  echo "   必須アクション:"
  echo "   - 新しい権限が必要な理由を確認"
  echo "   - Chrome Web Storeへの公開時に権限の説明が必要"
  echo "   - ユーザーへの影響を評価"
  echo ""
  HAS_WARNING=true
fi

if [ "$HOST_PERMISSIONS_CHANGED" = true ]; then
  echo "⚠️  ホスト権限（host_permissions）が変更されました"
  echo "   影響範囲: アクセス可能なドメイン、セキュリティ"
  echo "   必須アクション:"
  echo "   - 新しいホスト権限が必要な理由を確認"
  echo "   - セキュリティリスクを評価"
  echo "   - Chrome Web Storeへの公開時に権限の説明が必要"
  echo ""
  HAS_WARNING=true
fi

if [ "$BACKGROUND_CHANGED" = true ]; then
  echo "⚠️  background.js が変更されました"
  echo "   影響範囲: バックグラウンド処理、API呼び出し、メッセージハンドリング"
  echo "   必須アクション:"
  echo "   - Service Workerの動作確認"
  echo "   - メッセージハンドリングのテスト"
  echo "   - エラーハンドリングの確認"
  echo ""
  HAS_WARNING=true
fi

if [ "$POPUP_CHANGED" = true ]; then
  echo "⚠️  popup.js/popup.html が変更されました"
  echo "   影響範囲: UI表示、ユーザーインターフェース"
  echo "   必須アクション:"
  echo "   - ポップアップの表示確認"
  echo "   - UIの動作確認"
  echo "   - レスポンシブデザインの確認"
  echo ""
  HAS_WARNING=true
fi

if [ "$VERSION_CHANGED" = true ]; then
  echo "ℹ️  バージョン番号が変更されました"
  echo "   確認事項:"
  echo "   - バージョン番号が正しく更新されているか"
  echo "   - CHANGELOG.mdに変更内容を記載"
  echo ""
fi

# 結果の表示
if [ "$HAS_WARNING" = true ]; then
  echo "🚨 Gate 1: 危険な変更が検知されました"
  echo "   上記の必須アクションを実行してください。"
  echo ""
  echo "💡 推奨テスト手順:"
  echo "   1. chrome://extensions/ で拡張機能を再読み込み"
  echo "   2. 各機能を手動でテスト"
  echo "   3. コンソールでエラーを確認"
  echo "   4. 必要に応じてロールバックを検討"
  exit 0  # 警告のみなので、exit 0（CIでは続行可能）
else
  echo "✅ Gate 1: 危険な変更は検知されませんでした"
  exit 0
fi
