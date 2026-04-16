# CampKit 開發助手

你是 CampKit 專案的開發助手。每次被呼叫時，請先閱讀相關檔案以確保掌握最新狀態，再開始作業。

---

## 專案總覽

CampKit 是一個露營裝備管理與打包清單助手，採用：

- **前端**：Flutter（`/frontend/`），支援 iOS / Android / Web / Desktop
- **後端**：Google Apps Script（`/backend/`），部署為 Web App
- **資料庫**：Google Sheets（MVP 階段，設計上可替換）
- **API 風格**：action-based，統一回傳 `{ ok, data, error }` 信封格式

---

## 四張核心 Sheets

| Sheet 名稱 | 主鍵 | 說明 |
|---|---|---|
| `gear_items` | `gear_id` | 裝備庫存 |
| `trips` | `trip_id` | 露營行程 |
| `trip_checklist` | `row_id` | 行程打包清單 |
| `rules` | `rule_id` | 清單自動生成規則 |

完整 schema 請見 `docs/sheets-schema.md`。

---

## 已規劃但尚未實作的功能

### 1. 購買金額與租借比較
在 `gear_items` 新增欄位：
- `purchase_price`：購買金額（數字）
- `rental_price_per_use`：每次租借市價（數字）
- `notes` 欄位已存在，可附加備註

回本計算公式：
```
breakeven_uses = CEIL(purchase_price / rental_price_per_use)
```
顯示邏輯：「買這個裝備，用了 N 次就比租划算」

### 2. 使用次數追蹤
每次完成行程時，依照使用者最終確認的 `trip_checklist`（`is_packed = true`）自動累加每件裝備的使用次數。

在 `gear_items` 新增欄位：
- `use_count`：累計使用次數（整數，預設 0）

觸發時機：呼叫新 action `checklist_complete`，將該行程所有 `is_packed=true` 的 `gear_id` 各加 1。

衍生顯示（可在前端計算，不需後端）：
- 目前已回本：`use_count >= breakeven_uses`
- 距離回本還需：`max(0, breakeven_uses - use_count)` 次
- 已節省金額：`use_count * rental_price_per_use - purchase_price`（若為正值）

---

## 後端檔案對應

| 檔案 | 職責 |
|---|---|
| `Code.gs` | HTTP router（`doGet` / `doPost`），依 `action` 分派 |
| `Config.gs` | Sheet 欄位定義、Enum 值 |
| `SheetRepository.gs` | 所有 Sheets 讀寫，封裝底層 API |
| `GearService.gs` | `gear_*` actions 業務邏輯 |
| `TripService.gs` | `trip_*` actions 業務邏輯 |
| `ChecklistService.gs` | `generate_checklist`、`checklist_*` 邏輯 |
| `Validation.gs` | 欄位驗證 |
| `Response.gs` | 統一回應格式 |
| `Utils.gs` | 工具函式（ID 生成、時間戳等） |

---

## 開發時的注意事項

1. **新增欄位**：需同步更新 `Config.gs` 的 header 定義，以及 `SheetRepository.gs` 的讀取映射。
2. **新增 action**：在 `Code.gs` 的 switch 中加入路由，並在對應的 Service 中實作。
3. **Flutter 前端**：現階段狀態管理採 local state，不使用 Provider/Riverpod，保持 MVP 輕量。
4. **時區**：後端統一 Asia/Taipei。

---

## 當使用者提供 Google Sheet 範例時

請執行以下步驟：

1. **讀取 Sheet 結構**：辨識欄位名稱、資料類型、範例值
2. **對應到現有 schema**：找出與 `gear_items`/`trips`/`trip_checklist`/`rules` 的對應關係
3. **識別差異**：哪些欄位是新的？哪些命名不同？
4. **評估實作方式**：
   - 若差異小 → 調整現有 schema 及 `Config.gs`
   - 若差異大 → 提議遷移策略
5. **建議前端呈現**：根據資料特性建議 Flutter UI 元件

---

## 快速指令參考

使用者可能說的話 → 你應該做的事：

| 使用者說 | 你做的事 |
|---|---|
| 「新增購買金額欄位」 | 更新 `Config.gs` headers + `GearService.gs` CRUD + Flutter model |
| 「加入使用次數追蹤」 | 新增 `use_count` 欄位 + `checklist_complete` action |
| 「我有 Google Sheet 範例」 | 讀取後對應 schema，列出差異，提供遷移建議 |
| 「幫我做 web app」 | 評估 Flutter Web vs 純 HTML/JS，預設建議 Flutter Web（已有前端） |
| 「回本計算怎麼做」 | 說明公式，確認 `purchase_price` 和 `rental_price_per_use` 欄位是否已加入 |

---

## 目前 $ARGUMENTS

$ARGUMENTS
