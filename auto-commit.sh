#!/bin/bash

# 自動コミットスクリプト
# 使い方: ./auto-commit.sh "コミットメッセージ"

# 変更があるか確認
if [[ -z $(git status -s) ]]; then
  echo "✅ 変更なし - コミット不要"
  exit 0
fi

# コミットメッセージ
MESSAGE="$1"

# メッセージが指定されていない場合はデフォルト
if [[ -z "$MESSAGE" ]]; then
  MESSAGE="chore: 作業中の変更を保存 ($(date '+%Y-%m-%d %H:%M:%S'))"
fi

# ステージング
git add .

# コミット
git commit -m "$MESSAGE"

# 結果表示
echo ""
echo "✅ コミット完了！"
echo "📝 メッセージ: $MESSAGE"
echo ""
git log -1 --oneline
