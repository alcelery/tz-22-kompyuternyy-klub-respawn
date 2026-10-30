const SPREADSHEET_ID = '1KT_y3r5QNzVsVnPtUj1ashW_l2c-rtIuYQ2LIABzJzA';
const SHEET_NAME = 'leads';

const HEADERS = [
  'request_id', 'created_at', 'name', 'phone', 'email', 
  'lead_type', 'zone', 'slot', 'seats', 
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 
  'status'
];

function doPost(e) {
  let p = {};
  
  // ЧИТАЕМ ДАННЫЕ ИЗ ТЕЛА ЗАПРОСА
  if (e && e.postData && e.postData.contents) {
    const contents = e.postData.contents;
    contents.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) {
        p[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
      }
    });
  } else if (e && e.parameter) {
    p = e.parameter;
  }

  const clean = key => String(p[key] || '').trim();

  // 1. Проверка обязательных полей
  const requiredFields = ['request_id', 'name', 'phone', 'lead_type', 'zone', 'seats'];
  const missing = requiredFields.filter(key => !clean(key));
  if (missing.length) {
    return jsonResponse({ok: false, error: 'missing_required', fields: missing});
  }

  // 2. Проверка request_id
  const id = clean('request_id');
  if (!/^REQ-[A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[89AB][A-F0-9]{3}-[A-F0-9]{12}$/i.test(id)) {
    return jsonResponse({ok: false, error: 'invalid_request_id'});
  }

  // 3. Проверка телефона
  const phone = clean('phone').replace(/[^\d+]/g, '');
  if (!/^\+7\d{10}$/.test(phone)) {
    return jsonResponse({ok: false, error: 'invalid_phone'});
  }

  // 4. Проверка email
  const email = clean('email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ok: false, error: 'invalid_email'});
  }

  // 5. Проверка списков
  const leadType = clean('lead_type');
  if (!['booking', 'tournament'].includes(leadType)) {
    return jsonResponse({ok: false, error: 'invalid_lead_type'});
  }

  const zone = clean('zone');
  if (!['standard', 'vip', 'bootcamp', 'ps5'].includes(zone)) {
    return jsonResponse({ok: false, error: 'invalid_zone'});
  }

  // 6. Проверка мест
  const seats = parseInt(clean('seats'), 10);
  if (isNaN(seats) || seats < 1 || seats > 5) {
    return jsonResponse({ok: false, error: 'invalid_seats'});
  }

  // 7. Длина строк
  const stringFields = ['name', 'phone', 'email', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  if (stringFields.some(key => clean(key).length > 200)) {
    return jsonResponse({ok: false, error: 'value_too_long'});
  }

  // === ЗАПИСЬ ===
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse({ok: false, error: 'busy_retry'});

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return jsonResponse({ok: false, error: 'sheet_not_found', msg: 'Лист leads не найден'});
    }
    
    // ПРОВЕРКА ЗАГОЛОВКОВ С ВЫВОДОМ ОШИБКИ
    const tableHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|');
    const codeHeaders = HEADERS.join('|');
    
    if (tableHeaders !== codeHeaders) {
      return jsonResponse({
        ok: false, 
        error: 'invalid_sheet_schema',
        msg: 'Заголовки в таблице не совпадают с кодом',
        table: tableHeaders,
        code: codeHeaders
      });
    }

    const duplicate = sheet.getRange('A:A').createTextFinder(id).matchEntireCell(true).matchCase(false).useRegularExpression(false).findNext();
    if (duplicate) return jsonResponse({ok: false, error: 'duplicate_request_id'});

    const createdAt = new Date();
    const slot = clean('slot') || '';
    const source = clean('utm_source') || 'direct';
    const medium = clean('utm_medium') || 'none';
    const campaign = clean('utm_campaign') || 'not_set';
    const content = clean('utm_content') || 'not_set';
    const status = 'new';

    sheet.appendRow([
      id, createdAt, textCell(clean('name')), textCell(phone), textCell(email),
      leadType, zone, textCell(slot), seats,
      textCell(source), textCell(medium), textCell(campaign), textCell(content),
      status
    ]);
    
    SpreadsheetApp.flush();
    return jsonResponse({ok: true, request_id: id});

  } catch (error) {
    return jsonResponse({ok: false, error: 'storage_error', details: error.toString()});
  } finally {
    lock.releaseLock();
  }
}

function textCell(value) {
  if (!value) return '';
  return /^[=+@-]/.test(value) ? "'" + value : value;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}