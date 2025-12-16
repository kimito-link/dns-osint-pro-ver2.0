const $ = (id) => document.getElementById(id);

async function load() {
  // 外部APIキー（Chrome Syncストレージ）
  const { apiKeys = {} } = await chrome.storage.sync.get(["apiKeys"]);
  $("stKey").value = apiKeys.securitytrails || "";
  $("wxKey").value = apiKeys.whoisxml || "";
  $("ipdKey").value = apiKeys.ipdata || "";
  
  // Google APIキー（Chrome Localストレージ）
  const googleSettings = await chrome.storage.local.get(['googleApiKey', 'googleSearchEngineId', 'googleMapsApiKey']);
  $("googleApiKey").value = googleSettings.googleApiKey || "";
  $("googleSearchEngineId").value = googleSettings.googleSearchEngineId || "";
  $("googleMapsApiKey").value = googleSettings.googleMapsApiKey || "";
}

async function save() {
  // 外部APIキー（Chrome Syncストレージ）
  const apiKeys = {
    securitytrails: $("stKey").value.trim(),
    whoisxml: $("wxKey").value.trim(),
    ipdata: $("ipdKey").value.trim()
  };
  await chrome.storage.sync.set({ apiKeys });
  
  // Google APIキー（Chrome Localストレージ）
  await chrome.storage.local.set({
    googleApiKey: $("googleApiKey").value.trim(),
    googleSearchEngineId: $("googleSearchEngineId").value.trim(),
    googleMapsApiKey: $("googleMapsApiKey").value.trim()
  });
  
  alert("保存しました");
}

async function clearAll() {
  await chrome.storage.sync.set({ apiKeys: {} });
  await chrome.storage.local.set({
    googleApiKey: '',
    googleSearchEngineId: '',
    googleMapsApiKey: ''
  });
  await load();
  alert("クリアしました");
}

document.addEventListener("DOMContentLoaded", load);
$("save").addEventListener("click", save);
$("clear").addEventListener("click", clearAll);
