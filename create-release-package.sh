#!/bin/bash
# Chrome Web Store リリースパッケージ作成スクリプト
# v6.5.1

echo "🎉 Chrome Web Store リリースパッケージ作成開始"
echo ""

# 作業ディレクトリ
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SOURCE_DIR/release"
ZIP_NAME="kimitolink-web-diagnosis-v6.5.1.zip"
ZIP_PATH="$SOURCE_DIR/$ZIP_NAME"

# 一時ディレクトリ作成
if [ -d "$OUTPUT_DIR" ]; then
    rm -rf "$OUTPUT_DIR"
fi
mkdir -p "$OUTPUT_DIR"

echo "📁 必要なファイルをコピー中..."

# 必要なファイルをコピー
FILES=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "background.js"
    "utils.js"
    "ui-components.js"
    "styles.css"
    "options.html"
)

for file in "${FILES[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        cp "$SOURCE_DIR/$file" "$OUTPUT_DIR/"
        echo "  ✅ $file"
    else
        echo "  ⚠️ $file (見つかりません)"
    fi
done

# imagesフォルダをコピー
if [ -d "$SOURCE_DIR/images" ]; then
    cp -r "$SOURCE_DIR/images" "$OUTPUT_DIR/"
    echo "  ✅ images/"
else
    echo "  ⚠️ images/ (見つかりません)"
fi

echo ""
echo "📦 ZIPファイル作成中..."

# 既存のZIPファイルを削除
if [ -f "$ZIP_PATH" ]; then
    rm -f "$ZIP_PATH"
fi

# ZIPファイル作成
cd "$OUTPUT_DIR"
zip -r "$ZIP_PATH" . -q

# 一時ディレクトリ削除
cd "$SOURCE_DIR"
rm -rf "$OUTPUT_DIR"

echo ""
echo "✅ リリースパッケージ作成完了！"
echo ""
echo "📦 ファイル: $ZIP_NAME"
echo "📍 場所: $SOURCE_DIR"
echo ""

# ファイルサイズ表示
if [ -f "$ZIP_PATH" ]; then
    SIZE=$(du -h "$ZIP_PATH" | cut -f1)
    echo "📊 サイズ: $SIZE"
fi

echo ""
echo "🚀 次のステップ:"
echo "  1. Chrome Developer Dashboard にログイン"
echo "     https://chrome.google.com/webstore/devconsole"
echo "  2. 既存アイテムを選択"
echo "  3. 「パッケージをアップロード」から $ZIP_NAME を選択"
echo "  4. リリースノート（RELEASE_NOTES_v6.5.1.md）をコピー&ペースト"
echo "  5. 審査に提出"
echo ""
echo "完了！"
