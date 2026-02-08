# WSLプロジェクトをCursorで開く方法

## 🚀 推奨方法: WSL内から直接開く

### 手順

1. **WSLターミナルを開く**
   - Windowsのスタートメニューから「Ubuntu」を開く
   - または、PowerShellで `wsl -d Ubuntu` を実行

2. **プロジェクトディレクトリに移動**
   ```bash
   cd ~/projects/dns-osint-pro-ver2.0
   ```

3. **Cursorで開く**
   ```bash
   cursor .
   ```

これで、WSL内のプロジェクトがCursorで開きます！

---

## 🔄 または、PowerShellから実行

```powershell
wsl -d Ubuntu bash -c "cd ~/projects/dns-osint-pro-ver2.0 && cursor ."
```

---

## ⚠️ 注意事項

- CursorがWSL内のファイルを開く際は、自動的にWSLリモート接続が使用されます
- 初回はCursor serverのインストールが必要な場合があります
- エラーが出た場合は、Node.jsのインストールが必要かもしれません

---

## 📝 トラブルシューティング

### Cursor serverのインストールエラーが出る場合

WSL内でNode.jsをインストール：

```bash
# WSLターミナルで実行
sudo apt update
sudo apt install -y nodejs npm
```

### それでも開けない場合

元の場所（OneDriveフォルダー）で作業を続けることも可能です：
```
C:\Users\info\OneDrive\デスクトップ\GitHub\dns-osint-pro-ver2.0
```

