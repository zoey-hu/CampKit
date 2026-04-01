function getTimestamp() {
  return new Date().toISOString();
}

function generateId(prefix) {
  return [
    prefix,
    Utilities.getUuid().replace(/-/g, '').substring(0, 12)
  ].join('_');
}

function parseBoolean(value) {
  if (value === true || value === false) {
    return value;
  }
  if (value === 1 || value === '1') {
    return true;
  }
  if (value === 0 || value === '0') {
    return false;
  }
  if (typeof value === 'string') {
    var normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === 'no' || normalized === '') {
      return false;
    }
  }
  return false;
}

function parseNumber(value, fallback) {
  var parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value || '')
    .split(',')
    .map(function(tag) {
      return tag.trim();
    })
    .filter(function(tag) {
      return tag;
    })
    .join(', ');
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    return '';
  }
  return Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
}

function getRequestPayload(e) {
  var queryParams = e && e.parameter ? e.parameter : {};
  var body = {};

  if (e && e.postData && e.postData.contents) {
    body = JSON.parse(e.postData.contents);
  }

  var payload = {};
  var key;

  for (key in queryParams) {
    if (queryParams.hasOwnProperty(key)) {
      payload[key] = queryParams[key];
    }
  }

  for (key in body) {
    if (body.hasOwnProperty(key)) {
      payload[key] = body[key];
    }
  }

  return payload;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function toLookupMap(items, keyField) {
  return ensureArray(items).reduce(function(acc, item) {
    if (item[keyField]) {
      acc[item[keyField]] = item;
    }
    return acc;
  }, {});
}
