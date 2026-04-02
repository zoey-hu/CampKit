Add-Type -AssemblyName System.Web

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$csvPath = Join-Path $projectRoot 'frontend\assets\sample_checklist_main_view.csv'
$htmlPath = Join-Path $projectRoot 'docs\csv-preview-mock.html'

$rows = Import-Csv -Path $csvPath -Header c1, c2, c3, c4, c5, c6, c7, c8, c9 -Encoding UTF8

$items = $rows |
  Select-Object -Skip 2 |
  Where-Object { $_.c2.Trim() -ne '' -and $_.c4.Trim() -ne '' } |
  ForEach-Object {
    [PSCustomObject]@{
      bag = $_.c2.Trim()
      needFlag = $_.c3.Trim()
      itemName = $_.c4.Trim()
      packed = ($_.c5.Trim().ToLower() -eq 'true')
      note = $_.c6.Trim()
    }
  }

$grouped = $items | Group-Object bag

function HtmlEncode([string]$text) {
  return [System.Web.HttpUtility]::HtmlEncode($text)
}

$summaryRows = foreach ($group in $grouped) {
  $bagName = HtmlEncode $group.Name
  @"
<div class="summary-item">
  <div class="summary-main">
    <div class="summary-name">$bagName</div>
    <div class="summary-meta"><span data-bag-packed="$bagName">0</span> / <span data-bag-total="$bagName">0</span></div>
  </div>
  <div class="summary-bar"><div class="summary-fill" data-bag-fill="$bagName"></div></div>
  <div class="summary-value" data-bag-progress-text="$bagName">0%</div>
</div>
"@
}

$bagSections = foreach ($group in $grouped) {
  $bagName = HtmlEncode $group.Name
  $itemRows = foreach ($item in $group.Group) {
    $itemName = HtmlEncode $item.itemName
    $note = HtmlEncode $item.note
    $needFlag = HtmlEncode $item.needFlag
    $defaultChecked = if ($item.packed) { 'true' } else { 'false' }
    $tagClass = if ($item.needFlag -eq 'N') { 'tag skip' } elseif ($item.needFlag -eq 'Y') { 'tag important' } else { 'tag normal' }
    $tagText = if ($item.needFlag -eq 'N') { 'Skip' } elseif ($item.needFlag -eq 'Y') { 'Required' } else { 'Normal' }
    $noteHtml = if ([string]::IsNullOrWhiteSpace($item.note)) {
      ''
    } else {
      "<p class=""item-note"">$note</p>"
    }

    @"
<label class="item-row" data-bag="$bagName">
  <input class="item-checkbox" type="checkbox" data-default="$defaultChecked" />
  <div class="item-body">
    <div class="item-name">$itemName</div>
    $noteHtml
  </div>
  <div class="$tagClass">$tagText</div>
</label>
"@
  }

  @"
<section class="bag-card" data-bag-card="$bagName">
  <div class="bag-header">
    <div>
      <div class="bag-title">$bagName</div>
      <div class="bag-subtitle"><span data-bag-count="$bagName"></span> items</div>
    </div>
    <div class="bag-progress-pill"><span data-bag-progress="$bagName">0%</span></div>
  </div>
  <div class="bag-items">
$($itemRows -join "`n")
  </div>
</section>
"@
}

$html = @"
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CampKit Checklist Preview</title>
  <style>
    :root {
      --bg: #f4f1ea;
      --card: #ffffff;
      --ink: #223127;
      --muted: #657468;
      --line: #ddd4c8;
      --accent: #2f6b4f;
      --accent-soft: #dceadf;
      --warn: #8d5a22;
      --warn-soft: #f6e5d2;
      --skip: #7b3a3a;
      --skip-soft: #f6dddd;
      --shadow: 0 10px 30px rgba(34, 49, 39, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: var(--ink);
      font-family: "Segoe UI", "Noto Sans TC", sans-serif;
      background:
        radial-gradient(circle at top left, #efe5d3, transparent 24%),
        linear-gradient(180deg, #f8f5ef 0%, var(--bg) 100%);
    }

    .shell {
      max-width: 1320px;
      margin: 0 auto;
      padding: 28px 18px 56px;
    }

    .hero {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 18px;
      margin-bottom: 18px;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 22px;
      box-shadow: var(--shadow);
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    .hero-title {
      font-size: 30px;
      line-height: 1.1;
    }

    .hero-copy {
      margin-top: 10px;
      color: var(--muted);
      line-height: 1.7;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }

    button {
      appearance: none;
      border: 0;
      border-radius: 999px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    .primary-btn {
      background: var(--accent);
      color: white;
    }

    .ghost-btn {
      background: #f7f4ee;
      color: var(--ink);
      border: 1px solid var(--line);
    }

    .stat-row,
    .source-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }

    .stat-chip,
    .source-chip {
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 14px;
    }

    .stat-chip {
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 700;
    }

    .source-chip {
      background: #faf7f1;
      border: 1px solid var(--line);
      color: var(--muted);
    }

    .layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 18px;
      align-items: start;
    }

    .section-title {
      font-size: 19px;
      margin-bottom: 14px;
    }

    .summary-list {
      display: grid;
      gap: 10px;
    }

    .summary-item {
      display: grid;
      gap: 8px;
      padding: 14px 16px;
      border-radius: 18px;
      border: 1px solid var(--line);
      background: #fcfbf8;
    }

    .summary-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .summary-name {
      font-weight: 700;
    }

    .summary-meta {
      color: var(--muted);
      font-size: 13px;
    }

    .summary-bar {
      width: 100%;
      height: 10px;
      background: #ece5da;
      border-radius: 999px;
      overflow: hidden;
    }

    .summary-fill {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #5c8d71, var(--accent));
      transition: width 0.15s ease;
    }

    .summary-value {
      text-align: right;
      color: var(--accent);
      font-weight: 700;
    }

    .bag-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--shadow);
      margin-bottom: 16px;
    }

    .bag-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px;
      background: #faf7f1;
      border-bottom: 1px solid var(--line);
    }

    .bag-title {
      font-size: 20px;
      font-weight: 800;
    }

    .bag-subtitle {
      color: var(--muted);
      margin-top: 4px;
      font-size: 13px;
    }

    .bag-progress-pill {
      border-radius: 999px;
      padding: 10px 14px;
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 700;
      white-space: nowrap;
    }

    .item-row {
      display: grid;
      grid-template-columns: 24px 1fr auto;
      gap: 12px;
      padding: 14px 20px;
      border-bottom: 1px solid #efe8dd;
      align-items: start;
    }

    .item-row:last-child {
      border-bottom: 0;
    }

    .item-checkbox {
      width: 20px;
      height: 20px;
      margin-top: 3px;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .item-name {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.45;
    }

    .item-note {
      margin-top: 6px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .tag {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }

    .tag.important {
      background: var(--warn-soft);
      color: var(--warn);
    }

    .tag.skip {
      background: var(--skip-soft);
      color: var(--skip);
    }

    .tag.normal {
      background: #edf2ee;
      color: var(--accent);
    }

    .footer-note {
      margin-top: 20px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.7;
    }

    @media (max-width: 980px) {
      .hero,
      .layout {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero">
      <div class="card">
        <h1 class="hero-title">CampKit Checklist Web Preview</h1>
        <p class="hero-copy">
          這個頁面已經可以直接打開使用。它會顯示整份清單、即時計算每個袋子的打包進度，並把勾選結果存在瀏覽器本機。
        </p>
        <div class="actions">
          <button class="primary-btn" id="clear-all-btn">一鍵清空勾選</button>
          <button class="ghost-btn" id="reset-default-btn">回復原始 CSV 狀態</button>
        </div>
        <div class="stat-row">
          <div class="stat-chip">總進度 <span id="total-progress">0%</span></div>
          <div class="stat-chip">已勾選 <span id="packed-count">0</span> / <span id="total-count">0</span></div>
          <div class="stat-chip">袋類 <span id="bag-count">0</span></div>
        </div>
      </div>
      <div class="card">
        <h2 class="section-title">使用方式</h2>
        <div class="source-row">
          <div class="source-chip">直接雙擊這個 HTML</div>
          <div class="source-chip">勾選會自動記住</div>
          <div class="source-chip">不需要先跑 Flutter</div>
          <div class="source-chip">之後可再接 Google Sheet</div>
        </div>
        <p class="footer-note">
          目前資料來源來自 <strong>frontend/assets/sample_checklist_main_view.csv</strong>。<br />
          如果你之後換清單，我也可以幫你改成自動重新產生這個網頁版。
        </p>
      </div>
    </section>

    <section class="layout">
      <aside class="card">
        <h2 class="section-title">Bag Progress</h2>
        <div class="summary-list">
$($summaryRows -join "`n")
        </div>
      </aside>

      <main>
$($bagSections -join "`n")
      </main>
    </section>
  </div>

  <script>
    const storageKey = 'campkit_csv_preview_state_v1';
    const checkboxes = Array.from(document.querySelectorAll('.item-checkbox'));
    const bagNames = [...new Set(
      Array.from(document.querySelectorAll('[data-bag-card]')).map((node) => node.dataset.bagCard)
    )];

    function getBagItems(bagName) {
      return checkboxes.filter(
        (checkbox) => checkbox.closest('.item-row').dataset.bag === bagName
      );
    }

    function loadState() {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || '{}');
      } catch (error) {
        return {};
      }
    }

    function saveState() {
      const state = {};
      checkboxes.forEach((checkbox, index) => {
        state[index] = checkbox.checked;
      });
      localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function applyStoredState() {
      const state = loadState();
      checkboxes.forEach((checkbox, index) => {
        if (Object.prototype.hasOwnProperty.call(state, index)) {
          checkbox.checked = Boolean(state[index]);
        } else {
          checkbox.checked = checkbox.dataset.default === 'true';
        }
      });
    }

    function updateBagText(attrName, bagName, value) {
      const node = document.querySelector(`[${attrName}="${bagName}"]`);
      if (node) {
        node.textContent = value;
      }
    }

    function updateBagWidth(bagName, value) {
      const node = document.querySelector(`[data-bag-fill="${bagName}"]`);
      if (node) {
        node.style.width = value;
      }
    }

    function refreshBagProgress() {
      bagNames.forEach((bagName) => {
        const bagItems = getBagItems(bagName);
        const bagPacked = bagItems.filter((checkbox) => checkbox.checked).length;
        const bagTotal = bagItems.length;
        const bagPercent = bagTotal === 0 ? 0 : Math.round((bagPacked / bagTotal) * 100);

        updateBagText('data-bag-progress', bagName, bagPercent + '%');
        updateBagText('data-bag-progress-text', bagName, bagPercent + '%');
        updateBagText('data-bag-total', bagName, bagTotal);
        updateBagText('data-bag-packed', bagName, bagPacked);
        updateBagText('data-bag-count', bagName, bagTotal);
        updateBagWidth(bagName, bagPercent + '%');
      });
    }

    function refreshAll() {
      const total = checkboxes.length;
      const packed = checkboxes.filter((checkbox) => checkbox.checked).length;
      const totalPercent = total === 0 ? 0 : Math.round((packed / total) * 100);

      document.getElementById('total-count').textContent = total;
      document.getElementById('packed-count').textContent = packed;
      document.getElementById('total-progress').textContent = totalPercent + '%';
      document.getElementById('bag-count').textContent = bagNames.length;

      refreshBagProgress();
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        saveState();
        refreshAll();
      });
    });

    document.getElementById('clear-all-btn').addEventListener('click', () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      saveState();
      refreshAll();
    });

    document.getElementById('reset-default-btn').addEventListener('click', () => {
      localStorage.removeItem(storageKey);
      applyStoredState();
      refreshAll();
    });

    applyStoredState();
    refreshAll();
  </script>
</body>
</html>
"@

Set-Content -Path $htmlPath -Value $html -Encoding UTF8
