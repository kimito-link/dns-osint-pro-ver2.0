const $ = (id) => document.getElementById(id);

async function load() {
  const { apiKeys = {} } = await chrome.storage.sync.get(["apiKeys"]);
  $("stKey").value = apiKeys.securitytrails || "";
  $("wxKey").value = apiKeys.whoisxml || "";
  $("ipdKey").value = apiKeys.ipdata || "";
}
async function save() {
  const apiKeys = {
    securitytrails: $("stKey").value.trim(),
    whoisxml: $("wxKey").value.trim(),
    ipdata: $("ipdKey").value.trim()
  };
  await chrome.storage.sync.set({ apiKeys });
  alert("保存しました");
}
async function clearAll() {
  await chrome.storage.sync.set({ apiKeys: {} });
  await load();
  alert("クリアしました");
}

document.addEventListener("DOMContentLoaded", load);
$("save").addEventListener("click", save);
$("clear").addEventListener("click", clearAll);
