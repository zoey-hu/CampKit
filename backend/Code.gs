function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    var payload = getRequestPayload(e);
    validateAction(payload);

    var result = routeAction(payload.action, payload);
    return jsonOutput(createSuccessResponse(result));
  } catch (error) {
    return jsonOutput(
      createErrorResponse(
        error.code || 'INTERNAL_ERROR',
        error.message || 'Unexpected server error.'
      )
    );
  }
}

function routeAction(action, payload) {
  switch (action) {
    case 'gear_list':
      return listGear();
    case 'gear_create':
      return createGear(payload);
    case 'gear_update':
      return updateGear(payload);
    case 'gear_delete':
      return deleteGear(payload);
    case 'trip_list':
      return listTrips();
    case 'trip_create':
      return createTrip(payload);
    case 'trip_update':
      return updateTrip(payload);
    case 'generate_checklist':
      return generateChecklist(payload);
    case 'checklist_get':
      return getChecklist(payload);
    case 'checklist_toggle_packed':
      return toggleChecklistPacked(payload);
    default:
      throwKnownError('UNKNOWN_ACTION', 'Unsupported action: ' + action);
  }
}
