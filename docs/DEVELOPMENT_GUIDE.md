# 🛠️ 開発ガイド

## 📋 目次
- [開発環境セットアップ](#開発環境セットアップ)
- [プロジェクト構成](#プロジェクト構成)
- [開発ワークフロー](#開発ワークフロー)
- [デバッグ方法](#デバッグ方法)
- [リリース手順](#リリース手順)
- [コーディング規約](#コーディング規約)

---

## 🚀 開発環境セットアップ

### 必要なツール
- **Google Chrome** - 最新版
- **Git** - バージョン管理
- **テキストエディタ** - VSCode推奨
- **Git Bash** - Windowsの場合

### セットアップ手順

#### 1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/dns-osint-pro-ver2.0.git
cd dns-osint-pro-ver2.0
```

#### 2. Chrome拡張機能として読み込む
1. Chromeで `chrome://extensions/` を開く
2. 「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトフォルダを選択

#### 3. 動作確認
- 拡張機能アイコンをクリック
- 任意のドメインで検索
- 正常に動作することを確認

---

## 📂 プロジェクト構成

### ファイル構成
```
dns-osint-pro-ver2.0/
├── manifest.json               # 拡張機能の設定
├── popup.html                  # ポップアップUI
├── popup.js                    # メインロジック
├── background.js               # バックグラウンド処理
├── utils.js                    # ユーティリティ関数
├── ui-components.js            # UI関連関数
├── styles.css                  # スタイル
├── options.html                # 設定画面
├── images/                     # 画像ファイル
└── docs/                       # ドキュメント
```

### 主要ファイルの役割

#### manifest.json
- 拡張機能のメタデータ
- 権限設定
- バージョン管理

#### popup.js
- ユーザーインターフェースのロジック
- DOM操作
- イベントハンドリング

#### background.js
- バックグラウンドで実行される処理
- API呼び出し
- サジェスト取得
- サイト健康診断

#### utils.js
- DNS over HTTPS (DoH) クエリ
- RDAP情報取得
- ユーティリティ関数

#### ui-components.js
- UI生成関数
- SEO情報セクション
- 診断結果表示

---

## 🔄 開発ワークフロー

### 1. 新機能開発

#### ステップ1: ブランチ作成（将来的に）
```bash
git checkout -b feature/new-feature
```

#### ステップ2: コード変更
- ファイルを編集
- 定期的に保存

#### ステップ3: テスト
- Chromeで拡張機能をリロード
- 動作確認

#### ステップ4: デバッグ
- F12でDevToolsを開く
- コンソールログを確認
- デバッグログ機能を使用

#### ステップ5: コミット
```bash
git add .
git commit -m "新機能: 〇〇を追加"
```

---

### 2. バグ修正

#### ステップ1: 問題を再現
- バグを再現する手順を確認
- デバッグログで原因を特定

#### ステップ2: 修正
- コードを修正
- テストして動作確認

#### ステップ3: コミット
```bash
git add .
git commit -m "バグ修正: 〇〇の問題を解決"
```

---

## 🐛 デバッグ方法

### 1. デバッグログ機能
最も簡単な方法：
1. 拡張機能を開く
2. SEO情報タブに移動
3. 「🐛 デバッグログを表示」をクリック
4. ログを確認

### 2. Chrome DevTools
#### ポップアップのデバッグ
1. 拡張機能のポップアップを右クリック
2. 「検証」を選択
3. DevToolsが開く
4. Consoleタブでログを確認

#### Service Workerのデバッグ
1. `chrome://extensions/` を開く
2. 拡張機能の「service worker」をクリック
3. DevToolsが開く
4. background.jsのログを確認

### 3. ネットワーク通信の確認
1. DevToolsを開く
2. Networkタブを選択
3. API呼び出しを確認

### 4. ブレークポイント
1. DevToolsのSourcesタブ
2. ファイルを開く
3. 行番号をクリックしてブレークポイントを設定
4. コードを実行

---

## 📦 リリース手順

### 1. バージョンアップ

#### manifest.jsonを更新
```json
{
  "version": "6.6.0"  // 新しいバージョン
}
```

#### ドキュメント更新
- README.md のバージョン表記
- CHANGELOG.md に変更内容を追加
- RELEASE_NOTES を作成

### 2. テスト
- 全機能の動作確認
- 複数のサイトでテスト
- エラーがないか確認

### 3. コミット
```bash
git add .
git commit -m "v6.6.0: 新機能追加、バグ修正"
```

### 4. ZIPファイル作成
```bash
# Git Bash
./create-release-package.sh

# または PowerShell
.\create-release-package.ps1
```

### 5. Chrome Web Storeに申請
1. https://chrome.google.com/webstore/devconsole
2. 既存アイテムを選択
3. ZIPファイルをアップロード
4. リリースノートを入力
5. 審査に提出

---

## 📝 コーディング規約

### JavaScript

#### 命名規則
```javascript
// 変数: camelCase
const userName = "りんく";
const isActive = true;

// 定数: UPPER_SNAKE_CASE
const API_ENDPOINT = "https://api.example.com";
const MAX_RETRY = 3;

// 関数: camelCase
function fetchData() { }
async function getSuggests() { }

// クラス: PascalCase
class UserManager { }
```

#### インデント
- スペース2個
- タブは使わない

#### セミコロン
- 文末にセミコロンを付ける

#### コメント
```javascript
// 単行コメント: 日本語OK

/**
 * 複数行コメント
 * 関数の説明など
 */
function example() { }
```

### HTML

#### インデント
- スペース2個

#### 属性の順序
```html
<button 
  id="myButton"
  class="btn btn-primary"
  data-tab="seoTab"
  style="color: red;">
  クリック
</button>
```

### CSS

#### 命名規則
- kebab-case
```css
.tab-navigation { }
.tab-button { }
.debug-log-section { }
```

#### インデント
- スペース2個

---

## 🧪 テストのベストプラクティス

### 1. 複数のサイトでテスト
- 大規模サイト（ページ数: 1000+）
- 小規模サイト（ページ数: < 10）
- サイトマップなしのサイト

### 2. エラーケースのテスト
- ネットワークエラー
- タイムアウト
- 存在しないドメイン

### 3. パフォーマンステスト
- 処理時間の測定
- メモリ使用量の確認

---

## 🔧 トラブルシューティング

### 拡張機能が動作しない
1. Chrome を再起動
2. 拡張機能をリロード
3. キャッシュをクリア

### APIエラーが発生
1. ネットワーク接続を確認
2. API エンドポイントの確認
3. CORS設定の確認

### ログが表示されない
1. デバッグログ機能を使用
2. F12でDevToolsを開く
3. console.log の確認

---

## 📚 参考リンク

### Chrome拡張機能
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome APIs](https://developer.chrome.com/docs/extensions/reference/)

### Web API
- [DNS over HTTPS](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/)
- [RDAP](https://about.rdap.org/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## 💡 Tips

### 開発効率化
1. **Hot Reload**: 拡張機能の自動リロードツールを使う（将来的に）
2. **コードスニペット**: よく使うコードをスニペット登録
3. **デバッグログ**: 積極的にログを出力

### コードの品質
1. **関数は短く**: 1つの関数は1つの役割
2. **コメントを書く**: 複雑なロジックには説明を
3. **エラーハンドリング**: try-catchを適切に使う

---

**Happy Coding! 🚀**
