# WSLでの作業フローガイド

## 📍 プロジェクトの場所

**WSL内のパス**: `/home/info/projects/dns-osint-pro-ver2.0`  
**Windows内のパス（バックアップ）**: `C:\Users\info\OneDrive\デスクトップ\GitHub\dns-osint-pro-ver2.0`

---

## 🚀 VSCodeでの作業方法

### 初回セットアップ

1. **VSCodeを開く**
2. **コマンドパレットを開く** (`Ctrl + Shift + P`)
3. **「Remote-WSL: Open Folder in WSL」を選択**
4. **パスを入力**: `~/projects/dns-osint-pro-ver2.0`
5. **左下に「WSL: Ubuntu」と表示されることを確認**

### 2回目以降

- VSCodeの「最近開いたフォルダー」から選択
- または、コマンドパレットで「Remote-WSL: Reopen Folder in WSL」

---

## 💻 ターミナルでの作業

### VSCodeの統合ターミナル（推奨）

- `Ctrl + `` ` `` でターミナルを開く
- 自動的にWSL内で動作します
- 通常のLinuxコマンドが使用可能

### PowerShellからWSLコマンドを実行

```powershell
# WSL内のプロジェクトディレクトリでコマンドを実行
wsl -d Ubuntu bash -c "cd ~/projects/dns-osint-pro-ver2.0 && git status"

# WSL内のシェルに入る
wsl -d Ubuntu bash -c "cd ~/projects/dns-osint-pro-ver2.0 && bash"
```

---

## 🔧 よく使うコマンド

### Git操作

```bash
# ステータス確認
git status

# ファイルを追加
git add .

# コミット
git commit -m "メッセージ"

# プッシュ
git push

# プル
git pull
```

### ファイル操作

```bash
# 現在のディレクトリ確認
pwd
# → /home/info/projects/dns-osint-pro-ver2.0

# ファイル一覧
ls -la

# ファイル編集（VSCodeで開く）
code .
```

---

## 📝 作業の流れ

### 1. プロジェクトを開く
- VSCodeでWSLリモート接続を使用してプロジェクトを開く

### 2. ファイルを編集
- 通常通りファイルを編集
- 保存は `Ctrl + S`

### 3. Git操作
- VSCodeの統合ターミナルまたはGit機能を使用
- または、コマンドラインで `git` コマンドを実行

### 4. コミット・プッシュ
- 変更をコミット
- リモートリポジトリにプッシュ

---

## ⚠️ 注意事項

### バックアップについて

- **元の場所**: `C:\Users\info\OneDrive\デスクトップ\GitHub\dns-osint-pro-ver2.0`
  - バックアップとして残しています
  - OneDriveの同期は継続されますが、WSL内のプロジェクトとは別物です

### ファイルの同期

- **WSL内のプロジェクト**: `/home/info/projects/dns-osint-pro-ver2.0`
  - こちらがメインの作業場所です
  - OneDriveとは同期されません（WSLのext4ファイルシステム上）

### 両方の場所を更新したい場合

```powershell
# WSLからWindowsにコピー（必要に応じて）
wsl -d Ubuntu bash -c "cp -r ~/projects/dns-osint-pro-ver2.0 /mnt/c/Users/info/OneDrive/デスクトップ/GitHub/"
```

---

## 🎯 パフォーマンス向上のポイント

1. **WSLのext4ファイルシステム上で作業**
   - WindowsのNTFSより高速
   - 特に大量のファイル操作で効果的

2. **VSCodeのWSLリモート接続を使用**
   - ファイルの読み書きが高速
   - Git操作も高速

3. **OneDriveの同期を避ける**
   - WSL内のプロジェクトはOneDriveと同期されないため、パフォーマンスが向上

---

## 🔄 トラブルシューティング

### VSCodeでWSL接続できない場合

```powershell
# WSLが起動しているか確認
wsl --list --verbose

# Ubuntuを起動
wsl -d Ubuntu

# VSCodeのRemote-WSL拡張機能がインストールされているか確認
```

### Git操作が遅い場合

```bash
# Gitの設定を確認
git config --list

# WSL内でGitが正しく動作しているか確認
git --version
```

---

## 📚 参考リンク

- [VSCode Remote-WSL 公式ドキュメント](https://code.visualstudio.com/docs/remote/wsl)
- [WSL公式ドキュメント](https://learn.microsoft.com/ja-jp/windows/wsl/)


