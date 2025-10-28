# 畢業晚會許願牆（Plan A 超快無後端版）

## 你需要做的事（10 分鐘）
1. **建立 Google 表單**（欄位建議）：
   - 願望內容（段落、必填、200 字限制）
   - 匿名/署名（簡答或單選，預設「匿名」）
   - 類別（祝福、想看的橋段、感謝、點歌、其他）
   - 可公開展示？（是/否）
   - 聯絡方式（選填）

2. 表單 → 連結到 Google 試算表（取得「Form Responses 1」）。

3. 在該試算表打開 **Apps Script**，把 `apps_script.gs` 內容貼上：
   - 修改 `SHEET_NAME` 為你的工作表名稱（通常是 `Form Responses 1`）。
   - 檔案 > 儲存
   - **發布 > 部署為網路應用程式**：選擇 *任何人* 可存取，複製部署後的 URL。
   - 回到試算表，功能表會多出 `WishWall` → 點 `建立/檢查管理欄位`（自動補上 `status/pinned/created_at` 欄）。

4. 打開 `index.html`：
   - 將 `REPLACE_WITH_GOOGLE_FORM_EMBED_URL` 換成表單「已發佈」的嵌入連結。
   - 將 `REPLACE_WITH_APPS_SCRIPT_JSON_URL` 換成剛剛部署的 Web App URL。

5. 佈署靜態頁：
   - GitHub Pages：新建 repo，上傳 `index.html`，在 Settings → Pages 啟用。
   - 或 Netlify/Cloudflare Pages：直接拖曳上傳。

6. 審核流程：
   - 在試算表把需要展示的列 `status` 改成 `approved`，且 `可公開展示？` 欄為「是」即可出現在前端。
   - 置頂：把 `pinned` 改為 `true`。

## FAQ
- **沒有資料顯示？** 請確認 `status=approved` 且 `可公開展示？=是`；或檢查 Apps Script 部署 URL。
- **想要按讚防洗？** 本版為 LocalStorage 計數；若要真正統計請升級到 Supabase 版（Plan B）。
- **想要大螢幕輪播？** 我可以幫你加一個 `/wall` 頁面（自動輪播）。
