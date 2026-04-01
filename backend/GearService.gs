function listGear() {
  return getAllRows('gear_items').map(mapGearRow);
}

function createGear(payload) {
  validateGearPayload(payload, false);

  var timestamp = getTimestamp();
  var gear = {
    gear_id: generateId('gear'),
    name: String(payload.name).trim(),
    category: payload.category,
    quantity: parseNumber(payload.quantity, 1),
    location: String(payload.location || '').trim(),
    status: payload.status || 'ready',
    is_essential: parseBoolean(payload.is_essential),
    season_tags: normalizeTags(payload.season_tags),
    weather_tags: normalizeTags(payload.weather_tags),
    notes: String(payload.notes || '').trim(),
    created_at: timestamp,
    updated_at: timestamp
  };

  appendRows('gear_items', [gear]);
  return gear;
}

function updateGear(payload) {
  validateGearPayload(payload, true);

  var existing = getRowById('gear_items', payload.gear_id);
  if (!existing) {
    throwKnownError('NOT_FOUND', 'Gear item not found.');
  }

  return updateRowById('gear_items', payload.gear_id, {
    name: payload.name !== undefined ? String(payload.name).trim() : existing.name,
    category: payload.category !== undefined ? payload.category : existing.category,
    quantity: payload.quantity !== undefined ? parseNumber(payload.quantity, 1) : existing.quantity,
    location: payload.location !== undefined ? String(payload.location).trim() : existing.location,
    status: payload.status !== undefined ? payload.status : existing.status,
    is_essential: payload.is_essential !== undefined ? parseBoolean(payload.is_essential) : parseBoolean(existing.is_essential),
    season_tags: payload.season_tags !== undefined ? normalizeTags(payload.season_tags) : existing.season_tags,
    weather_tags: payload.weather_tags !== undefined ? normalizeTags(payload.weather_tags) : existing.weather_tags,
    notes: payload.notes !== undefined ? String(payload.notes).trim() : existing.notes,
    updated_at: getTimestamp()
  });
}

function deleteGear(payload) {
  validateRequiredFields(payload, ['gear_id']);
  deleteRowById('gear_items', payload.gear_id);
  return { gear_id: payload.gear_id };
}

function mapGearRow(row) {
  row.quantity = parseNumber(row.quantity, 0);
  row.is_essential = parseBoolean(row.is_essential);
  return row;
}
