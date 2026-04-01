function createSuccessResponse(data) {
  return {
    ok: true,
    data: data,
    error: null
  };
}

function createErrorResponse(code, message) {
  return {
    ok: false,
    data: null,
    error: {
      code: code,
      message: message
    }
  };
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
