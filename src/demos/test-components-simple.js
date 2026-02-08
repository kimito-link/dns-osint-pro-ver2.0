/**
 * UIコンポーネントの簡易テスト
 */

console.log('🧪 UIコンポーネントテスト開始\n');

// ui-components.jsの内容を確認
const fs = require('fs');
const path = require('path');

const uiComponentsPath = path.join(__dirname, 'ui-components.js');

if (!fs.existsSync(uiComponentsPath)) {
  console.error('❌ ui-components.js が見つかりません');
  process.exit(1);
}

const content = fs.readFileSync(uiComponentsPath, 'utf8');

// 新しいコンポーネントが存在するか確認
const tests = [
  { name: 'createGeneralReviewButtons', regex: /createGeneralReviewButtons\s*\(/ },
  { name: 'createCompanyReviewButtons', regex: /createCompanyReviewButtons\s*\(/ },
  { name: 'createHintBox', regex: /createHintBox\s*\(/ },
  { name: 'createReviewSiteButtons', regex: /createReviewSiteButtons\s*\(/ },
  { name: 'createYahooSuggestPlaceholder', regex: /createYahooSuggestPlaceholder\s*\(/ },
  { name: 'createSuggestExplanation', regex: /createSuggestExplanation\s*\(/ },
  { name: 'createReviewSiteSection', regex: /createReviewSiteSection\s*\(/ },
  { name: 'createBingRelatedKeywords', regex: /createBingRelatedKeywords\s*\(/ },
  { name: 'createSuggestHeader', regex: /createSuggestHeader\s*\(/ },
  { name: 'createDetectedPatternAlert', regex: /createDetectedPatternAlert\s*\(/ },
  { name: 'createSeoLoadButton', regex: /createSeoLoadButton\s*\(/ },
  { name: 'createNoSitemapWarning', regex: /createNoSitemapWarning\s*\(/ },
  { name: 'createTimeoutError', regex: /createTimeoutError\s*\(/ },
  { name: 'createGeneralError', regex: /createGeneralError\s*\(/ },
  { name: 'createWwwUnificationAlert', regex: /createWwwUnificationAlert\s*\(/ }
];

console.log('📋 コンポーネントの存在確認:\n');

let allPassed = true;

tests.forEach(test => {
  if (test.regex.test(content)) {
    console.log(`✅ ${test.name} - 見つかりました`);
  } else {
    console.log(`❌ ${test.name} - 見つかりませんでした`);
    allPassed = false;
  }
});

console.log('\n📊 popup.jsでの使用確認:\n');

const popupPath = path.join(__dirname, 'popup.js');
if (fs.existsSync(popupPath)) {
  const popupContent = fs.readFileSync(popupPath, 'utf8');
  
  const usageTests = [
    { name: 'UI.createGeneralReviewButtons', regex: /UI\.createGeneralReviewButtons\s*\(/ },
    { name: 'UI.createCompanyReviewButtons', regex: /UI\.createCompanyReviewButtons\s*\(/ },
    { name: 'UI.createHintBox', regex: /UI\.createHintBox\s*\(/ }
  ];
  
  usageTests.forEach(test => {
    if (test.regex.test(popupContent)) {
      console.log(`✅ ${test.name} - 使用されています`);
    } else {
      console.log(`⚠️  ${test.name} - 使用されていません`);
    }
  });
} else {
  console.log('❌ popup.js が見つかりません');
  allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ すべてのテストが合格しました！');
  console.log('コンポーネント化は正常に完了しています。');
} else {
  console.log('❌ 一部のテストが失敗しました');
}
console.log('='.repeat(50) + '\n');
