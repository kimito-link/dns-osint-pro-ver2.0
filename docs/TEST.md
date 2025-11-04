# DNS OSINT Pro ver2.0 - テストケース（TEST）

最終更新: 2025-11-04

---

## 📋 目次

1. [テスト戦略](#テスト戦略)
2. [ユニットテスト](#ユニットテスト)
3. [統合テスト](#統合テスト)
4. [E2Eテスト](#e2eテスト)
5. [TDD実装チェックリスト](#tdd実装チェックリスト)

---

## 🎯 テスト戦略

### TDD（Test-Driven Development）の原則

1. **Red**: テストを先に書く（失敗する）
2. **Green**: テストが通る最小限のコードを書く
3. **Refactor**: コードをリファクタリングする

### テストの種類

- **ユニットテスト**: 個別の関数をテスト
- **統合テスト**: モジュール間の連携をテスト
- **E2Eテスト**: ユーザー操作をテスト

---

## 🧪 ユニットテスト

### 1. utils.js のテスト

#### isValidDomain()

```javascript
describe('isValidDomain', () => {
  it('✅ 有効なドメイン名を正しく判定する', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.example.com')).toBe(true);
    expect(isValidDomain('example.co.jp')).toBe(true);
  });

  it('❌ 無効なドメイン名を正しく判定する', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('invalid domain')).toBe(false);
    expect(isValidDomain('example..com')).toBe(false);
  });
});
```

#### isValidIP()

```javascript
describe('isValidIP', () => {
  it('✅ 有効なIPv4アドレスを正しく判定する', () => {
    expect(isValidIP('192.168.1.1')).toBe(true);
    expect(isValidIP('8.8.8.8')).toBe(true);
  });

  it('❌ 無効なIPアドレスを正しく判定する', () => {
    expect(isValidIP('256.256.256.256')).toBe(false);
    expect(isValidIP('invalid')).toBe(false);
  });
});
```

#### extractDomain()

```javascript
describe('extractDomain', () => {
  it('✅ URLからドメインを抽出する', () => {
    expect(extractDomain('https://example.com/path')).toBe('example.com');
    expect(extractDomain('http://sub.example.com')).toBe('sub.example.com');
  });
});
```

### 2. popup.js のテスト

#### detectNegativeKeywords()

```javascript
describe('detectNegativeKeywords', () => {
  it('✅ ネガティブキーワードを検出する', () => {
    const suggests = ['example 詐欺', 'example ブラック', 'example 良い'];
    const negative = detectNegativeKeywords(suggests);
    expect(negative).toContain('example 詐欺');
    expect(negative).toContain('example ブラック');
    expect(negative).not.toContain('example 良い');
  });
});
```

---

## 🔗 統合テスト

### 1. DNS情報取得の統合テスト

```javascript
describe('DNS情報取得フロー', () => {
  it('✅ example.com のDNS情報を取得できる', async () => {
    const domain = 'example.com';
    const dnsInfo = await getDNSInfo(domain);
    
    expect(dnsInfo).toBeDefined();
    expect(dnsInfo.A).toBeInstanceOf(Array);
    expect(dnsInfo.A.length).toBeGreaterThan(0);
  });

  it('⏱️ タイムアウトが正しく動作する', async () => {
    const slowAPI = new Promise((resolve) => setTimeout(resolve, 20000));
    await expect(withTimeout(slowAPI, 5000)).rejects.toThrow('Timeout');
  });
});
```

### 2. サジェスト取得の統合テスト

```javascript
describe('サジェスト取得フロー', () => {
  it('✅ Google/Yahoo/Bingのサジェストを取得できる', async () => {
    const siteName = 'Amazon';
    const suggests = await getSuggests(siteName);
    
    expect(suggests.google).toBeInstanceOf(Array);
    expect(suggests.yahoo).toBeInstanceOf(Array);
    expect(suggests.bing).toBeInstanceOf(Array);
  });
});
```

---

## 🖱️ E2Eテスト

### 1. ドメイン検索フロー

```javascript
test('ドメイン検索が正常に動作する', async ({ page }) => {
  // 拡張機能を開く
  await page.goto('chrome-extension://[extension-id]/popup.html');
  
  // ドメインを入力
  await page.fill('input[name="domain"]', 'example.com');
  
  // 検索ボタンをクリック
  await page.click('button[id="search-btn"]');
  
  // DNS情報が表示されることを確認
  await expect(page.locator('.dns-info')).toBeVisible();
  await expect(page.locator('.dns-info')).toContainText('93.184.216.34');
});
```

### 2. 履歴機能のテスト

```javascript
test('検索履歴が保存される', async ({ page }) => {
  await page.goto('chrome-extension://[extension-id]/popup.html');
  
  // 検索実行
  await page.fill('input[name="domain"]', 'example.com');
  await page.click('button[id="search-btn"]');
  
  // 履歴タブを開く
  await page.click('button[id="history-tab"]');
  
  // 履歴に表示されることを確認
  await expect(page.locator('.history-list')).toContainText('example.com');
});
```

---

## ✅ TDD実装チェックリスト

### Phase 9: サブドメイン探索機能

#### 1. crt.sh API連携

- [ ] **テスト**: crt.sh APIからサブドメインを取得できる
- [ ] **テスト**: タイムアウトが正しく動作する
- [ ] **テスト**: エラーハンドリングが正しく動作する
- [ ] **実装**: `getSubdomainsFromCrtSh(domain)`
- [ ] **テスト通過確認**: すべてのテストがグリーン

#### 2. SecurityTrails API連携

- [ ] **テスト**: SecurityTrails APIからサブドメインを取得できる
- [ ] **実装**: `getSubdomainsFromSecurityTrails(domain)`
- [ ] **テスト通過確認**: すべてのテストがグリーン

#### 3. サブドメイン一覧表示

- [ ] **テスト**: サブドメインがUIに表示される
- [ ] **テスト**: 重複が除去される
- [ ] **テスト**: アルファベット順にソートされる
- [ ] **実装**: `displaySubdomains(subdomains)`
- [ ] **テスト通過確認**: すべてのテストがグリーン

#### 4. サブドメインのDNS情報取得

- [ ] **テスト**: 各サブドメインのDNS情報を取得できる
- [ ] **実装**: `getSubdomainDNSInfo(subdomain)`
- [ ] **テスト通過確認**: すべてのテストがグリーン

---

## 🚀 実装ルール

### TDD実装の流れ

```
1. テストを書く（Red）
   ↓
2. テストが失敗することを確認
   ↓
3. 最小限のコードを書く（Green）
   ↓
4. テストが通ることを確認
   ↓
5. コードをリファクタリング（Refactor）
   ↓
6. テストが通ることを再確認
   ↓
7. 次のテストへ
```

### コミットルール

- ✅ **テストがすべて通った時のみコミット**
- 📝 コミットメッセージ形式: `test: [機能名] のテスト追加` または `feat: [機能名] を実装`
- 🔴 テストが失敗している状態でコミットしない

---

<div align="center">

**DNS OSINT Pro ver2.0 - Test Cases**

TDD（テスト駆動開発）で確実な実装を

最終更新: 2025-11-04

</div>
