function listTrips() {
  return getAllRows('trips').map(mapTripRow);
}

function createTrip(payload) {
  validateTripPayload(payload, false);

  var timestamp = getTimestamp();
  var trip = {
    trip_id: generateId('trip'),
    camp_name: String(payload.camp_name).trim(),
    start_date: normalizeDate(payload.start_date),
    end_date: normalizeDate(payload.end_date),
    people_count: parseNumber(payload.people_count, 1),
    children_count: parseNumber(payload.children_count, 0),
    camp_type: payload.camp_type,
    cooking: parseBoolean(payload.cooking),
    has_power: parseBoolean(payload.has_power),
    with_pet: parseBoolean(payload.with_pet),
    region_type: payload.region_type || 'forest',
    weather_summary: String(payload.weather_summary || '').trim(),
    created_at: timestamp,
    updated_at: timestamp
  };

  appendRows('trips', [trip]);
  return trip;
}

function updateTrip(payload) {
  validateTripPayload(payload, true);

  var existing = getRowById('trips', payload.trip_id);
  if (!existing) {
    throwKnownError('NOT_FOUND', 'Trip not found.');
  }

  return updateRowById('trips', payload.trip_id, {
    camp_name: payload.camp_name !== undefined ? String(payload.camp_name).trim() : existing.camp_name,
    start_date: payload.start_date !== undefined ? normalizeDate(payload.start_date) : existing.start_date,
    end_date: payload.end_date !== undefined ? normalizeDate(payload.end_date) : existing.end_date,
    people_count: payload.people_count !== undefined ? parseNumber(payload.people_count, 1) : existing.people_count,
    children_count: payload.children_count !== undefined ? parseNumber(payload.children_count, 0) : existing.children_count,
    camp_type: payload.camp_type !== undefined ? payload.camp_type : existing.camp_type,
    cooking: payload.cooking !== undefined ? parseBoolean(payload.cooking) : parseBoolean(existing.cooking),
    has_power: payload.has_power !== undefined ? parseBoolean(payload.has_power) : parseBoolean(existing.has_power),
    with_pet: payload.with_pet !== undefined ? parseBoolean(payload.with_pet) : parseBoolean(existing.with_pet),
    region_type: payload.region_type !== undefined ? payload.region_type : existing.region_type,
    weather_summary: payload.weather_summary !== undefined ? String(payload.weather_summary).trim() : existing.weather_summary,
    updated_at: getTimestamp()
  });
}

function mapTripRow(row) {
  row.people_count = parseNumber(row.people_count, 1);
  row.children_count = parseNumber(row.children_count, 0);
  row.cooking = parseBoolean(row.cooking);
  row.has_power = parseBoolean(row.has_power);
  row.with_pet = parseBoolean(row.with_pet);
  return row;
}
