# DNS OSINT Pro ver2.0 - デザイン仕様書

最終更新: 2025-11-04

---

## 🎨 デザインコンセプト

### コンセプト

**「プロフェッショナルで使いやすいOSINTツール」**

- **信頼性**: セキュリティツールとしての信頼感
- **視認性**: 重要な情報を見やすく表示
- **親しみやすさ**: キャラクター（りんく、こん太、たぬ姉）による案内
- **効率性**: 必要な情報に素早くアクセス

---

## 🎨 カラーパレット

### プライマリーカラー

```css
--primary-color: #4a90e2;      /* ブルー - 信頼性・プロフェッショナル */
--primary-light: #6ba3e8;
--primary-dark: #3a7bc8;
```

### ステータスカラー

```css
--success-color: #4caf50;      /* グリーン - りんく */
--warning-color: #ff9800;      /* オレンジ - こん太 */
--danger-color: #f44336;       /* レッド - たぬ姉 */
--info-color: #2196f3;         /* ライトブルー */
```

### ニュートラルカラー

```css
--text-primary: #333333;       /* メインテキスト */
--text-secondary: #666666;     /* セカンダリテキスト */
--bg-primary: #ffffff;         /* メイン背景 */
--bg-secondary: #f5f5f5;       /* セカンダリ背景 */
--border-light: #e0e0e0;       /* ボーダー */
```

---

## 📝 タイポグラフィ

### フォント

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### サイズ

```css
--font-size-xs: 11px;      /* 極小 */
--font-size-sm: 12px;      /* 小 */
--font-size-base: 14px;    /* 基本 */
--font-size-lg: 18px;      /* 大 */
--font-size-xl: 20px;      /* 特大 */
```

---

## 📐 レイアウト

### スペーシング

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### ポップアップサイズ

```css
width: 500px;
min-height: 600px;
max-height: 800px;
```

---

## 🧩 UIコンポーネント

### ボタン

```css
.btn-primary {
  background-color: var(--primary-color);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}
```

### キャラクター吹き出し

#### りんく（成功）

```css
.character-bubble-rink {
  background-color: #e8f5e9;
  border: 2px solid var(--success-color);
  border-radius: 12px;
  padding: var(--spacing-md);
}
```

#### こん太（警告）

```css
.character-bubble-konta {
  background-color: #fff3e0;
  border: 2px solid var(--warning-color);
  border-radius: 12px;
  padding: var(--spacing-md);
}
```

#### たぬ姉（危険）

```css
.character-bubble-tanu {
  background-color: #ffebee;
  border: 2px solid var(--danger-color);
  border-radius: 12px;
  padding: var(--spacing-md);
}
```

### 風評被害アラート

```css
.reputation-alert {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #ffffff;
  padding: var(--spacing-lg);
  border-radius: 8px;
  text-align: center;
  animation: pulse 2s infinite;
}
```

---

## 🎬 アニメーション

### パックマンアニメーション

```css
.pacman {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ffeb3b;
  animation: pacman-move 2s linear infinite;
}

@keyframes pacman-move {
  0% { transform: translateX(-100px); }
  100% { transform: translateX(calc(100% + 100px)); }
}
```

### フェードイン

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## 🖼️ アイコン・画像

### キャラクター画像

| キャラクター | ファイル名 | サイズ | 用途 |
|-------------|-----------|-------|------|
| りんく | link.png | 128x128 | 良好な診断結果 |
| こん太 | konta.png | 128x128 | 改善点の提案 |
| たぬ姉 | tanu-nee.png | 128x128 | 警告・深刻な問題 |
| Reverse Rebirth Hack | rev.png | 256x256 | ヘッダーロゴ |

---

## ♿ アクセシビリティ

### フォーカス表示

```css
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### コントラスト比

- **テキスト**: 4.5:1以上（WCAG AA準拠）
- **大きなテキスト**: 3:1以上

---

## 📊 デザインガイドライン

### DO（推奨）

✅ シンプルで分かりやすいUI  
✅ 一貫性のあるスタイル  
✅ 適切な余白・スペーシング  
✅ 分かりやすいラベル・説明  
✅ 適切なフィードバック  

### DON'T（非推奨）

❌ 過度な装飾  
❌ 小さすぎるフォント  
❌ コントラストの低い配色  
❌ 分かりにくいアイコン  
❌ 不必要なアニメーション  

---

## 📝 関連ドキュメント

- [PROJECT.md](PROJECT.md) - プロジェクト構成
- [REQUIREMENTS.md](REQUIREMENTS.md) - 要件定義書
- [WORKFLOW.md](WORKFLOW.md) - 開発ワークフロー

---

<div align="center">

**DNS OSINT Pro ver2.0 - Design Specification**

君と繋がる、WEBサイト健康診断＆OSINT調査ツール

最終更新: 2025-11-04

</div>
