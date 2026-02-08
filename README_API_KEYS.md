# APIキーの設定方法

## 概要

この拡張機能では、Google APIキーを設定することで、以下の機能が使用できます：

- **Google Custom Search API**: 検索機能で使用
- **Google Maps API**: IPアドレスの位置情報を地図で表示

## 設定方法

### 方法1: オプション画面で設定（推奨）

1. Chrome拡張機能のアイコンを右クリック → 「オプション」を選択
2. 「Google Custom Search API Key」と「Google Maps API Key」を入力
3. 「保存」をクリック

この方法で設定したAPIキーは、Chrome Syncで端末間で同期されます。

### 方法2: ローカルでデフォルト値を設定

同じAPIキーを常に使用したい場合は、`background.js`の以下の部分を編集してください：

```javascript
const GOOGLE_API_CONFIG = {
  DEFAULT_API_KEY: 'あなたのAPIキー', // ここに設定
  // ...
};

const GOOGLE_MAPS_API_CONFIG = {
  DEFAULT_API_KEY: 'あなたのAPIキー' // ここに設定
};
```

**⚠️ 重要**: この方法で設定した場合、`background.js`をGitHubにプッシュする前に、APIキーを削除してください。

## セキュリティについて

- APIキーは**GitHubなどの公開リポジトリにコミットしないでください**
- オプション画面で設定する方法が最も安全です
- ローカルでデフォルト値を設定する場合は、必ずコミット前に削除してください

## APIキーの取得方法

1. [Google Cloud Console](https://console.cloud.google.com/) にログイン
2. プロジェクトを選択（または新規作成）
3. 「APIとサービス」→「認証情報」を開く
4. 「認証情報を作成」→「APIキー」を選択
5. 必要に応じてAPIキーの制限を設定（推奨）

## トラブルシューティング

### APIキーが設定されていない場合

- オプション画面で設定されているか確認してください
- 拡張機能をリロードしてください（`chrome://extensions/` で「更新」をクリック）

### エラーが発生する場合

- APIキーが正しく設定されているか確認してください
- Google Cloud ConsoleでAPIが有効になっているか確認してください
- APIキーの制限設定を確認してください

