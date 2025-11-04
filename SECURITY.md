# 🔒 セキュリティポリシー (Security Policy)

## サポートされているバージョン

現在、以下のバージョンでセキュリティアップデートを提供しています：

| バージョン | サポート状況 |
| --------- | ------------ |
| 5.1.x     | ✅ サポート中 |
| 5.0.x     | ✅ サポート中 |
| < 5.0     | ❌ サポート終了 |

---

## 🚨 セキュリティ脆弱性の報告

セキュリティ上の脆弱性を発見した場合は、**公開のIssueではなく**、以下の方法で報告してください。

### 推奨される報告方法

1. **メールで報告（最優先）**
   - 📧 **security@reverse-re-birth-hack.com**
   - 件名: `[SECURITY] DNS OSINT Pro - 脆弱性報告`

2. **LINE経由で報告**
   - 📱 [リバースハック公式LINE](https://t.co/3DiN1zx5ju)
   - メッセージに「セキュリティ脆弱性の報告」と明記

### 報告に含めるべき情報

```markdown
## 脆弱性の概要
簡潔に脆弱性を説明してください。

## 影響範囲
- 影響を受けるバージョン:
- 重要度（Critical/High/Medium/Low）:
- 攻撃の難易度:

## 再現手順
1. 手順1
2. 手順2
3. ...

## 概念実証（PoC）
可能であれば、脆弱性を実証するコードやスクリーンショットを提供してください。

## 推奨される修正方法
修正方法のアイデアがあれば記載してください。

## 連絡先
あなたの連絡先情報（任意）
```

---

## 🔐 セキュリティ対策

このプロジェクトでは、以下のセキュリティ対策を実施しています：

### 1. データ保護

- ✅ **ローカル処理**: すべてのデータはローカルで処理され、外部サーバーに送信されません
- ✅ **暗号化通信**: すべてのAPI通信はHTTPSで暗号化されています
- ✅ **DNS over HTTPS**: DNS通信はDoHで暗号化され、プライバシーが保護されます
- ✅ **データ保存なし**: 現在のバージョンでは、ユーザーデータを永続的に保存していません

### 2. 権限管理

```json
{
  "permissions": [
    "activeTab",      // 現在のタブ情報のみ
    "storage",        // 設定保存のみ
    "tabs",           // タブ情報取得のみ
    "contextMenus"    // 右クリックメニュー追加のみ
  ]
}
```

- 最小限の権限のみを要求
- 不要な権限は要求しない
- すべての履歴やブックマークへのアクセスは不要

### 3. Content Security Policy (CSP)

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

- インラインスクリプトの実行を禁止
- 外部スクリプトの読み込みを禁止
- XSS攻撃からの保護

### 4. CORS制限

- すべての外部APIリクエストは、明示的に許可されたドメインのみ
- `host_permissions`で厳密に制限

### 5. 入力検証

```javascript
// ドメイン名の検証
function normalizeDomain(input) {
  try { 
    return new URL(input).hostname; 
  } catch { 
    // フォールバック処理
  }
  const m = String(input).trim().match(/[a-z0-9.-]+\.[a-z.]{2,}/i);
  return m ? m[0].toLowerCase() : "";
}
```

- すべての入力を検証
- XSS攻撃の防止
- インジェクション攻撃の防止

---

## 🛡️ セキュリティのベストプラクティス

### 開発者向け

#### 1. コードレビュー

- すべてのプルリクエストは複数人でレビュー
- セキュリティ上の問題がないか確認

#### 2. 依存関係の管理

```bash
# 脆弱性のスキャン（将来的に導入予定）
npm audit
npm audit fix
```

#### 3. 機密情報の管理

```javascript
// ❌ Bad: APIキーをハードコード
const API_KEY = 'sk-1234567890abcdef';

// ✅ Good: 環境変数から取得
const API_KEY = process.env.API_KEY;
```

#### 4. エラーハンドリング

```javascript
// ✅ Good: エラー情報を適切に処理
try {
  const data = await fetchData();
} catch (error) {
  console.error('Error:', error.message);  // スタックトレースを公開しない
  showErrorMessage('データ取得に失敗しました');
}
```

### ユーザー向け

#### 1. 公式版のみを使用

- Chrome Web Storeの公式版のみをインストール
- 非公式のコピーは使用しない

#### 2. 権限の確認

インストール時に要求される権限を確認：
- 不審な権限が要求された場合はインストールしない
- 権限の変更があった場合は確認する

#### 3. 定期的な更新

- 最新版に更新して、セキュリティパッチを適用
- `chrome://extensions/` で自動更新を有効化

#### 4. 不審な動作の報告

以下のような不審な動作を発見した場合は、すぐに報告してください：
- 予期しないデータ送信
- 不要な権限の要求
- 異常なリソース使用
- 未知のネットワーク通信

---

## 📋 セキュリティチェックリスト

### リリース前のチェック項目

- [ ] すべてのAPI通信がHTTPSであることを確認
- [ ] 不要な権限を削除
- [ ] 入力検証が適切に実装されている
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] CSPが適切に設定されている
- [ ] 依存関係に既知の脆弱性がない
- [ ] コードレビューが完了している
- [ ] セキュリティテストが完了している

---

## 🔍 既知のセキュリティ問題

現在、報告されている既知のセキュリティ問題はありません。

過去のセキュリティアドバイザリは [Security Advisories](https://github.com/yourusername/dns-osint-pro-ver2.0/security/advisories) をご覧ください。

---

## 📜 セキュリティアップデート履歴

### v5.1.0 (2025-10-05)
- セキュリティヘッダー診断機能を追加
- タイムアウト処理を追加（DoS攻撃対策）
- エラーハンドリングを改善

### v5.0.0 (2025-10-04)
- Manifest V3への移行（セキュリティ強化）
- CORS制限への適切な対応
- 暗号化通信の強化

---

## 🏆 セキュリティ研究者への謝辞

セキュリティ脆弱性を責任を持って報告してくださった研究者の方々に感謝します。

**Hall of Fame:**

*現在、該当者はいません*

---

## 📞 セキュリティ関連の連絡先

### 緊急時

- 📧 **security@reverse-re-birth-hack.com**
- 📱 [LINE相談](https://t.co/3DiN1zx5ju)（「セキュリティ緊急」と明記）

### 一般的な問い合わせ

- 🐛 [GitHub Issues](https://github.com/yourusername/dns-osint-pro-ver2.0/issues)（セキュリティ以外）
- 💬 [Discussions](https://github.com/yourusername/dns-osint-pro-ver2.0/discussions)

---

## 📚 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)

---

## 🔄 ポリシーの更新

このセキュリティポリシーは定期的に見直され、必要に応じて更新されます。

**最終更新:** 2025年10月5日  
**次回レビュー予定:** 2025年11月1日

---

<p align="center">
  <strong>セキュリティは私たちの最優先事項です 🔒</strong>
  <br>
  <br>
  Made with ❤️ by Reverse Rebirth Hack Team
</p>
