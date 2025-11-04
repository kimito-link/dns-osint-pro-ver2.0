function uniq(arr) { return Array.from(new Set(arr.filter(Boolean))); }
function formatJSON(obj, fallback = "-") { try { if (!obj) return fallback; return JSON.stringify(obj, null, 2); } catch { return fallback; } }
function hostnameFromUrl(url) { try { return new URL(url).hostname; } catch { return ""; } }

function copyToClipboard(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select(); document.execCommand("copy");
  document.body.removeChild(ta);
}

// ファイルDL
function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// CSV/MD
function toCSV(rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return rows.map(r => r.map(esc).join(",")).join("\n");
}
function toMarkdownTable(rows) {
  if (!rows.length) return "";
  const header = rows[0];
  const sep = header.map(() => "---");
  const body = rows.slice(1);
  return [
    `| ${header.join(" | ")} |`,
    `| ${sep.join(" | ")} |`,
    ...body.map(r => `| ${r.join(" | ")} |`)
  ].join("\n");
}

// DoH & RDAP & Wayback
async function dohQuery(name, type = "A") {
  const u = new URL("https://cloudflare-dns.com/dns-query");
  u.searchParams.set("name", name);
  u.searchParams.set("type", type);
  const res = await fetch(u.toString(), { headers: { "accept": "application/dns-json" }});
  if (!res.ok) throw new Error(`DoH ${type} failed`);
  return res.json();
}
async function rdapDomain(domain) {
  const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error("RDAP domain failed");
  return res.json();
}
async function rdapIp(ip) {
  const res = await fetch(`https://rdap.org/ip/${encodeURIComponent(ip)}`);
  if (!res.ok) throw new Error("RDAP IP failed");
  return res.json();
}
async function waybackAvailable(url) {
  const u = new URL("https://archive.org/wayback/available");
  u.searchParams.set("url", url);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error("Wayback available failed");
  return res.json();
}

// --- APIキー系 ---
async function getApiKeys() {
  const { apiKeys = {} } = await chrome.storage.sync.get(["apiKeys"]);
  return apiKeys;
}

// SecurityTrails 例: サブドメイン・IPヒストリ
async function stSubdomains(domain, apiKey) {
  const url = `https://api.securitytrails.com/v1/domain/${encodeURIComponent(domain)}/subdomains?children_only=false`;
  const res = await fetch(url, { headers: { "APIKEY": apiKey } });
  if (!res.ok) throw new Error("SecurityTrails subdomains failed");
  return res.json(); // { subdomains:[], apex_domain:"" }
}
async function stHistoryA(domain, apiKey) {
  const url = `https://api.securitytrails.com/v1/history/${encodeURIComponent(domain)}/dns/a`;
  const res = await fetch(url, { headers: { "APIKEY": apiKey } });
  if (!res.ok) throw new Error("SecurityTrails A history failed");
  return res.json(); // レコード履歴
}

// ipdata（IP位置情報の例）
async function ipdataLookup(ip, apiKey) {
  const url = `https://ipdata.co/${encodeURIComponent(ip)}.json?api-key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("ipdata failed");
  return res.json();
}

// WhoisXML（ドメイン whoisの例：JSON）
async function whoisxmlDomain(domain, apiKey) {
  const url = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${encodeURIComponent(apiKey)}&domainName=${encodeURIComponent(domain)}&outputFormat=JSON`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("WhoisXML failed");
  return res.json();
}

// CRT.sh（CORS弱いので background 経由のproxyFetchでHTML→抽出）
async function crtSearch(domain) {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  // JSONはCORS通らないことがあるためtextで
  const viaBg = await chrome.runtime.sendMessage({ type: "proxyFetch", url });
  if (!viaBg.ok) throw new Error("crt.sh fetch failed");
  try {
    // crt.sh の ?output=json はJSON配列
    return JSON.parse(viaBg.text);
  } catch {
    return [];
  }
}

// Wayback CDX（年別/URL別ヒット）→ 背景経由で取得
async function cdxQuery(domain) {
  const url = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&fl=timestamp,original,statuscode&filter=statuscode:200`;
  const viaBg = await chrome.runtime.sendMessage({ type: "proxyFetch", url });
  if (!viaBg.ok) throw new Error("CDX fetch failed");
  let rows = [];
  try { rows = JSON.parse(viaBg.text); } catch { rows = []; }
  // rows[0] はヘッダ
  return rows.slice(1).map(r => ({ ts: r[0], url: r[1], code: r[2] }));
}

// 年別カウント
function countByYear(cdxRows) {
  const map = new Map();
  for (const r of cdxRows) {
    const y = String(r.ts).slice(0, 4);
    map.set(y, (map.get(y) || 0) + 1);
  }
  const rows = Array.from(map.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  return rows; // [ [year, count], ...]
}

// 簡易バーグラフ（素のCanvas・色指定なし）
function drawBarChart(canvas, dataRows) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const padding = 30;
  const max = Math.max(1, ...dataRows.map(r => r[1]));
  const barW = (w - padding*2) / dataRows.length;

  // 軸
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, h - padding);
  ctx.lineTo(w - padding, h - padding);
  ctx.stroke();

  // バー
  dataRows.forEach((r, i) => {
    const x = padding + i * barW + barW*0.1;
    const barH = (h - padding*2) * (r[1] / max);
    const y = h - padding - barH;
    ctx.fillRect(x, y, barW*0.8, barH);

    // 年ラベル
    ctx.save();
    ctx.translate(x + barW*0.4, h - padding + 12);
    ctx.rotate(-Math.PI/6);
    ctx.fillText(r[0], 0, 0);
    ctx.restore();
  });

  // 目盛（最大値）
  ctx.fillText(String(max), 2, padding + 4);
}

window.OsintUtils = {
  uniq, formatJSON, hostnameFromUrl, copyToClipboard, downloadText,
  toCSV, toMarkdownTable,
  dohQuery, rdapDomain, rdapIp, waybackAvailable,
  getApiKeys, stSubdomains, stHistoryA, ipdataLookup, whoisxmlDomain,
  crtSearch, cdxQuery, countByYear, drawBarChart
};


function syntaxHighlight(json) {
  if (typeof json != "string") {
    json = JSON.stringify(json, null, 2);
  }
  json = json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?)/g,
    function (match) {
      let cls = "json-num";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-str";
      } else if (/true|false/.test(match)) {
        cls = "json-bool";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
window.OsintUtils.syntaxHighlight = syntaxHighlight;
