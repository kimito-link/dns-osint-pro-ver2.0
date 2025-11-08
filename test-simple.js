/**
 * シンプルな拡張機能構成チェック
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Chrome拡張機能の構成チェック\n');

// 必須ファイルのチェック
const requiredFiles = [
  'manifest.json',
  'popup.html',
  'popup.js',
  'background.js',
  'utils.js',
  'ui-components.js',
  'styles.css'
];

let allFilesExist = true;

console.log('📁 必須ファイルの確認:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('');

// manifest.jsonの内容チェック
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  console.log('📋 manifest.json の情報:');
  console.log(`  名前: ${manifest.name}`);
  console.log(`  バージョン: ${manifest.version}`);
  console.log(`  マニフェストバージョン: ${manifest.manifest_version}`);
  console.log(`  ポップアップ: ${manifest.action?.default_popup || 'なし'}`);
  console.log(`  バックグラウンド: ${manifest.background?.service_worker || 'なし'}`);
  console.log('');
  
  // 権限のチェック
  console.log('🔐 権限:');
  if (manifest.permissions) {
    manifest.permissions.forEach(perm => {
      console.log(`  ✓ ${perm}`);
    });
  }
  console.log('');
  
  // ホスト権限のチェック
  console.log('🌐 ホスト権限: ' + (manifest.host_permissions?.length || 0) + ' 件');
  
} catch (error) {
  console.error('❌ manifest.json の読み込みエラー:', error.message);
}

console.log('\n📊 チェック結果:');
if (allFilesExist) {
  console.log('  ✅ すべての必須ファイルが存在します');
  console.log('  ✅ 拡張機能の基本構成はOKです\n');
  console.log('💡 次のステップ:');
  console.log('  1. node test-extension.js でPuppeteerテストを実行');
  console.log('  2. または chrome://extensions/ で手動読み込み\n');
} else {
  console.log('  ❌ 一部のファイルが見つかりません\n');
}
