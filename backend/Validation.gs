function validateRequiredFields(payload, requiredFields) {
  var missingFields = requiredFields.filter(function(field) {
    return payload[field] === undefined || payload[field] === null || payload[field] === '';
  });

  if (missingFields.length) {
    throwKnownError(
      'VALIDATION_ERROR',
      'Missing required fields: ' + missingFields.join(', ')
    );
  }
}

function validateGearPayload(payload, isUpdate) {
  validateRequiredFields(payload, isUpdate ? ['gear_id'] : ['name', 'category']);

  if (payload.category && APP_CONFIG.enums.gearCategories.indexOf(payload.category) === -1) {
    throwKnownError('VALIDATION_ERROR', 'Invalid gear category.');
  }

  if (payload.status && APP_CONFIG.enums.gearStatus.indexOf(payload.status) === -1) {
    throwKnownError('VALIDATION_ERROR', 'Invalid gear status.');
  }
}

function validateTripPayload(payload, isUpdate) {
  validateRequiredFields(
    payload,
    isUpdate ? ['trip_id'] : ['camp_name', 'start_date', 'end_date', 'camp_type']
  );

  if (payload.camp_type && APP_CONFIG.enums.campTypes.indexOf(payload.camp_type) === -1) {
    throwKnownError('VALIDATION_ERROR', 'Invalid camp type.');
  }

  if (payload.region_type && APP_CONFIG.enums.regionTypes.indexOf(payload.region_type) === -1) {
    throwKnownError('VALIDATION_ERROR', 'Invalid region type.');
  }

  var startDate = new Date(payload.start_date);
  var endDate = new Date(payload.end_date);
  if (payload.start_date && payload.end_date && startDate > endDate) {
    throwKnownError('VALIDATION_ERROR', 'Trip start date must be before end date.');
  }
}

function validateAction(payload) {
  validateRequiredFields(payload, ['action']);
}

function throwKnownError(code, message) {
  var error = new Error(message);
  error.code = code;
  throw error;
}
