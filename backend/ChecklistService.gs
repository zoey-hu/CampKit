function getChecklist(payload) {
  validateRequiredFields(payload, ['trip_id']);

  var trip = getRowById('trips', payload.trip_id);
  if (!trip) {
    throwKnownError('NOT_FOUND', 'Trip not found.');
  }

  return filterRowsByField('trip_checklist', 'trip_id', payload.trip_id).map(mapChecklistRow);
}

function toggleChecklistPacked(payload) {
  validateRequiredFields(payload, ['row_id', 'is_packed']);

  var existing = getRowById('trip_checklist', payload.row_id);
  if (!existing) {
    throwKnownError('NOT_FOUND', 'Checklist row not found.');
  }

  return updateRowById('trip_checklist', payload.row_id, {
    is_packed: parseBoolean(payload.is_packed),
    updated_at: getTimestamp()
  });
}

function generateChecklist(payload) {
  validateRequiredFields(payload, ['trip_id']);

  var tripRow = getRowById('trips', payload.trip_id);
  if (!tripRow) {
    throwKnownError('NOT_FOUND', 'Trip not found.');
  }
  var trip = mapTripRow(tripRow);

  var gearItems = listGear();
  var rules = getAllRows('rules');
  var requiredItems = collectRequiredItems(trip, gearItems, rules);
  var dedupedItems = deduplicateChecklistCandidates(requiredItems);
  var checklistRows = dedupedItems.map(function(candidate) {
    var timestamp = getTimestamp();
    return {
      row_id: generateId('chk'),
      trip_id: trip.trip_id,
      gear_id: candidate.gear_id,
      item_name: candidate.item_name,
      is_required: true,
      is_packed: false,
      missing: candidate.missing,
      reason: candidate.reason,
      note: candidate.note || '',
      created_at: timestamp,
      updated_at: timestamp
    };
  });

  deleteRowsByField('trip_checklist', 'trip_id', trip.trip_id);
  appendRows('trip_checklist', checklistRows);

  return checklistRows.map(mapChecklistRow);
}

function collectRequiredItems(trip, gearItems, rules) {
  var candidates = [];

  gearItems
    .filter(function(item) {
      return item.is_essential;
    })
    .forEach(function(item) {
      candidates.push(createChecklistCandidate(item, 'Essential gear item'));
    });

  if (trip.cooking) {
    APP_CONFIG.checklist.cookingCategories.forEach(function(category) {
      var categoryItems = gearItems.filter(function(item) {
        return item.category === category;
      });

      if (categoryItems.length) {
        categoryItems.forEach(function(item) {
          candidates.push(createChecklistCandidate(item, 'Included because trip cooking is enabled'));
        });
      } else {
        candidates.push({
          gear_id: '',
          item_name: category + ' gear',
          missing: true,
          reason: 'Cooking trip requires ' + category + ' gear, but none exists in inventory',
          note: ''
        });
      }
    });
  }

  evaluateRules(rules, trip, gearItems).forEach(function(candidate) {
    candidates.push(candidate);
  });

  return candidates;
}

function evaluateRules(rules, trip, gearItems) {
  return ensureArray(rules).reduce(function(acc, rule) {
    if (!doesRuleMatchTrip(rule, trip)) {
      return acc;
    }

    if (rule.action_type === 'include_category') {
      var categoryItems = gearItems.filter(function(item) {
        return item.category === rule.action_value;
      });

      if (categoryItems.length) {
        categoryItems.forEach(function(item) {
          acc.push(createChecklistCandidate(item, buildRuleReason(rule)));
        });
      } else {
        acc.push({
          gear_id: '',
          item_name: rule.action_value + ' gear',
          missing: true,
          reason: buildRuleReason(rule) + ' but inventory has no matching gear',
          note: rule.note || ''
        });
      }
    }

    if (rule.action_type === 'require_item_name') {
      var match = gearItems.filter(function(item) {
        return String(item.name).toLowerCase() === String(rule.action_value).toLowerCase();
      })[0];

      acc.push(match ? createChecklistCandidate(match, buildRuleReason(rule)) : {
        gear_id: '',
        item_name: rule.action_value,
        missing: true,
        reason: buildRuleReason(rule) + ' but this item does not exist in inventory',
        note: rule.note || ''
      });
    }

    return acc;
  }, []);
}

function doesRuleMatchTrip(rule, trip) {
  if (rule.condition_type !== 'trip_field_equals') {
    return false;
  }

  var parts = String(rule.condition_value || '').split(':');
  var fieldName = parts[0];
  var expectedValue = parts.slice(1).join(':');

  if (!fieldName || expectedValue === '') {
    return false;
  }

  var currentValue = trip[fieldName];
  if (typeof currentValue === 'boolean') {
    return String(currentValue) === expectedValue.toLowerCase();
  }

  return String(currentValue) === expectedValue;
}

function buildRuleReason(rule) {
  return rule.note || ('Included by rule ' + rule.rule_id);
}

function createChecklistCandidate(gearItem, reason) {
  return {
    gear_id: gearItem.gear_id,
    item_name: gearItem.name,
    missing: false,
    reason: reason,
    note: ''
  };
}

function deduplicateChecklistCandidates(candidates) {
  var seen = {};

  return candidates.filter(function(candidate) {
    var key = candidate.gear_id || ('missing:' + String(candidate.item_name).toLowerCase());
    if (seen[key]) {
      return false;
    }
    seen[key] = true;
    return true;
  });
}

function mapChecklistRow(row) {
  row.is_required = parseBoolean(row.is_required);
  row.is_packed = parseBoolean(row.is_packed);
  row.missing = parseBoolean(row.missing);
  return row;
}
