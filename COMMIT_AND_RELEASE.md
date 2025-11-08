# 🚀 コミット＆リリース手順（Git Bash版）

## v6.5.1 リリース手順

---

## 📋 ステップ1: Gitコミット（ローカル）

### 1. Git Bashを開く
```bash
# プロジェクトフォルダに移動
cd /c/Users/info/OneDrive/デスクトップ/GitHub/dns-osint-pro-ver2.0
```

### 2. 変更状態を確認
```bash
git status
```

### 3. すべての変更をステージング
```bash
git add .
```

### 4. コミット
```bash
git commit -m "v6.5.1: タブ切り替え修正、サイトタイトル表示、デバッグログ統合、サイトマップ高速化"
```

### 5. コミット履歴確認
```bash
git log --oneline -5
```

---

## 📦 ステップ2: リリースパッケージ作成

### 方法1: Bashスクリプトを使用（推奨）

```bash
# スクリプトに実行権限を付与
chmod +x create-release-package.sh

# スクリプトを実行
./create-release-package.sh
```

### 方法2: PowerShellスクリプトを使用

```powershell
.\create-release-package.ps1
```

---

## 📤 ステップ3: Chrome Web Storeに申請

### 1. ダッシュボードにアクセス
https://chrome.google.com/webstore/devconsole

### 2. パッケージアップロード
- `kimitolink-web-diagnosis-v6.5.1.zip` を選択

### 3. リリースノート入力
`RELEASE_NOTES_v6.5.1.md` の内容をコピー&ペースト

### 4. 審査に提出

---

## ✅ 完了！

審査完了まで1-3営業日かかります。

---

## 📝 補足: GitHubにプッシュする場合（将来的に）

もしGitHubリポジトリを作成した場合：

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/yourusername/dns-osint-pro-ver2.0.git

# プッシュ
git push -u origin main
```

---

## 🔖 タグ作成（オプション）

バージョンごとにタグを作成すると管理しやすい：

```bash
# タグ作成
git tag -a v6.5.1 -m "v6.5.1: Major improvements"

# タグ確認
git tag

# GitHubにプッシュする場合
git push origin v6.5.1
```
