# -*- coding: utf-8 -*-
"""
ゆっくり画像を英語名に変換してコピーするPythonスクリプト
"""

import os
import sys
import shutil
from pathlib import Path

# WindowsコンソールのエンコーディングをUTF-8に設定
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# パス設定
source_base = Path(r"C:\Users\info\OneDrive\ドキュメント\Downloads\20250912ゆっくり (1)\20250912ゆっくり")
dest_base = Path(r"C:\Users\info\OneDrive\デスクトップ\Resilio\github\dns-osint-pro-ver2.0\images\partsfile")

# フォルダ名のマッピング
character_folders = {
    "コン太": "konta",
    "たぬねぇ": "tanu-nee",
    "りんく": "rinku"
}

# ファイル名のマッピング
file_mappings = {
    "きつねー口ー閉じ.png": "kitsune-mouth-closed.png",
    "きつねー口ー開き.png": "kitsune-mouth-open.png",
    "きつねー目ーまばたき.png": "kitsune-eyes-blink.png",
    "きつねー目ーニコニコ.png": "kitsune-eyes-smile.png",
    "きつねー目ー半目.png": "kitsune-eyes-half.png",
    "きつねー目ー通常.png": "kitsune-eyes-normal.png",
    "きつねー顔.png": "kitsune-face.png",
    "たぬきー口ー閉じ.png": "tanuki-mouth-closed.png",
    "たぬきー口ー開き.png": "tanuki-mouth-open.png",
    "たぬきー目ーまばたき.png": "tanuki-eyes-blink.png",
    "たぬきー目ーニコニコ.png": "tanuki-eyes-smile.png",
    "たぬきー目ー半目.png": "tanuki-eyes-half.png",
    "たぬきー目ー通常.png": "tanuki-eyes-normal.png",
    "たぬきー顔.png": "tanuki-face.png",
    "りんくー口ー閉じ.png": "rinku-mouth-closed.png",
    "りんくー口ー開き.png": "rinku-mouth-open.png",
    "りんくー目ーまばたき.png": "rinku-eyes-blink.png",
    "りんくー目ーニコニコ.png": "rinku-eyes-smile.png",
    "りんくー目ー半目.png": "rinku-eyes-half.png",
    "りんくー目ー通常.png": "rinku-eyes-normal.png",
    "りんくー顔.png": "rinku-face.png"
}

print("開始: ゆっくり画像のコピー処理")

# 各キャラクターフォルダを処理
for japanese_folder, english_folder in character_folders.items():
    source_folder = source_base / japanese_folder
    dest_folder = dest_base / english_folder
    
    print(f"\n処理中: {japanese_folder} -> {english_folder}")
    
    if not source_folder.exists():
        print(f"  警告: ソースフォルダが見つかりません: {source_folder}")
        continue
    
    # コピー先フォルダを作成
    dest_folder.mkdir(parents=True, exist_ok=True)
    print(f"  フォルダ作成: {dest_folder}")
    
    # ファイルをコピー
    copied_count = 0
    for file_path in source_folder.iterdir():
        if file_path.is_file():
            japanese_filename = file_path.name
            
            if japanese_filename in file_mappings:
                english_filename = file_mappings[japanese_filename]
                dest_file = dest_folder / english_filename
                
                shutil.copy2(file_path, dest_file)
                print(f"  [OK] {japanese_filename} -> {english_filename}")
                copied_count += 1
            else:
                print(f"  警告: マッピングが見つかりません: {japanese_filename}")
    
    print(f"  完了: {copied_count} ファイルをコピーしました")

print("\n全ての処理が完了しました！")
