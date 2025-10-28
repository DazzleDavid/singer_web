/**
 * 將「已審核通過 + 同意公開」的表單資料輸出為 JSON。
 * 佈署：發布 > 部署為網路應用程式 > 任何人皆可存取
 * 前端會抓取此 JSON 來顯示許願牆。
 */
const SHEET_NAME = 'Form Responses 1'; // TODO: 改成你的回應工作表名稱

function doGet(e) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: '找不到工作表 ' + SHEET_NAME }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const range = sheet.getDataRange();
  const rows = range.getValues();
  if (rows.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ wishes: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const header = rows.shift();
  const idx = (name) => header.indexOf(name);

  // 這些欄位請在試算表中自行加入（位於最右側即可）
  const statusIdx = idx('status');          // pending/approved/rejected
  const pinnedIdx = idx('pinned');          // true/false
  const createdIdx = idx('created_at');     // 自動或留空，會退回 Timestamp
  const contentIdx = idx('願望內容');
  const nameIdx    = idx('匿名/署名');
  const catIdx     = idx('類別');
  const publicIdx  = idx('可公開展示？');
  const tsIdx      = idx('Timestamp');      // Google 表單系統欄

  const out = [];
  rows.forEach((r, i) => {
    const status = (statusIdx >= 0 ? r[statusIdx] : '').toString().toLowerCase();
    const isPublic = ((publicIdx >= 0 ? r[publicIdx] : '') + '').match(/是|yes/i);
    if (status === 'approved' && isPublic) {
      out.push({
        id: Utilities.getUuid(),
        content: contentIdx >= 0 ? (r[contentIdx] || '') : '',
        name: nameIdx >= 0 ? (r[nameIdx] || '匿名') : '匿名',
        category: catIdx >= 0 ? (r[catIdx] || '其他') : '其他',
        pinned: (pinnedIdx >= 0 ? ('' + r[pinnedIdx]).toLowerCase() === 'true' : false),
        created_at: createdIdx >= 0 && r[createdIdx] ? r[createdIdx] : (tsIdx >= 0 ? r[tsIdx] : '')
      });
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ wishes: out }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 加入自訂選單，協助建立管理欄位。
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('WishWall')
    .addItem('建立/檢查管理欄位', 'ensureColumns')
    .addToUi();
}

/**
 * 確保 status/pinned/created_at 欄位存在；若不存在則新增在最右側。
 * 也會把既有資料預設填入：status=pending、pinned=false、created_at=Timestamp。
 */
function ensureColumns() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);

  const range = sheet.getDataRange();
  const values = range.getValues();
  const header = values[0];
  const idx = (name) => header.indexOf(name);
  let needSave = false;

  const ensure = (name, defaultValueFunc) => {
    let col = idx(name);
    if (col === -1) {
      sheet.getRange(1, header.length + 1, 1, 1).setValues([[name]]);
      const tsIdx = header.indexOf('Timestamp');
      const nRows = sheet.getLastRow() - 1;
      if (nRows > 0) {
        const defaults = [];
        for (let i = 0; i < nRows; i++) {
          defaults.push([defaultValueFunc(tsIdx >= 0 ? values[i+1][tsIdx] : '')]);
        }
        sheet.getRange(2, header.length + 1, nRows, 1).setValues(defaults);
      }
      needSave = true;
    }
  };

  ensure('status', () => 'pending');
  ensure('pinned', () => 'false');
  ensure('created_at', (ts) => ts || new Date());

  if (!needSave) {
    SpreadsheetApp.getUi().alert('欄位已存在，無需變更。');
  } else {
    SpreadsheetApp.getUi().alert('管理欄位已建立/更新完成。');
  }
}
