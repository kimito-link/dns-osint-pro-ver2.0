#!/bin/bash
# 他のプロジェクトにMCP DevToolsをコピーするスクリプト

if [ -z "$1" ]; then
  echo "❌ エラー: プロジェクトパスを指定してください"
  echo ""
  echo "使い方:"
  echo "  bash copy-to-project.sh /path/to/your-project"
  echo ""
  echo "例:"
  echo "  bash copy-to-project.sh ../my-extension"
  echo "  bash copy-to-project.sh /c/Users/info/Desktop/my-webapp"
  exit 1
fi

TARGET_DIR="$1"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ エラー: ディレクトリが見つかりません: $TARGET_DIR"
  exit 1
fi

echo "🚀 MCP DevTools をコピー中..."
echo "   送信元: $(pwd)"
echo "   送信先: $TARGET_DIR"
echo ""

# ファイルをコピー
cp mcp-devtools-template.js "$TARGET_DIR/"
echo "✅ mcp-devtools-template.js をコピーしました"

cp SETUP_OTHER_PROJECTS.md "$TARGET_DIR/" 2>/dev/null || true
echo "✅ SETUP_OTHER_PROJECTS.md をコピーしました"

echo ""
echo "📝 次のステップ:"
echo ""
echo "1. プロジェクトに移動:"
echo "   cd $TARGET_DIR"
echo ""
echo "2. Puppeteerをインストール:"
echo "   npm install puppeteer --save-dev"
echo ""
echo "3. 設定を編集:"
echo "   code mcp-devtools-template.js"
echo "   # CONFIG セクションを編集"
echo ""
echo "4. テスト実行:"
echo "   node mcp-devtools-template.js test"
echo ""
echo "✨ セットアップ完了！"
