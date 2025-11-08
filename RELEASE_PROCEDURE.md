# 🚀 Chrome Web Store リリース手順

## バージョン: v6.5.1

---

## 📋 ステップ1: リリースパッケージ作成

### 方法1: PowerShellスクリプトを使用（推奨）

1. **PowerShellを開く**
   ```
   エクスプローラーでプロジェクトフォルダを開く
   → アドレスバーに「powershell」と入力してEnter
   ```

2. **スクリプトを実行**
   ```powershell
   .\create-release-package.ps1
   ```

3. **エラーが出る場合**
   ```powershell
   # 実行ポリシーを変更
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   # 再度実行
   .\create-release-package.ps1
   ```

4. **完了**
   - `kimitolink-web-diagnosis-v6.5.1.zip` が作成されます

---

### 方法2: 手動でZIPファイル作成

以下のファイル・フォルダを選択してZIPに圧縮：

#### 必須ファイル
- ✅ manifest.json
- ✅ popup.html
- ✅ popup.js
- ✅ background.js
- ✅ utils.js
- ✅ ui-components.js
- ✅ styles.css
- ✅ options.html
- ✅ images/ （フォルダごと）

#### 除外ファイル（ZIPに含めない）
- ❌ PROGRESS.md
- ❌ RELEASE_NOTES_v6.5.1.md
- ❌ DEBUG_LOG_GUIDE.md
- ❌ create-release-package.ps1
- ❌ RELEASE_PROCEDURE.md
- ❌ .git/
- ❌ node_modules/

---

## 📋 ステップ2: Chrome Web Storeに申請

### 1. ダッシュボードにアクセス
```
https://chrome.google.com/webstore/devconsole
```

### 2. 既存アイテムを選択
- 「君斗りんくのWEBサイト健康診断」を選択

### 3. パッケージをアップロード
- 「パッケージをアップロード」ボタンをクリック
- `kimitolink-web-diagnosis-v6.5.1.zip` を選択

### 4. ストア掲載情報の更新（オプション）

#### 更新内容（RELEASE_NOTES_v6.5.1.mdから）
```
v6.5.1 - 大幅な機能改善とパフォーマンス向上

【新機能】
✨ サイトタイトル常時表示 - 検索窓の下にサイト情報を表示
🐛 デバッグログ機能 - トラブルシューティングが簡単に
⚡ サイトマップ処理の高速化 - 約15倍の速度改善

【バグ修正】
✅ タブ切り替え問題を修正
✅ CSPエラーを解決

【改善】
🎨 UIデザインの向上
📊 パフォーマンス最適化
```

### 5. スクリーンショット更新（必要な場合）
- 新機能（サイトタイトル表示）のスクリーンショット
- デバッグログ機能のスクリーンショット

### 6. 審査に提出
- 「審査のために送信」ボタンをクリック
- 通常1-3日で審査完了

---

## ✅ チェックリスト

申請前に確認：

- [ ] ZIPファイルが作成されている
- [ ] manifest.jsonのバージョンが6.5.1になっている
- [ ] 不要なファイルが含まれていない
- [ ] リリースノートを準備している
- [ ] スクリーンショットを更新した（オプション）
- [ ] Chrome Developer Dashboardにログインできる

---

## 📞 トラブルシューティング

### PowerShellスクリプトが実行できない
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ZIPファイルのサイズが大きすぎる
- 不要なファイルが含まれていないか確認
- node_modules/や.git/が含まれていないか確認

### 審査で却下された場合
- 却下理由を確認
- 必要な修正を行う
- 再申請

---

## 📝 メモ

### バージョン履歴
- v6.0.9 → v6.5.1
- メジャーアップデート

### 審査期間
- 通常: 1-3営業日
- 初回: 最大1週間

### 次回リリース予定
- v7.0.0: Performance API統合、AI診断機能

---

## 🎉 完了！

審査が通ったら、Chrome Web Storeで公開されます。
ユーザーは自動的に最新版にアップデートされます。

お疲れ様でした！ 🚀
