# 🤝 コントリビューションガイド

DNS OSINT Pro ver2.0へのコントリビューション（貢献）をお待ちしています！  
このドキュメントでは、プロジェクトへの貢献方法を説明します。

---

## 📋 目次

1. [行動規範](#行動規範)
2. [貢献の方法](#貢献の方法)
3. [開発環境のセットアップ](#開発環境のセットアップ)
4. [プルリクエストの流れ](#プルリクエストの流れ)
5. [コーディングガイドライン](#コーディングガイドライン)
6. [コミットメッセージ](#コミットメッセージ)
7. [Issue の作成](#issueの作成)

---

## 行動規範

このプロジェクトに参加するすべての人は、以下の行動規範を守ってください：

### ✅ すべきこと
- 敬意を持って他の貢献者と接する
- 建設的なフィードバックを提供する
- 異なる意見や経験を尊重する
- コミュニティの利益を優先する
- 初心者を歓迎し、サポートする

### ❌ してはいけないこと
- 攻撃的または差別的な言動
- 個人攻撃や中傷
- 荒らし行為
- プライバシーの侵害
- その他、不適切な行動

---

## 貢献の方法

### 🐛 バグ報告

バグを見つけた場合：

1. [既存のIssue](https://github.com/yourusername/dns-osint-pro-ver2.0/issues)を確認
2. 同じバグが報告されていなければ、新しいIssueを作成
3. 以下の情報を含める：
   - バグの説明
   - 再現手順
   - 期待される動作
   - 実際の動作
   - スクリーンショット（あれば）
   - 環境情報（Chrome バージョン、OS等）

**Issueテンプレート:**
```markdown
## バグの説明
簡潔にバグを説明してください。

## 再現手順
1. '...' に移動
2. '....' をクリック
3. '....' までスクロール
4. エラーを確認

## 期待される動作
何が起こるべきかを説明してください。

## スクリーンショット
可能であれば、スクリーンショットを追加してください。

## 環境
- OS: [例: Windows 11]
- ブラウザ: [例: Chrome 120.0.6099.129]
- 拡張機能バージョン: [例: 5.1.0]

## 追加情報
その他の情報があれば記載してください。
```

---

### 💡 機能リクエスト

新機能のアイデアがある場合：

1. [Discussions](https://github.com/yourusername/dns-osint-pro-ver2.0/discussions)で議論
2. 合意が得られたら、Issueを作成
3. 以下の情報を含める：
   - 機能の説明
   - 必要性・ユースケース
   - 実装案（あれば）

**Issueテンプレート:**
```markdown
## 機能の説明
どんな機能を追加したいですか？

## 問題・必要性
この機能がなぜ必要ですか？どんな問題を解決しますか？

## 提案する解決策
どのように実装すべきだと思いますか？

## 代替案
他に考えられる解決策はありますか？

## 追加情報
その他の情報があれば記載してください。
```

---

### 📝 ドキュメントの改善

- タイポの修正
- 説明の改善
- 新しいガイドの追加
- 翻訳（英語版の作成等）

---

### 🔧 コードの貢献

- バグ修正
- 新機能の実装
- パフォーマンス改善
- リファクタリング

---

## 開発環境のセットアップ

### 1. リポジトリをフォーク

GitHubで「Fork」ボタンをクリックして、自分のアカウントにリポジトリをコピーします。

### 2. クローン

```bash
git clone https://github.com/YOUR_USERNAME/dns-osint-pro-ver2.0.git
cd dns-osint-pro-ver2.0
```

### 3. リモートリポジトリの設定

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/dns-osint-pro-ver2.0.git
git remote -v
```

### 4. Chrome拡張機能として読み込み

1. Chrome で `chrome://extensions/` を開く
2. デベロッパーモードを有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンしたフォルダを選択

---

## プルリクエストの流れ

### 1. 最新のコードを取得

```bash
git checkout main
git pull upstream main
```

### 2. 新しいブランチを作成

```bash
# 機能追加の場合
git checkout -b feature/your-feature-name

# バグ修正の場合
git checkout -b fix/bug-description

# ドキュメント修正の場合
git checkout -b docs/what-you-changed
```

**ブランチ命名規則:**
- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント
- `refactor/` - リファクタリング
- `test/` - テスト追加
- `chore/` - その他の変更

### 3. コードを変更

- コーディングガイドラインに従う
- 変更箇所をテストする
- 必要に応じてドキュメントを更新

### 4. コミット

```bash
git add .
git commit -m "Add: 新機能の説明"
```

### 5. プッシュ

```bash
git push origin feature/your-feature-name
```

### 6. プルリクエストを作成

1. GitHubでフォークしたリポジトリを開く
2. 「Compare & pull request」ボタンをクリック
3. 変更内容を説明
4. プルリクエストを送信

**PRテンプレート:**
```markdown
## 変更内容
この変更で何をしましたか？

## 関連するIssue
Closes #123

## 変更の種類
- [ ] バグ修正
- [ ] 新機能
- [ ] 破壊的変更
- [ ] ドキュメント更新

## チェックリスト
- [ ] コードが正しく動作することを確認した
- [ ] コーディングガイドラインに従っている
- [ ] 必要なドキュメントを更新した
- [ ] コミットメッセージが明確である

## スクリーンショット（該当する場合）
変更後の画面などを添付してください。

## 追加情報
その他、レビュアーが知っておくべき情報があれば記載してください。
```

---

## コーディングガイドライン

### JavaScript

#### スタイル

```javascript
// ✅ Good
const userName = 'John';
const API_URL = 'https://example.com';

function fetchUserData(userId) {
  return fetch(`${API_URL}/users/${userId}`);
}

// ❌ Bad
var user_name = 'John';
function fetch_user_data(user_id) {
  return fetch('https://example.com/users/' + user_id);
}
```

#### 非同期処理

```javascript
// ✅ Good: async/await
async function getData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// ❌ Bad: Promise.then()
function getData() {
  return fetch(url)
    .then(res => res.json())
    .catch(err => console.error(err));
}
```

#### エラーハンドリング

```javascript
// ✅ Good: 適切なエラー処理
try {
  const data = await riskyOperation();
  processData(data);
} catch (error) {
  console.error('Operation failed:', error);
  showErrorMessage(error.message);
}

// ❌ Bad: エラー無視
const data = await riskyOperation();
processData(data);
```

### HTML

```html
<!-- ✅ Good: セマンティックHTML -->
<header>
  <h1>タイトル</h1>
  <nav>
    <ul>
      <li><a href="#home">ホーム</a></li>
    </ul>
  </nav>
</header>

<!-- ❌ Bad -->
<div class="header">
  <div class="title">タイトル</div>
</div>
```

### CSS

```css
/* ✅ Good: BEM記法 */
.block {}
.block__element {}
.block--modifier {}

/* ✅ Good: 意味のあるクラス名 */
.user-profile {}
.btn-primary {}

/* ❌ Bad: 意味不明なクラス名 */
.box1 {}
.red-text {}
```

---

## コミットメッセージ

### フォーマット

```
種類: 簡潔な説明（50文字以内）

詳細な説明（必要に応じて）
```

### 種類

- `Add:` - 新機能の追加
- `Fix:` - バグ修正
- `Update:` - 既存機能の更新
- `Remove:` - ファイルやコードの削除
- `Refactor:` - リファクタリング
- `Docs:` - ドキュメントの変更
- `Style:` - コードフォーマットの変更
- `Test:` - テストの追加・修正
- `Chore:` - ビルド処理やツールの変更

### 例

```bash
# ✅ Good
git commit -m "Add: サブドメイン検索機能を追加"
git commit -m "Fix: サジェスト取得時のタイムアウトエラーを修正"
git commit -m "Update: README.mdのインストール手順を更新"

# ❌ Bad
git commit -m "update"
git commit -m "fix bug"
git commit -m "いろいろ変更"
```

### 詳細な説明が必要な場合

```bash
git commit -m "Add: サブドメイン検索機能

SecurityTrails APIを使用して、サブドメインを検索する機能を追加しました。

- background.jsにfetchSubdomains()関数を追加
- popup.jsに検索結果の表示処理を追加
- manifest.jsonに必要な権限を追加

Closes #42"
```

---

## Issue の作成

### 良いIssueの例

**タイトル:**
```
[Bug] サジェスト取得時に「Failed to fetch」エラーが発生
```

**本文:**
```markdown
## 環境
- OS: Windows 11
- Chrome: 120.0.6099.129
- 拡張機能バージョン: 5.1.0

## 問題の説明
特定のドメインでサジェスト情報を取得しようとすると、
「Failed to fetch」エラーが発生します。

## 再現手順
1. 拡張機能を開く
2. ドメイン「example.co.jp」を入力
3. 検索ボタンをクリック
4. サジェスト情報の取得でエラー

## 期待される動作
Google、Yahoo、Bingのサジェストが正常に表示される

## 実際の動作
エラーメッセージが表示される：
「⚠️ エラーが発生しました: Failed to fetch」

## スクリーンショット
[添付画像]

## 追加情報
- 他のドメイン（example.com等）では正常に動作する
- コンソールに「CORS error」が表示される
```

---

## レビュープロセス

### レビュアー向け

- コードの品質を確認
- テストが必要な場合は実際に動作確認
- 建設的なフィードバックを提供
- 承認またはChanges Requestedを明確に

### コントリビューター向け

- レビューのフィードバックに迅速に対応
- 質問があれば遠慮なく聞く
- レビュアーに感謝の気持ちを忘れずに

---

## マージ後

### 1. ブランチの削除

```bash
# ローカルブランチ削除
git branch -d feature/your-feature-name

# リモートブランチ削除
git push origin --delete feature/your-feature-name
```

### 2. mainブランチを更新

```bash
git checkout main
git pull upstream main
git push origin main
```

---

## よくある質問

### Q: 初めての貢献で何から始めればいいですか？

**A:** 以下のラベルが付いたIssueから始めることをお勧めします：
- `good first issue` - 初心者向け
- `help wanted` - ヘルプ募集中
- `documentation` - ドキュメント改善

### Q: コードは書けませんが、貢献できますか？

**A:** もちろんです！以下の方法で貢献できます：
- ドキュメントの改善
- バグ報告
- 機能提案
- UIデザインの提案
- テスト・レビュー

### Q: プルリクエストが承認されるまでどのくらいかかりますか？

**A:** 通常1-7日程度です。ただし、規模や内容によって異なります。

### Q: レビューで修正を求められました。どうすればいいですか？

**A:** 
1. フィードバックを確認
2. コードを修正
3. コミット・プッシュ（プルリクエストは自動更新されます）
4. レビュアーに再レビューを依頼

```bash
git add .
git commit -m "Fix: レビューのフィードバックに対応"
git push origin feature/your-feature-name
```

---

## コミュニティ

### サポートが必要な場合

- 💬 [Discussions](https://github.com/yourusername/dns-osint-pro-ver2.0/discussions) - 質問・議論
- 🐛 [Issues](https://github.com/yourusername/dns-osint-pro-ver2.0/issues) - バグ報告
- 📧 Email: info@reverse-re-birth-hack.com

### 参考資料

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)

---

## 謝辞

すべての貢献者に感謝します！ 🙏

貢献者リストは [CONTRIBUTORS.md](CONTRIBUTORS.md) をご覧ください。

---

## ライセンス

このプロジェクトに貢献することで、あなたのコントリビューションが [MIT License](LICENSE) の下でライセンスされることに同意したものとみなされます。

---

<p align="center">
  <strong>貢献してくださりありがとうございます！ ❤️</strong>
  <br>
  <br>
  Made with ❤️ by Reverse Rebirth Hack Team
</p>
