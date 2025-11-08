#!/bin/bash
# Git Bashで高速コミット

echo "🔍 Git状態を確認中..."
git status

echo ""
echo "📝 変更をステージング..."
git add -A

echo ""
echo "💾 コミット実行..."
git commit -m "feat: Chrome DevTools MCP integration - development efficiency tools added

- Added test-devtools-mcp.js: Full automated test suite
- Added dev-helper.js: Interactive development helper
- Added test-simple.js: Basic structure validation
- Added test-extension.js: Puppeteer-based extension testing
- Added DEVTOOLS_MCP.md: Complete usage guide
- Updated PROGRESS.md: Latest status

Features:
- Real-time console monitoring
- Network request analysis
- CORS error detection
- Performance metrics collection
- DOM/CSS inspection
- User interaction simulation
"

echo ""
echo "📊 最新のコミット履歴:"
git log --oneline -5

echo ""
echo "✅ コミット完了！"
