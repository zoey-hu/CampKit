# CampKit

CampKit is an MVP camping gear manager and trip packing assistant built with Flutter on the frontend and Google Apps Script plus Google Sheets on the backend.

## Project Overview

CampKit helps users:

1. Manage camping gear inventory
2. Create camping trips
3. Generate packing checklists from trip conditions
4. Prepare the codebase for future weather-aware recommendations

## Architecture

### Frontend

- `frontend/`
- Flutter app using Material 3
- Strongly typed Dart models
- API service layer for Apps Script HTTP calls
- Simple production-minded screens for inventory, trips, and checklists

### Backend

- `backend/`
- Google Apps Script Web App
- Action-based routing via `doGet` and `doPost`
- Sheet repository helpers isolate storage access from business logic
- Validation and response formatting are centralized
- Checklist generation logic is separated into its own service

### Storage

- Google Sheets acts as the MVP database
- Sheet headers are defined in config
- Data access is abstracted enough to replace Sheets later with a real database-backed repository

## Directory Layout

```text
/
  README.md
  /backend
    appsscript.json
    Code.gs
    Config.gs
    Response.gs
    Utils.gs
    Validation.gs
    SheetRepository.gs
    GearService.gs
    TripService.gs
    ChecklistService.gs
    /sample-data
  /frontend
    pubspec.yaml
    analysis_options.yaml
    .env.example
    /lib
      /config
      /models
      /services
      /screens
      /widgets
    /test
  /docs
    api-contract.md
    sheets-schema.md
    checklist-rules.md
```

## Google Sheets Setup

1. Create a new Google Spreadsheet.
2. Create these sheets exactly:
   - `gear_items`
   - `trips`
   - `trip_checklist`
   - `rules`
3. Copy the header rows from [docs/sheets-schema.md](/d:/Project/CampKit/docs/sheets-schema.md).
4. Import the CSV files from `backend/sample-data/` if you want starter data.
5. Copy the Spreadsheet ID from the spreadsheet URL.

## Apps Script Setup

1. Create a new Apps Script project bound to the spreadsheet or standalone.
2. Copy all files from `backend/` into the Apps Script project.
3. In [backend/Config.gs](/d:/Project/CampKit/backend/Config.gs), set `APP_CONFIG.spreadsheetId` if you are using a standalone Apps Script project.
4. Save and run a test function once so Apps Script can request permissions.
5. Deploy as a Web App:
   - Execute as: `User accessing the web app` is not required here; keep `USER_DEPLOYING`
   - Access: `Anyone`
6. Copy the deployed `/exec` URL.

## Flutter Local Run Steps

1. Install Flutter.
2. From `frontend/`, run `flutter create .` once if you want Flutter to generate native runner folders such as `android/`, `ios/`, `web/`, `linux/`, `macos/`, and `windows/`.
3. Run `flutter pub get`.
4. Start the app with your Apps Script URL:

```bash
flutter run --dart-define=API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

You can also copy `frontend/.env.example` into your own local notes or tooling, but the current app reads its base URL from `--dart-define`.

## Backend Actions

- `gear_list`
- `gear_create`
- `gear_update`
- `gear_delete`
- `trip_list`
- `trip_create`
- `trip_update`
- `generate_checklist`
- `checklist_get`
- `checklist_toggle_packed`

## Example API Requests

### List Gear

```http
POST /exec
Content-Type: application/json

{
  "action": "gear_list"
}
```

### Create Trip

```http
POST /exec
Content-Type: application/json

{
  "action": "trip_create",
  "camp_name": "Maple Valley",
  "start_date": "2026-04-18",
  "end_date": "2026-04-20",
  "people_count": 4,
  "children_count": 1,
  "camp_type": "tent",
  "cooking": true,
  "has_power": false,
  "with_pet": false,
  "region_type": "forest",
  "weather_summary": "Cool nights and possible wind"
}
```

### Generate Checklist

```http
POST /exec
Content-Type: application/json

{
  "action": "generate_checklist",
  "trip_id": "trip_001"
}
```

## Example API Responses

### Success Envelope

```json
{
  "ok": true,
  "data": [
    {
      "gear_id": "gear_001",
      "name": "Family Tent"
    }
  ],
  "error": null
}
```

### Failure Envelope

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: camp_name"
  }
}
```

## What Was Built

- Modular Apps Script backend with config, repository helpers, validation, routing, and checklist generation
- Flutter MVP app with usable inventory, trip, and checklist flows
- CSV sample data for all four sheets
- Supporting docs for API contract, sheet schema, and checklist rules

## TODO: Next-Phase Weather Integration

- Add weather lookup service and background fetch strategy
- Normalize structured weather conditions instead of storing summary text only
- Add rule handlers for wind, rain, temperature, and storm conditions
- Expand `rules` to support threshold comparisons and multiple conditions
- Add UI prompts for weather-sensitive packing suggestions
- Add checklist explanations that distinguish inventory matches from forecast-driven additions

## Notes

- The frontend is intentionally dependency-light and uses local state for MVP speed.
- The Flutter source app is included in this repo. Native runner folders were not auto-generated here because Flutter tooling is not installed in this environment.
- The backend currently deletes gear rows directly for `gear_delete`; if you want auditability next, add archival or soft-delete behavior behind the repository layer.
- Weather integration is prepared structurally but not yet implemented as a live weather feature.
