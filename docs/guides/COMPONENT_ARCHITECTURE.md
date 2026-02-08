# コンポーネント化と直書きのバランスガイド

このドキュメントでは、Chrome拡張機能プロジェクトにおける「コンポーネント化」と「直書き」の適切なバランスについて説明します。

---

## 📋 目次

1. [基本方針](#基本方針)
2. [判断ルール](#判断ルール)
3. [現在のプロジェクト構造](#現在のプロジェクト構造)
4. [推奨される分割案](#推奨される分割案)
5. [実装例](#実装例)
6. [よくある質問](#よくある質問)

---

## 🎯 基本方針

### 「直書き0・全部コンポーネント化」は目標ではない

**重要な考え方:**
- **"変わるもの"だけをコンポーネント化（または設定化）**
- **"変わらない骨格"は直書きでもOK**
- **管理しやすさを最優先にする**

### コンポーネント化のメリット

✅ **差分が減る**（同じUI/処理を何度も書かない）  
✅ **修正が1箇所で済む**（バグ・文言・デザイン）  
✅ **品質が安定**（UIの統一、入力バリデーション統一）

### 落とし穴（やりすぎると逆に辛い）

❌ **抽象化しすぎて読みにくくなる**（どこで何してるか追えない）  
❌ **コンポーネントが増えすぎて探しにくい**（本末転倒）  
❌ **ちょい修正が重くなる**（小さな変更に「設計」が必要になる）

---

## 🔍 判断ルール

### 1. 直書きしていいもの（＝骨格）

以下のものは直書きで問題ありません：

- ✅ 画面の**レイアウト構造**（Grid/Stackの並び）
- ✅ ページ固有の**ストーリー**（そのページだけの流れ）
- ✅ 1回しか出ない**超固有UI**（再利用予定なし）

**例:**
```html
<!-- popup.html - レイアウト構造は直書きOK -->
<header>
  <div class="header-content">
    <img src="images/link.png" alt="君斗りんく" />
    <h1>💙 君斗りんくのWEBサイト健康診断</h1>
  </div>
</header>

<nav class="tab-navigation">
  <button class="tab-button active" data-tab="diagnosisTab">🏥 サイト健康診断</button>
  <button class="tab-button" data-tab="seoTab">📊 SEO情報</button>
</nav>
```

### 2. コンポーネント化すべきもの（＝変わる・増える）

以下のものはコンポーネント化を推奨します：

- ✅ 同じUIが**2回以上**出る（Button/Card/Modal/Tableなど）
- ✅ バリデーション、エラーハンドリング、ローディングなどの**共通挙動**
- ✅ 「表示ルール」があるもの（例：**IP表示の強調**、ステータス表示、通知）

**例:**
```javascript
// ui-components.js - 2回以上使うものはコンポーネント化
window.OsintUIComponents = {
  // ✅ 複数箇所で使う警告ボックス
  createReputationAlert(data) { ... },
  
  // ✅ 複数箇所で使うローディングスピナー
  createLoadingSpinner(message) { ... },
  
  // ✅ 複数箇所で使うエラーボックス
  createErrorBox(message, title) { ... }
};
```

### 3. コンポーネントより"設定化"が向いてるもの

以下のものは設定ファイルに分離することを推奨します：

- ✅ 文言（コピー）やラベル → **constants / i18n**
- ✅ APIのURL、タイムアウト、閾値 → **config**
- ✅ 画面の表示条件（ON/OFF）→ **feature flags**

**例:**
```javascript
// constants.js - 設定化すべきもの
const LINE_URLS = {
  IT_INFRA: 'https://lin.ee/lrjVHvH',
  REPUTATION: 'https://lin.ee/X2aWSFO'
};

const VERSION_CONSTANTS = {
  WP_MINIMUM: 6.8,
  PHP_MINIMUM: 8.0,
  CF7_MINIMUM: 6.1
};

const TIMEOUT_CONSTANTS = {
  FETCH: 10000,
  ANALYSIS: 15000
};
```

---

## 📂 現在のプロジェクト構造

### 現在のファイル構成

```
dns-osint-pro-ver2.0/
├── popup.html              # メインHTML（レイアウト構造は直書き）
├── popup.js                # メインロジック（長大なファイル）
├── ui-components.js        # UIコンポーネント（既に一部コンポーネント化）
├── utils.js                # ユーティリティ関数
├── background.js           # バックグラウンド処理
├── styles.css              # スタイルシート
│
└── src/                    # リファクタリング後のソースコード（部分的）
    ├── features/           # 機能モジュール
    │   └── suggest/       # サジェスト機能
    ├── ui/                 # UIコンポーネント
    │   ├── components.js
    │   └── link-templates.js
    └── utils/             # ユーティリティ
        └── utils.js
```

### 現在の状態の評価

**✅ 良い点:**
- `ui-components.js`でUIコンポーネントが分離されている
- `src/`配下でリファクタリングが進んでいる
- 設定値が定数として定義されている

**⚠️ 改善の余地:**
- `popup.js`が長大（5000行以上）
- HTMLにインラインスタイルが多い
- 状態管理が散在している

---

## 🎨 推奨される分割案

### 理想的な構造

```
dns-osint-pro-ver2.0/
├── popup.html                    # レイアウト構造のみ（直書きOK）
├── popup.js                      # ページ固有のストーリー（直書きOK）
│
├── src/
│   ├── components/              # UI部品
│   │   ├── ui/                  # 汎用UIコンポーネント
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Modal.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── AlertBox.js
│   │   │
│   │   └── domain/              # 業務部品
│   │       ├── ReputationAlert.js
│   │       ├── EmailSecurityCard.js
│   │       ├── SiteHealthCard.js
│   │       ├── DnsInfoTable.js
│   │       └── SuggestList.js
│   │
│   ├── hooks/                   # 状態と通信
│   │   ├── useDnsInfo.js
│   │   ├── useSuggest.js
│   │   ├── useSiteHealth.js
│   │   └── useDebugLog.js
│   │
│   ├── services/                 # API
│   │   ├── api/
│   │   │   ├── dns.js
│   │   │   ├── suggest.js
│   │   │   └── siteHealth.js
│   │   └── storage.js
│   │
│   ├── constants/                # 定数
│   │   ├── urls.js
│   │   ├── versions.js
│   │   ├── timeouts.js
│   │   └── messages.js
│   │
│   └── utils/                    # ユーティリティ
│       ├── dns.js
│       ├── validation.js
│       └── formatting.js
│
└── styles/
    ├── base.css                  # 基本スタイル
    ├── components.css            # コンポーネントスタイル
    └── layout.css                # レイアウトスタイル
```

### 実装の優先順位

#### Phase 1: 設定の分離（最優先・簡単）

```javascript
// constants/urls.js
export const LINE_URLS = {
  IT_INFRA: 'https://lin.ee/lrjVHvH',
  REPUTATION: 'https://lin.ee/X2aWSFO'
};

// constants/versions.js
export const VERSION_CONSTANTS = {
  WP_MINIMUM: 6.8,
  PHP_MINIMUM: 8.0,
  CF7_MINIMUM: 6.1
};

// constants/timeouts.js
export const TIMEOUT_CONSTANTS = {
  FETCH: 10000,
  ANALYSIS: 15000
};
```

#### Phase 2: 共通UIコンポーネントの抽出

```javascript
// src/components/ui/AlertBox.js
export function createAlertBox(type, message, title) {
  const styles = {
    error: { bg: '#ffebee', border: '#f44336', color: '#c62828' },
    success: { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32' },
    warning: { bg: '#fff3e0', border: '#ff9800', color: '#e65100' },
    info: { bg: '#e3f2fd', border: '#2196f3', color: '#0d47a1' }
  };
  
  const style = styles[type] || styles.info;
  
  return `
    <div style="background: ${style.bg}; border: 2px solid ${style.border}; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: ${style.color}; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}
```

#### Phase 3: 業務コンポーネントの抽出

```javascript
// src/components/domain/ReputationAlert.js
import { createAlertBox } from '../ui/AlertBox.js';
import { LINE_URLS } from '../../constants/urls.js';

export function createReputationAlert(suggestData) {
  const hasNegativeKeywords = suggestData.negativeKeywords.length > 0;
  
  if (!hasNegativeKeywords) {
    return '';
  }
  
  return `
    ${createAlertBox('error', '風評被害の可能性があります', '🚨 警告')}
    <div class="consultation-section">
      <!-- 相談導線 -->
    </div>
  `;
}
```

#### Phase 4: 状態管理の分離（高度）

```javascript
// src/hooks/useDnsInfo.js
export function useDnsInfo(domain) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!domain) return;
    
    setLoading(true);
    fetchDnsInfo(domain)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [domain]);
  
  return { data, loading, error };
}
```

---

## 💡 実装例

### 例1: ローディングスピナー（2回以上使う → コンポーネント化）

**Before（直書き）:**
```html
<!-- popup.html - 複数箇所に同じコード -->
<div id="seoLoadingAnimation" style="display: none;">
  <div style="text-align: center; padding: 40px 20px;">
    <div class="rinku-loader">
      <div class="rinku-character">
        <img src="images/link.png" alt="りんく" class="rinku-img">
      </div>
      <div class="loading-dots">...</div>
    </div>
    <p>🗺️ サイトマップを読み込んでいます...</p>
  </div>
</div>
```

**After（コンポーネント化）:**
```javascript
// src/components/ui/LoadingSpinner.js
export function createLoadingSpinner(message = '読み込み中...') {
  return `
    <div class="loading-spinner">
      <div class="rinku-loader">
        <div class="rinku-character">
          <img src="images/link.png" alt="りんく" class="rinku-img">
        </div>
        <div class="loading-dots">...</div>
      </div>
      <p>${message}</p>
    </div>
  `;
}

// popup.js
import { createLoadingSpinner } from './src/components/ui/LoadingSpinner.js';

function showLoading(message) {
  els.seoLoadingAnimation.innerHTML = createLoadingSpinner(message);
  els.seoLoadingAnimation.style.display = 'block';
}
```

### 例2: エラーボックス（2回以上使う → コンポーネント化）

**Before（直書き）:**
```javascript
// popup.js - 複数箇所に同じコード
function showError(message) {
  const errorHtml = `
    <div style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px;">
      <strong style="color: #c62828;">⚠️ エラーが発生しました</strong><br>
      <span>${message}</span>
    </div>
  `;
  els.resultBody.innerHTML = errorHtml;
}
```

**After（コンポーネント化）:**
```javascript
// src/components/ui/AlertBox.js
export function createErrorBox(message, title = '⚠️ エラーが発生しました') {
  return `
    <div style="background: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <strong style="color: #c62828; font-size: 1.05em;">${title}</strong><br>
      <span style="font-size: 0.9em; color: #333; margin-top: 8px; display: block;">${message}</span>
    </div>
  `;
}

// popup.js
import { createErrorBox } from './src/components/ui/AlertBox.js';

function showError(message) {
  els.resultBody.innerHTML = createErrorBox(message);
}
```

### 例3: レイアウト構造（1回しか出ない → 直書きOK）

**popup.html（直書きでOK）:**
```html
<!-- レイアウト構造は直書きで問題なし -->
<header>
  <div class="header-content">
    <img src="images/link.png" alt="君斗りんく" class="header-logo" />
    <div class="header-text">
      <h1>💙 君斗りんくのWEBサイト健康診断</h1>
    </div>
  </div>
</header>

<nav class="tab-navigation">
  <button class="tab-button active" data-tab="diagnosisTab">🏥 サイト健康診断</button>
  <button class="tab-button" data-tab="seoTab">📊 SEO情報</button>
</nav>
```

---

## 🎯 判断フローチャート

```
新しいUI要素を作る
    ↓
2回以上使う？
    ├─ YES → コンポーネント化
    │         ↓
    │     設定値が多い？
    │         ├─ YES → 設定化（constants）
    │         └─ NO  → コンポーネント化
    │
    └─ NO  → 直書きOK
              ↓
          レイアウト構造？
              ├─ YES → 直書きOK（popup.html）
              └─ NO  → ページ固有のストーリー？
                           ├─ YES → 直書きOK（popup.js）
                           └─ NO  → 1回しか出ない？
                                        ├─ YES → 直書きOK
                                        └─ NO  → 再検討
```

---

## 📊 現在のプロジェクトへの適用例

### 現状分析

**popup.html:**
- ✅ レイアウト構造 → **直書きOK**（変更不要）
- ⚠️ インラインスタイルが多い → **CSSファイルに移動推奨**

**popup.js:**
- ✅ ページ固有のストーリー → **直書きOK**（ただし分割推奨）
- ⚠️ 5000行以上 → **機能ごとに分割推奨**

**ui-components.js:**
- ✅ 既にコンポーネント化されている → **良い状態**
- ⚠️ 1ファイルに全て → **機能ごとに分割推奨**

### 推奨される改善手順

#### Step 1: 設定の分離（簡単・効果大）

```javascript
// constants/config.js を作成
export const CONFIG = {
  LINE_URLS: {
    IT_INFRA: 'https://lin.ee/lrjVHvH',
    REPUTATION: 'https://lin.ee/X2aWSFO'
  },
  VERSION_CONSTANTS: {
    WP_MINIMUM: 6.8,
    PHP_MINIMUM: 8.0,
    CF7_MINIMUM: 6.1
  },
  TIMEOUT_CONSTANTS: {
    FETCH: 10000,
    ANALYSIS: 15000
  }
};
```

#### Step 2: UIコンポーネントの整理

```javascript
// src/components/ui/ に分割
// - AlertBox.js（エラー/成功/警告/情報）
// - LoadingSpinner.js
// - Button.js（必要に応じて）
```

#### Step 3: 業務コンポーネントの抽出

```javascript
// src/components/domain/ に分割
// - ReputationAlert.js（風評被害アラート）
// - EmailSecurityCard.js（メールセキュリティ）
// - SiteHealthCard.js（サイト健康診断）
// - DnsInfoTable.js（DNS情報テーブル）
```

#### Step 4: popup.jsの分割

```javascript
// 機能ごとに分割
// - src/features/dns/dnsHandler.js
// - src/features/suggest/suggestHandler.js
// - src/features/siteHealth/siteHealthHandler.js
// - src/features/seo/seoHandler.js
```

---

## ❓ よくある質問

### Q1: すべてをコンポーネント化すべきですか？

**A:** いいえ。**2回以上使うものだけ**コンポーネント化してください。レイアウト構造やページ固有のストーリーは直書きで問題ありません。

### Q2: インラインスタイルは悪ですか？

**A:** Chrome拡張機能では、CSP（Content Security Policy）の制約により、インラインスタイルを使う必要がある場合があります。ただし、**共通のスタイルはCSSファイルに移動**し、**動的なスタイルだけインライン**にするのが良いでしょう。

### Q3: popup.jsが5000行ありますが、どう分割すべきですか？

**A:** 機能ごとに分割することを推奨します：
- DNS情報取得 → `src/features/dns/`
- サジェスト取得 → `src/features/suggest/`
- サイト健康診断 → `src/features/siteHealth/`
- SEO情報取得 → `src/features/seo/`

### Q4: 状態管理はどうすべきですか？

**A:** Chrome拡張機能では、React/Vueなどのフレームワークを使わない場合、**カスタムフック風の関数**を作成することを推奨します：

```javascript
// src/hooks/useDnsInfo.js
export function useDnsInfo(domain) {
  // 状態管理ロジック
}
```

### Q5: コンポーネント化のタイミングは？

**A:** 以下のタイミングでコンポーネント化を検討してください：
- ✅ 同じコードが2回以上出現したとき
- ✅ 修正時に複数箇所を変更する必要があるとき
- ✅ テストしやすくしたいとき

---

## 📝 まとめ

### 基本原則

1. **"変わるもの"だけをコンポーネント化**
2. **"変わらない骨格"は直書きOK**
3. **管理しやすさを最優先**

### 判断基準

- **2回以上使う → コンポーネント化**
- **設定値が多い → 設定化（constants）**
- **レイアウト構造 → 直書きOK**
- **ページ固有のストーリー → 直書きOK**

### 実装の優先順位

1. **設定の分離**（簡単・効果大）
2. **共通UIコンポーネントの抽出**
3. **業務コンポーネントの抽出**
4. **状態管理の分離**（高度）

---

**参考:**
- [Gate 1 ガイド](../workflows/GATE1_GUIDE.md)
- [開発ガイド](DEVELOPMENT_GUIDE.md)
- [コーディング規約](../workflows/WORKFLOW.md#コーディング規約)
